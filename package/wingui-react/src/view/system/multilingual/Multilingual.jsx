import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, IconButton } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  GridExcelImportButton, GridExcelExportButton, GridSaveButton,
  InputField, BaseGrid, CommonButton, GridAddRowButton, GridDeleteRowButton, useIconStyles, useViewStore
} from "../../../imports";
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

let multilGridItems = [
  { name: "langCd", dataType: "text", headerText: "LANG", editable: true, validRules: [{ criteria: "required" }] },
  { name: "langKey", dataType: "text", headerText: "LANG_KEY", editable: true, validRules: [{ criteria: "required" }] },
  { name: "langValue", dataType: "text", headerText: "LANG_VALUE", editable: true, validRules: [{ criteria: "required" }] },
];

function Multilingual() {
  const classes = useIconStyles();
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const [multilGrid, setMultilGrid] = useState(null);
  const { control, getValues, setValue } = useForm({
    defaultValues: {
    }
  });
  const [selectOptions, setSelectOptions] = useState([]);
  const globalButtons = [
    {
      name: "search",
      action: (e) => { loadData() },
      visible: true,
      disable: false
    }
  ]
  const exportExceloptions = {
    headerDepth: 1,
    footer: "hidden",
    allColumns: true,
    lookupDisplay: true,
    separateRows: false
  }
  useEffect(() => {
    setMultilGrid(getViewInfo(vom.active, 'multilGrid'))
  }, [viewData])

  useEffect(() => {
    if (multilGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)

      setOptions()
    }
  }, [multilGrid])

  useEffect(() => {
    resetConditions();
    loadLocale();
  }, []);

  function setOptions() {
    multilGrid.gridView.setCheckBar({ visible: true })
    multilGrid.gridView.onCellEdited = function (grid) {
      grid.commit(true);
    }
  }

  function insertRow() {
    if (multilGrid.dataProvider.getRowCount() > 0) {
      multilGrid.gridView.beginInsertRow(multilGrid.gridView.getCurrent().dataRow + 1);
    } else {
      multilGrid.gridView.beginAppendRow(0);
    }
    multilGrid.gridView.commit(true);
  }

  function deleteRow() {
    multilGrid.gridView.commit(true);

    let deleteRows = [];
    multilGrid.gridView.getCheckedRows().forEach(function (indx) {
      deleteRows.push(multilGrid.dataProvider.getJsonRow(indx));
    });

    if (!deleteRows.length) {
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SELECT_DELETE'));
      return;
    }

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_DELETE'), function (answer) {
      if (answer) {
        multilGrid.dataProvider.removeRows(multilGrid.dataProvider.getAllStateRows().created);

        multilGrid.gridView.showToast(progressSpinner + 'Deleting data...', true);

        axios({
          method: 'post',
          url: baseURI() + 'system/lang-packs/delete',
          headers: { 'content-type': 'application/json' },
          data: deleteRows
        }).then(function (response) {
          if (response.status === gHttpStatus.SUCCESS) {
            multilGrid.dataProvider.removeRows(multilGrid.gridView.getCheckedRows());
          }
        }).catch(function (err) {
          console.log(err);
        }).then(function () {
          multilGrid.gridView.hideToast();
        });
      }
    })
  }

  function saveData() {
    multilGrid.gridView.commit(true);
    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          multilGrid.dataProvider.getAllStateRows().created,
          multilGrid.dataProvider.getAllStateRows().updated,
          multilGrid.dataProvider.getAllStateRows().deleted,
          multilGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.map(function (row) {
          changeRowData.push(multilGrid.dataProvider.getJsonRow(row));
        });

        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          multilGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/lang-packs',
            data: changeRowData
          }).then(function (response) {
          }).catch(function (err) {
            console.log(err);
          }).then(function () {
            multilGrid.gridView.hideToast();
            loadData()
          });
        }
      }
    });
  }

  function loadLocale() {
    axios.get(baseURI() + 'system/lang-packs/language-codes', {
      params: {
        'include-all': true
      }
    }).then(function (res) {
      let resultData = JSON.stringify(res.data);
      let result = [];
      $.each(JSON.parse(resultData), function (idx, obj) {
        result.push({ label: transLangKey(obj.langNm), value: obj.langCd })
      });
      setSelectOptions(result);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
    });
  }

  function loadData() {
    multilGrid.gridView.commit(true);

    multilGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/lang-packs', {
      params: {
        'lang-cd': getValues('langCd'),
        'lang-key': getValues('langKey'),
        'lang-value': getValues('langValue'),
      }
    }).then(function (res) {
      multilGrid.dataProvider.fillJsonData(res.data);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      multilGrid.gridView.hideToast();
      if (multilGrid.dataProvider.getRowCount() == 0) {
        multilGrid.gridView.setDisplayOptions({ showEmptyMessage: true, emptyMessage: transLangKey('MSG_NO_DATA') });
      }
    });
  }

  function resetConditions() {
    setValue('langCd', 'all')
    setValue('langKey', '')
    setValue('langValue', '')
  }

  function reloadLanguage() {
    axios.get(baseURI() + 'system/lang-packs/' + getValues('langCd') + '/reload')
      .then(function (res) {
        showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_CONFIRM_RELOAD_LANGPACK'));
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        window.location.reload()
      })
  }

  function fixdata(data) {
    let o = "", l = 0, w = 10240;
    for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));

    return o;
  }

  function handleXlsFile(e) {
    let files = e.target.files;
    let i, f;
    for (i = 0, f = files[i]; i != files.length; ++i) {
      let reader = new FileReader();
      // let name = f.name;
      reader.onload = function (e) {
        let data = e.target.result;
        let arr = fixdata(data);
        let workbook = XLSX.read(btoa(arr), { type: 'base64' });
        processWb(workbook);
      };
      reader.readAsArrayBuffer(f);
    }
  }

  function processWb(wb) {
    let output = "";
    output = sheetToJson(wb);

    let sheetNames = Object.keys(output);

    if (sheetNames.length > 0) {
      let colsObj = output[sheetNames][0];

      if (colsObj) {
        multilGrid.dataProvider.clearRows();
        multilGrid.dataProvider.fillJsonData(output, { rows: sheetNames[0] });
      }
      let rowCount = output[sheetNames[0]].length;
      for (let i = 0; i < rowCount; i++) {
        multilGrid.dataProvider.setRowState(i, "updated", false);
      }
    }
  }

  function sheetToJson(workbook) {
    let result = {};
    workbook.SheetNames.forEach(function (sheetName) {
      let bindingInfo = JSON.parse(workbook.Sheets[sheetName]['A1'].v);
      let bindingFields = Object.values(bindingInfo.BINDING_FIELDS);
      let dataBeginIdx = bindingInfo.DATA_BEGIN_IDX + 1;
      let range = workbook.Sheets[sheetName]['!ref'].replace('A1', 'A' + dataBeginIdx);

      workbook.Sheets[sheetName]['!ref'] = range;
      let roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], { header: bindingFields });
      if (roa.length > 0) {
        result[sheetName] = roa;
      }
    });
    return result;
  }

  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField type="select" name="langCd" label={transLangKey("LANG")} control={control} options={selectOptions} />
          <InputField control={control} label={transLangKey("LANG_KEY")} name="langKey" onKeyPress={(e) => { if (e.key === 'Enter') { loadData() } }} ></InputField>
          <InputField control={control} label={transLangKey("LANG_VALUE")} name="langValue" onKeyPress={(e) => { if (e.key === 'Enter') { loadData() } }}></InputField>
        </SearchRow>
      </SearchArea>
      <ButtonArea>
        <LeftButtonArea>
          <GridExcelImportButton type="icon" grid="multilGrid" />
          <GridExcelExportButton type="icon" grid="multilGrid" options={exportExceloptions} />
          <CommonButton title={transLangKey("RESET_LANGPACK")} onClick={reloadLanguage} ><SystemUpdateAltIcon /></CommonButton>
        </LeftButtonArea>
        <RightButtonArea>
          <GridAddRowButton type="icon" grid="multilGrid" onClick={() => { insertRow() }}>{transLangKey("ADD")}</GridAddRowButton>
          <GridDeleteRowButton type="icon" grid="multilGrid" onClick={() => { deleteRow() }}>{transLangKey("DELETE")}</GridDeleteRowButton>
          <GridSaveButton type="icon" onClick={() => { saveData() }}>{transLangKey("SAVE")}</GridSaveButton>
        </RightButtonArea>
      </ButtonArea>
      <ResultArea sizes={[100, 50]} direction={"vertical"}>
        <BaseGrid id="multilGrid" items={multilGridItems}></BaseGrid>
      </ResultArea>
    </ContentInner>
  );
}

export default Multilingual
