import OperationManager from '../../wingui-viewconfig/src/viewconfig/service/OperationManager';
import ServiceManager from '../../wingui-viewconfig/src/viewconfig/service/ServiceManager';
import DataManager from './DataManager';

class ViewServiceManager {
  constructor() {
    this.operationManagers = [];
    this.serviceManagers = [];
    this.dataManagers = [];
    this.active = '';
  }
  init() {
    this.views = [];
  }
  create(viewId) {
    const om = new OperationManager(viewId);
    if (!this.operationManagers.find(x => x.id === viewId)) {
      this.add(om, "operationManager");
    }
    
    const sm = new ServiceManager(viewId);
    if (!this.serviceManagers.find(x => x.viewId === viewId)) {
      this.add(sm, "serviceManager");
    }
  
    const dm = new DataManager(viewId);
    if (!this.dataManagers.find(x => x.currentViewId === viewId)) {
      this.add(dm, "dataManager");
    } 
  }
  clearAll() {
    this.operationManagers = [];
    this.serviceManagers = [];
    this.dataManagers = [];
  }
  remove(viewId) {
    const index = this.operationManagers.findIndex(element => element.id === viewId);
    const index2 = this.serviceManagers.findIndex(element => element.viewId === viewId);
    const index3 = this.dataManagers.findIndex(element => element.currentViewId === viewId);

    if(index !== -1) {
      this.operationManagers.splice(index, 1);
    }

    if(index2 !== -1) {
      this.serviceManagers.splice(index2, 1);
    }

    if(index3 !== -1) {
      this.dataManagers.splice(index3, 1);
    }
  }
  add(d, type) {
    switch (type) {
      case 'operationManager':
        this.operationManagers.push(d);
        break;
      case 'serviceManager':
        this.serviceManagers.push(d);
        break;
      case 'dataManager':
        this.dataManagers.push(d);
        break;
      default:
        console.error(`type is not defined. ${d}`);
    }
  }
  get(viewId, type) {
    switch (type) {
      case 'operationManager':
        return this.operationManagers.find(element => element.id === viewId);
      case 'serviceManager':
        return this.serviceManagers.find(element => element.viewId === viewId);
      case 'dataManager':
        return this.dataManagers.find(element => element.currentViewId === viewId);
      default:
      console.error(`${viewId} ${type} is not exist.`);
    }
  }
}

const vsm = new ViewServiceManager();

export default vsm;