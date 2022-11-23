import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Box } from '@mui/material';
import { BaseGrid, PopupDialog, useViewStore, zAxios } from "@zionex/imports";

let popupGrid1Items = [
  { name: "LOCAT_MST_ID", dataType: "text", headerText: "LOCAT_MST_ID", visible: false, editable: false, width: "100" },
  { name: "LOCAT_TP_ID", dataType: "text", headerText: "LOCAT_TP_ID", visible: false, editable: false, width: "100" },
  { name: "LOCAT_TP_NM", dataType: "text", headerText: "LOCAT_TP_NM", visible: true, editable: false, width: "80", textAlignment: "center" },
  { name: "LOCAT_LV", dataType: "text", headerText: "LOCAT_LV", visible: true, editable: false, width: "50", textAlignment: "center" },
]

function PopLocatMst(props) {
  const refPopupGrid1 = useRef({});
  const [grid, setGrid] = useState(null);

  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])
  const { handleSubmit, clearErrors } = useForm({
    defaultValues: {
    }
  });

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_PopLocatGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (grid != grdObjPopup)
          setGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    async function initLoad() {
      if (grid) {
        setOptions();
        await popupLoadData();
      }
    }
    initLoad();
  }, [grid]);

  const setOptions = () => {
    // setVisibleProps(grid, true, false, false);
    grid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
    });

    grid.gridView.displayOptions.selectionStyle = "singleRow";

    //dobule click 시 선택
    grid.gridView.onCellDblClicked = function (grid, clickData) {
      saveSubmit();
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

  const popupLoadData = () => {
    grid.gridView.showToast(progressSpinner + 'Load Data...', true);

    zAxios({
      method: 'post',
      header: { 'content-type': 'application/json' },
      url: 'engine/T3SeriesSupplyNetServer/SRV_GET_LOCAT_MST_GRID_LIST',
      params: {
      }
    })
      .then(function (res) {
        grid.dataProvider.fillJsonData(res.data.RESULT_DATA);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        grid.gridView.hideToast();
      });
  }

  // popup 확인
  const saveSubmit = () => {

    let focusCell = grid.gridView.getCurrent();
    let targetRow = focusCell.dataRow;
    props.confirm(grid.dataProvider.getJsonRow(targetRow));
    props.onClose(false);
  }

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="POP_UI_CM_02_06" resizeHeight={500} resizeWidth={450}>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_PopLocatGrid`} items={popupGrid1Items} ref={refPopupGrid1}></BaseGrid>
      </Box>
    </PopupDialog>
  );
}

PopLocatMst.displayName = 'PopLocatMst'

export default PopLocatMst;