import create from 'zustand';
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import produce from 'immer';

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


let t3smartScmViewStore = (set, get, api) => ({
  viewData: [], //view 정보 배열
  setViewInfo: (viewId, key, value) => fnSetViewInfo(get(), set, viewId, key, value),
  getViewInfo: (viewId, key) => fnGetViewInfo(get(), viewId, key),
  getViewIsUpdated: (viewId) => fnGetViewIsUpdated(get(), viewId),
  removeViewData: (viewId) => fnRemoveViewData(get(), set, viewId),
  getGlobalButtons: (viewId) => fnGetGlobalButtons(get(), viewId)
})
t3smartScmViewStore = subscribeWithSelector(t3smartScmViewStore)

t3smartScmViewStore = immer(t3smartScmViewStore) //immer
//t3smartScmViewStore = log(t3smartScmViewStore) //log
//t3smartScmViewStore = devtools(t3smartScmViewStore) //devtools

export const [useViewStore, viewApi] = create(t3smartScmViewStore)

function fnSetViewInfo(state, set, viewId, key, value) {
  if (viewId) {

    let newViewData = [...state.viewData];

    let idx = newViewData.findIndex(i => i.viewId == viewId)
    if (idx >= 0) {
      let viewObj = newViewData[idx]
      viewObj[key] = value;
      set({ viewData: newViewData })
    }
    else {
      let newViewObj = { 'viewId': viewId }
      newViewObj[key] = value;

      newViewData.push(newViewObj);
      set({ viewData: newViewData })
    }
  }
}

function fnGetViewInfo(state, viewId, key) {
  if (viewId) {
    let viewData = state.viewData;
    if (viewData) {
      let idx = viewData.findIndex(i => i.viewId == viewId)
      if (idx >= 0) {
        let viewObj = viewData[idx]
        //console.log(viewId, key, viewObj);
        let value = viewObj[key];
        if (value) {
          if(value.type) {
            if ((value.type === 'grid' || value.type === 'treeView') && value.dataProvider) {
              return value
            }
            else {
              return null;
            }
          }
          return value;
        }
      }
    }
  }
  return null;
}

function fnGetViewIsUpdated(state, viewId) {
  let updated = false;
  if (viewId) {
    let viewData = state.viewData;
    if (viewData) {
      let idx = viewData.findIndex(i => i.viewId == viewId)
      if (idx >= 0) {
        let viewObj = viewData[idx]
        Object.keys(viewObj).forEach((id) => {
          let viewValue = viewObj[id];
          //isUpdated 함수가 존재하는지 체크
          if (viewValue['isUpdated'] && viewValue.isUpdated())
            updated = true;
        })
      }
    }
  }
  return updated;
}

function fnRemoveViewData(state, set, viewId) {
  let updated = false;
  if (viewId) {

    let newViewData = [...state.viewData];
    if (newViewData) {
      let idx = newViewData.findIndex(i => i.viewId == viewId)
      if (idx >= 0) {
        let viewObj = newViewData[idx]
        Object.keys(viewObj).forEach((id) => {
          let viewValue = viewObj[id];
          if (viewValue['destory'])
            viewValue.destory();
          delete viewObj[id];
        })
        newViewData.splice(idx, 1)
        set({ viewData: newViewData })
      }
    }
  }
}

function fnGetGlobalButtons(state, viewId) {
  if (viewId) {
    let viewData = state.viewData;
    if (viewData) {
      let idx = viewData.findIndex(i => i.viewId == viewId)
      if (idx >= 0) {
        let viewObj = viewData[idx]
        let value = viewObj['globalButtons'];
        if (typeof value === 'object') {
          return value
        }
        else
          return []
      }
    }
  }
  return [];
}

