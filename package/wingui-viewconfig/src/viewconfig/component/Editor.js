import Component from './Component';

import { combine } from '../util/utils';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

export default class Editor extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  static getReplacedValue(valueType, text) {
    let replacedText;

    switch (valueType) {
      case 'xml':
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        replacedText = '<pre>' + text + '</pre>';
        break;
      case 'html':
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        replacedText = '<pre>' + text + '</pre>';
        break;
      case 'text':
        let decoded = $('<textarea/>').html(text).text();
        replacedText = decoded;
        break;
      default:
        break;
    }

    return replacedText;
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let width = vom.get(me.viewId).propWidth(this.id);
    let height = vom.get(me.viewId).propHeight(this.id);
    let toolbarUsable = vom.get(me.viewId).propToolbarUsable(this.id);
    let editable = vom.get(me.viewId).propEditable(this.id);

    const textarea = document.createElement('textarea');

    this.element.appendChild(textarea);
    this.element.classList.add('kd_editorWrap');

    textarea.style.height = height ? height + 'px' : '100%';
    textarea.style.width = width ? width + 'px' : '100%';

    this.widget = window.kendo.jQuery(textarea);
    this.widget.kendoEditor(this.opt(me));

    if (toolbarUsable) {
      const toolbar = this.element.querySelector('.k-editor-toolbar');
      if (toolbar) {
        toolbar.style.display = 'none';
      }
    }

    this.editorBody = this.widget.data('kendoEditor').body;

    if (!editable) {
      this.editorBody.removeAttribute('contenteditable');
      this.editorBody.style.backgroundColor = '#eee';
      this.editorBody.style.cursor = 'not-allowed';
    }

    let dataValueField = vom.get(me.viewId).propInitValue(this.id);
    if (dataValueField) {
      this.setValue(dataValueField);
    }

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let editor = this.widget.data('kendoEditor');
      editor && editor.destroy();
    }
    this.destroyed();
  }

  opt(me) {
    let pasteOption = vom.get(me.viewId).propPasteOption(this.id);

    const opt = {
      resizable: {
        content: true,
        toolbar: false
      },
      pasteCleanup: {
      },
      tools: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
        'justifyFull',
        'insertUnorderedList',
        'insertOrderedList',
        'indent',
        'outdent',
        'createLink',
        'unlink',
        'insertImage',
        'insertFile',
        'subscript',
        'superscript',
        'createTable',
        'addRowAbove',
        'addRowBelow',
        'addColumnLeft',
        'addColumnRight',
        'deleteRow',
        'deleteColumn',
        'viewHtml',
        'formatting',
        'cleanFormatting',
        'fontName',
        'fontSize',
        'foreColor',
        'backColor',
        'print'
      ]
    };

    if (pasteOption === 'ONLY_TEXT') {
      opt.pasteCleanup.keepNewLines = true;
    }

    return opt;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId.startsWith('SET')) {
      let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
      let data = paramMap['SET'];

      this.setValue(data);

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId === 'VALIDATE') {
      return !!this.getValue();
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
          this.editorBody.setAttribute('contenteditable', true);
          this.editorBody.style.backgroundColor = '';
          this.editorBody.style.cursor = '';
        } else {
          this.editorBody.removeAttribute('contenteditable');
          this.editorBody.style.backgroundColor = '#eee';
          this.editorBody.style.cursor = 'not-allowed';
        }

        successFunc(this.id, operationId, null);
        completeFunc(this.id, operationId, null);

        return;
      } else {
        let me = this;

        const activeSwitch = function (val) {
          if (val) {
            me.editorBody.setAttribute('contenteditable', true);
          } else {
            me.editorBody.removeAttribute('contenteditable');
          }
        };

        this.validate.call(this, this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch);

        return;
      }
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

  getActualComponent() {
    return this.widget.data('kendoEditor');
  }

  getValue() {
    const textArea = this.getActualComponent();
    if (textArea === null) {
      return null;
    }

    return textArea.encodedValue();
  }

  setValue(data) {
    let me = this;

    if (!data) {
      data = '';
    }

    let extractedData = data;
    let dataId = vom.get(me.viewId).propValueId(this.id);
    let valueType = vom.get(me.viewId).propValueType(this.id) || 'text';
    let lang = vom.get(me.viewId).propLang(this.id);

    if (data instanceof Array) {
      extractedData = data[0][dataId];
    } else if (data instanceof Object) {
      extractedData = data[dataId];
    }

    if (lang) {
      extractedData = transLangKey(extractedData);
    }

    this.getActualComponent().value(Editor.getReplacedValue(valueType, extractedData));
  }

  initValue() {
    let me = this;
    let dataValueField = vom.get(me.viewId).propInitValue(this.id);
    if (dataValueField) {
      this.setValue(dataValueField);
    } else {
      this.setValue('');
    }
  }
}
