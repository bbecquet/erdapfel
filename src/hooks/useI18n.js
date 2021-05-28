import { localizedUrls } from 'config/constants.yml';

const getLocalizedUrl = lang => urlName => {
  return localizedUrls?.[lang]?.[urlName] || localizedUrls?.['en']?.[urlName];
};

export const useI18n = () => {
  const { locale, code: lang } = window.getLang();

  return {
    // Sadly we cannot do that for now, as when built
    // the _ function is not recognized by the gettext system
    // _: window._,
    locale,
    lang,
    getLocalizedUrl: getLocalizedUrl(lang),
  };
};
