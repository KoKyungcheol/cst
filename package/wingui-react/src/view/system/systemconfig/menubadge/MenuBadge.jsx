import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ButtonGroup, IconButton } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  BaseGrid, InputField, GridAddRowButton, GridSaveButton, GridDeleteRowButton, useViewStore, useIconStyles,
} from "../../../../imports";

let menuGridItems = [
  { name: "menuId", dataType: "text", headerText: "VIEW_ID", visible: true, editable: true, width: 100, validRules: [{ criteria: "required" }] },
  { name: "menuCd", dataType: "text", headerText: "VIEW_NAME", visible: true, editable: true, width: 100 },
  { name: "badgeContent", dataType: "text", headerText: "BADGE_CONTENT", visible: true, editable: true, width: 100, validRules: [{ criteria: "required" }] },
  { name: "expiredDttm", dataType: "text", headerText: "EXPIRE_DATE", visible: true, editable: true, width: 100, format: "yyyy-MM-dd", validRules: [{ criteria: "required" }] },
]

function MenuBadge() {
  const classes = useIconStyles();
  const [menuGrid, setMenuGrid] = useState(null);
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo])
  const { control, getValues, formState: { errors }} = useForm({
    defaultValues: {
    }
  })
  const globalButtons = [
    { name: "search", action: (e) => { loadData() }, visible: true, disable: false }
  ]

  useEffect(() => {
    setViewInfo(vom.active, 'globalButtons', globalButtons)

    setMenuGrid(getViewInfo(vom.active, 'menuGrid'))
  }, [viewData])

  useEffect(() => {
    if (menuGrid)
      setOption();
  }, [menuGrid]);

  function setOption() {
    menuGrid.gridView.setCheckBar({ visible: true })
    menuGrid.gridView.onCellEdited = function (grid) {
      grid.commit(true);
    }
  }

  function saveData() {
    menuGrid.gridView.commit(true);

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey("MSG_SAVE"), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          menuGrid.dataProvider.getAllStateRows().created,
          menuGrid.dataProvider.getAllStateRows().updated,
          menuGrid.dataProvider.getAllStateRows().deleted,
          menuGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          changeRowData.push(menuGrid.dataProvider.getJsonRow(row));
        });

        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          menuGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          changeRowData.forEach(function (value) {
            if (value.expiredDttm && value.expiredDttm instanceof Date) {
              value.expiredDttm = value.expiredDttm.format("yyyy-MM-ddTHH:mm:ss");
            }
          })

          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/menus/badges',
            data: changeRowData
          })
            .then(function (response) { })
            .catch(function (err) {
              console.log(err);
            })
            .then(function () {
              menuGrid.gridView.hideToast();
              loadData();
            });
        }
      }
    });
  }
  function loadData() {
    menuGrid.gridView.commit(true);

    menuGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/menus/badges/general', {
      params: {
        'menu-cd': getValues('menuCd')
      }
    })
      .then(function (res) {
        res.data.forEach(function (data) {
          data.menuNm = transLangKey(data.menuCd);
        });
        menuGrid.dataProvider.fillJsonData(res.data);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        menuGrid.gridView.hideToast();
      });
  }
  const onBeforeDelete = (targetGrid) => {
    targetGrid.gridView.commit(true);
    if (targetGrid.gridView.getCheckedRows().length === targetGrid.dataProvider.getRowCount()) {
      //적어도 하나 이상의 공통코드는 존재해야 합니다.
      showMessage(transLangKey('DELETE'), transLangKey('최소 하나 이상의 사용자는 존재해야 합니다.'), { close: false })
      return false;
    }

    return true;
  }

  //Promise를 리턴해야 한다.
  const onDelete = (targetGrid, deleteRows) => {
    if (deleteRows.length > 0) {
      return axios({
        method: 'post',
        url: baseURI() + 'system/menus/badges',
        headers: { 'content-type': 'application/json' },
        data: deleteRows
      })
    }
  }

  const onAfterDelete = (targetGrid) => {
    if (targetGrid.gridId === 'menuGrid') {
      loadData();
    }
  }
  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField name="menuCd" label={transLangKey("UI_ID")} readonly={false} disabled={false} control={control} onKeyPress={(e) => { if (e.key === 'Enter') { loadData() } }} />
        </SearchRow>
      </SearchArea>
      <ButtonArea>
        <LeftButtonArea></LeftButtonArea>
        <RightButtonArea>
          <ButtonGroup variant="outlined">
            <GridAddRowButton grid="menuGrid"></GridAddRowButton>
            <GridDeleteRowButton grid="menuGrid" onBeforeDelete={onBeforeDelete} onDelete={onDelete} onAfterDelete={onAfterDelete}></GridDeleteRowButton>
            <GridSaveButton title={transLangKey("SAVE")} style={{ width: "60px" }} onClick={() => { saveData() }}></GridSaveButton>
          </ButtonGroup>
        </RightButtonArea>
      </ButtonArea>
      <ResultArea sizes={[100]} direction={"vertical"}>
        <BaseGrid id="menuGrid" items={menuGridItems} className="white-skin"></BaseGrid>
      </ResultArea>
    </ContentInner>
  );
}

export default MenuBadge;