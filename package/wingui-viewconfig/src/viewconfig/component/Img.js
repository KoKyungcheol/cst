import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class Img extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    let me = this;

    if (this.isMounted) {
      return;
    }

    this.img = document.createElement('img');

    let src = vom.get(me.viewId).propImage(this.id);
    if (src) {
      this.img.setAttribute('src', 'images/' + src);
    } else {
      let initSrc = vom.get(me.viewId).propInitValue(this.id);
      this.img.setAttribute('src', initSrc);
    }

    this.element.appendChild(this.img);
    this.element.classList.add('wing_imgWrap');

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  getDom() {
    return this.img;
  }

  getValue() {
    return this.img.getAttribute('src');
  }

  setValue(data) {
    let me = this;
    let src;
    if (data instanceof Array) {
      src = data[0][vom.get(me.viewId).propValueId(this.id)];
    } else if (data instanceof Object) {
      src = data[vom.get(me.viewId).propValueId(this.id)];
    } else if (typeof data === 'string') {
      src = data;
    }
    this.getDom().setAttribute('src', src);
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;
    if (operationId.startsWith('SET')) {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
      const src = paramMap['src'];

      (src) && this.setValue(src);

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    }

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId === 'VALIDATE') {
      return !!this.getValue();
    }

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else {
      callService(actionParamMap, this.id, operationId, successFuncs, failFunc, completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }
}
