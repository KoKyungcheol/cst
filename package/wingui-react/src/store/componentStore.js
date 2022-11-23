import create from 'zustand';
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import produce from 'immer';

const immer = config => (set, get, api) => config((partial, replace) => {
  const nextState = typeof partial === 'function'
    ? produce(partial)
    : partial
  return set(nextState, replace)
}, get, api)


let componentStore = (set, get, api) => ({
  componentData: [],
  setComponentInfo: (viewId, key, value) => fnSetComponentInfo(get(), set, viewId, key, value),
  getComponentInfo: (viewId, key) => fnGetComponentInfo(get(), viewId, key)
})
componentStore = subscribeWithSelector(componentStore)
componentStore = immer(componentStore)

export const [useComponentStore, componentApi] = create(componentStore)

function fnSetComponentInfo(state, set, viewId, key, value) {
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

function fnGetComponentInfo(state, viewId, key) {
  if (viewId) {
    let viewData = state.viewData;
    if (viewData) {
      let idx = viewData.findIndex(i => i.viewId == viewId)
      if (idx >= 0) {
        let viewObj = viewData[idx]
        return viewObj[key]
      }
    }
  }
  return null;
}

