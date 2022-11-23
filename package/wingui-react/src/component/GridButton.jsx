import React, { useEffect, useRef, useState } from "react";
import { TreeView } from 'realgrid';
import { Button, IconButton, Tooltip } from "@mui/material";
import PropTypes from 'prop-types';
import { transLangKey } from "../lang/i18n-func";
import { useViewStore } from '../store/viewStore'
import { useIconStyles } from "./CommonStyle";
import { exportGridtoExcel } from "../utils/grid";
import { showMessage } from "../utils/common";
import { Icon } from "..";
import { getAppSettings } from "@zionex/utils/common";

let component = getAppSettings('component');

export function GridAddRowButton(props) {
  const iconClasses = useIconStyles();

  const [gridObject, setGridObject] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])

  useEffect(() => {
    if (props.grid) {
      const grdObj = getViewInfo(vom.active, props.grid);
      if (grdObj) {
        setGridObject(grdObj);
      }
    }
  }, [viewData])

  function insertRow() {
    if (gridObject == null) {
      console.log('gridObject 가 없습니다.')
      return;
    }

    const gridView = gridObject.gridView;
    const dataProvider = gridObject.dataProvider;
    try {
      gridView.commit(true);
      __insertRow(gridView, dataProvider);
    }
    catch (e) {
      showMessage(transLangKey('DELETE'), '이전 편집내용을 취소하시겠습니까?', function (answer) {
        if (answer) {
          gridView.cancel();
          __insertRow(gridView, dataProvider);
        }
      }
      );
    }
  }

  function __insertRow(gridView, dataProvider) {
    const onBeforeAdd = props.onBeforeAdd || (() => { return true });
    const onAfterAdd = props.onAfterAdd || (() => { return true });
    const onGetData = props.onGetData || (() => { return null });

    let tree = gridView instanceof TreeView ? true : false;

    if (!onBeforeAdd(gridObject))
      return;

    let data = onGetData(gridObject);

    if (tree) {
      if (data) {
        dataProvider.addChildRow(-1, data, 0, false);
      } else {
        dataProvider.addChildRow(-1, [gridView.getCurrent().dataRow + 1, ""], 0, false);
      }
    } else {
      if (dataProvider.getRowCount() > 0) {
        if (data)
          dataProvider.insertRow(gridView.getCurrent().dataRow + 1, data);
        else
          gridView.beginInsertRow(gridView.getCurrent().dataRow + 1);
      } else {
        if (data)
          dataProvider.insertRow(0, data);
        else
          gridView.beginAppendRow();
      }
    }

    gridView.showEditor();
    gridView.setFocus();

    try {
      gridView.commit(true);
    }
    catch (e) {
      gridView.cancel();
    }

    onAfterAdd(gridObject);
  }

  return (
    <>
      <Tooltip title={transLangKey("ADD")} placement='bottom' arrow>
        {component.button === 'icon' ?
          <IconButton className={iconClasses.gridIconButton} onClick={props.onClick ? props.onClick : insertRow}><Icon.Plus /></IconButton>
          : <Button variant="outlined" props={{ ...props }} className="commonButton" onClick={props.onClick ? props.onClick : insertRow}>
            {transLangKey("ADD")}
          </Button>
        }
      </Tooltip>
    </>
  )
}

GridAddRowButton.propTypes = {
  grid: PropTypes.string,
  type: PropTypes.string,
  onBeforeAdd: PropTypes.func,
  onGetData: PropTypes.func,
  onAfterAdd: PropTypes.func,
  onClick: PropTypes.func,
};

GridAddRowButton.displayName = 'GridAddBtn';

export function GridDeleteRowButton(props) {
  const iconClasses = useIconStyles();
  const [gridObject, setGridObject] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])

  useEffect(() => {
    if (props.grid) {
      const grdObj = getViewInfo(vom.active, props.grid);

      if (grdObj) {
        setGridObject(grdObj);
      }
    }
  }, [viewData])
  function deleteRow() {
    if (!gridObject)
      return;

    const gridView = gridObject.gridView;
    const dataProvider = gridObject.dataProvider;

    try {
      gridView.commit();
      __deleteRow(gridView, dataProvider)
    }
    catch (e) {
      showMessage(transLangKey('DELETE'), '이전 편집내용을 취소하시겠습니까?', function (answer) {
        if (answer) {
          gridView.cancel();
          gridView.commit(true);
          __deleteRow(gridView, dataProvider)
        }
      });
    }
  }
  function __deleteRow(gridView, dataProvider) {
    const onBeforeDelete = props.onBeforeDelete || (() => { return true });
    const onDelete = props.onDelete || (() => { return Promise.resolve(1) });
    const onAfterDelete = props.onAfterDelete || (() => { return true });
    const onErrorDelete = props.onErrorDelete || ((gridObj, err) => { console.log(err) });

    const v1 = onBeforeDelete(gridObject);

    if (v1 == undefined || v1 === false) {
      return;
    }

    let deleteRows = [];
    let newRows = [];
    let allDelRows = [];
    gridView.getCheckedRows().forEach(function (indx) {
      if (!dataProvider.getAllStateRows().created.includes(indx)) {
        deleteRows.push(dataProvider.getJsonRow(indx));
      } else {
        newRows.push(indx);
      }
      allDelRows.push(indx);
    });

    if (allDelRows.length == 0 && newRows == 0) {
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SELECT_DELETE'), { close: false });
    }
    else {
      showMessage(transLangKey('DELETE'), transLangKey('MSG_DELETE'), function (answer) {
        if (answer) {
          if (props.url) {
            gridView.showToast(progressSpinner + 'Deleting data...', true);

            axios({
              method: 'post',
              url: baseURI() + props.url,
              headers: { 'content-type': 'application/json' },
              data: deleteRows
            })
              .then(function (response) {
                if (response.status === gHttpStatus.SUCCESS) {
                  dataProvider.removeRows(gridView.getCheckedRows());
                  onAfterDelete(gridObject);
                }
              })
              .catch(function (err) {
                onErrorDelete(gridObject, err);
              })
              .then(function () {
                gridView.hideToast();
              });
          } else {
            let thenable = onDelete(gridObject, deleteRows, newRows);
            if (thenable && isPromise(thenable)) {
              thenable.then(function (response) {
                dataProvider.removeRows(allDelRows);
                onAfterDelete(gridObject);
              })
                .catch(function (err) {
                  onErrorDelete(gridObject, err);
                })
            }
            else {
              dataProvider.removeRows(allDelRows);
              onAfterDelete(gridObject);
            }
          }
        }
      });
    }
  }
  return (
    <>
      <Tooltip title={transLangKey("DELETE")} placement='bottom' arrow>
        {component.button === 'icon' ?
          <IconButton className={iconClasses.gridIconButton} onClick={props.onClick ? props.onClick : deleteRow}><Icon.Minus /></IconButton>
          : <Button variant="outlined" props={{ ...props }} className="commonButton" onClick={props.onClick ? props.onClick : deleteRow}>
            {transLangKey("DELETE")}
          </Button>
        }
      </Tooltip>
    </>
  )
}

GridDeleteRowButton.propTypes = {
  grid: PropTypes.string,
  type: PropTypes.string,
  url: PropTypes.string,
  onBeforeDelete: PropTypes.func,
  onDelete: PropTypes.func,
  onAfterDelete: PropTypes.func,
  onClick: PropTypes.func,
};

GridDeleteRowButton.displayName = 'GridDeleteRowButton';

export function GridSaveButton(props) {
  const iconClasses = useIconStyles();
  const [gridObject, setGridObject] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])

  useEffect(() => {
    if (props.grid) {
      const grdObj = getViewInfo(vom.active, props.grid);

      if (grdObj) {
        setGridObject(grdObj);
      }
    }
  }, [viewData])

  function saveRows() {
    if (!gridObject)
      return;

    const gridView = gridObject.gridView;
    const dataProvider = gridObject.dataProvider;

    try {
      gridView.commit();
      __saveRows(gridView, dataProvider)
    }
    catch (e) {
      showMessage(transLangKey('SAVE'), '저장할 데이터에 오류가 있습니다. 이전 편집내용을 취소하시겠습니까?', function (answer) {
        if (answer) {
          gridView.cancel();
          gridView.commit(true);
          __saveRows(gridView, dataProvider)
        } else {
          gridView.commit(true);
          gridView.validateCells(null, false);
          __saveRows(gridView, dataProvider)
        }
      });
    }
  }

  function __saveRows(gridView, dataProvider) {
    const onBeforeSave = props.onBeforeSave || (() => { return true });
    const onSave = props.onSave || (() => { return Promise.resolve(1) });
    const onAfterSave = props.onAfterSave || (() => { return true });
    const onErrorSave = props.onErrorSave || ((gridObj, err) => { console.log(err) });

    const v1 = onBeforeSave(gridObject);

    if (v1 == undefined || v1 === false) {
      return;
    }

    gridView.validateCells(null, false);

    const invalidCells = gridView.getInvalidCells();
    if (invalidCells) {
      //아래 오류 내용을 확인해주세요.
      let contentBody = '<h4>' + transLangKey('MSG_VALIDATE_ERROR_SAVE_DATA') + '</h4><br/>';
      invalidCells.forEach(c => {
        contentBody += '<h4> [Row: ' + c.dataRow + ' Column: ' + gridView.getColumnProperty(c.column, 'header').text + '] : ' + transLangKey(c.message) + '</h4>'
      })
      showMessage(transLangKey('FP_VALIDATION_FAIL'), contentBody, { close: false });
      return;
    }

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          dataProvider.getAllStateRows().created,
          dataProvider.getAllStateRows().updated,
          dataProvider.getAllStateRows().deleted,
          dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          let values = dataProvider.getJsonRow(row);
          Object.keys(values).forEach(key => {
            if (values[key] && values[key] instanceof Date) {
              values[key] = values[key].format('yyyy-MM-ddTHH:mm:ss');
            }
          });
          changeRowData.push(values);
        });

        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          if (props.url) {
            gridView.showToast(progressSpinner + 'Saving data...', true);
            axios({
              method: 'post',
              headers: { 'content-type': 'application/json' },
              url: baseURI() + props.url,
              data: changeRowData
            })
              .then(function (response) {
              })
              .catch(function (err) {
                onErrorSave(gridObject, err);
              })
              .then(function () {
                gridView.hideToast();
                onAfterSave(gridObject);
              });
          } else {
            let thenable = onSave(gridObject, changeRowData);
            if (thenable && isPromise(thenable)) {
              thenable.then(function (response) {
                onAfterSave(gridObject);
              })
                .catch(function (err) {
                  onErrorSave(gridObject, err);
                })
            }
          }
        }
      }
    });
  }

  return (
    <>
      <Tooltip title={transLangKey("SAVE")} placement='bottom' arrow>
        {component.button === 'icon' ?
          <IconButton className={iconClasses.gridIconButton} onClick={props.onClick ? props.onClick : saveRows}><Icon.Save size={20} /></IconButton>
          : <Button variant="outlined" props={{ ...props }} className="commonButton" onClick={props.onClick ? props.onClick : saveRows}>{transLangKey("SAVE")}</Button>
        }
      </Tooltip>
    </>
  )
}

GridSaveButton.propTypes = {
  grid: PropTypes.string,
  type: PropTypes.string,
  url: PropTypes.string,
  onBeforeSave: PropTypes.func,
  onSave: PropTypes.func,
  onAfterSave: PropTypes.func,
  onErrorSave: PropTypes.func,
  onClick: PropTypes.func,
};

GridSaveButton.displayName = 'GridSaveButton';

export function GridExcelImportButton(props) {
  const iconClasses = useIconStyles();

  const [gridObject, setGridObject] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])

  const refXlsUpload = useRef(null);

  useEffect(() => {
    if (props.grid) {
      const grdObj = getViewInfo(vom.active, props.grid);

      if (grdObj) {
        setGridObject(grdObj);
      }
    }
  }, [viewData])

  function importExcel() {
    refXlsUpload.current.click();
  }

  function excelToJson() {
    const fileInput = event.target;

    if (!gridObject || !fileInput) {
      return;
    }

    const gridView = gridObject.gridView;
    const dataProvider = gridObject.dataProvider;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    fileInput.value = '';

    gridView.commit(true);

    gridView.showToast(progressSpinner + 'Importing data...', true);
    axios.post(baseURI() + 'excel-import', formData, {
      headers: getHeaders({
        'Content-Type': 'multipart/form-data',
        'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
      }, true)
    })
      .then(function (res) {
        gridView.cancel();
        dataProvider.clearRows();
        dataProvider.fillJsonData(res.data.RESULT_DATA, { fillMode: 'append', count: -1 });
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        gridView.hideToast();
        gridView.validateCells(null, false);
      });
  }

  return (
    <>
      <input id="xlsUpload" ref={refXlsUpload} type={"file"} onChange={excelToJson} hidden={true} />
      <Tooltip title={transLangKey("EXCEL_IMPORT")} placement='bottom' arrow>
        {component.button === 'icon' ?
          <IconButton className={iconClasses.gridIconButton} onClick={props.onClick ? props.onClick : importExcel}><Icon.Upload /></IconButton>
          : <Button variant="outlined" props={{ ...props }} className="commonButton" onClick={importExcel}>
            {transLangKey("EXCEL_IMPORT")}
          </Button>
        }
      </Tooltip>
    </>
  )
}

GridExcelImportButton.propTypes = {
  grid: PropTypes.string,
  type: PropTypes.string,
};

GridExcelImportButton.displayName = 'GridExcelImportButton';

export function GridExcelExportButton(props) {
  const iconClasses = useIconStyles();

  const [gridObject, setGridObject] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])

  useEffect(() => {
    if (props.grid) {
      const grdObj = getViewInfo(vom.active, props.grid);

      if (grdObj) {
        setGridObject(grdObj);
      }
    }
  }, [viewData])

  function exportExcel() {
    if (!gridObject) {
      return;
    }
    const gridView = gridObject.gridView;
    exportGridtoExcel(gridView, props.options);
  }

  return (
    <>
      <Tooltip title={transLangKey("EXCEL_EXPORT")} placement='bottom' arrow>
        {component.button === 'icon' ?
          <IconButton className={iconClasses.gridIconButton} onClick={props.onClick ? props.onClick : exportExcel}><Icon.Download /></IconButton>
          : <Button variant="outlined" props={{ ...props }} className="commonButton" onClick={props.onClick ? props.onClick : exportExcel}>
            {transLangKey("EXCEL_EXPORT")}
          </Button>
        }
      </Tooltip>
    </>
  )
}

GridExcelExportButton.propTypes = {
  grid: PropTypes.string,
  type: PropTypes.string,
  options: PropTypes.any,
};

GridExcelExportButton.displayName = 'GridExcelExportButton';
