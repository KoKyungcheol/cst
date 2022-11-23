import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class CheckBox extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    let labelText = vom.get(this.viewId).propName(this.id);
    let labelPosition = vom.get(this.viewId).propNamePosition(this.id);
    let isChecked = vom.get(this.viewId).propCheckBoxInitValue(this.id);
    let tabIdx = vom.get(this.viewId).propTabIndex(this.id);
    let editable = vom.get(this.viewId).propEditable(this.id);
    let lang = vom.get(this.viewId).propLang(this.id);

    const label = document.createElement('label');
    this.labelTextSpan = document.createElement('span');
    this.input = document.createElement('input');

    this.input.setAttribute('type', 'checkbox');
    this.labelTextSpan.classList.add('kd_checkboxLabel');

    isChecked && (this.input.checked = true);
    tabIdx && this.input.setAttribute('tabindex', tabIdx);
    !editable && this.input.setAttribute('disabled', true);

    lang && (labelText = transLangKey(labelText));
    this.labelTextSpan.innerText = labelText;

    label.appendChild(this.input);
    if (labelPosition === 'left') {
      label.insertBefore(this.labelTextSpan, label.firstChild);
    } else {
      label.appendChild(this.labelTextSpan);
    }

    this.element.appendChild(label);
    this.element.classList.add('kd_checkBoxWrap');

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    }

    if (operationId === 'VALIDATE') {
      return !!this.getValue();
    }

    if (operationId.startsWith('SET')) {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      let data = paramMap['SET'];
      if (data === 'false') {
        data = false;
      }
      data = Boolean(data);

      this.input.checked = data;

      if (paramMap['SET'] instanceof Object || this.input.value instanceof Object) {
        failFunc(this.id, operationId, null);
      } else {
        successFunc(this.id, operationId, null);
      }
      completeFunc(this.id, operationId, null);

      return;
    }

    if (operationId.startsWith('ENABLE')) {
      let paramIds = vom.get(me.viewId).getServiceCallAllParameterIds(this.id, operationId);

      if (actionParamMap.hasOwnProperty('ENABLE') || paramIds.indexOf('ENABLE') > -1) {
        const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

        let value = paramMap['ENABLE'];
        if (value === 'false') {
          value = false;
        }
        value = Boolean(value);

        if (value) {
          this.input.removeAttribute('disabled');
        } else {
          this.input.setAttribute('disabled', true);
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let activeSwitch = function (val) {
          if (val) {
            me.input.removeAttribute('disabled');
          } else {
            me.input.setAttribute('disabled', true);
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

  getActualComponent() {
    return $(this.input);
  }

  getDom() {
    return this.input;
  }

  getValue(type) {
    if (type === undefined) {
      let isChk = this.input.checked;
      if (isChk === null) {
        return null;
      }
      return isChk;
    } else {
      return this.getActualComponent().attr('data-source');
    }
  }

  setValue(...arg) {
    let me = this;
    const extractedData = arg[0];
    const checkBox = this.getDom();

    let valueId = vom.get(me.viewId).propValueId(this.id);
    let textId = vom.get(me.viewId).propTextId(this.id);
    let isChecked = extractedData[0][valueId];
    let labelText = extractedData[0][textId];
    let lang = vom.get(me.viewId).propLang(this.id);

    if (isChecked === 'false') {
      isChecked = false;
    }
    checkBox.checked = Boolean(isChecked);
    checkBox.setAttribute('data-source', JSON.stringify(extractedData[0]));

    if (!labelText) {
      labelText = '';
    }

    if (lang) {
      labelText = transLangKey(labelText);
    }
    this.labelTextSpan.innerText = labelText;
  }

  initValue() {
    let me = this;
    let isChecked = vom.get(me.viewId).propCheckBoxInitValue(this.id);
    if (isChecked) {
      this.input.checked = true;
    } else {
      this.input.checked = false;
    }
  }

  onComponentChanged() {
  }
}
