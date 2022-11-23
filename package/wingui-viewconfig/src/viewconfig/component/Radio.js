import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class Radio extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.radios = [];

    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let nameText = vom.get(me.viewId).propName(this.id);
    let optionDeployment = vom.get(me.viewId).propOptionDeployment(this.id) === 'vertical' ? 'block' : 'inline-block';
    let tabIdx = vom.get(me.viewId).propTabIndex(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);

    const options = vom.get(me.viewId).propOptions(this.id);
    const btnGroup = document.createElement('span');

    btnGroup.classList.add('kd_radioBtnGroup');

    for (let i = 0, n = options.length; i < n; i++) {
      let value = vom.get(me.viewId).propOptionPropertyValue(options[i], 'value');

      let isChecked = vom.get(me.viewId).propOptionSelected(this.id, value);
      let optionText = vom.get(me.viewId).propOptionText(this.id, value) || value;
      let optionTextPosition = vom.get(me.viewId).propOptionTextPosition(this.id, value);

      const radio = document.createElement('input');
      const labelText = document.createElement('span');
      const label = document.createElement('label');

      radio.setAttribute('type', 'radio');
      labelText.classList.add('kd_radioLabel');

      radio.setAttribute('id', value);
      radio.setAttribute('name', this.id);
      radio.setAttribute('data-caption', optionText);

      if (isChecked) {
        radio.setAttribute('checked', 'checked');
      }

      if (tabIdx) {
        radio.setAttribute('tabindex', tabIdx);
      }

      if (lang) {
        optionText = transLangKey(optionText);
      }

      label.appendChild(radio);
      label.style.margin = '5px';
      label.style.display = optionDeployment;

      labelText.innerText = optionText;

      if (optionTextPosition === 'left') {
        label.insertBefore(labelText, label.firstChild);
      } else {
        label.appendChild(labelText);
      }

      btnGroup.appendChild(label);

      this.radios.push(radio);
    }

    if (Boolean(nameText)) {
      if (lang) {
        nameText = transLangKey(nameText);
      }

      const title = document.createElement('span');
      title.classList.add('kd_radioTitle');
      title.innerText = nameText;
      title.style.margin = '5px';
      this.element.appendChild(title);
    }

    this.element.classList.add('kd_radioWrap');
    this.element.appendChild(btnGroup);

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let successFuncs = successFunc;

    let me = this;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    } else if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);
      return;
    } else if (operationId.startsWith('ENABLE')) {
      let paramIds = vom.get(me.viewId).getServiceCallAllParameterIds(this.id, operationId);

      if (actionParamMap.hasOwnProperty('ENABLE') || paramIds.indexOf('ENABLE') > -1) {
        let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

        let value = paramMap['ENABLE'];
        if (value === 'false') {
          value = false;
        }
        value = Boolean(value);

        if (value) {
          for (let i = 0, n = this.radios.length; i < n; i++) {
            this.radios[i].removeAttribute('disabled');
          }
        } else {
          for (let i = 0, n = this.radios.length; i < n; i++) {
            this.radios[i].setAttribute('disabled', true);
          }
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let activeSwitch = function (val) {
          if (val) {
            for (let i = 0, n = me.radios.length; i < n; i++) {
              me.radios[i].removeAttribute('disabled');
            }
          } else {
            for (let i = 0, n = me.radios.length; i < n; i++) {
              me.radios[i].setAttribute('disabled', true);
            }
          }
        };

        this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);
        return;
      }
    } else if (operationId.startsWith('SELECT')) {
      let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      let index = paramMap['INDEX'];
      let text = paramMap['TEXT'];
      let value = paramMap['VALUE'];

      let callbackFunc = function (selectIndex) {
        if (selectIndex) {
          successFunc(me.id, operationId, null);
        } else {
          failFunc(me.id, operationId, null);
        }

        completeFunc(me.id, operationId, null);
      };

      let selectIndex;

      if (index || index === '0') {
        if (isNaN(index)) {
          index = index.toUpperCase();
          if (index === 'LAST') {
            index = this.radios.length - 1
          } else if (index === 'FIRST') {
            index = 0;
          }
        }

        selectIndex = Number(index);

        if (selectIndex > this.radios.length - 1) {
          selectIndex = undefined;
        }
      } else if (text) {
        for (let i = 0, n = this.radios.length; i < n; i++) {
          let radio = this.radios[i];
          if (radio.getAttribute('data-caption') === text) {
            selectIndex = i;
            break;
          }
        }
      } else if (value) {
        for (let i = 0, n = this.radios.length; i < n; i++) {
          let radio = this.radios[i];
          if (radio.id === value) {
            selectIndex = i;
            break;
          }
        }
      }

      for (let i = 0, n = this.radios.length; i < n; i++) {
        let radio = this.radios[i];
        if (i === selectIndex) {
          radio.checked = true;
        } else {
          radio.checked = false;
        }
      }

      callbackFunc(selectIndex);

      return;
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
    for (let i = 0, n = this.radios.length; i < n; i++) {
      let radio = this.radios[i];
      if (radio.checked) {
        return $(radio);
      }
    }
    return null;
  }

  getValue() {
    for (let i = 0, n = this.radios.length; i < n; i++) {
      let radio = this.radios[i];
      if (radio.checked) {
        return radio.getAttribute('id');
      }
    }
    return null;
  }

  setValue(resultData) {
    let me = this;
    let optionDeployment = vom.get(me.viewId).propOptionDeployment(this.id) === 'vertical' ? 'block' : 'inline-block';
    let valueId = vom.get(me.viewId).propValueId(this.id);
    let textId = vom.get(me.viewId).propTextId(this.id);
    let selectId = vom.get(me.viewId).propSelectId(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);

    const btnGroup = document.createElement('span');

    btnGroup.classList.add('kd_radioBtnGroup');

    this.radios.length = 0;

    for (let optionRow of resultData) {
      const radio = document.createElement('input');
      const labelText = document.createElement('span');
      const label = document.createElement('label');

      let optionText = optionRow[textId] ? optionRow[textId] : optionRow[valueId];
      let isChecked = optionRow[selectId];

      radio.setAttribute('type', 'radio');
      labelText.classList.add('kd_radioLabel');

      if (isChecked === 'false') {
        isChecked = false;
      }
      isChecked = Boolean(isChecked);

      if (lang) {
        optionText = transLangKey(optionText);
      }

      radio.setAttribute('id', optionRow[valueId]);
      radio.setAttribute('data-caption', optionRow[textId]);
      radio.setAttribute('name', this.id);
      radio.setAttribute('data-source', JSON.stringify(optionRow));
      isChecked && (radio.setAttribute('checked', 'checked'));

      this.radios.push(radio);

      labelText.innerText = optionText;

      label.appendChild(radio);
      label.appendChild(labelText);
      label.style.margin = '5px';
      label.style.display = optionDeployment;

      btnGroup.appendChild(label)
    }

    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
    this.element.appendChild(btnGroup);
  }

  initValue() {
    let me = this;
    for (let i = 0, n = this.radios.length; i < n; i++) {
      let radio = this.radios[i];
      if (vom.get(me.viewId).propOptions(this.id).length > 0) {
        radio.checked = vom.get(me.viewId).propOptionSelected(this.id, radio.id);
      } else {
        let selectId = vom.get(me.viewId).propSelectId(this.id);
        let dataSource = JSON.parse(radio.getAttribute('data-source'));
        radio.checked = dataSource[selectId];
      }
    }
  }

  onComponentChanged() {
  }
}
