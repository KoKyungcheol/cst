import {
  showDialog,
  showPromptDialog
} from '../util/dialog';
import Component from './Component';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';

import { combine } from '../util/utils';

export default class Bpmn extends Component {
  constructor(id, element, viewId) {
    super(id, element);
    this.viewId = viewId;
    this.bpmnModeler = {};
    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    let bpmnModelEditable = vom.get(this.viewId).propDataEditable(this.id);
    if (bpmnModelEditable) {
      $('body').append('<script src="js/bpmn-js/bpmn-modeler.js"></script>');
    } else {
      $('body').append('<script src="js/bpmn-js/bpmn-navigated-viewer.js"></script>');
    }

    let height = parseInt(vom.get(this.viewId).propHeight(this.id));

    this.element.style.height = height ? height + 'px' : '100%';

    this.bpmnModeler = new BpmnJS({
      container: '#' + this.id
    });

    if (vom.get(this.viewId).propToolbarUsable(this.id)) {
      this.mountToolbar();
      this.element.classList.add('bpmn_modelerWrap');
      this.element.parentNode.style.paddingBottom = '48px';
    }

    let bjsContainer = this.element.querySelector('.bjs-container');
    if (bjsContainer) {
      bjsContainer.style.border = '1px solid lightgray';
    }

    this.isMounted = true;
    this.mounted();
  }

  mountToolbar() {
    const iconMap = {
      'IMPORT': 'folder-open',
      'EXPORT': 'floppy-o',
      'NEW': 'plus-circle',
      'LOAD': 'download',
      'SAVE': 'upload',
      'ZOOM_RESET': 'crosshairs',
      'ZOOM_IN': 'search-plus',
      'ZOOM_OUT': 'search-minus'
    };

    let eventType = 'click';

    let leftElement = document.createElement('div');
    leftElement.classList.add('leftCon');

    let rightElement = document.createElement('div');
    rightElement.classList.add('rightCon');

    let toolbarElement = document.createElement('div');
    toolbarElement.classList.add('ui_gridToolBarWrap');
    toolbarElement.appendChild(leftElement);
    toolbarElement.appendChild(rightElement);

    let toolbarButtonElements = [];

    let toolBarButtonIds = vom.get(this.viewId).propToolbarButtonIds(this.id);
    for (let i = 0, n = toolBarButtonIds.length; i < n; i++) {
      let toolBarButtonId = toolBarButtonIds[i];
      if (!vom.get(this.viewId).propToolbarButtonVisible(this.id, toolBarButtonId)) {
        continue;
      }

      let toolBarTooptip = vom.get(this.viewId).propToolbarButtonTooltip(this.id, toolBarButtonId) ? vom.get(this.viewId).propToolbarButtonTooltip(this.id, toolBarButtonId) : toolBarButtonId;

      let buttonElement = document.createElement('button');
      buttonElement.id = toolBarButtonId + '_' + this.id;
      buttonElement.setAttribute('type', 'button');
      buttonElement.setAttribute('title', transLangKey(toolBarTooptip));
      buttonElement.classList.add('k-button');

      if (!vom.get(this.viewId).propToolbarButtonEnable(this.id, toolBarButtonId)) {
        buttonElement.disabled = true;
      }

      toolbarButtonElements.push(buttonElement);

      if (iconMap.hasOwnProperty(toolBarButtonId)) {
        let iElement = document.createElement('i');
        iElement.classList.add('btnIcon');
        iElement.classList.add('fa');
        iElement.classList.add('fa-lg');
        iElement.classList.add('fa-' + iconMap[toolBarButtonId]);
        buttonElement.appendChild(iElement);
      }

      if (vom.get(this.viewId).propToolbarButtonPosition(this.id, toolBarButtonId) === 'left') {
        leftElement.appendChild(buttonElement);
      } else {
        rightElement.appendChild(buttonElement);
      }
    }

    let actualButtonElements = [];

    let toolbarButtonIds = ['NEW', 'ZOOM_RESET', 'ZOOM_IN', 'ZOOM_OUT'];
    for (let i = 0, n = toolbarButtonIds.length; i < n; i++) {
      let toolBarButtonId = toolbarButtonIds[i];

      let buttonElement = document.createElement('button');
      buttonElement.id = toolBarButtonId + '_' + this.id;
      buttonElement.setAttribute('type', 'button');
      buttonElement.setAttribute('title', transLangKey(toolBarButtonId));
      buttonElement.classList.add('k-button');

      actualButtonElements.push(buttonElement);

      if (iconMap.hasOwnProperty(toolBarButtonId)) {
        let iElement = document.createElement('i');
        iElement.classList.add('btnIcon');
        iElement.classList.add('fa');
        iElement.classList.add('fa-lg');
        iElement.classList.add('fa-' + iconMap[toolBarButtonId]);
        buttonElement.appendChild(iElement);
      }

      if (toolBarButtonId === 'NEW') {
        leftElement.insertBefore(buttonElement, leftElement.firstChild);
      } else {
        rightElement.appendChild(buttonElement);
      }
    }

    this.element.insertBefore(toolbarElement, this.element.firstChild);

    let inputElement = document.createElement('input');
    inputElement.id = this.id + '_bpmn';
    inputElement.setAttribute('type', 'file');
    inputElement.setAttribute('name', 'bpmnFile');
    inputElement.style.display = 'none';

    let me = this;

    inputElement.addEventListener('change', (event) => {
      const fixdata = function (data) {
        let fixedData = '';

        let i = 0, w = 10240;
        for (; i < data.byteLength / w; i++) {
          fixedData += String.fromCharCode.apply(null, new Uint8Array(data.slice(i * w, i * w + w)));
        }
        fixedData += String.fromCharCode.apply(null, new Uint8Array(data.slice(i * w)));

        return fixedData;
      }

      const processBpmnDoc = function (data) {
        me.bpmnModeler.importXML(data, function (err) {
          if (err) {
            console.warn(err);
          } else {
            me.bpmnModeler.get('canvas').zoom('1.0');
          }
        });
      }

      let files = event.target.files;

      for (let i = 0; i != files.length; i++) {
        let reader = new FileReader();
        reader.onload = function (event) {
          processBpmnDoc(fixdata(event.target.result));
        };

        reader.readAsArrayBuffer(files[i]);
      }

      document.getElementById(e.target.id).setAttribute('value', '');

      event.stopPropagation();
      event.cancelBubble = true;
    }, false);

    this.element.insertBefore(inputElement, this.element.firstChild);

    for (let i = 0, n = actualButtonElements.length; i < n; i++) {
      actualButtonElements[i].addEventListener(eventType, (event) => {
        let buttonId = event.currentTarget.id;
        if (buttonId.startsWith('NEW')) {
          me.bpmnModeler.get('canvas').zoom('1.0', 'auto');
          me.bpmnModeler.createDiagram();
        } else if (buttonId.startsWith('ZOOM_RESET')) {
          me.bpmnModeler.get('canvas').zoom('1.0', 'auto');
        } else if (buttonId.startsWith('ZOOM_IN')) {
          me.bpmnModeler.get('zoomScroll').stepZoom(1);
        } else if (buttonId.startsWith('ZOOM_OUT')) {
          me.bpmnModeler.get('zoomScroll').stepZoom(-1);
        }

        event.stopPropagation();
        event.cancelBubble = true;
      });
    }

    for (let i = 0, n = toolbarButtonElements.length; i < n; i++) {
      toolbarButtonElements[i].addEventListener(eventType, (event) => {
        let buttonId = event.currentTarget.id.replace('_' + me.id, '');

        let successFunc = function (componentId, toolBarButtonId, data) {
          me.doToolbarSuccessOperation(componentId, toolBarButtonId, data)
        };

        let failFunc = function (componentId, toolBarButtonId, data) {
          me.doToolbarFailOperation(componentId, toolBarButtonId, data)
        };

        let completeFunc = function (componentId, toolBarButtonId, data) {
          me.doToolbarCompleteOperation(componentId, toolBarButtonId, data)
        };

        me.doOperation(me.id, buttonId, {}, successFunc, failFunc, completeFunc);

        event.stopPropagation();
        event.cancelBubble = true;
      });
    }
  }

  getActualComponent() {
    return this.bpmnModeler;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    operationId = operationId.toUpperCase();

    if (operationId === 'LOAD') {
      this.loadData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId === 'SAVE') {
      this.saveData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId === 'IMPORT') {
      this.importData(this.id);
    } else if (operationId === 'EXPORT') {
      this.exportData(this.id);
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    }
  }

  doToolbarSuccessOperation(componentId, toolbarId, result) {
    let operationCallIds = vom.get(this.viewId).getToolbarSuccessOperationCallIds(componentId, toolbarId);
    vsm.get(this.viewId, "operationManager").doRecursiveOperation(componentId, operationCallIds, result);
  }

  doToolbarFailOperation(componentId, toolbarId, result) {
    let operationCallIds = vom.get(this.viewId).getToolbarFailOperationCallIds(componentId, toolbarId);
    vsm.get(this.viewId, "operationManager").doRecursiveOperation(componentId, operationCallIds, result);
  }

  doToolbarCompleteOperation(componentId, toolbarId, result) {
    let operationCallIds = vom.get(this.viewId).getToolbarCompleteOperationCallIds(componentId, toolbarId);
    vsm.get(this.viewId, "operationManager").doRecursiveOperation(componentId, operationCallIds, result);
  }

  loadData(targetComponentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    if (vom.get(this.viewId).isReferenceService(targetComponentId, operationId)) {
      doReferenceService(actionParamMap, targetComponentId, operationId, successFunc, combine(this.loadFail, failFunc), completeFunc, this.viewId);
    } else {
      callService(actionParamMap, targetComponentId, operationId, combine(this.loadProcess, successFunc), combine(this.loadFail, failFunc), completeFunc, this.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);

    let bpmnXML = data[RESULT_DATA]['BPMN_CONTENTS'];
    let component = com.get(this.viewId).getComponent(componentId);

    component.bpmnModeler.importXML(bpmnXML, function (err) {
      if (err) {
        console.warn(err);
        showDialog('fail', err.message, DIALOG_TYPE.ALERT);
      } else {
        component.bpmnModeler.get('canvas').zoom('1.0', 'auto');
      }
    });

    component.loadProcessFlagOn();
  }

  loadFail(componentId, operationId) {
    console.error(`Failed to load. (component id: ${componentId}, operation id: ${operationId})`);
  }

  saveData(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, this.viewId);
    if (paramMap.hasOwnProperty('BPMN_CONTENTS')) {
      console.log('Saving data...');

      let currentFileName = paramMap['BPMN_FILE_NAME'];

      showPromptDialog('Save As', 'BPMN file name', currentFileName, DIALOG_TYPE.CONFIRM).then(function (dialogResult) {
        if (dialogResult.comfirmation) {
          let bpmnFileName = dialogResult.inputString;
          if (bpmnFileName != undefined && bpmnFileName.length > 0) {
            paramMap['BPMN_FILE_NAME'] = bpmnFileName;
            callService(paramMap, this.id, operationId, combine(bpmn.bpmnWebModeler.saveProcess, successFunc), combine(bpmn.bpmnWebModeler.saveFail, failFunc), completeFunc, me.viewId);
          } else {
            console.warn('Failed to save. (no file name)');
            showDialog('Fail', 'Failed to save. (no file name)', DIALOG_TYPE.ALERT);
          }
        } else {
          console.warn('Canceled.');
        }
      });
    } else {
      showDialog('Warning', 'There is no data to save.', DIALOG_TYPE.ALERT);
      console.warn('There is no data to save.');
    }
  }

  saveProcess(componentId, operationId, data) {
    showDialog('Success', 'Saving BPMN document.', DIALOG_TYPE.INFO);
    console.log('Successfully saved.');
  }

  saveFail(componentId, operationId) {
    showDialog('Fail', 'Saving BPMN document.', DIALOG_TYPE.ALERT);
    console.error('Failed to save.');
  }

  importData(componentId) {
    $('#' + this.id + '_bpmn').trigger('click');
  }

  exportData(componentId) {
    let bpmnDoc = this.getValue();

    if (bpmnDoc.length > 0) {
      let defaultExportedFileName = vom.get(this.viewId).propOperationFileName(this.id, 'EXPORT');
      if (!defaultExportedFileName) {
        let dateString = new Date().toCurrentDateString();
        dateString = dateString.replace(/\:/g, '-').replace('.', '-').replace(' ', '-');

        defaultExportedFileName = this.viewId + '_' + this.id + '_' + dateString;
      }

      if (navigator.msSaveBlob) {
        let fileData = [bpmnDoc];
        let blobObject = new Blob(fileData);
        window.navigator.msSaveBlob(blobObject, defaultExportedFileName + '.bpmn');
      } else {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(bpmnDoc));
        element.setAttribute('download', defaultExportedFileName + '.bpmn');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
      }
    } else {
      console.warn('There is no export data.');
      showDialog('Export', 'There is no export data.', DIALOG_TYPE.ALERT);
    }
  }

  getValue() {
    let bpmnDoc = '';

    this.bpmnModeler.saveXML({ format: true }, function (err, xml) {
      if (err) {
        console.error('Failed to get bpmn documnet.');
      } else {
        console.log('Succeeded to get bpmn documnet.');
        bpmnDoc = xml;
      }
    });

    return bpmnDoc;
  }

  setValue(resultData) {
    this.bpmnModeler.importXML(resultData['BPMN_CONTENTS'], function (err) {
      if (err) {
        console.warn(err);
        showDialog('fail', err.message, DIALOG_TYPE.ALERT);
      } else {
        bpmnModeler.get('canvas').zoom('1.0', 'auto');
      }
    });
  }
}
