import React from 'react';

const FloatingItems = ({ items, position }) => (
  <div
    className="floatingItems"
    style={position === 'left' ? { paddingLeft: 12 } : { paddingRight: 12, right: 0 }}
  >
    {items}
  </div>
);
export default FloatingItems;
