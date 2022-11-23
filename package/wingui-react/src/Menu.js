import axios from 'axios';
import baseURI from './baseURI';
import React from 'react';
import { transLangKey } from './lang/i18n-func';
import settings from './settings';

class Menu {
  constructor() {
    this.windowObj = {};
    this.data = [];
    this.views = [{ path: "/home", exact: true, name: transLangKey("HOME"), viewId: "HOME", component: (React.lazy(() => import('./view/home/Home'))) }];
    this.navigateObject = {};
  }

  async getData() {
    let json = await axios.get(baseURI() + 'menus');
    return json;
  }
  openWindow(viewId, target) {
    let href = window.location.href;

    let popupUrl;
    let index = href.indexOf('#');
    if (index >= 0) {
      popupUrl = href.slice(0, index) + '#' + viewId;
    } else {
      if (href.charAt(href.length - 1) === '/') {
        popupUrl = href + 'index.html#' + viewId;
      } else {
        popupUrl = href + '#' + viewId;
      }
    }

    let targetId = target || viewId;
    if (target === 'new') {
      targetId = '_blank';
    }

    if (!this.windowObj[targetId] || targetId === '_blank') {
      this.windowObj[targetId] = window.open(popupUrl, targetId);
    } else {
      this.windowObj[targetId] = window.open(popupUrl, targetId);
      this.windowObj[targetId].location.reload(true);
    }
  }
  build() {
    let me = this;

    this.getData().then((res) => {
      me.data = res.data;
    });
  }
  addRoute(view) {
    let path = view.path.replace('/external', '');
    if (path !== "") {
      let component = null;
      if (view.type === 'viewconfig') {
        component = (React.lazy(() => import('./component/ViewConfig')));
      } else {
        let realpath = view.path.toLowerCase() + view.path.slice(view.path.lastIndexOf('/'))
        component = (React.lazy(() => import('./view' + realpath).catch((err) => {
          return import('./view/pages/NoContent')
        })))
      }
      if (menu.views.filter(x => x.viewId === view.id).length === 0) {
        menu.views.push({ path: view.path.toLowerCase(), name: transLangKey(view.id), viewId: view.id, type: view.type, component: component });
      }
    }
  }
  getType(m) {
    let type = "";
    if (m.id !== "" && m.path === "" && m.parentId === "") {
      type = "large";
    } else if (m.parentId !== "" && m.path === "") {
      type = "medium";
    } else if (m.path !== "") {
      type = "small";
    }
    return type;
  }
  deactivate() {
    document.getElementsByClassName("sidebar-item").forEach(function (el) { el.classList.remove("active") });
    document.getElementsByClassName("sidebar-link").forEach(function (el) { el.classList.remove("active") });
  }
  activate(m, inx, target) {
    if (target === m) {
      let activeUiElement = document.querySelectorAll('ul#' + m).length > 1 ? document.querySelectorAll('ul#' + m)[1].previousSibling : document.getElementById(m).previousSibling;

      if (document.querySelectorAll('ul#' + m + "-topTemplate")[1] || document.getElementById(m + "-topTemplate")) {
        let activeUiElement2 = document.querySelectorAll('ul#' + m + "-topTemplate").length > 1 ? document.querySelectorAll('ul#' + m + "-topTemplate")[1].previousSibling : document.getElementById(m + "-topTemplate").previousSibling;
        activeUiElement2.classList.add("active");
      }
      activeUiElement.classList.add("active");
    } else {
      if (document.querySelectorAll('[data-bs-target="#' + m + '"]').length > 0) {
        let activeElement = document.querySelectorAll('[data-bs-target="#' + m + '"]')[0];
        activeElement.classList.add("active");
        if (inx == 0) {
          activeElement.parentElement.classList.add("active");
        }
      }

      if (document.querySelectorAll('ul#' + m + "-topTemplate")[1] || document.getElementById(m + "-topTemplate")) {
        let activeUiElement2 = document.querySelectorAll('ul#' + m + "-topTemplate").length > 1 ? document.querySelectorAll('ul#' + m + "-topTemplate")[1].previousSibling : document.getElementById(m + "-topTemplate").previousSibling;
        activeUiElement2.classList.add("active");
      }

    }
  }
  goHome() {
    let home = ''
    if (settings.authentication != undefined) {
      let defaultUrl = settings.authentication.defaultUrl;
      if (defaultUrl.includes('home')) {
        home = '/home'
      } else {
        home = '/' + defaultUrl.replace(baseURI(), '')
      }
    }
    return home;
  }
  getDefaultMenu() {
    let defaultUrl = settings.authentication.defaultUrl;
    let homePath = defaultUrl.includes('home') ? '/home' : defaultUrl.replace(baseURI(), '');

    let lst = menu.views.filter(x => x.path === homePath)
    if (lst.length > 0) {
      let route = lst[0];
      let defContent = { viewId: route.viewId, path: route.path, pathname: route.pathname, type: route.type };
      return defContent;
    }
    else {
      return { "viewId": "HOME", "path": "/home" };
    }
  }

}
export function getContentDataFromViewId(viewId) {
  let views = menu.views;
  let lst = null;

  console.log('getContentDataFromViewId', views.length);
  for (let i = 0; i < views.length; i++) {
    let view = views[i];
    if (view.viewId == viewId) {
      console.log('getContentDataFromViewId', view);
      lst = view
      break;
    }
  }

  if (lst) {
    let route = lst;
    let content = { viewId: route.viewId, path: route.path, pathname: route.pathname, type: route.type };
    return content;
  }
  else
    return null;
}

const menu = new Menu();

export default menu;