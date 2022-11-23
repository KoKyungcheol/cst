import GridUtil from '../component/grid/GridUtil';

class ExcelTool {
  constructor() {
    this.fileInputs = {};
  }

  clear() {
    for (let id in this.fileInputs) {
      delete this.fileInputs[id];
    }
  }

  template(element, display = true) {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }

    if (element) {
      const fileInput = document.createElement('input');
      fileInput.id = element.id + '_XLSX';
      fileInput.setAttribute('type', 'file');
      fileInput.addEventListener('change', this.importExcel, false);

      if (display) {
        fileInput.style.display = 'block';
      } else {
        fileInput.style.display = 'none';
      }

      this.fileInputs[element.id] = fileInput;

      element.appendChild(fileInput);
    }
  }

  exportExcel(componentId, operationId, exportAll) {
    GridUtil.exportData(componentId, operationId, exportAll);
  }

  importExcel(event) {
    const fileInput = event.target;
    const componentId = fileInput.id.replace('_XLSX', '');

    GridUtil.showToast(componentId, 'Importing data...');
    
    if(fileInput.files[0]) {
      xl.excelToJson(fileInput)
      .then(res => {
        if (res && res.data && res.data.RESULT_SUCCESS) {
            console.log(res.data.RESULT_MESSAGE);
            GridUtil.importData(componentId, res.data);
          } else {
            console.warn('Import Failed!');
            GridUtil.hideToast(componentId);
          }
        })
        .catch(err => {
          console.error(err);
          GridUtil.hideToast(componentId);
      });
    }
  }

  dispatchEvent(type, componentId) {
    const fileInput = this.fileInputs[componentId];
    if (!fileInput) {
      return;
    }

    // The latest event method was not applied in IE, so I applied it in the old event method.
    let event;
    if (type === 'click') {
      event = document.createEvent('MouseEvents');
      event.initMouseEvent(type, true, true, window, 0,
        event.screenX, event.screenY, event.clientX, event.clientY,
        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
        0, null);
    } else {
      event = document.createEvent('Event');
      event.initEvent(type, true, true);
    }

    fileInput.dispatchEvent(event);
  }

  async excelToJson(fileInput) {
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fileInput.value = '';

    let res = await axios.post(baseURI() + 'excel-import', formData, {
      headers: getHeaders({
        'Content-Type': 'multipart/form-data'
      }, true)
    });

    return res;
  }

}

const xl = new ExcelTool();

export default xl;
