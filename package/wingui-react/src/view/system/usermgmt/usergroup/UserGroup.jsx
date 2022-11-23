import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, ButtonGroup } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  InputField, BaseGrid, CommonButton, useIconStyles, useStyles, useViewStore, GridDeleteRowButton, GridAddRowButton, GridSaveButton
} from "../../../../imports";
import PopSelectUser from "./PopSelectUser";

const userGroupGridItems = [
  { name: "id", dataType: "text", headerText: "ID", visible: false, editable: false, width: 100 },
  { name: "grpCd", dataType: "text", headerText: "GRP_CD", editable: true, width: 100, validRules: [{ criteria: "required" }] },
  { name: "grpNm", dataType: "text", headerText: "GRP_NM", editable: true, width: 100, validRules: [{ criteria: "required" }] },
  { name: "grpDescrip", dataType: "text", headerText: "DESCRIP", editable: true, width: 130 },
];

const userGridItems = [
  { name: "userId", dataType: "text", headerText: "ID", visible: false, editable: false, width: 100 },
  {
    name: "displayName", dataType: "text", headerText: "USER_NM", editable: false, width: 100,
    styleCallback: function (grid, dataCell) {
      let res = {}
      res.styleName = 'link-column';
      return res;
    },
  },
  { name: "username", dataType: "text", headerText: "USER_ID", editable: false, width: 100 },
  { name: "department", dataType: "text", headerText: "DEPARTMENT", editable: false, width: 100 },
  { name: "businessValue", dataType: "text", headerText: "BUSINESS", editable: false, width: 100 },
  { name: "grpCd", dataType: "text", headerText: "GRP_CD", visible: false, editable: false, width: 100 },
];

function UserGroup() {
  const history = useHistory();
  const location = useLocation();
  const iconClasses = useIconStyles();
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const [userGrid, setUserGrid] = useState(null);
  const [userGroupGrid, setUserGroupGrid] = useState(null);
  const { control, getValues, setValue } = useForm({
    defaultValues: {
    }
  });
  const globalButtons = [
    {
      name: "search",
      action: (e) => { loadData() },
      visible: true,
      disable: false
    }
  ]

  useEffect(() => {
    setUserGroupGrid(getViewInfo(vom.active, 'userGroupGrid'))
    setUserGrid(getViewInfo(vom.active, 'userGrid'))
  }, [viewData])
  useEffect(() => {
    if (userGroupGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)

      setOptions()
      loadData()
    }
    if (userGrid) {
      setPOptions()
    }
  }, [userGrid, userGroupGrid])
  useEffect(() => {
    if (location.state !== undefined && location.state !== null && userGroupGrid !== null) {
      setValue('grpNm', location.state.grpNm)

      loadData();
    }
  }, [location, userGroupGrid])
  function setOptions() {
    userGroupGrid.gridView.setCheckBar({ visible: true });
    userGroupGrid.gridView.onCellClicked = function (grid, clickData) {
      let rowState = grid.getDataSource().getRowState(clickData.itemIndex);
      if (clickData.cellType != "check" && clickData.cellType != "head" && clickData.cellType != "header") {
        let groupCode = grid.getValue(clickData.itemIndex, "grpCd");
        if (rowState != "created") {
          loadUserGrid(groupCode);
          userGroupGrid.gridView.setDisplayOptions({ showEmptyMessage: true });
        } else {
          resetConditions();
          userGroupGrid.gridView.setDisplayOptions({ showEmptyMessage: false });
        }
      }
    }
    userGroupGrid.gridView.onCellEdited = function (grid) {
      grid.commit(true);
    }
  }
  function setPOptions() {
    userGrid.gridView.setCheckBar({ visible: true });
    userGrid.gridView.onCellClicked = function (grid, clickData) {
      let clickedRow = grid.getJsonRows()[clickData.dataRow]
      if (clickData.column === 'displayName') {
        history.push({ pathname: '/system/usermgmt/users', state: { username: clickedRow.username } })
      }
    }
  }
  function loadData() {
    loadUserGroupGrid();
    resetConditions();
  }
  function loadUserGroupGrid() {
    if (location.state !== undefined && location.state !== null) {
      location.state.grpNm = getValues('grpNm')
    }
    userGroupGrid.gridView.commit(true);

    userGroupGrid.gridView.showToast(progressSpinner + 'Load Data...', true);
    axios.get(baseURI() + 'system/groups', {
      params: {
        'group-nm': getValues('grpNm')
      }
    })
      .then(function (res) {
        userGroupGrid.dataProvider.fillJsonData(res.data);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        userGroupGrid.gridView.hideToast();
        userGroupGrid.gridView.setAllCheck(false, true);  // init header checkBar

        userGrid.dataProvider.clearRows();
      });
  }

  const onBeforeDelete = (targetGrid) => {
    targetGrid.gridView.commit(true);
    if (targetGrid.gridId === 'userGrid') {
      if (targetGrid.gridView.getCheckedRows().length === targetGrid.dataProvider.getRowCount()) {
        //적어도 하나 이상의 공통코드는 존재해야 합니다.
        showMessage(transLangKey('DELETE'), transLangKey('최소 하나 이상의 사용자 그룹은 존재해야 합니다.'), { close: false })
        return false;
      }
    }

    return true;
  }

  const onDelete = (targetGrid, deleteRows) => {
    if (deleteRows.length > 0) {
      if (targetGrid.gridView.id === 'userGrid') {
        return axios({
          method: 'post',
          url: baseURI() + 'system/groups/' + getValues('groupCode') + '/users/delete',
          headers: { 'content-type': 'application/json' },
          data: deleteRows
        })
      } else if (targetGrid.gridView.id === 'userGroupGrid') {
        axios({
          method: 'post',
          url: baseURI() + 'system/groups/delete',
          headers: { 'content-type': 'application/json' },
          data: deleteRows
        })
      }
    }
  }

  function onAfterDelete(targetGrid) {
    if (targetGrid.gridView.id === 'userGrid') {
      // loadData();
      // resetConditions();
    } else if (targetGrid.gridView.id === 'userGroupGrid') {
      // updateGroupInfo();
    }
  }
  function loadUserGrid(groupCode) {
    userGrid.gridView.commit(true);

    userGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/groups/' + groupCode + '/users')
      .then(function (res) {
        userGrid.dataProvider.fillJsonData(res.data);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        userGrid.gridView.hideToast();
        userGrid.gridView.setAllCheck(false, true);  // init header checkBar
        updateGroupInfo();
      });
  }
  function insertUserGridRow(users) {
    users.forEach(function (user) {
      user.grpCd = getValues('groupCode');
      let userNames = userGrid.dataProvider.getFieldValues("username", 0, -1);
      if (userNames != null) {
        if (userNames.indexOf(user.username) === -1) {
          let itemIndex = userGrid.gridView.getCurrent().itemIndex + 1;
          userGrid.dataProvider.insertRow(itemIndex, user);
          userGrid.gridView.setCurrent({ itemIndex: itemIndex });
        }
      } else {
        userGrid.dataProvider.insertRow(0, user);
        userGrid.gridView.setCurrent({ itemIndex: 0 });
      }
    });
    userGrid.gridView.commit(true);
  }
  function insertGroupGridRow() {
    if (userGroupGrid.dataProvider.getRowCount() > 0) {
      userGroupGrid.gridView.beginInsertRow(userGroupGrid.gridView.getCurrent().dataRow + 1);
    } else {
      userGroupGrid.gridView.beginAppendRow(0);
    }
    userGroupGrid.gridView.commit(true);

    resetConditions();
  }
  function deleteGroupGridRow() {
    userGroupGrid.gridView.commit(true);

    let deleteRows = [];
    let createdDeleteRowIndex = [];
    userGroupGrid.gridView.getCheckedRows().forEach(function (indx) {
      if (!userGroupGrid.dataProvider.getAllStateRows().created.includes(indx)) {
        deleteRows.push(userGroupGrid.dataProvider.getJsonRow(indx));
      } else {
        createdDeleteRowIndex.push(indx);
      }
    });

    if (!deleteRows.length) {
      if (!createdDeleteRowIndex.length) {
        showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SELECT_DELETE'));
      } else {
        showMessage(transLangKey('DELETE'), transLangKey('MSG_DELETE'), function (answer) {
          if (answer) {
            userGroupGrid.dataProvider.removeRows(createdDeleteRowIndex);
          }
        });
      }
    } else {
      showMessage(transLangKey('DELETE'), transLangKey('MSG_DELETE'), function (answer) {
        if (answer) {
          userGroupGrid.gridView.showToast(progressSpinner + 'Deleting data...', true);

          axios({
            method: 'post',
            url: baseURI() + 'system/groups/delete',
            headers: { 'content-type': 'application/json' },
            data: deleteRows
          })
            .then(function (response) {
              if (response.status === gHttpStatus.SUCCESS) {
                userGroupGrid.dataProvider.removeRows(userGroupGrid.gridView.getCheckedRows());
              }
            })
            .catch(function (err) {
              console.log(err);
            })
            .then(function () {
              userGroupGrid.gridView.hideToast();
              resetConditions();
            });
        }
      });
    }
  }
  function saveGroupGridData() {
    userGroupGrid.gridView.commit(true);

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          userGroupGrid.dataProvider.getAllStateRows().created,
          userGroupGrid.dataProvider.getAllStateRows().updated,
          userGroupGrid.dataProvider.getAllStateRows().deleted,
          userGroupGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          changeRowData.push(userGroupGrid.dataProvider.getJsonRow(row));
        });

        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          userGroupGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/groups',
            data: changeRowData
          })
            .then(function (response) { })
            .catch(function (err) {
              console.log(err);
            })
            .then(function () {
              userGroupGrid.gridView.hideToast();
              loadData();
            });
        }
      }
    });
  }
  function saveGroupUser() {
    userGrid.gridView.commit(true);

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          userGrid.dataProvider.getAllStateRows().created,
          userGrid.dataProvider.getAllStateRows().updated,
          userGrid.dataProvider.getAllStateRows().deleted,
          userGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          changeRowData.push(userGrid.dataProvider.getJsonRow(row));
        });
        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          userGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/groups/' + getValues('groupCode') + '/users',
            data: changeRowData
          })
            .then(function (response) { })
            .catch(function (err) {
              console.log(err);
            })
            .then(function () {
              userGrid.gridView.hideToast();
              loadUserGrid(getValues('groupCode'));
            });
        }
      }
    });
  }
  function updateGroupInfo() {
    let groupGridFocus = userGroupGrid.gridView.getCurrent();
    if (groupGridFocus.itemIndex != -1) {
      let rowData = userGroupGrid.gridView.getValues(groupGridFocus.itemIndex);
      let createCount = userGrid.dataProvider.getRowStateCount("created");
      let rowCount = userGrid.dataProvider.getRowCount() - createCount;
      setValue('groupCode', rowData.grpCd)
      setValue('groupInfo', rowData.grpNm + "(" + rowData.grpCd + ") : ")
      setValue('userCount', transLangKey("AUTH_USER") + " " + rowCount + " " + transLangKey("PEOPLE"))
    } else {
      setValue('groupCode', '')
      setValue('groupInfo', '')
      setValue('userCount', '')
    }
  }
  function openUserPopup() {
    let index = userGroupGrid.gridView.getSelectedRows()[0]
    if (index !== undefined && userGroupGrid.gridView.getValue(index, 'grpCd') !== null) {
      setDialogOpen(true);
    } else {
      showMessage(transLangKey('WARNING'), transLangKey("MSG_SELECT_GROUP_CODE"));
    }
  }

  function resetConditions() {
    setValue('groupCode', '')
    setValue('groupInfo', '')
    setValue('userCount', '')
  }

  return (
    <>
      <ContentInner>
        <SearchArea>
          <SearchRow>
            <InputField control={control} label={transLangKey("GRP_NM")} name="grpNm" onKeyPress={(e) => { if (e.key === 'Enter') { loadData() } }}></InputField>
          </SearchRow>
        </SearchArea>
        <ResultArea sizes={[50, 50]} direction={"vertical"}>
          <Box className={classes.resultAreaBox}>
            <ButtonArea>
              <LeftButtonArea></LeftButtonArea>
              <RightButtonArea>
                <GridAddRowButton grid="userGroupGrid" onClick={() => { insertGroupGridRow() }}></GridAddRowButton>
                <GridDeleteRowButton grid="userGroupGrid" onClick={() => { deleteGroupGridRow() }}></GridDeleteRowButton>
                <GridSaveButton onClick={() => { saveGroupGridData() }}></GridSaveButton>
              </RightButtonArea>
            </ButtonArea>
            <Box style={{ height: "calc(100% - 53px" }}>
              <BaseGrid id="userGroupGrid" items={userGroupGridItems} className="white-skin"></BaseGrid>
            </Box>
          </Box>
          <Box className={classes.resultAreaBox}>
            <ButtonArea>
              <LeftButtonArea></LeftButtonArea>
              <RightButtonArea>
                <CommonButton title={transLangKey("ADD_USER")} onClick={() => { openUserPopup() }}><Icon.UserPlus /></CommonButton>
                <GridDeleteRowButton grid="userGrid" onBeforeDelete={onBeforeDelete} onDelete={onDelete} onAfterDelete={onAfterDelete}></GridDeleteRowButton>
                <GridSaveButton onClick={() => { saveGroupUser() }}></GridSaveButton>
              </RightButtonArea>
            </ButtonArea>
            <Box style={{ height: "calc(100% - 53px" }}>
              <BaseGrid id="userGrid" items={userGridItems} className="white-skin"></BaseGrid>
            </Box>
          </Box>
        </ResultArea>
        <PopSelectUser groupCode={getValues('groupCode')} open={dialogOpen} onClose={() => setDialogOpen(false)} confirm={insertUserGridRow}></PopSelectUser>
      </ContentInner>
    </>
  );
}

export default UserGroup