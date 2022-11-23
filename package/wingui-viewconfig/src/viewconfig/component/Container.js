import { doGridResize } from './grid/gridFunc';
import Component from './Component';

export default class Container extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.containerElements = {};

    this.initContainerIds = [];
    this.selectedContainerId = '';

    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.element.classList.add('cm_containerWrap');

    const width = vom.get(this.viewId).propWidth(this.id);
    if (width) {
      this.element.style.width = width + 'px';
    }

    const height = vom.get(this.viewId).propHeight(this.id);
    if (height) {
      this.element.style.minHeight = height + 'px';
    }

    const isGroupBox = vom.get(this.viewId).hasGroupBox(this.id);
    if (isGroupBox) {
      let groupBoxBorderWidth = vom.get(this.viewId).propGroupBoxBorderWidth(this.id) || 1;
      let groupBoxBorderStyle = vom.get(this.viewId).propGroupBoxBorderStyle(this.id) || 'solid';
      let groupBoxBorderColor = vom.get(this.viewId).propGroupBoxBorderColor(this.id) || '#9f9f9f';
      let groupBoxBorderRadius = vom.get(this.viewId).propGroupBoxBorderRadius(this.id);
      let groupBoxTitle = vom.get(this.viewId).propGroupBoxTitle(this.id);

      this.element.style.borderWidth = groupBoxBorderWidth + 'px';
      this.element.style.borderStyle = groupBoxBorderStyle;
      this.element.style.borderColor = groupBoxBorderColor;

      if (groupBoxBorderRadius) {
        this.element.style.borderRadius = groupBoxBorderRadius + 'px';
      }

      if (groupBoxTitle) {
        let titleWrap = document.createElement('span');
        let title = document.createElement('span');
        let titlePosition = vom.get(this.viewId).propGroupBoxTitlePosition(this.id);

        title.classList.add('containerTitle');
        title.innerText = transLangKey(groupBoxTitle);

        titleWrap.style.display = 'block';
        titleWrap.style.textAlign = titlePosition;
        titleWrap.classList.add('containerTitleWrap');
        titleWrap.appendChild(title);

        this.element.appendChild(titleWrap);
      }
    }

    const containerIds = vom.get(this.viewId).propContainerIds(this.id);

    let containerDivs = [];
    for (let i = 0, n = this.element.childNodes.length; i < n; i++) {
      let containerElement = this.element.childNodes[i];
      if (containerElement.nodeName === 'DIV') {
        containerDivs.push(containerElement);
      }
    }

    for (let i = 0, n = containerDivs.length; i < n; i++) {
      let containerDiv = containerDivs[i];
      let containerId = containerIds[i];

      containerDiv.id = containerId;

      this.element.appendChild(containerDiv);

      let isExpand = vom.get(this.viewId).propContainerExpand(this.id, containerId);
      if (isExpand) {
        this.initContainerIds.unshift(containerId);
        containerDiv.classList.add('active');
      }

      let isRender = vom.get(this.viewId).propContainerInitRender(this.id, containerId);
      if (isRender) {
        this.initContainerIds.push(containerId);
      }

      this.containerElements[containerId] = containerDiv;
    }

    let mountedComponents = [];

    for (let i = 0, n = this.initContainerIds.length; i < n; i++) {
      let containerId = this.initContainerIds[i];

      let children = vom.get(this.viewId).getContainerComponentIds(this.id)[containerId];
      for (let j = 0, len = children.length; j < len; j++) {
        let componentId = children[j];

        let componentType = vom.get(this.viewId).getComponentType(componentId);
        if (!co.isEmptyFragment() && com.get(this.viewId).isDocumentComponent(componentType)) {
          com.get(this.viewId).addUnmountedId(componentId);
          continue;
        }

        let component = com.get(this.viewId).getComponent(componentId);
        if (component && !component.isMounted) {
          component.mount();
          mountedComponents.push(component);
        }
      }
    }

    if (mountedComponents.length > 0) {
      console.groupCollapsed(`Run the initial action. (container id: ${this.id})`);
      for (let i = 0, n = mountedComponents.length; i < n; i++) {
        mountedComponents[i].initAction();
      }
      console.groupEnd();
    }

    this.isMounted = true;
    this.mounted();
  }

  getValue() {
    return this.selectedContainerId;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    if (operationId === 'ACTIVATE') {
      this.selectedContainerId = actionParamMap['ACTIVATE'];

      let containers = Object.values(this.containerElements);
      for (let i = 0, n = containers.length; i < n; i++) {
        let container = containers[i];
        if (container.classList.contains('active')) {
          container.classList.remove('active');
        }
      }

      let containerElement = this.containerElements[this.selectedContainerId];
      if (containerElement) {
        containerElement.classList.add('active');

        let mountedComponents = [];

        let children = vom.get(this.viewId).getContainerComponentIds(this.id)[containerElement.id];
        for (let i = 0, n = children.length; i < n; i++) {
          let childId = children[i];

          let componentType = vom.get(this.viewId).getComponentType(childId);
          if (!co.isEmptyFragment() && com.get(this.viewId).isDocumentComponent(componentType)) {
            com.get(this.viewId).addUnmountedId(childId);
            continue;
          }

          let component = com.get(this.viewId).getComponent(childId);
          if (component && !component.isMounted) {
            component.mount();
            mountedComponents.push(component);
          }
        }

        if (mountedComponents.length > 0) {
          console.groupCollapsed(`Run the initial action. (container id: ${this.id})`);
          for (let i = 0, n = mountedComponents.length; i < n; i++) {
            mountedComponents[i].initAction();
          }
          console.groupEnd();
        }
      }

      doGridResize(this.viewId);
    } else if (operationId === 'INIT') {
      let containers = Object.values(this.containerElements);
      for (let i = 0, n = containers.length; i < n; i++) {
        let container = containers[i];
        if (container.classList.contains('active')) {
          container.classList.remove('active');
        }
      }
    }

    successFunc(this.id, operationId, null);
    completeFunc(this.id, operationId, null);
  }
}
