import countryData from './countryData';
import { initI18n } from './i18n-func';
import languageData from './languageData';
import { useContentStore } from '../store/contentStore'

class LanguageObject {
  constructor() {
    this.defaultCountries = {};
  }

  getLanguageCode() {
    return this.languageCode;
  }

  getCountryCode() {
    return this.countryCode;
  }

  getCurrencyCode() {
    return this.currencyCode;
  }

  getFontFamily() {
    if (window.settings.style && window.settings.style.fontFaces) {
      let fontFace = window.settings.style.fontFaces[this.languageCode];
      if (fontFace) {
        return fontFace.split(',')[0];
      }
    }
    return 'Noto Sans KR';
  }

  getFontSize() {
    if (window.settings.style && window.settings.style.fontFaces) {
      let fontFace = window.settings.style.fontFaces[this.languageCode];
      if (fontFace) {
        let fontStyles = fontFace.split(',');
        if (fontStyles.length > 1) {
          return parseInt(fontStyles[1]);
        }
      }
    }
    return 13;
  }

  init() {
    const storeState = useContentStore.getState();

    const setLanguageCode = storeState.setLanguageCode;
    const setCountryCode = storeState.setCountryCode;
    const setCurrencyCode = storeState.setCurrencyCode;

    for (let language in this.defaultCountries) {
      delete this.defaultCountries[language];
    }

    for (let i = 0, n = window.settings.languages.length; i < n; i++) {
      let language = window.settings.languages[i];
      this.defaultCountries[language.substr(0, 2)] = language.substr(3);
    }

    let languageCode = localStorage.getItem('languageCode');
    let countryCode = localStorage.getItem('countryCode');

    if (!languageCode || !countryCode) {
      let language;
      if (navigator.language) {
        language = navigator.language;
      } else if (navigator.browserLanguage) {
        language = navigator.browserLanguage;
      } else if (navigator.systemLanguage) {
        language = navigator.systemLanguage;
      } else if (navigator.userLanguage) {
        language = navigator.userLanguage;
      } else {
        language = 'en-US';
      }

      if (language.length == 2) {
        this.languageCode = language;

        let countryCode = this.defaultCountries[language];
        if (countryCode) {
          this.countryCode = countryCode;
        } else {
          this.countryCode = 'None';
          console.error(`Set the country code for the '${language}' language code in the application.yaml file.`);
        }
      } else {
        this.languageCode = language.substr(0, 2);
        this.countryCode = language.substr(3);
      }

      localStorage.setItem('languageCode', this.languageCode);
      localStorage.setItem('countryCode', this.countryCode);

      this.currencyCode = countryData[this.countryCode].currency;
      localStorage.setItem('currencyCode', this.currencyCode);
    } else {
      this.languageCode = languageCode;
      this.countryCode = countryCode;
      this.currencyCode = countryData[this.countryCode].currency;

      localStorage.setItem('currencyCode', this.currencyCode);
    }
    setLanguageCode(this.languageCode);
    setCountryCode(this.countryCode);
    setCurrencyCode(this.currencyCode);

    let langpack = localStorage.getItem('langpack');

    if (!langpack) {
      getLangpackData(this.languageCode);
    } else {
      initI18n(languageCode, JSON.parse(langpack))
    }
  }

  mount() {
    this.langElement = document.getElementById('languages');
    this.countryBtnElement = document.getElementById('languageDropdown');
    let languageName = document.createElement('span');
    languageName.classList.add('align-middle');

    let languageCode = localStorage.getItem('languageCode')
    languageName.textContent = languageData[languageCode].name;

    this.countryBtnElement.appendChild(languageName);

    for (let i = 0, n = window.settings.languages.length; i < n; i++) {
      let code = window.settings.languages[i].substr(0, 2);
      let country = window.settings.languages[i].substr(3);
      let name = languageData[code].name;

      let langItem = document.createElement('a');
      langItem.setAttribute('title', name);
      langItem.classList.add('dropdown-item');
      langItem.classList.add('langItem');

      langItem.addEventListener('click', (event) => {
        let textContent = event.target.textContent || event.target.parentNode.textContent;

        this.languageCode = textContent.toLowerCase().substr(0, 2);
        localStorage.setItem('languageCode', this.languageCode);
        getLangpackData(this.languageCode);
        this.setKendoLanguage(this.languageCode)

        let countryCode = this.defaultCountries[this.languageCode];
        if (countryCode) {
          this.countryCode = countryCode;
          this.currencyCode = countryData[this.countryCode].currency;

          localStorage.setItem('countryCode', this.countryCode);
          localStorage.setItem('currencyCode', this.currencyCode);

        }

        window.location.reload();

        if (this.langElement.classList.contains('localeSelShow')) {
          this.langElement.classList.remove('localeSelShow');
        }
      });

      let span = document.createElement('span');
      span.classList.add('align-middle');
      span.textContent = code.toUpperCase() + " - " + name;

      langItem.appendChild(span);

      this.langElement.appendChild(langItem);
      langItem = null;
    }

    if (window.settings.layout && window.settings.layout.currencyButton === 'show') {
      this.countryElement = document.getElementById('countries');
      this.countryDropdownElement = document.getElementById('countryDropdown');

      let langCodes = Object.keys(this.defaultCountries);

      for (let i = 0, n = langCodes.length; i < n; i++) {
        let code = this.defaultCountries[langCodes[i]];
        let name = countryData[code].name;

        let countryItem = document.createElement('a');
        countryItem.setAttribute('title', name);
        countryItem.classList.add('dropdown-item');
        countryItem.classList.add('countryItem');

        countryItem.appendChild(document.createTextNode(code.toUpperCase()));

        countryItem.addEventListener('click', (event) => {
          this.countryCode = event.target.textContent || event.target.parentNode.textContent;
          this.currencyCode = countryData[this.countryCode].currency;

          this.countryDropdownElement.textContent = this.countryCode;

          localStorage.setItem('countryCode', this.countryCode);
          localStorage.setItem('currencyCode', this.currencyCode);

          if (this.countryElement.classList.contains('countrySelShow')) {
            this.countryElement.classList.remove('countrySelShow');
          }

        });

        this.countryElement.appendChild(countryItem);

        countryItem = null;

      }

      let span = document.createElement('span');
      span.textContent = localStorage.getItem('countryCode');

      this.countryDropdownElement.appendChild(span);

    } else {
      let countrySel = document.querySelector('.countrySel');
      if (countrySel) {
        countrySel.parentNode.removeChild(countrySel);
      }
    }

    let me = this;

    window.requestAnimationFrame(function () {
      me.setKendoLanguage(me.languageCode)
      let bodyStyle = document.getElementsByTagName('body')[0].style;

      bodyStyle.fontFamily = me.getFontFamily();
      bodyStyle.fontSize = me.getFontSize() + 'px';
    });
  }

  toggleLocaleSelector() {
    this.langElement.classList.toggle('localeSelShow');
  }

  toggleCountrySelector() {
    if (this.countryElement) {
      this.countryElement.classList.toggle('countrySelShow');
    }
  }

  closeSelector() {
    if (this.langElement.classList.contains('localeSelShow')) {
      this.langElement.classList.remove('localeSelShow');
    }

    if (this.countryElement && this.countryElement.classList.contains('countrySelShow')) {
      this.countryElement.classList.remove('countrySelShow');
    }
  }

  setKendoLanguage(langCode = 'en') {
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'js/kendo/js/cultures/kendo.culture.' + langCode + '.min.js';

    head.appendChild(script);
  }

}

const lo = new LanguageObject();

export default lo;
