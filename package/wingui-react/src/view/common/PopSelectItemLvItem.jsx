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
  { name: "ITEM_CD", dataType: "text", headerText: "ITEM_CD", visible: true, editable: false, width: "90", textAlignment: "center" },
  { name: "ITEM_NM", dataType: "text", headerText: "ITEM_NM", visible: true, editable: false, width: "160", textAlignment: "center" },
]

function PopSelectItemLvItem(props) {

  // const refPopupGrid1 = useRef({});
  const [itemSelectGrid, setItemSelectGrid] = useState(null);

  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])
  const { handleSubmit, getValues, setValue, control, formState: { errors }, clearErrors } = useForm({
    defaultValues: {
      itemCd: "",
      itemNm: "",
    }
  });

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_PopSelectItemLvItemGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (itemSelectGrid != grdObjPopup)
          setItemSelectGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    if (itemSelectGrid) {
      popupLoadData(getValues());
      setOptions();
    }
  }, [itemSelectGrid]);

  const setOptions = () => {
    itemSelectGrid.dataProvider.setOptions({ restoreMode: "auto" });
    itemSelectGrid.gridView.setFooters({ visible: false });
    itemSelectGrid.gridView.setStateBar({ visible: false });
    itemSelectGrid.gridView.setEditOptions({ insertable: false, appendable: false });
    itemSelectGrid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
    });
    itemSelectGrid.gridView.setCheckBar({ exclusive: props.multiple });
    //dobule click 시 선택
    itemSelectGrid.gridView.onCellDblClicked = function (grid, clickData) {
      let focusCell = itemSelectGrid.gridView.getCurrent();
      let targetRow = focusCell.dataRow;
      props.confirm([itemSelectGrid.dataProvider.getJsonRow(targetRow)]);
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
      url: 'engine/T3SeriesDataServer/SRV_GET_UI_BF_00_POPUP_ITEM_Q1',
      data: param
    })
      .then(function (res) {
        let resultData = res.data.RESULT_DATA;
        if(resultData  && resultData.length  == 0) {
          showMessage(transLangKey('WARNING'), transLangKey('MSG_NO_DATA'), { close: false })
        }
        itemSelectGrid.dataProvider.fillJsonData(res.data.RESULT_DATA);
      })
      .catch(function (err) {
        console.log(err);
      });
  }
  // popup 확인
  const saveSubmit = () => {
    let checkedRows = [];

    itemSelectGrid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(itemSelectGrid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  }

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="ITEM_POP" resizeHeight={470} resizeWidth={400}>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_PopSelectItemLvItemGrid`} items={popupGrid1Items} ></BaseGrid> 
      </Box>
    </PopupDialog>
  );
}

PopSelectItemLvItem.propTypes = {
  itemCd: PropTypes.string,
  itemNm: PropTypes.string,
};

PopSelectItemLvItem.displayName = 'PopSelectItemLvItem'

export default PopSelectItemLvItem;