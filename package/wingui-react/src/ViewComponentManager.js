import ViewComponent from '../../wingui-viewconfig/src/viewconfig/component/ViewComponent';

class ViewComponentManager {
  constructor() {
    this.viewComponents = [];
    this.waitingComponents = [];
    this.active = '';
  }
  init() {
    this.views = [];
  }
  create(viewId) {
    const cm = new ViewComponent(viewId);
    if(!this.viewComponents.find(x => x.id === viewId)) {
      this.add(cm);
    }
  }
  clearAll() {
    this.viewComponents = [];
  }
  remove(viewId) {
    const index = this.viewComponents.findIndex(element => element.id === viewId);
    if(index !== -1) {
      this.viewComponents.splice(index, 1)
    }
  }
  checkChanges(viewId) {
    let returnValue = false;
    if (vom.get(viewId).includeVue()) {
      Object.keys(Vue.grids).forEach(gridId => {
        let gridView = Vue.grids[gridId].gridView;
        if (gridView && Object.keys(gridView).length > 0 ) {
          gridView.commit(true);
  
          let dataProvider = gridView.getDataProvider();
          let statRows = dataProvider.getAllStateRows();
  
          let stats = Object.getOwnPropertyNames(statRows);
          for (let i = 0, n = stats.length; i < n; i++) {
            let stat = statRows[stats[i]];
            if (stat.length > 0) {
              returnValue = true;
            }
          }
        }
      })
    } else {
      for (let componentId in com.get(viewId).getComponents()) {
        let component = com.get(viewId).getComponent(componentId);
        if (component.type !== 'R_GRID' && component.type !== 'R_TREE') {
          continue;
        }
  
        if (component.ignoreChange) {
          continue;
        }
  
        let gridView = component.getActualComponent();
        
        if (gridView && Object.keys(gridView).length > 0 ) {
          gridView.cancel();
          gridView.commit(true);
  
          let dataProvider = gridView.getDataProvider();
          let statRows = dataProvider.getAllStateRows();
  
          let stats = Object.getOwnPropertyNames(statRows);
          for (let i = 0, n = stats.length; i < n; i++) {
            let stat = statRows[stats[i]];
            if (stat.length > 0) {
              returnValue = true;
            }
          }
        }
      }
    }
    return returnValue;
  }
  checkWaitStatus(viewId) {
    return this.waitingComponents.find(element => element === viewId)
  }
  addWaitStatus(viewId) {
    const index = this.waitingComponents.findIndex(element => element === viewId);
    if (index === -1) {
      this.waitingComponents.push(viewId)
    }
    let iconElement = document.createElement('i');

    iconElement.classList.add("fa","fa-spinner");
    iconElement.style.marginRight = "5px";

    let tabElement = document.getElementsByClassName(viewId + " inner nav-link");
    
    if(tabElement.length !== 0) {
      tabElement[0].insertBefore(iconElement, tabElement[0].firstChild);
    }
  }
  removeWaitStatus(viewId) {
    const index = this.waitingComponents.findIndex(element => element === viewId);
    if (index !== -1) {
      this.waitingComponents.splice(index, 1)
      if (document.getElementsByClassName(viewId + " inner nav-link")[0].firstChild.tagName === 'I') {
        document.getElementsByClassName(viewId + " inner nav-link")[0].firstChild.remove();
      }
    }
  }
  add(d) {
    this.viewComponents.push(d);
  }
  hasComponent(componentId) {
    return com.get(com.active).hasComponent(component);
  }

  hasOpendWindow() {
    return com.get(com.active).windowCount > 0;
  }

  get(viewId) {
    return this.viewComponents.find(element => element.id === viewId)
  }

  getActive() {
    return this.viewComponents.find(element => element.id === this.active)
  }
  
}

const com = new ViewComponentManager();

export default com;