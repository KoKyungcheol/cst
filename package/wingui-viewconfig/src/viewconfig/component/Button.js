import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class Button extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    let tooltip = vom.get(this.viewId).propTooltip(this.id);
    if (tooltip) {
      this.element.setAttribute('title', transLangKey(tooltip));
    }

    let btnName = vom.get(this.viewId).propName(this.id);
    let lang = vom.get(this.viewId).propLang(this.id);
    let iconName = vom.get(this.viewId).propIcon(this.id);
    let disable = vom.get(this.viewId).propDisable(this.id);
    let tabIdx = vom.get(this.viewId).propTabIndex(this.id);
    let width = vom.get(this.viewId).propWidth(this.id);
    let bgColor = vom.get(this.viewId).propBackground(this.id);
    let isBold = vom.get(this.viewId).propFontBold(this.id);
    let isItalic = vom.get(this.viewId).propFontItalic(this.id);
    let fontSize = vom.get(this.viewId).propFontSize(this.id);
    let fontColor = vom.get(this.viewId).propFontColor(this.id);
    let visible = vom.get(this.viewId).propVisible(this.id);

    this.button = document.createElement('button');

    this.button.setAttribute('type', 'button');
    this.button.classList.add('k-button');

    tabIdx && this.button.setAttribute('tabindex', tabIdx);
    disable && this.button.setAttribute('disabled', 'disabled');

    if (Boolean(btnName) && lang) {
      btnName = transLangKey(btnName);
    }

    if (btnName) {
      lang && (btnName = transLangKey(btnName));
      this.button.innerText = btnName;
    }

    if (iconName) {
      this.button.insertBefore(this.templateIcon(iconName), this.button.firstChild);
    }

    if (!visible) {
      this.button.style.display = 'none';
    }

    isBold && (this.button.style['font-weight'] = 'bold');
    isItalic && (this.button.style['font-style'] = 'italic');
    fontSize && (this.button.style['font-size'] = fontSize + 'px');
    fontColor && (this.button.style['color'] = fontColor);
    bgColor && (this.button.style['background-color'] = bgColor) && (this.button.style['background'] = bgColor);
    width && (this.button.style['width'] = width + 'px');

    if (!btnName) {
      this.button.style['padding-top'] = '7px';
      this.button.style['padding-bottom'] = '6px';
    }

    this.element.classList.add('kd_buttonWrap');
    this.element.appendChild(this.button);

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  templateIcon(iconName) {
    let iconClass;
    if (PREDEFINED_ICONLIST.includes(iconName)) {
      iconClass = iconName;
    } else if (PREDEFINED_ICONSET.hasOwnProperty(iconName)) {
      iconClass = PREDEFINED_ICONSET[iconName];
    }

    if (iconClass) {
      let i = document.createElement('i');
      i.classList.add('btnIcon');
      i.classList.add('fa');
      i.classList.add('fa-lg');
      i.classList.add('fa-' + iconClass);
      return i;
    } else {
      let img = document.createElement('img');
      img.setAttribute('src', 'images/icons/' + iconName + '.png');
      img.classList.add('btnIcon');
      return img;
    }
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    }

    let me = this;

    if (operationId === 'VALIDATE') {
      return !!this.getValue();
    } else if (operationId.startsWith('ENABLE')) {
      let paramIds = vom.get(me.viewId).getServiceCallAllParameterIds(this.id, operationId);

      if (actionParamMap.hasOwnProperty('ENABLE') || paramIds.indexOf('ENABLE') > -1) {
        const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

        let value = paramMap['ENABLE'];
        if (value === 'false') {
          value = false;
        }

        value = Boolean(value);
        if (value) {
          this.button.removeAttribute('disabled');
        } else {
          this.button.setAttribute('disabled', true);
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let activeSwitch = function (val) {
          if (val) {
            me.button.removeAttribute('disabled');
          } else {
            me.button.setAttribute('disabled', true);
          }
        };

        this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);

        return;
      }
    }

    if (operationId === 'VISIBLE') {
      let activeSwitch = function (val) {
        if (val) {
          me.button.style.display = 'block';
        } else {
          me.button.style.display = 'none';
        }
      };

      this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);

      return;
    }

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else {
      callService(actionParamMap, this.id, operationId, successFuncs, failFunc, completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    return null;
  }

  getActualComponent() {
    return $(this.button);
  }

  getDom() {
    return this.button;
  }

  getValue() {
    return this.getActualComponent();
  }

  setValue(resultData) {
    return null;
  }

  onComponentClicked() {
  }
}
