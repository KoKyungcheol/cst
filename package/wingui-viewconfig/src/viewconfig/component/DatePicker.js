import Component from './Component';

import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';
import { combine } from '../util/utils';

export default class DatePicker extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.dateType = vom.get(viewId).propDateType(id);
    this.baseValue = vom.get(viewId).propBaseValue(id);

    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    let width = vom.get(this.viewId).propWidth(this.id);
    let labelText = vom.get(this.viewId).propName(this.id);
    let labelPosition = vom.get(this.viewId).propNamePosition(this.id);
    let editable = vom.get(this.viewId).propEditable(this.id);
    let tabIdx = vom.get(this.viewId).propTabIndex(this.id);
    let lang = vom.get(this.viewId).propLang(this.id);
    let opt = this.opt(this);

    const input = document.createElement('input');
    const label = document.createElement('label');
    const labelTextSpan = document.createElement('span');

    this.element.classList.add('kd_datePickerWrap');
    label.classList.add('kd_datePickerLabel');
    labelTextSpan.classList.add('kd_datePickerLabelText');

    width && (input.style.width = width + 'px');
    tabIdx && input.setAttribute('tabindex', tabIdx);

    label.appendChild(input);

    if (labelText) {
      if (lang) {
        labelText = transLangKey(labelText);
      }

      labelTextSpan.innerText = labelText;
      labelTextSpan.style.margin = '0 5px';

      if (labelPosition == 'right') {
        label.appendChild(labelTextSpan);
      } else {
        label.insertBefore(labelTextSpan, label.firstChild);
      }
    }

    this.element.appendChild(label);
    this.widget = window.kendo.jQuery(input);

    switch (this.dateType) {
      case 'datetime':
        this.widget.kendoDateTimePicker(opt);
        break;
      case 'time':
        this.widget.kendoTimePicker(opt);
        break;
      default:
        this.widget.kendoDatePicker(opt);
        break;
    }

    if (!editable) {
      this.getActualComponent().readonly();
      this.getActualComponent().enable(false);

      this.element.getElementsByClassName('k-select')[0].style.display = 'none';
      this.element.getElementsByClassName('k-picker-wrap')[0].style.padding = '0';
    }

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let datepicker = this.widget.data('kendoDatePicker');
      datepicker && datepicker.destroy();
    }
    this.destroyed();
  }

  opt(datePicker) {
    let me = datePicker;
    let dateType = vom.get(me.viewId).propDateType(this.id);
    let dateFormat = vom.get(me.viewId).propDateFormat(this.id);
    let dateValue = vom.get(me.viewId).propDatePickerDateValue(this.id);

    if (dateValue) {
      dateValue = dateValue.toUpperCase();

      switch (dateValue) {
        case 'CURRENT_DATE':
          dateValue = new Date();
          dateValue.setHours(0, 0, 0, 0);
          break;
        case 'CURRENT_DATETIME':
          dateValue = new Date();
          break;
        case 'CURRENT_TIME':
          dateValue = new Date();
          dateValue.setFullYear(0, 0, 1);
          break;
        case 'NONE':
          dateValue = null;
          break;
        default:
          dateValue = new Date();
          break;
      }
    } else {
      dateValue = new Date();
    }

    dateType = (function () {
      switch (dateType) {
        case 'year':
          return 'decade';
        case 'month':
          return 'year';
        case 'day':
          return 'month';
        case 'datetime':
          return 'day';
        case 'time':
          return 'time';
        default:
          return 'month';
      }
    })(dateType);

    return {
      start: dateType,
      depth: dateType,
      format: dateFormat,
      value: dateValue,
      culture : localStorage.getItem('languageCode') + '-' + localStorage.getItem('countryCode'),
      change() {
        if (vom.get(me.viewId).getOperationCallIds(me.id, 'change').length > 0) {
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, 'change');
        }
      }
    };
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let successFuncs = successFunc;
    let me = this;
    if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    } else if (operationId.startsWith('ENABLE')) {
      let paramIds = vom.get(me.viewId).getServiceCallAllParameterIds(this.id, operationId);
      if (actionParamMap.hasOwnProperty('ENABLE') || paramIds.indexOf('ENABLE') > -1) {
        let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
        let value = paramMap['ENABLE'];
        let datepicker = this.getActualComponent();

        if (value === 'false') {
          value = false;
        }
        value = Boolean(value);

        if (value) {
          datepicker.enable(true);
        } else {
          datepicker.enable(false);
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let me = this;
        let dateType = vom.get(me.viewId).propDateType(this.id);

        let datepicker;
        if (dateType === 'datetime') {
          datepicker = this.widget.data('kendoDateTimePicker');
        } else {
          datepicker = this.widget.data('kendoDatePicker');
        }

        let activeSwitch = function (val) {
          if (val) {
            datepicker.readonly(false);
          } else {
            datepicker.readonly();
          }
        };

        this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);

        return;
      }
    } else if (operationId.startsWith('SET')) {
      let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
      let data = paramMap['SET'];

      if (!Boolean(data)) {
        data = '';
      } else {
        data = data.toUpperCase();
        if (data.startsWith('CURRENT')) {
          data = kendo.toString(new Date(), 'yyyy-MM-ddTHH:mm:ss');
        }
      }

      this.setValue(data);

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    }

    if (vom.get(this.viewId).isReferenceService(this.id, operationId)) {
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
    let dateDataType;
    switch (this.dateType) {
      case 'datetime':
        dateDataType = 'kendoDateTimePicker';
        break;
      case 'time':
        dateDataType = 'kendoTimePicker';
        break;
      default:
        dateDataType = 'kendoDatePicker';
        break;
    }

    return this.widget.data(dateDataType);
  }

  getValue() {
    let selectDate = this.getActualComponent().value();
    let dateType = this.dateType;
    let baseValue = this.baseValue;

    const digitForm = (n) => {
      return n < 10 ? '0' + n : '' + n;
    };

    if (selectDate === null) {
      return null;
    }

    if (baseValue) {
      const valueDate = new Date(baseValue);
      const baseYear = valueDate.getFullYear();
      const baseMonth = digitForm(valueDate.getMonth() + 1);
      const baseDate = digitForm(valueDate.getDate());
      const baseHours = digitForm(valueDate.getHours());
      const baseMinutes = digitForm(valueDate.getMinutes());
      const baseSeconds = digitForm(valueDate.getSeconds());

      switch (dateType) {
        case 'year':
          return selectDate.format('yyyy-' + baseMonth + '-' + baseDate + 'T' + baseHours + ':' + baseMinutes + ':' + baseSeconds);
        case 'month':
          return selectDate.format('yyyy-MM-' + baseDate + 'T' + baseHours + ':' + baseMinutes + ':' + baseSeconds);
        case 'day':
          return selectDate.format('yyyy-MM-dd' + 'T' + baseHours + ':' + baseMinutes + ':' + baseSeconds);
        case 'datetime':
          return selectDate.format('yyyy-MM-ddTHH:mm:ss');
        case 'time':
          return selectDate.format(baseYear + '-' + baseMonth + '-' + baseDate + 'THH:mm:ss');
      }
    } else {
      switch (dateType) {
        case 'year':
          return selectDate.format('yyyy-01-01T00:00:00');
        case 'month':
          return selectDate.format('yyyy-MM-01T00:00:00');
        case 'day':
          return selectDate.format('yyyy-MM-ddT00:00:00');
        case 'datetime':
          return selectDate.format('yyyy-MM-ddTHH:mm:ss');
        case 'time':
          return selectDate.format('0000-00-00THH:mm:ss');
      }
    }
  }

  setValue(data) {
    let me = this;
    let extractedData = data;

    if (typeof data === 'undefined' || data === null) {
      extractedData = '';
    } else if (data instanceof Array) {
      extractedData = data[0][vom.get(me.viewId).propValueId(this.id)];
    } else if (data instanceof Object) {
      extractedData = data[vom.get(me.viewId).propValueId(this.id)];
    }

    this.getActualComponent().value(extractedData);
  }

  initValue() {
    let me = this;
    let dateValue = vom.get(me.viewId).propDatePickerDateValue(this.id);
    if (dateValue) {
      dateValue = dateValue.toUpperCase();

      switch (dateValue) {
        case 'CURRENT_DATE':
          dateValue = new Date();
          dateValue.setHours(0, 0, 0, 0);
          break;
        case 'CURRENT_DATETIME':
          dateValue = new Date();
          break;
        case 'CURRENT_TIME':
          dateValue = new Date();
          dateValue.setFullYear(0, 0, 1);
          break;
        case 'NONE':
          dateValue = null;
          break;
        default:
          dateValue = new Date();
          break;
      }
    } else {
      dateValue = new Date();
    }

    this.getActualComponent().value(dateValue);
  }
}
