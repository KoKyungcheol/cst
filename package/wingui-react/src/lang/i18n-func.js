import baseURI from '../baseURI';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next'
import VueI18n from 'vue-i18n';

export function getLangpackData(languageCode) {
  $.ajax({
    url: baseURI() + 'system/lang-packs/' + languageCode + '/cached',
    async: false,
    dataType: 'json',
    success: function (data, textStatus, jqXHR) {
      if (!isEmpty(data)) {
        localStorage.setItem('langpack', JSON.stringify(data));
        
        initI18n(languageCode, data)
        
      } else {
        showDialog('No Support!', `The currently selected locale is not supported. (language: ${languageCode.toUpperCase()}`, alert, true);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Failed to load language data.', errorThrown);
    }
  });
}

export function initI18n(languageCode, data) {
  i18n
  .use(initReactI18next)
  .init({
    resources: makeLanguageResources(languageCode),
    lng: languageCode
  })
  if(data !== undefined) {
    gI18n = new VueI18n({
      locale: languageCode,
      messages: data,
      silentTranslationWarn: true
    })
  }
}

export function reloadLanguage() {
  let languageCode = localStorage.getItem('languageCode');

  $.ajax({
    url: baseURI() + 'system/lang-packs/' + languageCode + '/reload',
    dataType: 'json',
    async: false,
    success: function (data) {
      this.languageCode = languageCode;
      
      localStorage.setItem('langpack', JSON.stringify(data));
      window.location.reload();
    },
    error: function (xhr, textStatus, errorThrown) {
      console.warn('Language pack reloading failed:', errorThrown);
    }
  });
}


export function getLanguageCode() {
  let languageCode = localStorage.getItem('languageCode');
  if (languageCode) {
    return languageCode;
  } else {
    return 'en';
  }
}
export function makeLanguageResources(code) {
  let langpack = {};
  langpack[code] = {};
  let langpackData = localStorage.getItem('langpack')
  if (langpackData) {
    langpack[code]['translation'] = JSON.parse(langpackData)[code];
  }

  return langpack;
}

export function transLangKey(langKey, params) {
  let transValue = '';
  if(langKey !== undefined && langKey !== null) {
    if(i18n.exists(langKey)) {
      transValue = i18n.t(langKey, params)
    } else {
      transValue = langKey
    }
  }
  
  return transValue
}

export function existLangValue(langKey) {
  return i18n.exists(langKey)
}
