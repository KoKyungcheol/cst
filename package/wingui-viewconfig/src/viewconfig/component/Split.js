import { getCompleteParamMap } from '../service/ServiceManager';
import Component from './Component';


export default class Split extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    const splitIds = vom.get(me.viewId).propSplitIds(this.id);
    const width = vom.get(me.viewId).propWidth(this.id);
    const height = vom.get(me.viewId).propHeight(this.id);

    this.element.style.width = width + 'px';
    if (height) {
      this.element.style.height = height + 'px';
    } else {
      this.element.style.height = '100%';
    }
    this.element.classList.remove('wingui_component');

    let splitDivs = [];
    for (let i = 0, n = this.element.childNodes.length; i < n; i++) {
      let splitDiv = this.element.childNodes[i];
      if (splitDiv.nodeType === Node.ELEMENT_NODE) {
        splitDivs.push(splitDiv);
      }
    }

    if (splitDivs.length === splitIds.length) {
      for (let i = 0, n = splitDivs.length; i < n; i++) {
        splitDivs[i].id = splitIds[i];
        splitDivs[i].classList.add('k-splitContent');
      }
    }

    this.widget = window.kendo.jQuery(this.element);
    this.widget.kendoSplitter(this.opt(me));

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let splitter = this.widget.data('kendoSplitter');
      splitter && splitter.destroy();
    }
    this.destroyed();
  }

  opt(me) {
    let splitPosition = vom.get(me.viewId).propPosition(this.id);
    let splitIds = vom.get(me.viewId).propSplitIds(this.id);

    let panes = [];
    for (let i = 0, n = splitIds.length; i < n; i++) {
      let splitId = splitIds[i];
      let pane = {};

      pane.id = splitId;
      pane.collapsible = vom.get(me.viewId).propCollapsible(this.id, splitId);
      pane.collapsed = vom.get(me.viewId).propCollapsed(this.id, splitId);
      pane.size = vom.get(me.viewId).propSplitSize(this.id, splitId);
      if (!vom.get(me.viewId).propResizable(this.id, splitId)) {
        pane.resizable = false;
      }

      panes.push(pane);
    }

    return {
      orientation: splitPosition || 'horizontal',
      panes: panes,
      resize(e) {
        doGridResize(me.viewId);
      },
      collapse(e) {
      }
    };
  }

  getActualComponent() {
    return this.widget.data('kendoSplitter');
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
    let targetId = paramMap['target'];

    if (operationId === 'OPEN') {
      this.getActualComponent().expand('#' + targetId);
    } else if (operationId === 'CLOSE') {
      this.getActualComponent().collapse('#' + targetId);
    }

    successFunc(this.id, operationId, null);
    completeFunc(this.id, operationId, null);
  }
}
