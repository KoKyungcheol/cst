import Component from './Component';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

import { combine } from '../util/utils';

export default class ComboBox extends Component {
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
    let labelText = vom.get(me.viewId).propName(this.id);
    let labelPosition = vom.get(me.viewId).propNamePosition(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);
    let tabIdx = vom.get(me.viewId).propTabIndex(this.id);

    const input = document.createElement('input');
    const label = document.createElement('label');
    const labelTextSpan = document.createElement('span');

    this.element.classList.add('kd_comboBoxWrap');
    label.classList.add('kd_comboBoxLabel');
    labelTextSpan.classList.add('kd_comboBoxLabelText');

    width && (input.style.width = width + 'px');
    tabIdx && input.setAttribute('tabindex', tabIdx);

    label.appendChild(input);

    if (labelText) {
      if (lang) {
        labelText = transLangKey(labelText);
      }

      labelTextSpan.innerText = labelText;
      labelTextSpan.style.margin = '0 5px';

      if (labelPosition === 'right') {
        label.appendChild(labelTextSpan);
      } else {
        label.insertBefore(labelTextSpan, label.firstChild);
      }
    }

    this.element.appendChild(label);

    this.widget = $(input);
    this.widget.kendoComboBox(this.opt(me));

    let editable = vom.get(me.viewId).propEditable(this.id);
    if (!editable) {
      this.getActualComponent().input.attr('readonly', true).on('keydown', function (e) {
        if (e.keyCode === 8) {
          e.preventDefault();
        }
      });
    }

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let combobox = this.widget.data('kendoComboBox');
      combobox && combobox.destroy();
    }
    this.destroyed();
  }

  onComboboxChanged(viewId, componentId, e) {
  }

  opt(combobox) {
    let me = combobox;
    let placeholder = vom.get(me.viewId).propPlaceholder(this.id);
    let dataTextField;
    let dataValueField;
    let dataSource;
    let editable = vom.get(me.viewId).propEditable(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);
    let height = vom.get(me.viewId).propDropdownHeight(this.id);
    let enable = vom.get(me.viewId).propEnable(this.id);

    let actionEventTypes = vom.get(me.viewId).getActionEventTypes(this.id);

    let opt = {
      orgId: me.id,
      enable: enable,
      autoWidth: true,
      placeholder: placeholder,
      dataSource: dataSource,
      ignoreCase: vom.get(me.viewId).propIgnoreCase(me.id),
      change(e) {
        me.onComboboxChanged(me.viewId, me.id, e);

        for (let i = 0, n = actionEventTypes.length; i < n; i++) {
          let actionEventType = actionEventTypes[i];
          if (permission.check(me.id, actionEventType, me.viewId)) {
            if (actionEventType === 'select-item') {
              vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
            }
          }
        }
      },
      filter: 'contains',
      suggest: true,
      clearButton: editable,
      readOnly: editable,
      index: null,
      select(e) {  
        this.wrapper.kendoTooltip({
          content: 'No value selected'
        });
    
        this.wrapper.data('kendoTooltip').destroy();
    
        let componentId = this.options.orgId;
        let selectedDataItem = e.dataItem;
        let tooltipFields = vom.get(me.viewId).propDataTooltip(componentId);
        if (selectedDataItem && tooltipFields) {
          com.get(me.viewId).getComponent(componentId).setTooltip(componentId, selectedDataItem, tooltipFields);
        }
      }
    };

    if (vom.get(me.viewId).propInitValue(this.id)) {
      const dataInfo = [];

      let options = vom.get(me.viewId).propInitValueOption(this.id);

      for (let i = 0, n = options.length; i < n; i++) {
        let option = options[i];

        let value = option.value || '';
        let text = option.text || value;
        if (lang) {
          text = transLangKey(text);
        }

        dataInfo.push({ value: value, text: text });
      }

      opt.dataTextField = 'text';
      opt.dataValueField = 'value';
      opt.dataSource = dataInfo;

      let selectIndex = vom.get(me.viewId).propSelectIndex(this.id);
      if (selectIndex === 'LAST') {
        selectIndex = dataSource.length - 1;
      } else if (selectIndex === 'FIRST') {
        if (dataSource.length > 0) {
          selectIndex = 0;
        } else {
          selectIndex = -1;
        }
      } else {
        selectIndex = parseInt(selectIndex);
      }

      opt.index = selectIndex;
    } else {
      dataValueField = vom.get(me.viewId).propValueId(this.id);
      dataTextField = vom.get(me.viewId).propTextId(this.id) || dataValueField;

      opt.dataTextField = dataTextField;
      opt.dataValueField = dataValueField;

      if ((dataTextField === null && dataValueField === null) || dataValueField === '') {
        console.error(`The value-id is not defined. (Check the '${this.id}' component of view-config.)`)
      }
    }

    if (height) {
      if (!isNaN(parseInt(height))) {
        opt.height = height;
      }
    }

    return opt;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    } else if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId.startsWith('INIT_SELECT')) {
      this.initSelect();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId.startsWith('ENABLE')) {
      let me = this;
      let paramIds = vom.get(me.viewId).getServiceCallAllParameterIds(this.id, operationId);
      if (actionParamMap.hasOwnProperty('ENABLE') || paramIds.indexOf('ENABLE') > -1) {
        const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
        let value = paramMap['ENABLE'];

        if (value == 'false') {
          value = false;
        }
        value = Boolean(value);

        value ? this.getActualComponent().enable(true) : this.getActualComponent().enable(false);

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let me = this;

        let activeSwitch = function (val) {
          let kendoComboBox = me.widget.data('kendoComboBox');
          if (!kendoComboBox) {
            return;
          }

          if (val) {
            kendoComboBox.input.attr('readonly', false).off('keydown', function (e) {
              if (e.keyCode === 8) {
                e.preventDefault();
              }
            });
          } else {
            kendoComboBox.input.attr('readonly', true).on('keydown', function (e) {
              if (e.keyCode === 8) {
                e.preventDefault();
              }
            });
          }
        };

        this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);

        return;
      }
    } else if (operationId.startsWith('SELECT')) {
      let me = this;
      let comboBox = this.getActualComponent();

      let textField = vom.get(me.viewId).propTextId(this.id);
      let valueField = vom.get(me.viewId).propValueId(this.id);
      let selectField = vom.get(me.viewId).propSelectId(this.id);

      let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      let index = paramMap['INDEX'];
      let text = paramMap['TEXT'];
      let value = paramMap['VALUE'];
      let selectVal = paramMap['SELECT'];
      let isSelectAction = paramMap['SELECT_ACTION'] !== 'false';

      let callbackFunc = function (data) {
        isSelectAction && comboBox.trigger('change');

        let tooltipFields = vom.get(me.viewId).propDataTooltip(me.id);
        let selectedDataItem = comboBox.dataItem();
        if (selectedDataItem && tooltipFields) {
          me.setTooltip(me.id, selectedDataItem, tooltipFields);
        }

        if (data instanceof Object) {
          failFunc(me.id, operationId, null);
        } else {
          successFunc(me.id, operationId, null);
        }

        completeFunc(me.id, operationId, null);
      };

      if (index || index === '0') {
        if (index === 'FIRST') {
          comboBox.select(0);
        } else if (index === 'LAST') {
          comboBox.select(comboBox.dataSource._data.length - 1);
        } else {
          comboBox.select(parseInt(index));
        }

        callbackFunc(index);
      } else if (text) {
        comboBox.select(function (dataItem) {
          return dataItem[textField] === text;
        });

        callbackFunc(text);
      } else if (value) {
        if (value) {
          comboBox.select(function (dataItem) {
            return dataItem[valueField] === value;
          });
        } else {
          comboBox.value('');
        }

        callbackFunc(value);
      } else {
        if (selectVal) {
          comboBox.select(function (dataItem) {
            return dataItem[selectField] === selectVal;
          });
        } else {
          comboBox.value('');
        }

        callbackFunc(selectVal);
      }

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
    return this.widget.data('kendoComboBox');
  }

  setTooltip(componentId, selectedDataItem, tooltipFields) {
    let comboBox = this.getActualComponent();
    tooltipFields = tooltipFields.split(',');
    let tooltip = '';
    for (let i = 0, len = tooltipFields.length; i < len; i++) {
      tooltip = tooltip + selectedDataItem[tooltipFields[i]];
      if (i < len - 1) {
        tooltip = tooltip + ',\n';
      }
    }

    if (tooltip && tooltip.length > 0) {
      comboBox.wrapper.kendoTooltip({});
      comboBox.wrapper.data('kendoTooltip').destroy();
      comboBox.wrapper.kendoTooltip({
        content: tooltip
      });
    }
  }

  getValue() {
    const comboBox = this.getActualComponent();
    if (comboBox === null) return null;
    return comboBox.value();
  }

  setValue(resultData) {
    let me = this;
    let comboBox = this.getActualComponent();

    let dataTextField = vom.get(me.viewId).propTextId(this.id);
    let dataValueField = vom.get(me.viewId).propValueId(this.id);
    let sort = vom.get(me.viewId).propTextIdSort(this.id);
    let lang = vom.get(me.viewId).propLang(this.id);

    if (resultData && resultData.length > 0 && !Object.keys(resultData[0]).includes(dataValueField)) {
      console.error(`Incorrect value-id. (value-id: ${dataValueField}, component id: ${this.id})`);
    }

    let resultDataObj = {
      data: resultData,
      change: function (e) {
        const data = this.data();
        if (lang) {
          for (let i in data) {
            if (data[i][dataTextField] === null) {
              data[i][dataTextField] = '';
            }
            if (typeof data[i] === 'object') {
              data[i][dataTextField] = transLangKey(data[i][dataTextField]);
            }
          }
        }
      }
    };

    if (sort) {
      resultDataObj.sort = {field: dataTextField, dir: sort};
    }

    let comboDataSource = new kendo.data.DataSource(resultDataObj);

    this.initSelect();

    comboBox.setDataSource(comboDataSource);

    let selectIndex = vom.get(me.viewId).propSelectIndex(this.id);
    if (selectIndex) {
      if (selectIndex === 'LAST') {
        selectIndex = resultData.length - 1;
      } else if (selectIndex === 'FIRST') {
        if (resultData.length > 0) {
          selectIndex = 0;
        } else {
          selectIndex = -1;
        }
      } else {
        selectIndex = parseInt(selectIndex);
      }

      if (selectIndex >= 0) {
        comboBox.select(selectIndex);
        vsm.get(me.viewId, "operationManager").actionOperation(this.id, 'select-item');

        let tooltipFields = vom.get(me.viewId).propDataTooltip(this.id);
        let selectedDataItem = comboBox.dataItem();
        if (selectedDataItem && tooltipFields) {
          this.setTooltip(this.id, selectedDataItem, tooltipFields);
        }
      }
    }
  }

  initValue() {
    let me = this;
    const comboBox = this.getActualComponent();

    comboBox.setDataSource('');
    comboBox.text('');
    comboBox.value('');

    if (vom.get(me.viewId).propInitValue(this.id)) {
      let lang = vom.get(me.viewId).propLang(this.id);

      const dataSource = [];

      let options = vom.get(me.viewId).propInitValueOption(this.id);
      for (let i = 0, n = options.length; i < n; i++) {
        let option = options[i];

        let value = option.value || '';
        let text = option.text || value;
        if (lang) {
          text = transLangKey(text);
        }

        dataSource.push({ value: value, text: text });
      }

      comboBox.dataValueField = 'value';
      comboBox.dataTextField = 'text';
      comboBox.setDataSource(dataSource);

      let selectIndex = vom.get(me.viewId).propSelectIndex(this.id);
      if (selectIndex === 'LAST') {
        selectIndex = dataSource.length - 1;
      } else if (selectIndex === 'FIRST') {
        if (dataSource.length > 0) {
          selectIndex = 0;
        } else {
          selectIndex = -1;
        }
      } else {
        selectIndex = parseInt(selectIndex);
      }

      if (selectIndex >= 0) {
        comboBox.select(selectIndex);
      }
    }
  }

  initSelect() {
    const comboBox = this.getActualComponent();

    comboBox.text('');
    comboBox.value('');
  }
}
