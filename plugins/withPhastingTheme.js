// Plugin Expo : colore les boîtes de dialogue natives d'Android (calendrier, horloge)
// aux couleurs de Phasting (vert émeraude), au lieu du bleu/cyan par défaut.
const { withAndroidStyles } = require('expo/config-plugins');

const EMERALD = '#0E7C5B';

module.exports = function withPhastingTheme(config) {
  return withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults;
    const appTheme = (styles.resources.style || []).find((s) => s.$.name === 'AppTheme');
    if (!appTheme) return cfg;

    appTheme.item = appTheme.item || [];
    const setItem = (name, value) => {
      const existing = appTheme.item.find((i) => i.$.name === name);
      if (existing) existing._ = value;
      else appTheme.item.push({ $: { name }, _: value });
    };

    setItem('colorAccent', EMERALD);
    setItem('colorControlActivated', EMERALD);
    return cfg;
  });
};
