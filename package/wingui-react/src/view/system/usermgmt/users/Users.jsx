import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Menu, MenuItem } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  InputField, BaseGrid, CommonButton, GridAddRowButton, GridDeleteRowButton, GridSaveButton, useViewStore
} from "@zionex/imports";

let baseGridItems = [
  { name: "username", dataType: "text", headerText: "USER_ID", editable: true, validRules: [{ criteria: "required" }] },
  { name: "displayName", dataType: "text", headerText: "USER_NM", editable: true, validRules: [{ criteria: "required" }] },
  { name: "uniqueValue", dataType: "text", headerText: "UNIQUE_VALUE", editable: true },
  { name: "department", dataType: "text", headerText: "DEPARTMENT", editable: true },
  { name: "businessValue", dataType: "text", headerText: "BUSINESS", editable: true },
  { name: "email", dataType: "text", headerText: "EMAIL", editable: true },
  { name: "phone", dataType: "text", headerText: "PHONE", editable: true },
  { name: "etc", dataType: "text", headerText: "ETC", editable: true },
  { name: "adminYn", dataType: "boolean", headerText: "ADMIN_YN", editable: true, defaultValue: false, width: 50 },
  { name: "enabled", dataType: "boolean", headerText: "ACTV_YN", editable: false, defaultValue: true, width: 50 },
  { name: "loginFailCount", dataType: "number", headerText: "LOGIN_FAIL_COUNT", editable: false, width: 60, numberFormat: '#,###' }
];

function Users() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const [userGrid, setUserGrid] = useState(null);
  const { control, getValues, setValue } = useForm({
    defaultValues: {
    }
  });
  const globalButtons = [
    { name: "search", action: (e) => { loadData() }, visible: true, disable: false }
  ]
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    if (userGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)
      setOptions()
    }
  }, [userGrid])
  useEffect(() => {
    setUserGrid(getViewInfo(vom.active, 'userGrid'))
  }, [viewData])
  useEffect(() => {
    if (location.state !== undefined && location.state !== null && userGrid !== null) {
      setValue('username', location.state.username)
      loadData();
    }
  }, [location, userGrid])
  const onBeforeDelete = (targetGrid) => {
    targetGrid.gridView.commit(true);
    if (targetGrid.gridView.getCheckedRows().length === targetGrid.dataProvider.getRowCount()) {
      //MSG_DELETE_VALID:  최소 하나 이상의 {{val}}는 존재해야 합니다.
      let val = transLangKey('USER')
      showMessage(transLangKey('DELETE'), transLangKey('MSG_DELETE_VALID', { val }), { close: false })
      return false;
    }

    return true;
  }
  function setOptions() {
    userGrid.gridView.setCheckBar({ visible: true });
  }
  const onDelete = (targetGrid, deleteRows) => {
    if (deleteRows.length > 0) {
      return axios({
        method: 'post',
        url: baseURI() + 'system/users',
        headers: { 'content-type': 'application/json' },
        data: deleteRows
      })
    }
  }

  const onAfterDelete = (targetGrid) => {
    if (targetGrid.gridId === 'userGrid') {
      loadData();
    }
  }
  function refresh() {

  }
  function saveData() {
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

          changeRowData.forEach(function (value) {
            if (value.expiredDttm && value.expiredDttm instanceof Date) {
              value.expiredDttm = value.expiredDttm.format("yyyy-MM-ddTHH:mm:ss");
            }
          });
          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/users',
            data: changeRowData
          }).then(function (response) {
          }).catch(function (err) {
            console.log(err);
          }).then(function () {
            userGrid.gridView.hideToast();
            loadData();
          });
        }
      }
    });
  }
  function loadData() {
    let name = ''
    if (location.state !== undefined && location.state !== null) {
      name = location.state.username
    } else {
      name = getValues('username')
    }
    userGrid.gridView.commit(true);

    userGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/users', {
      params: {
        'username': name,
        'display-name': getValues('displayName'),
        'unique-value': getValues('uniqueValue'),
        'include-admin': true
      }
    }).then(function (res) {
      userGrid.dataProvider.fillJsonData(res.data);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      userGrid.gridView.hideToast();
    });
  }
  function resetPassword() {
    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('PW_MSG_0001'), function (answer) {
      if (answer) {
        let resetRows = [];
        userGrid.gridView.getCheckedRows().forEach(function (indx) {
          if (!userGrid.dataProvider.getAllStateRows().created.includes(indx)) {
            resetRows.push(userGrid.dataProvider.getJsonRow(indx));
          }
        });

        axios({
          method: 'post',
          headers: { 'content-type': 'application/json' },
          url: baseURI() + 'system/users/password-reset',
          data: resetRows
        }).then(function (response) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('PW_SUCCESS_MSG_0002'));
        }).catch(function (err) {
          console.log(err);
        }).then(function () {
          loadData();
        });
      }
    })
  }
  function unlock() {
    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_UNLOCK_USER'), function (answer) {
      if (answer) {
        let checkedRows = [];
        userGrid.gridView.getCheckedRows().forEach(function (indx) {
          if (!userGrid.dataProvider.getAllStateRows().created.includes(indx)) {
            checkedRows.push(userGrid.dataProvider.getJsonRow(indx));
          }
        });

        axios({
          method: 'post',
          headers: { 'content-type': 'application/json' },
          url: baseURI() + 'system/users/login-unlock',
          data: checkedRows
        }).then(function (response) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SUCCESS_UNLOCK_USER'));
        }).catch(function (err) {
          console.log(err);
        }).then(function () {
          loadData();
        });
      }
    })
  }
  function exportExcel() {
    let options = {}
    exportGridtoExcel(userGrid.gridView, options)
  }
  const onSubmit = () => {
    loadData();
  };
  const onError = (errors, e) => {
    if (typeof errors !== "undefined" && Object.keys(errors).length > 0) {
      $.each(errors, function (key, value) {
        showMessage(transLangKey('WARNING'), `[${value.ref.name}] ${value.message}`);
        clearErrors();
        return false;
      });
    }
  }
  const afterToLoad = (targetGrid) => {
    if (targetGrid.gridView.id === 'userGrid') {
      loadData();
    }
  }
  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField control={control} label={transLangKey("USER_ID")} name="username" rules={{}} onKeyPress={(e) => { if (e.key === 'Enter') { onSubmit() } }}></InputField>
          <InputField control={control} label={transLangKey("USER_NM")} name="displayName" onKeyPress={(e) => { if (e.key === 'Enter') { onSubmit() } }}></InputField>
          <InputField control={control} label={transLangKey("UNIQUE_VALUE")} name="uniqueValue" onKeyPress={(e) => { if (e.key === 'Enter') { onSubmit() } }}></InputField>
        </SearchRow>
      </SearchArea>
      <ButtonArea>
        <LeftButtonArea />
        <RightButtonArea>
          <GridAddRowButton grid="userGrid"></GridAddRowButton>
          <GridDeleteRowButton grid="userGrid" onBeforeDelete={onBeforeDelete} onDelete={onDelete} onAfterDelete={onAfterDelete}></GridDeleteRowButton>
          <GridSaveButton grid="userGrid" url="system/users" onAfterSave={afterToLoad} />
          <CommonButton title={transLangKey("FP_MORE_VERTICAL")} onClick={handleClick}><Icon.MoreVertical /></CommonButton>
          <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={resetPassword}>{transLangKey("RESET_PASSWORD")}</MenuItem>
            <MenuItem onClick={unlock}>{transLangKey("LOGIN_UNLOCK")}</MenuItem>
          </Menu>
        </RightButtonArea>
      </ButtonArea>
      <ResultArea sizes={[100]} direction={"vertical"}>
        <BaseGrid id="userGrid" items={baseGridItems}></BaseGrid>
      </ResultArea>
    </ContentInner>
  );
}

export default Users
