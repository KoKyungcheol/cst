import baseURI from './baseURI';
import {
  componentClassName,
  PERMISSION_TYPE_PREFIX,
  DIALOG_TYPE
} from './const';
import permission from './Permission';
import getHeaders from './getHeaders';
import vom from './ViewObjectManager';
import ViewObject from './ViewObject';
import com from './ViewComponentManager';
import { setLoadingBar } from './Loading'
import vsm from './ViewServiceManager';

class ViewContentLoader {
  constructor() {
    this.intervals = {};
    this.contentLoading = false
  }
  
  load(viewId, newType) {
    setLoadingBar(true);
    if (newType) {
      vsm.create(viewId);
      com.create(viewId);
      setLoadingBar(false);
    } else {
      vsm.create(viewId);
      com.create(viewId);
      let promise = Promise.resolve(true);
      let me = this;
      return promise 
        .then((answer) => {
          if (answer) {
            me.contentLoading = true;
            localStorage.setItem('lastViewId', viewId);
  
            document.title = transLangKey(viewId.toUpperCase());
  
            console.log(`Loading the content... (view id: ${viewId})`);
  
            if (!viewId) {
              console.warn('The view id is not set.');
              showDialog('Warning', 'The view id is not set.', DIALOG_TYPE.ALERT);
              return false;
            }
  
            me.viewId = viewId;
            if(me != undefined) {
              me.init(viewId);
            }
            
  
            if (window.viewWaitOn) {
              waitOn('body');
            }
  
            return true;
          }
  
          return false;
        })
        .then((result) => {
          if (result) {
            me.create(viewId)
              .then(() => {
                me.mount(viewId);
              })
              .then(() => {
                // if (vom.get(viewId).includeVue()) {
                //   let kelements = document.querySelectorAll('.k-window')
                //   for (let i = 0, n = kelements.length; i < n; i++) {
                //     kelements[i].parentNode.removeChild(kelements[i]);
                //   }
                // }
                if (window.viewWaitOn) {
                  console.warn('waitView off');
                  waitOff('body');
                }
              });
          } else {
            if (window.viewWaitOn) {
              console.warn('waitView off');
              waitOff('body');
            }
          }
  
          return result;
        })
    }
  }

  init(viewId) {
    this.preparedPromises = {};
    this.createdPromise = new Deferred();
    this.mountedPromise = new Deferred();

    if (TGGrids.Gantt) {
      TGGrids.Gantt.Dispose();
    }

    com.get(viewId).clear();
    xl.clear();

    for (let componentId in this.intervals) {
      let interval = this.intervals[componentId];
      if (interval) {
        for (let eventType in interval) {
          let handle = interval[eventType];
          if (handle) {
            window.clearInterval(handle);
          }
        }
      }
      interval = null;
    }

    this.intervals = {};

    if (!this.content) {
      this.content = document.getElementById('content');
    }
    if(this.content != undefined) {
      this.content.innerHTML = '';
    }

    this.fragment = document.createDocumentFragment();
  }

  async template(viewId) {
    try {
      return await axios.get(baseURI() + 'template/' + viewId, {
        headers: getHeaders()
      });
    } catch (err) {
      console.error(`Failed to load template file. (error: ${err})`);
    }
  }

  create(viewId) {
    console.groupCollapsed('Creating components...');

    const vo = new ViewObject(viewId);
    permission.load(viewId);

    let permissionValue = permission.valueOf(PERMISSION_TYPE_PREFIX + 'READ');
    if (!permissionValue) {
      showDialog('Warning', 'Don\'t have permission to read ' + viewId, DIALOG_TYPE.ALERT);

      console.warn('The component was not created. (Permission Denied)');
      console.groupEnd();

      this.createdPromise.resolve();
      return;
    }

    let me = this;

    let viewConfigPromise = vo.load(viewId);
    let templatePromise = this.template(viewId);

    return Promise.all([viewConfigPromise, templatePromise]).then(values => {
      let templates = [];

      let templateHtml = new DOMParser().parseFromString(values[1].data, 'text/html');

      let templateBody = templateHtml.getElementsByTagName('body')[0].children;
      for (let i = 0, n = templateBody.length; i < n; i++) {
        templates.push(templateBody[i]);
      }

      templateHtml = null;
      templateBody = null;

      if (templates.length === 0) {
        console.warn('The component was not created. (The template is empty)');
        console.groupEnd();
        return;
      }

      for (let i = 0, n = templates.length; i < n; i++) {
        me.fragment.appendChild(templates[i]);
      }

      com.get(viewId).createComponent('COMMON', 'COMMON', viewId);

      let elements = me.fragment.querySelectorAll('.' + componentClassName);
      for (let i = 0, n = elements.length; i < n; i++) {
        let element = elements[i];
        if (vom.get(viewId).hasComponent(element.id)) {
          com.get(viewId).addElement(element.id, element);

          let componentType = vom.get(viewId).getComponentType(element.id);
          com.get(viewId).createComponent(element.id, componentType, viewId);

          if (componentType === 'WINDOW') {
            element.parentNode.removeChild(element);
          }
        }
        element = null;
      }

      me.createdPromise.resolve();

      let scripts = me.fragment.querySelectorAll('script');
      for (let i = 0, n = scripts.length; i < n; i++) {
          let script = scripts[i];
          com.get(viewId).addScriptContent(script.innerHTML);
          script.parentNode.removeChild(script);

          script = null;
      }

      console.log('Created components.');
      console.groupEnd();

      me.contentLoading = false;

      templates = null;
      elements = null;
      scripts = null;
    });
  }

  mount(viewId) {
    console.groupCollapsed('Mounting components...');
    if (com.get(viewId).getComponents().length === 0) {
      this.mountedPromise.resolve();

      console.warn('The component was not mounted. (components is empty)');
      console.groupEnd();
      return;
    }

    let me = this;

    this.prepareData(viewId).then(() => {
      let componentIds = vom.get(viewId).getContainerComponentIds('DOCUMENT');

      let mountedComponents = [];

      for (let i = 0, n = componentIds.length; i < n; i++) {
        let componentId = componentIds[i];

        let component = com.get(viewId).getComponent(componentId);
        if (component) {
          if (com.get(viewId).isDocumentComponent(component.type)) {
            com.get(viewId).addUnmountedId(componentId);
            continue;
          }

          component.mount();
          mountedComponents.push(component);
        }
      }

      me.content.appendChild(me.fragment);
      me.loadScripts(viewId);

      let unmountedIds = com.get(viewId).getUnmountedIds();
      for (let i = 0, n = unmountedIds.length; i < n; i++) {
        let component = com.get(viewId).getComponent(unmountedIds[i]);
        if (component) {
          component.mount();
          mountedComponents.push(component);
        }
      }

      console.groupCollapsed('Run the initial action. (document children component)');
      for (let i = 0, n = mountedComponents.length; i < n; i++) {
        mountedComponents[i].initAction();
      }
      console.groupEnd();

      me.mountedPromise.resolve();

      window.scrollTo(500, 0);
      history.pushState({ currentViewId: viewId }, viewId);

      console.log('Mounted components.');
      console.groupEnd();

      mountedComponents = null;
      setLoadingBar(false);
    }).catch((err) => {
      me.mountedPromise.resolve();

      console.warn(`The component was not mounted. (error message: ${err.message})`);
      console.groupEnd();
      setLoadingBar(false);
    });
  }

  prepareData(viewId) {
    let me = this;

    return new Promise((resolve, reject) => {
      let promises = [];
      let componentIds = com.get(viewId).getMetaComponentIds();
      for (let i = 0, n = componentIds.length; i < n; i++) {
        let promise = new Deferred();
        promises.push(promise);

        let componentId = componentIds[i];
        me.preparedPromises[componentId] = promise;

        vsm.get(viewId, 'operationManager').actionOperation(componentId, 'meta');
      }

      Promise.all(promises).then(() => {
        console.log('Initial data preparation is completed.');
        resolve();
      }).catch((err) => {
        setLoadingBar(false);
        console.error(`Initial data preparation is failed. (error: ${err})`);
        reject();
      });
    });
  }

  preparedPromise(componentId) {
    return this.preparedPromises[componentId];
  }

  componentCreated() {
    return this.createdPromise.promise;
  }

  componentMounted() {
    return this.mountedPromise.promise;
  }

  loadScripts(viewId) {
    let scriptContents = com.get(viewId).getScriptContents();
    for (let i = 0, n = scriptContents.length; i < n; i++) {
      let scriptElement = document.createElement('script');
      scriptElement.innerHTML = scriptContents[i];
      this.content.appendChild(scriptElement);
    }
  }

  isEmptyFragment() {
    return this.fragment.childNodes.length === 0;
  }

  getTargetDocument() {
    if (this.isEmptyFragment()) {
      return document;
    }
    return this.fragment;
  }

  getIntervals() {
    return this.intervals;
  }
}

const co = new ViewContentLoader();

export default co;
