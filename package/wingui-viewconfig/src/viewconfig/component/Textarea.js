import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class Textarea extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let width = vom.get(me.viewId).propWidth(this.id);
    let height = vom.get(me.viewId).propHeight(this.id);

    this.textarea = document.createElement('textarea');
    this.textarea.style.width = width ? width + 'px' : '100%';
    this.textarea.style.height = height ? height + 'px' : 'auto';

    this.element.classList.add('cm_textareaWrap');
    this.element.appendChild(this.textarea);

    let editable = vom.get(me.viewId).propEditable(this.id);
    if (!editable) {
      this.textarea.setAttribute('disabled', true);
    }

    let tabIdx = vom.get(me.viewId).propTabIndex(this.id);
    if (tabIdx) {
      this.textarea.setAttribute('tabindex', tabIdx);
    }

    this.addDefaultEvent();

    let initValue = vom.get(me.viewId).propInitValue(this.id);
    if (initValue) {
      this.setValue(initValue);
    }

    this.isMounted = true;
    this.mounted();
  }

  getActualComponent() {
    return $(this.textarea);
  }

  initValue() {
    this.textarea.value = '';
  }

  getValue() {
    return this.textarea.value;
  }

  setValue(data) {
    let me = this;
    if (!data) {
      data = '';
    }

    let extractedData = data;
    let dataId = vom.get(me.viewId).propValueId(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);

    if (data instanceof Array) {
      extractedData = data[0][dataId];
    } else if (data instanceof Object) {
      extractedData = data[dataId];
    }

    (lang) && (extractedData = transLangKey(extractedData));

    this.textarea.value = extractedData;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    }

    if (operationId.startsWith('SET')) {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
      let data = paramMap['SET'];

      this.setValue(data);

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    }

    if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    }

    if (operationId === 'VALIDATE') {
      return !!this.getValue();
    }

    if (operationId.startsWith('ENABLE')) {
      let paramIds = vom.get(me.viewId).getServiceCallAllParameterIds(this.id, 'ENABLE');

      if (actionParamMap.hasOwnProperty('ENABLE') || paramIds.indexOf('ENABLE') > -1) {
        const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

        let value = paramMap['ENABLE'];
        if (value === 'false') {
          value = false;
        }

        value = Boolean(value);
        if (value) {
          this.textarea.removeAttribute('disabled');
        } else {
          this.textarea.setAttribute('disabled', true);
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let me = this;

        const activeSwitch = function (val) {
          if (val) {
            me.textarea.removeAttribute('disabled');
          } else {
            me.textarea.setAttribute('disabled', true);
          }
        };

        this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);
        return;
      }
    }

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId)
    } else {
      callService(actionParamMap, this.id, operationId, successFuncs, failFunc, completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }
}
