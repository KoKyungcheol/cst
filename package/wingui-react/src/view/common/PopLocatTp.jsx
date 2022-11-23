import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Box } from '@mui/material';
import { BaseGrid, PopupDialog, useViewStore, zAxios } from "@zionex/imports";

const popupGrid1Items = [
  { name: "LOCAT_MST_ID", dataType: "text", headerText: "LOCAT_MST_ID", visible: false, editable: false, width: "100" },
  { name: "LOCAT_ID", dataType: "text", headerText: "LOCAT_ID", visible: false, editable: false, width: "100" },
  { name: "LOCAT_TP_ID", dataType: "text", headerText: "LOCAT_TP_ID", visible: false, editable: false, width: "100" },
  { name: "LOCAT_MGMT_ID", dataType: "text", headerText: "LOCAT_MGMT_ID", visible: false, editable: false, width: "150", textAlignment: "center" },
  { name: "LOCAT_TP_NM", dataType: "text", headerText: "LOCAT_TP_NM", visible: true, editable: false, width: "80", textAlignment: "center" },
  { name: "LOCAT_LV", dataType: "text", headerText: "LOCAT_LV", visible: true, editable: false, width: "50", textAlignment: "center" },
  { name: "LOCAT_CD", dataType: "text", headerText: "LOCAT_CD", visible: true, editable: false, width: "60", textAlignment: "center" },
  { name: "LOCAT_NM", dataType: "text", headerText: "LOCAT_NM", visible: true, editable: false, width: "150", textAlignment: "center" },
]

function PopLocatTp(props) {
  const [grid, setGrid] = useState(null);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])
  const { handleSubmit, clearErrors } = useForm({
    defaultValues: {
    }
  })
  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_LocatGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (grid != grdObjPopup) {
          setGrid(grdObjPopup);
        }
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
    setVisibleProps(grid, true, false, false);
    grid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
    });

    grid.gridView.displayOptions.selectionStyle = "singleRow";

    //dobule click 시 선택
    grid.gridView.onCellDblClicked = function (grid, clickData) {
      saveSubmit();
    };

    grid.gridView.setCheckBar({
      exclusive: true
    });

    grid.gridView.onDataLoadComplated = function () {
      grid.gridView.setFocus();
    }
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

  const popupLoadData = async () => {
    grid.gridView.showToast(progressSpinner + 'Load Data...', true);

    zAxios({
      method: 'post',
      header: { 'content-type': 'application/json' },
      url: 'engine/T3SeriesSupplyNetServer/SRV_GET_LOCAT_GRID_LIST',
      params: {
        'timeout': 0,
        'PREV_OPERATION_CALL_ID': 'OPC_SRH_CPT_LOCAT_TP_05_CLICK',
        'CURRENT_OPERATION_CALL_ID': 'OPC_SRH_CPT_LOCAT_TP_05_CLICK_SUCCESS_01',
      },
      fromPopup: true
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
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="POP_UI_CM_02_06" resizeHeight={600} resizeWidth={600}>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_LocatGrid`} items={popupGrid1Items}></BaseGrid>
      </Box>
    </PopupDialog>
  );
}

PopLocatTp.displayName = 'PopLocatTp'

export default PopLocatTp;