import Component from './Component';

import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';
import { combine } from '../util/utils';



export default class Input extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let hidden = vom.get(me.viewId).propHidden(this.id);
    let width = vom.get(me.viewId).propWidth(this.id);
    let labelText = vom.get(me.viewId).propName(this.id);
    let labelPosition = vom.get(me.viewId).propNamePosition(this.id) || 'left';
    let initValue = vom.get(me.viewId).propInitValue(this.id);
    let placeholder = vom.get(me.viewId).propPlaceholder(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);
    let tabIdx = vom.get(me.viewId).propTabIndex(this.id);
    let editable = vom.get(me.viewId).propEditable(this.id);
    let bgColor = vom.get(me.viewId).propBackground(this.id);
    let isBold = vom.get(me.viewId).propFontBold(this.id);
    let isItalic = vom.get(me.viewId).propFontItalic(this.id);
    let fontSize = vom.get(me.viewId).propFontSize(this.id);
    let fontColor = vom.get(me.viewId).propFontColor(this.id);

    let type = (type => {
      switch (type) {
        case 'password':
          return 'password';
        case 'number':
          return 'number';
        case 'hidden':
          return 'hidden';
        case 'search':
          return 'search';
        default:
          return 'text';
      }
    })(vom.get(me.viewId).propType(this.id));

    this.input = document.createElement('input');
    const label = document.createElement('label');

    hidden && (this.element.style.display = 'none');

    // TODO : have to remove
    lang && (initValue = transLangKey(initValue));

    this.input.setAttribute('placeholder', placeholder);
    this.input.setAttribute('type', type);
    this.input.value = initValue;

    if (type === 'number') {
      this.input.setAttribute('min', vom.get(me.viewId).propMin(this.id));
      this.input.setAttribute('max', vom.get(me.viewId).propMax(this.id));
    }

    if (tabIdx) {
      this.input.setAttribute('tabindex', tabIdx);
    }

    this.input.classList.add('k-textbox');
    label.appendChild(this.input);

    this.element.appendChild(label);
    this.element.classList.add('kd_inputWrap');

    isBold && (this.input.style['font-weight'] = 'bold');
    isItalic && (this.input.style['font-style'] = 'italic');
    fontSize && (this.input.style['font-size'] = fontSize + 'px');
    fontColor && (this.input.style['color'] = fontColor);
    bgColor && (this.input.style['background-color'] = bgColor);
    width && (this.input.style['width'] = width + 'px');

    if (labelText) {
      const span = document.createElement('span');
      lang && (labelText = transLangKey(labelText));
      span.appendChild(document.createTextNode(labelText));
      span.style.margin = '0 5px';

      if (labelPosition === 'left') {
        label.insertBefore(span, label.firstChild);
      } else {
        label.appendChild(span);
      }
    }

    if (!editable) {
      this.getDom().setAttribute('disabled', true);
    }

    if (vom.get(me.viewId).hasSuggestValueId(this.id)) {
      $(this.input).kendoAutoComplete(this.suggestOpt(this.id));
    }

    const btnCancel = document.createElement('i');
    btnCancel.classList.add('btnCancel');
    btnCancel.appendChild(document.createTextNode('X'));
    if (type === 'number') {
      btnCancel.classList.add('numberType');
    }

    label.appendChild(btnCancel);

    if (initValue) {
      btnCancel.style.display = 'block';
    } else {
      btnCancel.style.display = 'none';
    }

    this.addDefaultEvent();

    btnCancel.addEventListener('click', function (e) {
      this.previousSibling.value = '';
      this.style.display = 'none';
    });

    this.input.addEventListener('keyup', function (e) {
      if (e.target.value) {
        this.nextSibling.style.display = 'block';
      } else {
        this.nextSibling.style.display = 'none';
      }
    });

    this.isMounted = true;
    this.mounted();
  }

  suggestOpt(componentId) {
    let me = this;
    let dataValueField = vom.get(me.viewId).propSuggestValueId(componentId);
    let dataTextField = vom.get(me.viewId).propSuggestDescriptionId(componentId);
    let templete = '#= ' + dataValueField + '# (#= ' + dataTextField + ' #)';
    let actionEventTypes = vom.get(me.viewId).getActionEventTypes(componentId);
    let dataSource = new kendo.data.DataSource({});

    if (!dataTextField) {
      templete = '#= ' + dataValueField + '#';
    }

    return {
      template: templete,
      dataTextField: dataValueField,
      height: 520,
      filter: 'contains',
      ignoreCase: vom.get(me.viewId).propSuggestIgnoreCase(componentId),
      dataSource: dataSource,
      select: function (e) {
        me.input.value = e.item.text().split(' (')[0];

        for (let i = 0, n = actionEventTypes.length; i < n; i++) {
          let actionEventType = actionEventTypes[i];
          if (permission.check(componentId, actionEventType)) {
            if (actionEventType === 'suggestion-select') {
              vsm.get(me.viewId, "operationManager").actionOperation(componentId, actionEventType);
            }
          }
        }
      }
    };
  }

  getActualComponent() {
    return $(this.input);
  }

  getDom() {
    return this.input;
  }

  initValue() {
    let me = this;
    let lang = vom.get(me.viewId).propLang(this.id);
    let initValue = vom.get(me.viewId).propInitValue(this.id);
    lang && (initValue = transLangKey(initValue));

    if (initValue) {
      this.input.value = initValue;
      this.input.nextSibling.style.display = 'block';
    } else {
      this.input.value = '';
      this.input.nextSibling.style.display = 'none';
    }
  }

  getValue() {
    return this.input.value;
  }

  setValue(data) {
    let me = this;
    let extractedData = data;
    let lang = vom.get(me.viewId).propLang(this.id);

    if (typeof data !== 'number' && !data || data.toString().length === 0) {
      extractedData = '';
    } else {
      if (data instanceof Array) {
        if (data.length > 0) {
          extractedData = data[0][vom.get(me.viewId).propValueId(this.id)];
        } else {
          extractedData = '';
        }
      } else if (data instanceof Object) {
        let modelValueId = vom.get(me.viewId).propValueId(this.id);
        if (data.hasOwnProperty(modelValueId)) {
          extractedData = data[modelValueId];
        } else {
          extractedData = '';
        }
      }
    }

    if (lang) {
      extractedData = transLangKey(extractedData);
    }

    this.input.value = extractedData;
  }
  
  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId === 'INIT') {
      com.get(me.viewId).getComponent(this.id).initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId.startsWith('SUGGEST')) {
      successFuncs = combine(this.suggest, successFunc);
    } else if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc)
    } else if (operationId.startsWith('SET')) {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
      const data = paramMap['SET'];

      this.setValue(data);

      if (data instanceof Object || this.getValue() instanceof Object) {
        failFunc(this.id, operationId, null);
      } else {
        successFunc(this.id, operationId, null);
      }

      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId === 'VALIDATE') {
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
          this.input.removeAttribute('disabled');
        } else {
          this.input.setAttribute('disabled', true);
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let me = this;

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

  suggest(componentId, operationId, data) {
    let me = this;
    data = data[RESULT_DATA];

    if (vom.get(me.viewId).hasSuggestValueId(componentId)) {
      this.getActualComponent().data('kendoAutoComplete').options.dataSource.data(data);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }
}
