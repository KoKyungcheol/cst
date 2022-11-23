import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

let gI18n = (function () {
  let langPackData;
  try {
    if (typeof localStorage.langpack === 'string') {
      langPackData = JSON.parse(localStorage.langpack);
    }
    return new VueI18n({
      locale: localStorage.languageCode,
      messages: langPackData,
      silentTranslationWarn: true //delete console warning
    });
  } finally {
    langPackData = null;
  }
})();

export { gI18n };
