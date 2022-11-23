import Bpmn from './Bpmn';
import Common from './Common';
import Container from './Container';
import Data from './Data';
import FileUpload, { KendoFileUpload } from './FileUpload';
import BaseGrid from './grid/BaseGrid';
import TreeGrid from './grid/TreeGrid';
import Img from './Img';
import Input from './Input';
import Split from './Split';
import Tab from './Tab';
import Textarea from './Textarea';
import URLPage from './URLPage';
import Window from './Window';
import Scheduler from './Scheduler';
import Label from './Label';
import Button from './Button';
import CheckBox from './CheckBox';
import Radio from './Radio';
import ComboBox from './ComboBox';
import DatePicker from './DatePicker';
import Editor from './Editor';
import Tree from './Tree';
import Chart from './chart/Chart';
import PieChart from './chart/PieChart';

class ViewComponent {
  constructor(id) {
    this.id = id;
    this.documentComponentTypes = ['SCHEDULER', 'R_GRID', 'R_TREE', 'EDITOR', 'BPMN_WEB_MODELER', 'SPLIT'];

    this.elements = {};
    this.scriptContents = [];

    this.unmountedIds = [];

    this.factory = new ComponentFactory();

    this.windowCount = 0;
    this.views = {};
  }

  addElement(elementId, element) {
    this.elements[elementId] = element;
  }

  addScriptContent(scriptContent) {
    this.scriptContents.push(scriptContent);
  }

  getScriptContents() {
    return this.scriptContents;
  }

  createComponent(componentId, componentType, viewId) {
    let element = this.elements[componentId];
    if (componentId === 'COMMON' || element) {
      return this.factory.create(componentId, componentType, element, viewId);
    }
    return null;
  }

  getComponent(componentId) {
    return this.factory.getComponent(componentId);
  }

  getComponents() {
    return this.factory.getComponents();
  }

  hasComponent(componentId) {
    return this.factory.hasComponent(componentId);
  }

  set(newViews) {
    if (Object.keys(this.views).includes(vom.active)) {
      this.views[vom.active].push(newViews)
    } else {
      this.views[vom.active] = [];
      this.views[vom.active].push(newViews)
    }
  }

  getNewComponent(id) {
    this.views[vom.active].forEach(element => {
      if (element.id === id) {
        return element
      }
    });
  }

  getMetaComponentIds() {
    return this.factory.getMetaComponentIds();
  }

  addUnmountedId(componentId) {
    this.unmountedIds.push(componentId);
  }

  getUnmountedIds() {
    return this.unmountedIds;
  }

  isDocumentComponent(componentType) {
    return this.documentComponentTypes.includes(componentType);
  }

  hasOpendWindow() {
    return this.windowCount > 0;
  }

  opendWindow() {
    this.windowCount++;
  }

  closedWindow() {
    this.windowCount--;
  }

  clear() {
    this.unmountedIds.length = 0;
    this.scriptContents.length = 0;

    for (let elementId in this.elements) {
      delete this.elements[elementId];
    }

    this.factory.clear();

    this.windowCount = 0;
  }
}

class ComponentFactory {
  constructor() {
    this.metaComponentIds = [];

    this.components = {};
  }

  create(id, type, element, viewId) {
    // console.log("in ComponentFactory >> Type :: " + type);
    if (id === 'COMMON') {
      let component = this.getComponent(id);
      if (!component) {
        component = new Common(id, element, viewId);
        component.type = type;

        this.components[id] = component;
        // console.log('The common component has been created.');
      }
      return component;
    }

    if (!vom.get(viewId).hasComponent(id)) {
      return null;
    }

    let component = this.getComponent(id);
    if (component) {
      return component;
    }

    switch (type) {
      case 'LABEL':
        component = new Label(id, element, viewId);
        break;
      case 'IMG':
        component = new Img(id, element, viewId);
        break;
      case 'BUTTON':
        component = new Button(id, element, viewId);
        break;
      case 'INPUTBOX':
        component = new Input(id, element, viewId);
        break;
      case 'CHECKBOX':
        component = new CheckBox(id, element, viewId);
        break;
      case 'RADIO':
        component = new Radio(id, element, viewId);
        break;
      case 'COMBOBOX':
        component = new ComboBox(id, element, viewId);
        break;
      case 'EDITOR':
        component = new Editor(id, element, viewId);
        break;
      case 'TEXTAREA':
        component = new Textarea(id, element, viewId);
        break;
      case 'TREE':
        component = new Tree(id, element, viewId);
        break;
      case 'R_GRID':
        component = new BaseGrid(id, element, viewId);
        break;
      case 'R_TREE':
        component = new TreeGrid(id, element, viewId);
        break;
      case 'CHART':
        component = new Chart(id, element, viewId);
        break;
      case 'CHART_PIE':
        component = new PieChart(id, element, viewId);
        break;
      case 'DATEPICKER':
        component = new DatePicker(id, element, viewId);
        break;
      case 'FILEUPLOAD':
        component = new FileUpload(id, element, viewId);
        break;
      case 'K_FILEUPLOAD':
        component = new KendoFileUpload(id, element);
        break;
      case 'WINDOW':
        component = new Window(id, element, viewId);
        break;
      case 'URL_PAGE':
        component = new URLPage(id, element, viewId);
        break;
      case 'BPMN_WEB_MODELER':
        component = new Bpmn(id, element, viewId);
        break;
      case 'DATA':
        component = new Data(id, element, viewId);

        const actionEventTypes = vom.get(viewId).getActionEventTypes(id);
        for (let i = 0, n = actionEventTypes.length; i < n; i++) {
          let actionEventType = actionEventTypes[i];
          if (actionEventType === 'meta') {
            this.metaComponentIds.push(id);
            break;
          }
        }
        break;
      case 'TAB':
        component = new Tab(id, element, viewId);
        break;
      case 'SPLIT':
        component = new Split(id, element, viewId);
        break;
      case 'CONTAINER':
        component = new Container(id, element, viewId);
        break;
      case 'SCHEDULER':
        component = new Scheduler(id, element, viewId);
        break;
      default:
        console.error(`Component type is not defined. (component id: ${id}, component type: ${type})`);
    }

    if (component) {
      this.components[id] = component;
      component.type = type;

      return component;
    }

    return null;
  }

  hasComponent(id) {
    return id in this.components;
  }

  getComponent(id) {
    return this.components[id];
  }

  getComponents() {
    return this.components;
  }

  getMetaComponentIds() {
    return this.metaComponentIds;
  }

  clear() {
    this.metaComponentIds.length = 0;

    for (let id in this.components) {
      this.components[id].destroy();
      delete this.components[id];
    }
  }
}

export default ViewComponent;
