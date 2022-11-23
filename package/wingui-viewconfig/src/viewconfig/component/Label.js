import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class Label extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let tooltip = vom.get(me.viewId).propTooltip(this.id);
    if (tooltip) {
      this.element.setAttribute('title', transLangKey(tooltip));
    }

    let labelText = vom.get(me.viewId).propInitValue(this.id);
    let iconName = vom.get(me.viewId).propIcon(this.id);
    let width = vom.get(me.viewId).propWidth(this.id);
    let align = vom.get(me.viewId).propPosition(this.id);
    let bgColor = vom.get(me.viewId).propBackground(this.id);
    let isBold = vom.get(me.viewId).propFontBold(this.id);
    let isItalic = vom.get(me.viewId).propFontItalic(this.id);
    let fontSize = vom.get(me.viewId).propFontSize(this.id);
    let fontColor = vom.get(me.viewId).propFontColor(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);

    if (lang) {
      labelText = transLangKey(labelText);
    }

    this.element.appendChild(document.createTextNode(labelText));
    this.element.classList.add('kd_labelWrap');

    isBold && (this.element.style['font-weight'] = 'bold');
    isItalic && (this.element.style['font-style'] = 'italic');
    fontSize && (this.element.style['font-size'] = fontSize + 'px');
    fontColor && (this.element.style['color'] = fontColor);
    bgColor && (this.element.style['background-color'] = bgColor);
    width && (this.element.style['width'] = width + 'px');
    align && (this.element.style['text-align'] = align);

    if (iconName) {
      this.element.insertBefore(this.templateIcon(iconName), this.element.firstChild);
    }

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
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId.startsWith('SET')) {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
      const data = paramMap['SET'];

      this.setValue(data);

      if (data instanceof Object || this.getDom().value instanceof Object) {
        failFunc(this.id, operationId, null);
      } else {
        successFunc(this.id, operationId, null);
      }

      completeFunc(this.id, operationId, null);

      return;
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

  formatInterpret(formatstr, data, regex, totrans) {
    if (formatstr === undefined || data === undefined || regex === undefined) {
      return formatstr;
    }

    let text = formatstr;
    let match;
    while ((match = regex.exec(formatstr)) !== null) {
      if (match.length > 0) {
        let item = match[0];
        let key = item.substring(2, item.length - 1);
        let value = data[key];
        if (value !== undefined) {
          if (totrans) {
            value = transLangKey(value);
          }
        } else {
          if (totrans) {
            value = transLangKey(key);
          } else {
            value = key;
          }
        }

        if (value !== undefined) {
          text = text.replace(item, value);
        }
      }
    }
    return text;
  }

  getValue() {
    return this.element.innerText;
  }

  setValue(data) {
    let me = this;
    let lang = vom.get(me.viewId).propLang(this.id);
    let format = vom.get(me.viewId).propLabelFormat(this.id);

    if (!data) {
      data = '';
    } else if (format) {
      let regex = /\${[^{}]*}/g;
      let text = this.formatInterpret(format, data, regex, true);

      if (text !== format) {
        data = text;
      }
    } else if (data instanceof Array) {
      data = data[0][vom.get(me.viewId).propValueId(this.id)];
    } else if (data instanceof Object) {
      data = data[vom.get(me.viewId).propValueId(this.id)];
    }

    (lang) ? data = transLangKey(data) : void (0);
    this.element.innerHTML = data;
  }
}
