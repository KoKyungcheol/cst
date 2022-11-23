import create from 'zustand';
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import produce from 'immer';
import menu from '../Menu';
import menuData from '../menus'
import { deepClone, isDeepEqual } from '../utils/common';

const log = config => (set, get, api) => config(args => {
  console.log("  applying", args)
  set(args)
  console.log("  new state", get())
}, get, api)

const immer = config => (set, get, api) => config((partial, replace) => {
  const nextState = typeof partial === 'function'
    ? produce(partial)
    : partial
  return set(nextState, replace)
}, get, api)

const defRmViewData = []
let t3smartScmStore = (set, get, api) => ({
  activeViewId: '',
  setActiveViewId: newVal => _setActiveViewId(set, newVal),
  contentData: [], //tab views
  setContentData: (newVal) => set({ contentData: newVal }),
  addContentData: newVal => set(state => _addContentData(state, newVal)),
  setViewUpdated: (viewId, newVal) => fnSetViewUpdated(get(), set, viewId, newVal),
  setViewGridUpdated: (viewId, gridId, newVal) => fnSetViewGridUpdated(get(), set, viewId, gridId, newVal),
  rmViewDataEvnt: defRmViewData,
  fireRemoveViewEvnt: (viewId) => set(state => _fireRemoveViewEvnt(state, viewId)),
  resetRemoveViewEvnt: () => set({ rmViewDataEvnt: defRmViewData }),
  menuLayout: 'default',
  setMenuLayout: newVal => fnSetMenuLayout(set, newVal),
  menuType: fnGetMenuType(),
  setMenuType: newVal => fnSetMenuType(set, newVal),
  menuCollapse: false,
  setMenuCollapse: newVal => set({ menuCollapse: newVal }),
  resetLangEvent: 0,
  setResetLangEvent: () => set(state => ({ resetLangEvent: state.resetLangEvent + 1 })),
  languageCode: 'ko',
  setLanguageCode: newVal => _setLanguageCode(set, newVal),
  countryCode: '',
  setCountryCode: newVal => _setCountryCode(set, newVal),
  currencyCode: '',
  setCurrencyCode: newVal => _setCurrencyCode(set, newVal),
  navbarVisible: true,
  setNavbarVisible: newVal => set({ navbarVisible: newVal })
})
t3smartScmStore = subscribeWithSelector(t3smartScmStore)
t3smartScmStore = persist(t3smartScmStore, {
  name: "T3SmartSCM", // name of item in the storage (must be unique)
  getStorage: () => sessionStorage, // (optional) by default the 'sessionStorage' is used
  partialize: (state) => ({
    activeViewId: state.activeViewId, contentData: state.contentData,
    languageCode: state.languageCode, countryCode: state.countryCode,
    currencyCode: state.currencyCode
  })
}) //persist
t3smartScmStore = immer(t3smartScmStore) //immer
//t3smartScmStore = log(t3smartScmStore) //log
//t3smartScmStore = devtools(t3smartScmStore) //devtools
export const [useContentStore, storeApi] = create(t3smartScmStore)
async function _initMenu(state, set, mode) {
  const res = await menu.getData();
  if (mode === 'develop') {
    menu.data = menuData;
  } else {
    menu.data = res.data;
  }
  set({ menus: menu.data })
  state.refreshBookmarks();
}
function _setContentData(state, newVal) {
  return { contentData: newVal }
}
function _addContentData(state, newVal) {
  let sConData = [...state.contentData]
  if (sConData.findIndex(i => i.viewId == newVal.viewId) === -1) {
    sConData.push(newVal)
  }
  return { contentData: sConData }
}
function fnSetViewUpdated(state, set, viewId, newVal) {
  if (viewId) {
    let sConData = deepClone(state.contentData)
    let idx = sConData.findIndex(i => i.viewId == viewId)
    if (idx >= 0) {
      let tab = sConData[idx]
      tab.isViewUpdated = newVal;
      set({ contentData: sConData })
    }
  }
}
function fnSetViewGridUpdated(state, set, viewId, gridId, newVal) {
  if (viewId) {
    let sConData = deepClone(state.contentData)
    let idx = sConData.findIndex(i => i.viewId == viewId)
    if (idx >= 0) {
      let tab = sConData[idx]
      tab.gridStatus = { ...tab.gridStatus, gridId: newVal };
      set({ contentData: sConData })
    }
  }
}
function _fireRemoveViewEvnt(state, viewId) {
  let newRemove = [...state.rmViewDataEvnt];
  if (Array.isArray(viewId)) {
    viewId.map(v => {
      if (newRemove.includes(v) == false)
        newRemove.push(v)
    })
  }
  else {
    if (newRemove.includes(viewId) == false)
      newRemove.push(viewId)
  }
  return { rmViewDataEvnt: newRemove }
}
function fnRefreshBookMarks(state, set) {
  let menus = state.menus;
  let ret = [];
  const getChildMenu = (m) => {
    if (m.items.length > 0) {
      m.items.map((child) => {
        ret.concat(getChildMenu(child));
      })
    }
    else {
      ret.push(m);
    }
    return ret;
  }
  const getMenus = (menuid) => {
    if (menus && menus.items) {
      let filtered = menus.items.filter((m) => {
        if (m.id === menuid) {
          return true;
        }
      })
      if (filtered.length > 0) {
        return getChildMenu(filtered[0])
      }
    }

    return []
  }
  let bookmarks = getMenus('BOOKMARK');
  set({ bookmarks: bookmarks })
}
function getMenuFromId(pm, menuId) {

  if (pm.items.length > 0) {
    for (let i = 0; i < pm.items.length; i++) {
      let m = pm.items[i];
      if (m.id == menuId)
        return m;
      else if (m.items && m.items.length > 0) {
        let cm = getMenuFromId(m, menuId);
        if (cm)
          return cm;
      }
    }
  }
  return null;
}
function fnAddBookMark(state, set, menuId) {
  let menus = state.menus;
  let addingMenu = getMenuFromId(menus, menuId);
  if (addingMenu) {
    addingMenu.bookmarked = true;
    fnSetBookMark(menuId, true);
  }
  else
    return;
  let newFavorite = deepClone(addingMenu);
  //bookmark 폴더에 추가
  let bookmarkP = getMenuFromId(menus, 'BOOKMARK');
  if (bookmarkP && bookmarkP.items) {
    let itemIdx = bookmarkP.items.findIndex(menu => menu.id == menuId);
    if (itemIdx < 0) {
      bookmarkP.items.push(newFavorite);
    }
  }

  //메뉴를 수정하고 저장한다.
  let bookmarks = state.bookmarks;
  let idx = bookmarks.findIndex(menu => menu.id == menuId);
  if (idx < 0) {
    bookmarks.push(newFavorite);
    set({ bookmarks: bookmarks })
  }
  //state.refreshBookmarks()
}
function fnDeleteBookMark(state, set, menuId) {
  let menus = state.menus;
  //bookmark 폴더에서 제외
  let bookmarkP = getMenuFromId(menus, 'BOOKMARK');
  if (bookmarkP && bookmarkP.items) {
    let itemIdx = bookmarkP.items.findIndex(menu => menu.id == menuId);
    if (itemIdx >= 0) {
      bookmarkP.items.splice(itemIdx, 1);
    }
  }
  // 해당메뉴의 bookmark 표시 제외
  let addingMenu = getMenuFromId(menus, menuId)
  if (addingMenu) {
    addingMenu.bookmarked = false;
    fnSetBookMark(menuId, false);
  }
  //bookmarks에서 삭제
  let bookmarks = state.bookmarks;
  let idx = bookmarks.findIndex(menu => menu.id == menuId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    set({ bookmarks: bookmarks })
  }
  //state.refreshBookmarks();
}
function fnIsBookMarked(state, menuId) {
  let bookmarks = state.bookmarks;
  if (bookmarks) {
    if (bookmarks.findIndex(menu => menu.id == menuId) >= 0)
      return true;
  }
  return false;
}
function fnSetBookMark(menuCd, bookmarked) {
  let bookmark = {
    id: menuCd,
    bookmarked: bookmarked
  }
  axios({
    method: "post",
    url: baseURI() + "system/menus/bookmark",
    headers: { "content-type": "application/json" },
    data: bookmark
  }).then(function (response) {
  }).catch(function (err) {
    console.log(err);
  })
}
function fnGetMenuType(state) {
  let menuType = localStorage.getItem("menuType");
  if (!menuType) menuType = 'default';
  return menuType;
}
function fnSetMenuType(set, val) {
  set({ menuType: val })
}
function fnSetMenuLayout(set, val) {
  set({ menuLayout: val })
}
function _setLanguageCode(set, newVal) {
  set({ languageCode: newVal })
}
function _setCountryCode(set, newVal) {
  set({ countryCode: newVal })
}
function _setCurrencyCode(set, newVal) {
  set({ currencyCode: newVal })
}
function _setActiveViewId(set, newVal) {

  set({ activeViewId: newVal })
}

let t3smartScmMenuStore = (set, get, api) => ({
  menus: {},
  initMenu: (mode) => _initMenu(get(), set, mode), //메뉴정보
  setMenus: newVal => set(state => { if (isDeepEqual(state.menus, newVal) == false) return { menus: newVal } }),
  bookmarks: [],
  refreshBookmarks: () => fnRefreshBookMarks(get(), set),
  addBookMark: menuId => fnAddBookMark(get(), set, menuId),
  deleteBookMark: menuId => fnDeleteBookMark(get(), set, menuId),
  isBookMarked: menuId => fnIsBookMarked(get(), menuId),
})
t3smartScmMenuStore = subscribeWithSelector(t3smartScmMenuStore)
t3smartScmMenuStore = persist(t3smartScmMenuStore, {
  name: "T3SmartSCMMenus", // name of item in the storage (must be unique)
  getStorage: () => localStorage, // (optional) by default the 'sessionStorage' is used
  partialize: (state) => ({ menus: state.menus })
}
) //persist
t3smartScmMenuStore = immer(t3smartScmMenuStore) //immer
//t3smartScmMenuStore = log(t3smartScmMenuStore) //log
//t3smartScmMenuStore = devtools(t3smartScmMenuStore) //devtools
export const [useMenuStore, menuStoreApi] = create(t3smartScmMenuStore)

let historyModel = (set, get, api) => ({
  urlHistory: [],
  addHistory: newVal => set(state => _addHistory(state, newVal))
})
historyModel = subscribeWithSelector(historyModel)
historyModel = persist(historyModel, {
  name: "T3SmartSCM_History", // name of item in the storage (must be unique)
  getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
  partialize: (state) => ({ urlHistory: state.urlHistory })
}) //persist
historyModel = immer(historyModel) //immer
//historyModel = log(historyModel) //log
//historyModel = devtools(historyModel) //devtools
export const [useHistoryModel] = create(historyModel)
function _addHistory(state, newVal) {
  let newHis = [...state.urlHistory]

  let now = new Date();
  if (newHis.length > 100) {
    newHis = newHis.slice(-100)
  }

  let last = [...newHis].pop();
  if (last) {
    if (last.url != newVal)
      newHis.push({ visittime: now, url: newVal });
  }
  else {
    newHis.push({ visittime: now, url: newVal });
  }
  return { urlHistory: newHis }
}
