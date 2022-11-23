import axios from 'axios';
import baseURI from './baseURI';
import getHeaders from './getHeaders';

const settings = {
  projectCode: '',
  mode: '',
  component: {
    button: 'icon',
    input: 'floating'
  }
};

async function getSettings() {
  let json = await axios.get(baseURI() + 'system/settings', {
    headers: getHeaders()
  });
  return json;
}

function getMenuBadge() {
  axios.get(baseURI() + 'system/menus/badges', {
      headers: getHeaders()
    })
    .then(res => {
      const badges = document.getElementsByClassName('badge');
      Array.from(badges).forEach(badge => {
        badge.innerHTML = '';
      });

      const badgeItems = res.data;

      badgeItems.forEach(badgeItem => {
        Array.from(document.getElementsByClassName(badgeItem.menuCd)).forEach(menu => {
          menu.innerHTML = badgeItem.badgeContent;
        });
      });
    })
    .catch(err => {
      console.error('Failed to apply menu badge: ' + err.message);
    })
    .then(() => {
    });
}

export function initSettings(callback) {
  getSettings().then(res => {
    let settingsObj = res.data;

    if (settingsObj.langpackVersion) {
      let newVersion = settingsObj.langpackVersion;

      let oldVersion = localStorage.getItem('langpackVersion');
      if (newVersion !== oldVersion) {
        localStorage.removeItem('langpack');
      }

      localStorage.setItem('langpackVersion', newVersion);
    }

    if (settingsObj.service) {
      settings.service = settingsObj.service;

      if (settingsObj.service.badge && settingsObj.service.badge.enable) {
        window.setInterval(getMenuBadge, settingsObj.service.badge.interval);
      }
    }

    settings.authentication = {};

    if (settingsObj.authentication) {
      let defaultUrl = settingsObj.authentication.defaultUrl.trim();
      if (defaultUrl) {
        if (!defaultUrl.startsWith('http://') && !defaultUrl.startsWith('https://')) {
          defaultUrl = baseURI() + defaultUrl;
        }
        settings.authentication.defaultUrl = defaultUrl;
      } else {
        settings.authentication.defaultUrl = 'index.html#home';
      }

      let loginUrl = settingsObj.authentication.loginUrl.trim();
      if (loginUrl) {
        if (!loginUrl.startsWith('http://') && !loginUrl.startsWith('https://')) {
          if (loginUrl.charAt(0) === '/') {
            loginUrl = loginUrl.slice(1);
          }
          loginUrl = baseURI() + loginUrl;
        }
        settings.authentication.loginUrl = loginUrl;
      } else {
        settings.authentication.defaultUrl = 'index.html#login';
      }
    }

    if (settingsObj.languages) {
      settings.languages = settingsObj.languages;
    }

    if (settingsObj.style) {
      settings.style = settingsObj.style;
    }

    if (settingsObj.layout) {
      settings.layout = settingsObj.layout;

      if (settingsObj.layout.settingButton) {
        if (settingsObj.layout.settingButton === 'show' && document.getElementsByClassName('js-settings').length > 0 ) {
          document.getElementsByClassName('js-settings')[0].style.display = ''
        } else if (settingsObj.layout.settingButton === 'hide') {
          document.getElementsByClassName('js-settings')[0].style.display = 'none'
          document.getElementsByClassName('navbar-collapse collapse')[0].style.paddingRight = 0
        } 
      }

      if (settingsObj.layout.currencyButton) {
        if (settingsObj.layout.currencyButton === 'hide'  && document.getElementsByClassName('navbar-nav').length > 0 ) {
          document.getElementsByClassName('navbar-nav')[0].children[1].style.display = 'none'; 
        }
      }

    }

    settingsObj = null;

    if (callback) {
      callback();
    }
  });
}
 
export default settings;
