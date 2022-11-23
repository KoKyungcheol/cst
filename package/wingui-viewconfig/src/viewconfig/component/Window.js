import { doGridResize } from './grid/gridFunc';
import Component from './Component';


export default class Window extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.loadedComponents = [];

    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    this.element.classList.add('kd_windowWrap');
    this.widget = window.kendo.jQuery(this.element);

    this.widget.kendoWindow(this.opt(me));
    this.widget.off('keydown');

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let dialog = this.widget.data('kendoWindow');
      dialog && dialog.destroy();
    }
    this.destroyed();
  }

  opt(me) {

    let title = vom.get(me.viewId).propTitle(me.id);
    let width = vom.get(me.viewId).propWidth(me.id);
    let height = vom.get(me.viewId).propHeight(me.id);
    let visible = vom.get(me.viewId).propVisible(me.id);
    let modal = vom.get(me.viewId).propModal(me.id);
    let lang = vom.get(me.viewId).propLang(me.id);
    let useActionButtons = vom.get(me.viewId).propUseButtons(me.id);

    let actions = [];
    if (useActionButtons) {
      actions = [
        'Minimize',
        'Maximize',
        'Close'
      ]
    }

    lang && (title = transLangKey(title));

    return {
      title: title,
      width: width,
      height: height,
      visible: visible,
      modal: modal,
      resizable: true,
      actions: actions,
      appendTo: "div#" + me.viewId + "-content",
      open() {
        console.log(`Open a component in new window. (component id: ${me.id}`);

        if (me.loadedComponents.length > 0) {
          for (let i = 0, n = me.loadedComponents.length; i < n; i++) {
            const loadedComponent = me.loadedComponents[i];
            loadedComponent.initValue();
            loadedComponent.initAction();
          }
        } else {
          me.loadedComponents = [];

          let componentIds = vom.get(me.viewId).getContainerComponentIds(me.id);
          for (let i = 0, n = componentIds.length; i < n; i++) {
            let componentId = componentIds[i];

            let componentType = vom.get(me.viewId).getComponentType(componentId);
            if (!co.isEmptyFragment() && com.get(me.viewId).isDocumentComponent(componentType)) {
              com.get(me.viewId).addUnmountedId(componentId);
              continue;
            }

            let component = com.get(me.viewId).getComponent(componentId);
            if (component && !component.isMounted) {
              if (componentType === 'TAB') {
                component.resizable(false);
              }

              component.mount();
              me.loadedComponents.push(component);
            }
          }

          if (me.loadedComponents.length > 0) {
            console.groupCollapsed(`Run the initial action. (window id: ${me.id})`);
            for (let i = 0, n = me.loadedComponents.length; i < n; i++) {
              me.loadedComponents[i].initAction();
            }
            console.groupEnd();
          }
        }

        com.get(me.viewId).opendWindow();
      },
      activate() {
        console.log(`The window component is activated. (component id: ${me.id}`);
        doGridResize(me.viewId);
      },
      close(e) {
        console.log(`The window component has closed. (component id: ${me.id}`);
       if(com.get(me.viewId)) {
        com.get(me.viewId).closedWindow();
       }
      },
      deactivate() {
      },
      resize() {
        doGridResize(me.viewId);
      }
    };
  }

  getActualComponent() {
    return this.widget.data('kendoWindow');
  }

  getValue() {
    console.warn(`The getValue function is not supported for this window component. (component id: ${me.id}`);
    return null;
  }

  setValue() {
    console.warn(`The setValue function is not supported for this window component. (component id: ${me.id}`);
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

    this.mount();

    if (operationId === 'OPEN') {
      this.getActualComponent().center().open();
    } else if (operationId === 'CLOSE') {
      this.getActualComponent().close();
    } else if (operationId === 'CENTER') {
      this.getActualComponent().center();
    } else if (operationId === 'TOFRONT') {
      this.getActualComponent().toFront();
    } else if (operationId === 'SET_TITLE') {
      paramMap['TITLE'] = actionParamMap['TITLE'] || actionParamMap['title'];

      let title = paramMap['TITLE'];
      let lang = vom.get(me.viewId).propLang(this.id);

      lang && (title = transLangKey(title));

      this.getActualComponent().title(title);

      if (title instanceof Object) {
        failFunc(this.id, operationId, null);
      } else {
        successFunc(this.id, operationId, null);
      }

      completeFunc(this.id, operationId, null);

      return;
    }

    successFunc(this.id, operationId, null);
    completeFunc(this.id, operationId, null);
  }
}
