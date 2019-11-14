import HourPanelView from 'src/views/poi_bloc/hour.dot';
import nextTransitionPartial from 'src/views/poi_bloc/hour_next_transition_partial.dot';
import Panel from 'src/libs/panel';
import OsmSchedule from 'src/adapters/osm_schedule';
import Telemetry from 'src/libs/telemetry';

function HourPanel(block, poi, options) {
  this.nextTransitionPartial = nextTransitionPartial;
  this.panel = new Panel(this, HourPanelView);
  this.name = block.name;
  this.title = options.title;
  this.opening = new OsmSchedule(block, {
    open: {
      msg: _('Open'),
      color: '#60ad51',
    },
    closed: {
      msg: _('Closed'),
      color: '#8c0212',
    }
  });
  this.messages = options.messages;
  this.latLng = poi.latLon;
  this.isCollapsed = true;
}

HourPanel.prototype.extend = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open');
  if (this.isCollapsed) {
    Telemetry.add(Telemetry.POI_HOUR_EXTEND);
    this.panel.addClassName(
      .3,
      '.poi_panel__info__hours__status__toggle',
      'poi_panel__info__hours__status__toggle--reversed',
    );
    this.isCollapsed = false;
  } else {
    this.panel.removeClassName(
      .3,
      '.poi_panel__info__hours__status__toggle',
      'poi_panel__info__hours__status__toggle--reversed',
    );
    this.isCollapsed = true;
  }
};

export default HourPanel;
