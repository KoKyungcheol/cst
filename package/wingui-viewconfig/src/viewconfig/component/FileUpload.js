import Component from './Component';
import { callService } from '../service/ServiceManager';

export default class FileUpload extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();

    this.loadProcessFlag = false;
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.element.innerHTML = this.template();
    this.element.classList.add('fileUploadWrap');

    this.isMounted = true;
    this.mounted();
  }

  template() {
    return `
      <form id="fileUploadForm${this.id}" enctype="multipart/form-data">
        <fieldset>
          <legend>파일 업로드</legend>
          <input id="addFile${this.id}" multiple="multiple" name="files[]" type="file" />
        </fieldset>
      </form>
      <span id="location${this.id}" class="fileLocation"></span>
      `;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    if (operationId.startsWith('UPLOAD')) {
      callService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else if (operationId === 'INIT') {
      const targetComponent = $('#' + this.id);
      if ($.browser.msie) {
        targetComponent.find('input[type="file"]').replaceWith(targetComponent.find('input[type="file"]').clone(true));
      } else {
        targetComponent.find('input[type="file"]').val('');
      }
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    }
  }

  getActualComponent() {
    return $('#' + this.id).find('.fileLocation').children('span');
  }

  getValue(type) {
    if (type === 'list') {
      let fileInput = document.getElementById(this.id).getElementsByTagName('input')[0];
      let files = fileInput.files;
      return Array.prototype.slice.call(files);
    } else {
      let fileList = [];

      let spans = this.getActualComponent();
      $(spans).each(function () {
        fileList.push($(this).text());
      });

      return fileList;
    }
  }
}

export class KendoFileUpload extends Component {
  constructor(id, element) {
    super(id, element);
    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.element.classList.add('kd_fileUploadWrap');
    this.element.innerHTML = this.template();

    let target = this.querySelector('#addFile' + this.id);

    this.widget = window.kendo.jQuery(target);
    this.widget.kendoUpload({});

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let upload = this.widget.data('kendoUpload');
      upload && upload.destroy();
    }
    this.destroyed();
  }

  template() {
    return `
      <form id="fileUploadForm${this.id}" enctype="multipart/form-data">
        <fieldset>
          <legend>다중파일 업로드</legend>
          <input id="addFile${this.id}" multiple="multiple" name="files[]" type="file" />
        </fieldset>
      </form>
      <span id="location${this.id}" class="fileLocation"></span>
      `;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    if (operationId.startsWith('UPLOAD')) {
      callService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else if (operationId === 'INIT') {
      let upload = $('#addFile' + this.id).data('kendoUpload');
      upload.clearAllFiles();
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    }
  }

  getActualComponent() {
    return this.widget.data('kendoUpload');
  }

  getValue(type) {
    let fileList = [];

    if (type === 'list') {
      $(this.widget.prevAll('input')).each(function () {
        let files = Array.prototype.slice.call(this.files);
        fileList = fileList.concat(files);
      });
    } else {
      let spans = $('#' + this.id).find('.fileLocation').children('span');
      $(spans).each(function () {
        fileList.push($(this).text());
      });
    }

    return fileList;
  }
}
