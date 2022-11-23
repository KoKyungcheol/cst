import { getCompleteParamMap } from '../service/ServiceManager';
import { doGridResize } from './grid/gridFunc';
import Component from './Component';

export default class Tab extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.itemElements = {};
    this.contentElements = {};

    this.initTabIds = [];
    this.selectedTabId = '';

    this.isResizeContent = true;

    this.created();
  }

  mount() {
    let me = this;

    if (this.isMounted) {
      return;
    }

    this.width = vom.get(me.viewId).propWidth(this.id);
    this.height = vom.get(me.viewId).propHeight(this.id);

    this.width && (this.element.style.width = this.width + 'px');
    !this.height && (this.element.style.height = '100%');

    let headerElement = this.createItems();

    this.element.insertBefore(headerElement, this.element.firstChild);

    this.widget = window.kendo.jQuery(this.element);
    this.widget.kendoTabStrip(this.opt(me));

    for (let i = 0, n = this.element.childNodes.length; i < n; i++) {
      let contentElement = this.element.childNodes[i];
      if (contentElement.nodeName !== 'DIV') {
        continue;
      }

      this.contentElements[contentElement.id] = contentElement;
    }

    let mountedComponents = [];
    for (let i = 0, n = this.initTabIds.length; i < n; i++) {
      let tabId = this.initTabIds[i];

      let children = vom.get(me.viewId).getContainerComponentIds(this.id)[tabId];
      for (let j = 0, len = children.length; j < len; j++) {
        let componentId = children[j];
        let componentType = vom.get(me.viewId).getComponentType(componentId);
        if (!co.isEmptyFragment() && com.get(com.active).isDocumentComponent(componentType)) {
          com.get(com.active).addUnmountedId(componentId);
          continue;
        }

        let component = com.get(com.active).getComponent(componentId);
        if (component && !component.isMounted) {
          component.mount();
          mountedComponents.push(component);
        }
      }
    }

    if (mountedComponents.length > 0) {
      console.groupCollapsed(`Run the initial action. (tab id: ${this.id})`);
      for (let i = 0, n = mountedComponents.length; i < n; i++) {
        mountedComponents[i].initAction();
      }
      console.groupEnd();
    }

    let checkIds = [];
    for (let i = 0, n = headerElement.childNodes.length; i < n; i++) {
      checkIds.push(headerElement.childNodes[i].getAttribute('aria-controls'));
    }

    let targets = Object.values(this.contentElements);
    for (let i = 0, n = targets.length; i < n; i++) {
      let target = targets[i];

      if (!target.id || !checkIds.includes(target.id)) {
        console.log(`Removed tab content. (tab content id: ${target.id})`);
        target.parentNode.removeChild(target);
      }
    }

    this.resizeContent();
    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let tabStrip = this.widget.kendoTabStrip().data('kendoTabStrip');
      tabStrip && tabStrip.destroy();
    }
    this.destroyed();
  }

  createItems() {
    let me = this;
    let ul = document.createElement('ul');

    const tabIds = vom.get(me.viewId).propTabIds(this.id);
    for (let i = 0, n = tabIds.length; i < n; i++) {
      let tabId = tabIds[i];

      let title = vom.get(me.viewId).propTabTitle(this.id, tabId);
      let expand = vom.get(me.viewId).propTabExpand(this.id, tabId);
      let initRender = vom.get(me.viewId).propTabInitRender(this.id, tabId);

      let li = document.createElement('li');
      li.id = tabId;
      li.appendChild(document.createTextNode(transLangKey(title)));

      if (expand) {
        this.initTabIds.push(tabId);
        li.classList.add('k-state-active');
      }

      if (initRender) {
        this.initTabIds.push(tabId);
      }

      this.itemElements[li.id] = li;
      ul.appendChild(li);
    }

    return ul;
  }

  resizable(isResizeContent) {
    this.isResizeContent = isResizeContent;
  }

  resizeContent() {
    if (!this.isResizeContent) {
      return;
    }

    const headerHeight = 66; // header height : 32, inner div height : 34

    for (let i = 0, n = this.element.childNodes.length; i < n; i++) {
      let contentElement = this.element.childNodes[i];
      if (contentElement.nodeName !== 'DIV') {
        continue;
      }

      if (this.height) {
        contentElement.style.minHeight = parseInt(this.height) - parseInt(headerHeight) + 'px';
        contentElement.style.height = parseInt(this.height) - parseInt(headerHeight) + 'px';
      } else {
        contentElement.style.minHeight = 'calc(100% - ' + parseInt(headerHeight) + 'px)';
        contentElement.style.height = 'calc(100% - ' + parseInt(headerHeight) + 'px)';
      }
    }
  }

  opt(me) {
    let tabPosition = vom.get(me.viewId).propPosition(this.id);
    if(tabPosition === '') {
      tabPosition = 'top';
    }
    return {
      tabPosition: tabPosition,
      animation: {
        close: {
          duration: 200,
          effects: 'fadeOut'
        },
        open: {
          duration: 200,
          effects: 'fadeIn'
        }
      },
      select(e) {
        me.selectedTabId = e.contentElement.id;
      },
      show(e) {
        me.doBeforeShow();
        let mountedComponents = [];

        let children = vom.get(me.viewId).getContainerComponentIds(me.id)[e.item.id];
        for (let i = 0, n = children.length; i < n; i++) {
          let componentId = children[i];
          
          let componentType = vom.get(me.viewId).getComponentType(componentId);
          if (!co.isEmptyFragment() && com.get(me.viewId).isDocumentComponent(componentType)) {
            com.get(me.viewId).addUnmountedId(componentId);
            continue;
          }

          let component = com.get(me.viewId).getComponent(componentId);
          if (component && !component.isMounted) {
            component.mount();
            mountedComponents.push(component);
          }
        }

        if (mountedComponents.length > 0) {
          console.groupCollapsed(`Run the initial action. (tab id: ${me.id})`);
          for (let i = 0, n = mountedComponents.length; i < n; i++) {
            mountedComponents[i].initAction();
          }
          console.groupEnd();
        }
      },
      activate(e) {
        let tabHeight = me.height;

        let tabsHeight = me.tabsHeight;
        if (tabHeight === '100%') {
          e.contentElement.style.height = 'calc(100% - ' + tabsHeight + 'px)';
        } else {
          e.contentElement.style.height = (tabHeight - tabsHeight) + 'px';
        }

        console.log(`The tab component activated. (component id: ${me.id}, tab id: ${e.item.id})`);

        if (vom.get(me.viewId).getOperationCallIds(me.id, 'activate-tab').length > 0) {
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, 'activate-tab');
        }

        me.doAfterActivate();
        doGridResize(me.viewId);
      }
    };
  }

  getActualComponent() {
    return this.widget.data('kendoTabStrip');
  }

  getValue() {
    let tabElement = this.element.querySelector('.k-state-active');
    if (tabElement) {
      this.selectedTabId = tabElement.id;
    }
    return this.selectedTabId;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;

    if (operationId === 'ACTIVATE') {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      this.selectedTabId = paramMap['ACTIVATE'];

      let itemElement = this.itemElements[this.selectedTabId];
      if (itemElement) {
        this.getActualComponent().activateTab($(itemElement));
      }
    }

    successFunc(this.id, operationId, null);
    completeFunc(this.id, operationId, null);
  }

  doBeforeShow() {
  }

  doAfterActivate() {
  }
}
