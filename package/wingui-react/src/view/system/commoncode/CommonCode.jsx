import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, IconButton } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  InputField, BaseGrid, CommonButton, GridAddRowButton, GridDeleteRowButton, GridSaveButton, 
  useIconStyles, useViewStore
} from "../../../imports";

let codeGrpGridItems = [
  { name: "id", dataType: "text", headerText: "ID", visible: false, editable: false, width: 100 },
  { name: "srcId", dataType: "text", headerText: "SRC_ID", visible: false, editable: false, width: 100 },
  {
    name: "grpCd", dataType: "text", headerText: "GRP_CD", visible: true, editable: false, width: 200, validRules: [{ criteria: "required" }],
    styleCallback: function (grid, dataCell) {
      let ret = {}
      if (dataCell.item.rowState == 'created' || dataCell.item.itemState == 'appending' || dataCell.item.itemState == 'inserting') {
        ret.editable = true;
        ret.styleName = 'editable-text-column';
      } else {
        ret.editable = false;
        ret.styleName = 'text-column';
      }
      return ret;
    },
  },
  { name: "grpNm", dataType: "text", headerText: "GRP_NM", visible: true, editable: true, width: 250, validRules: [{ criteria: "required" }] },
  { name: "descrip", dataType: "text", headerText: "DESCRIP", visible: false, editable: false, width: 250 },
  {
    name: "descripLangValue", dataType: "text", headerText: "DESCRIP", visible: true, editable: true, width: 250,
    displayCallback: function (grid, index, value) {
      return transLangKey(value);
    }
  },
  { name: "seq", dataType: "text", headerText: "SEQ", visible: false, editable: false, width: 50 },
  { name: "useYn", dataType: "boolean", headerText: "USE_YN", visible: true, editable: true, width: 50, defaultValue: true },
  { name: "attr01Val", dataType: "text", headerText: "ATTR01_VAL", visible: true, editable: true, width: 100 },
  { name: "attr02Val", dataType: "text", headerText: "ATTR02_VAL", visible: true, editable: true, width: 100 },
  { name: "attr03Val", dataType: "text", headerText: "ATTR03_VAL", visible: true, editable: true, width: 100 },
  { name: "attr04Val", dataType: "text", headerText: "ATTR04_VAL", visible: true, editable: true, width: 100 },
  { name: "attr05Val", dataType: "text", headerText: "ATTR05_VAL", visible: true, editable: true, width: 100 },
  { name: "createBy", dataType: "text", headerText: "CREATE_BY", visible: true, editable: false, width: 80 },
  { name: "createDttm", dataType: "datetime", headerText: "CREATE_DTTM", visible: true, editable: false, width: 100 },
  { name: "modifyBy", dataType: "text", headerText: "MODIFY_BY", visible: true, editable: false, width: 80 },
  { name: "modifyDttm", dataType: "datetime", headerText: "MODIFY_DTTM", visible: true, editable: false, width: 100 },
];

let codeGridItems = [
  { name: "id", dataType: "text", headerText: "ID", visible: false, editable: false, width: 100 },
  { name: "srcId", dataType: "text", headerText: "SRC_ID", visible: false, editable: false, width: 100, validRules: [{ criteria: "required" }] },
  { name: "grpCd", dataType: "text", headerText: "GRP_CD", visible: false, editable: false, width: 200, validRules: [{ criteria: "required" }] },
  { name: "comnCd", dataType: "text", headerText: "COMN_CD", visible: true, editable: true, width: 200 },
  { name: "comnCdNm", dataType: "text", headerText: "COMN_CD_NM", visible: true, editable: true, width: 250 },
  { name: "descrip", dataType: "text", headerText: "DESCRIP", visible: false, editable: false, width: 250 },
  { name: "descripLangValue", dataType: "text", headerText: "DESCRIP", visible: true, editable: true, width: 250 },
  { name: "seq", dataType: "text", headerText: "SEQ", visible: true, editable: true, width: 50 },
  { name: "useYn", dataType: "boolean", headerText: "USE_YN", visible: true, editable: true, width: 50, defaultValue: true },
  { name: "attr01Val", dataType: "text", headerText: "ATTR01_VAL", visible: true, editable: true, width: 100 },
  { name: "attr02Val", dataType: "text", headerText: "ATTR02_VAL", visible: true, editable: true, width: 100 },
  { name: "attr03Val", dataType: "text", headerText: "ATTR03_VAL", visible: true, editable: true, width: 100 },
  { name: "attr04Val", dataType: "text", headerText: "ATTR04_VAL", visible: true, editable: true, width: 100 },
  { name: "attr05Val", dataType: "text", headerText: "ATTR05_VAL", visible: true, editable: true, width: 100 },
  { name: "createBy", dataType: "text", headerText: "CREATE_BY", visible: true, editable: false, width: 80 },
  { name: "createDttm", dataType: "datetime", headerText: "CREATE_DTTM", visible: true, editable: false, width: 100 },
  { name: "modifyBy", dataType: "text", headerText: "MODIFY_BY", visible: true, editable: false, width: 80 },
  { name: "modifyDttm", dataType: "datetime", headerText: "MODIFY_DTTM", visible: true, editable: false, width: 100 },
];

function CommonCode() {
  const classes = useIconStyles();
  const [groupCodeLabel, setGroupCodeLabel] = useState('');
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const [codeGrpGrid, setcodeGrpGrid] = useState(null);
  const [codeGrid, setCodeGrid] = useState(null);
  const { control, getValues } = useForm({
    defaultValues: {
    }
  });
  const globalButtons = [
    {
      name: "search",
      action: (e) => { loadData(codeGrpGrid) },
      visible: true,
      disable: false
    }
  ]

  useEffect(() => {
    setcodeGrpGrid(getViewInfo(vom.active, 'codeGrpGrid'))
    setCodeGrid(getViewInfo(vom.active, 'codeGrid'))
  }, [viewData])
  useEffect(() => {
    if (codeGrpGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)
      setOptions()
    }
  }, [codeGrpGrid])
  useEffect(() => {
    if (codeGrid) {
      setCodeGridOptions()
    }
  }, [codeGrid])

  useEffect(() => {
    setGroupCodeLabel('');
  }, []);

  function setOptions() {
    codeGrpGrid.gridView.setCheckBar({ visible: true });
    codeGrpGrid.gridView.onCellClicked = function (grid, clickData) {
      let id = grid.getValue(clickData.itemIndex, 'id')
      if (id !== undefined && id !== null) {
        setGroupCodeLabel(transLangKey("COMMON_CODE_GROUP") + " : " + grid.getValue(clickData.itemIndex, 'grpCd') + " (" + grid.getValue(clickData.itemIndex, 'grpNm') + ")")
        loadData(codeGrid, id)
      }
    }
  }
  function setCodeGridOptions() {
    codeGrid.gridView.setCheckBar({ visible: true });
  }
  function deleteRow(targetGrid) {
    let seperator = (targetGrid.gridView.id === 'codeGrpGrid') ? 'groups' : 'codes'
    targetGrid.gridView.commit(true);

    let deleteRows = [];
    let createdDeleteRowIndex = [];
    targetGrid.gridView.getCheckedRows().forEach(function (indx) {
      if (!targetGrid.dataProvider.getAllStateRows().created.includes(indx)) {
        deleteRows.push(targetGrid.dataProvider.getJsonRow(indx));
      } else {
        createdDeleteRowIndex.push(indx);
      }
    });
    if (!deleteRows.length) {
      if (!createdDeleteRowIndex.length) {
        //삭제할 행을 선택해주세요.
        showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SELECT_DELETE'), { close: false });
      } else {
        showMessage(transLangKey('DELETE'), transLangKey('MSG_DELETE'), function (answer) {
          if (answer) {
            targetGrid.dataProvider.removeRows(createdDeleteRowIndex);
          }
        });
      }

    } else {
      if (targetGrid.gridView.id === 'codeGrid' && targetGrid.gridView.getCheckedRows().length === targetGrid.dataProvider.getRowCount()) {
        //적어도 하나 이상의 공통코드는 존재해야 합니다.
        showMessage(transLangKey('DELETE'), transLangKey('최소 하나 이상의 공통코드는 존재해야 합니다.'), { close: false })
      } else {
        showMessage(transLangKey('DELETE'), transLangKey('MSG_DELETE'), function (answer) {
          if (answer) {
            targetGrid.gridView.showToast(progressSpinner + 'Deleting data...', true);

            axios({
              method: 'post',
              url: baseURI() + 'system/common/' + seperator + '/delete',
              headers: { 'content-type': 'application/json' },
              data: deleteRows
            }).then(function (response) {
              if (response.status === gHttpStatus.SUCCESS) {
                targetGrid.dataProvider.removeRows(targetGrid.gridView.getCheckedItems());
              }
            })
              .catch(function (err) {
                console.log(err);
              })
              .then(function () {
                targetGrid.gridView.hideToast();
                if (targetGrid.gridView.id === 'codeGrpGrid') {
                  loadData(targetGrid)
                } else {
                  loadData(targetGrid, selectedSrcId)
                }
              });
          }
        });
      }
    }
  }
  function saveData(targetGrid) {
    targetGrid.gridView.commit(true);

    let seperator = (targetGrid.gridView.id === 'codeGrpGrid') ? 'groups' : 'codes'

    let changeRowData = [];
    let changes = [];

    changes = changes.concat(
      targetGrid.dataProvider.getAllStateRows().created,
      targetGrid.dataProvider.getAllStateRows().updated,
      targetGrid.dataProvider.getAllStateRows().deleted,
      targetGrid.dataProvider.getAllStateRows().createAndDeleted
    );

    let msg = '';
    let checkCd = '';

    let useYn = true;
    let selectedGroupCd = codeGrpGrid.dataProvider.getValue(codeGrpGrid.gridView.getCurrent().itemIndex, 'grpCd')
    let selectedSrcId = codeGrpGrid.dataProvider.getValue(codeGrpGrid.gridView.getCurrent().itemIndex, 'id')
    let selectedUseYn = codeGrpGrid.dataProvider.getValue(codeGrpGrid.gridView.getCurrent().itemIndex, 'useYn')
    let checkCharactor = 0;
    changes.forEach(function (row) {
      useYn = targetGrid.dataProvider.getJsonRow(row).useYn;
      checkCd = (targetGrid.gridView.id === 'codeGrpGrid') ? targetGrid.dataProvider.getJsonRow(row).grpCd : targetGrid.dataProvider.getJsonRow(row).comnCd;
      if (targetGrid.gridView.id === 'codeGrid') {
        targetGrid.dataProvider.setValue(row, 'grpCd', selectedGroupCd)
        targetGrid.dataProvider.setValue(row, 'srcId', selectedSrcId)
      }
      if (checkCd !== undefined) {
        if (checkCd.replaceAll("_", "").replaceAll(/[0-9]/g, '').match(/[^A-Z]/g) !== null || checkCd.match(new RegExp(/[\s]/g)) !== null) {
          // 코드는 대문자와 숫자만 입력 가능하며 공백 대신 '_' 문자를 사용해야 합니다.
          msg = 'MSG_CHECK_GROUP_CODE_01'
          checkCharactor++;
        }
      } else {
        //코드를 입력해주세요.
        msg = 'MSG_CHECK_GROUP_CODE_03'
        checkCharactor++;
      }
      changeRowData.push(targetGrid.dataProvider.getJsonRow(row));
    });

    if (changeRowData.length === 0) {
      //저장 할 내용이 없습니다.
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'), { close: false });
    } else if (checkCharactor > 0 || checkCd === undefined) {
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey(msg), { close: false });
    } else {
      let msg = "MSG_SAVE";
      let useYnCount = 0;

      if (targetGrid.gridView.id === 'codeGrpGrid') {
        //모든 공통코드도 사용 해제됩니다. 저장하시겠습니까?
        msg = (!useYn) ? "MSG_SAVE_GROUP_CODE" : "MSG_SAVE"
        useYnCount = 1;
      } else {
        targetGrid.dataProvider.getJsonRows().forEach(function (row) {
          if (row.useYn) {
            useYnCount++
          }
        })
      }
      if (selectedUseYn && !useYnCount) {
        //공통코드 그룹이 사용중입니다. 최소 하나 이상의 공통코드는 사용해야 합니다.
        msg = 'MSG_WARNING_COMMON_CODE';
        showMessage(transLangKey('MSG_CONFIRM'), transLangKey(msg), { close: false })
      } else {
        showMessage(transLangKey('MSG_CONFIRM'), transLangKey(msg), function (answer) {
          if (answer) {
            targetGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

            changeRowData.forEach(function (value) {
              if (value.expiredDttm && value.expiredDttm instanceof Date) {
                value.expiredDttm = value.expiredDttm.format("yyyy-MM-ddTHH:mm:ss");
              }
            })

            axios({
              method: 'post',
              headers: { 'content-type': 'application/json' },
              url: baseURI() + 'system/common/' + seperator,
              data: changeRowData
            })
              .then(function (response) { })
              .catch(function (err) {
                console.log(err);
              })
              .then(function () {
                targetGrid.gridView.hideToast();
                if (targetGrid.gridView.id === 'codeGrpGrid') {
                  loadData(targetGrid)
                } else {
                  loadData(targetGrid, selectedSrcId)
                }
              });
          }
        });
      }
    }
  }
  function loadData(targetGrid, srcId) {
    if (targetGrid.gridView.id === 'codeGrpGrid') {
      resetAll()
    }

    targetGrid.gridView.commit(true);

    let seperator = {};
    if (srcId === undefined) {
      seperator.url = 'groups'
      seperator.params = {
        'group-cd': getValues('grpCd'),
        'group-nm': getValues('grpNm')
      }
    } else {
      seperator.url = 'codes/' + srcId
      seperator.params = { 'srcId': srcId }
    }

    targetGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/common/' + seperator.url, {
      params: seperator.params
    }).then(function (res) {
      if (res.data.length === 0) {
        targetGrid.dataProvider.fillJsonData([]);
        setGroupCodeLabel('')
      } else {
        targetGrid.dataProvider.fillJsonData(res.data);
      }
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      targetGrid.gridView.hideToast();
    });
  }
  function resetAll() {
    codeGrpGrid.dataProvider.clearRows();
    codeGrid.dataProvider.clearRows();
    setGroupCodeLabel('')
  }
  function insertRow(gridObject) {
    if (gridObject.dataProvider.getRowCount() > 0) {
      gridObject.gridView.beginInsertRow(gridObject.gridView.getCurrent().dataRow + 1);
    } else {
      gridObject.gridView.beginAppendRow(0);
    }
    gridObject.gridView.commit(true);
  }
  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField name="grpCd" label={transLangKey("GRP_CD")} readonly={false} disabled={false} onKeyPress={(e) => { if (e.key === 'Enter') { loadData(codeGrpGrid) } }} control={control} />
          <InputField name="grpNm" label={transLangKey("GRP_NM")} onKeyPress={(e) => { if (e.key === 'Enter') { loadData(codeGrpGrid) } }} control={control} readonly={false} disabled={false} />
        </SearchRow>
      </SearchArea>
      <ButtonArea>
        <LeftButtonArea></LeftButtonArea>
        <RightButtonArea>
          <ButtonGroup variant="outlined">
            <GridAddRowButton grid="codeGrpGrid" onClick={() => { insertRow(codeGrpGrid) }}></GridAddRowButton>
            <GridDeleteRowButton grid="codeGrpGrid" onClick={() => { deleteRow(codeGrpGrid) }}></GridDeleteRowButton>
            <GridSaveButton onClick={() => { saveData(codeGrpGrid) }}>{transLangKey("SAVE")}</GridSaveButton>
          </ButtonGroup>
        </RightButtonArea>
      </ButtonArea>
      <ResultArea style={{ height: "calc(100% - 53px" }}>
        <BaseGrid id="codeGrpGrid" items={codeGrpGridItems} className="white-skin"></BaseGrid>
      </ResultArea>
      <ButtonArea>
        <LeftButtonArea>
          <label className="mt-2" style={{ height: "28px", lineHeight: "28px" }}>{groupCodeLabel}</label>
        </LeftButtonArea>
        <RightButtonArea>
          <ButtonGroup variant="outlined">
            <GridAddRowButton grid="codeGrid" onClick={() => { insertRow(codeGrid) }}></GridAddRowButton>
            <GridDeleteRowButton grid="codeGrid" onClick={() => { deleteRow(codeGrid) }}></GridDeleteRowButton>
            <GridSaveButton onClick={() => { saveData(codeGrid) }}>{transLangKey("SAVE")}</GridSaveButton>
          </ButtonGroup>
        </RightButtonArea>
      </ButtonArea>
      <ResultArea style={{ height: "calc(40% - 22px)" }}>
        <BaseGrid id="codeGrid" items={codeGridItems} className="white-skin"></BaseGrid>
      </ResultArea>
    </ContentInner>
  );
}

export default CommonCode