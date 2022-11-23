import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Box, IconButton } from "@mui/material";
import {
  InputField, useViewStore, useIconStyles, PopupDialog, SearchArea, SearchRow, BaseGrid
} from '../../../../imports';
import "./usergroup.css"

const popupGrid1Items = [
  { name: "id", dataType: "text", headerText: "ID", visible: false, editable: false, width: 100 },
  { name: "username", dataType: "text", headerText: "USER_ID", editable: false, width: 100 },
  { name: "displayName", dataType: "text", headerText: "USER_NM", editable: false, width: 100 },
  { name: "department", dataType: "text", headerText: "DEPARTMENT", editable: false, width: 100 },
  { name: "businessValue", dataType: "text", headerText: "BUSINESS", editable: false, width: 100 },
];

function PopSelectUser(props) {
  const iconClasses = useIconStyles()
  const [userSelectGrid, setUserSelectGrid] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])
  const { handleSubmit, getValues, control, formState: { errors }, clearErrors } = useForm({
    defaultValues: {
      groupName: "",
      username: "",
    }
  });

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, 'userSelectGrid');
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (userSelectGrid != grdObjPopup)
          setUserSelectGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    if (userSelectGrid) {
      popupLoadData();
      settingOption();
    }
  }, [userSelectGrid]);

  const settingOption = () => {
    userSelectGrid.gridView.setCheckBar({ visible: true })
  }
  const onError = (errors, e) => {
    if (typeof errors !== "undefined" && Object.keys(errors).length > 0) {
      $.each(errors, function (key, value) {
        showMessage(transLangKey('WARNING'), `[${value.ref.name}] ${value.message}`);
        clearErrors();
        return false;
      });
    }
  }

  const popupLoadData = () => {
    userSelectGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/users/' + props.groupCode + '/except', {
      params: {
        'username': getValues("username"),
        'display-name': getValues("displayName"),
      }
    })
      .then(function (res) {
        userSelectGrid.dataProvider.fillJsonData(res.data);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        userSelectGrid.gridView.hideToast();
      });
  }
  // popup 확인
  const saveSubmit = () => {
    let checkedRows = [];

    userSelectGrid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(userSelectGrid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  }

  // popup 조회 클릭시 조회
  const onPopupSubmit = (data) => {
    popupLoadData();
  }

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title={transLangKey("ADD_USER")} resizeHeight={400} resizeWidth={770}>
      <Box>
        <InputField name="username" label={transLangKey("USER_ID")} readonly={false} disabled={false} control={control} />
        <InputField name="displayName" label={transLangKey("USER_NM")} control={control} readonly={false} />
        <IconButton className={iconClasses.iconButton} onClick={handleSubmit(onPopupSubmit, onError)}><Icon.Search /></IconButton>
      </Box>
      <Box style={{ height: "100%" }}>
        <BaseGrid id="userSelectGrid" items={popupGrid1Items}></BaseGrid>
      </Box>
    </PopupDialog>
  );
}
export default PopSelectUser;