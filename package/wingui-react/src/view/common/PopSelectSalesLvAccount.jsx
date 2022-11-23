import React, { useState, useEffect, useContext, useRef } from "react";
import { Box, ButtonGroup } from '@mui/material';
import { useForm } from "react-hook-form";
import PropTypes from 'prop-types';
import {
  ContentInner, 
  ViewPath, 
  ResultArea, 
  SearchArea, 
  StatusArea, 
  ButtonArea, 
  LeftButtonArea, 
  RightButtonArea, 
  SearchRow,
  InputField,
  CommonButton,
  GridAddRowButton, 
  GridDeleteRowButton, 
  GridSaveButton,
  BaseGrid,
  PopupDialog,
  GridCnt, 
  useViewStore, 
  useStyles,
  zAxios,
} from '@zionex/imports';

let popupGrid1Items = [
  { name: "ID", dataType: "text", headerText: "ID", visible: false, editable: false, width: "200" },
  { name: "ACCOUNT_CD", dataType: "text", headerText: "ACCOUNT_CD", visible: true, editable: false, width: "100", textAlignment: "center" },
  { name: "ACCOUNT_NM", dataType: "text", headerText: "ACCOUNT_NM", visible: true, editable: false, width: "100", textAlignment: "center" },
]

function PopSelectSalesLvAccount(props) {

  // const refPopupGrid1 = useRef({});
  const [accountSelectGrid, setAccountSelectGrid] = useState(null);

  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])
  const { handleSubmit, getValues, setValue, control, formState: { errors }, clearErrors } = useForm({
    defaultValues: {
      accountCd: "",
      accountNm: "",
    }
  });

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_PopSelectSalesLvAccountGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (accountSelectGrid != grdObjPopup)
          setAccountSelectGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    if (accountSelectGrid) {
      popupLoadData(getValues());
      setOptions();
    }
  }, [accountSelectGrid]);

  const setOptions = () => {
    accountSelectGrid.dataProvider.setOptions({ restoreMode: "auto" });
    accountSelectGrid.gridView.setFooters({ visible: false });
    accountSelectGrid.gridView.setStateBar({ visible: false });
    accountSelectGrid.gridView.setEditOptions({ insertable: false, appendable: false });
    accountSelectGrid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
    });
    accountSelectGrid.gridView.setCheckBar({ exclusive: props.multiple });

    //dobule click 시 선택
    accountSelectGrid.gridView.onCellDblClicked = function (grid, clickData) {
      let focusCell = accountSelectGrid.gridView.getCurrent();
      let targetRow = focusCell.dataRow;
      props.confirm([accountSelectGrid.dataProvider.getJsonRow(targetRow)]);
      props.onClose(false);
    };
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

  const popupLoadData = (data) => {
    let param = new URLSearchParams();
    param.append('LV_MGMT_ID', props.values);
    zAxios({
      method: 'post',
      header: { 'content-type': 'application/json' },
      url: 'engine/T3SeriesDataServer/SRV_GET_UI_BF_00_POPUP_ACCT_Q1',
      data: param
    })
      .then(function (res) {
        let resultData = res.data.RESULT_DATA;
        if(resultData  && resultData.length  == 0) {
          showMessage(transLangKey('WARNING'), transLangKey('MSG_NO_DATA'), { close: false })
        }
        accountSelectGrid.dataProvider.fillJsonData(res.data.RESULT_DATA);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
  // popup 확인
  const saveSubmit = () => {
    let checkedRows = [];

    accountSelectGrid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(accountSelectGrid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  }

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="ACCOUNT_POP" resizeHeight={470} resizeWidth={400}>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_PopSelectSalesLvAccountGrid`} items={popupGrid1Items} ></BaseGrid>
      </Box>
    </PopupDialog>
  );
}

PopSelectSalesLvAccount.propTypes = {
  accountCd: PropTypes.string,
  accountNm: PropTypes.string,
};

PopSelectSalesLvAccount.displayName = 'PopSelectSalesLvAccount'

export default PopSelectSalesLvAccount;