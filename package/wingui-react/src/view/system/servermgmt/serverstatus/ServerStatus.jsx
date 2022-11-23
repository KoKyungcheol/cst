import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, ButtonGroup, IconButton, Tooltip } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  BaseGrid, InputField, GridAddRowButton, GridSaveButton, GridDeleteRowButton, useViewStore, useIconStyles,
} from "../../../../imports";
import SyncIcon from '@mui/icons-material/Sync';

let servGridItems = [
  { name: "id", headerText: "SERVER_ID", dataType: "string", width: "100", editable: false, visible: true },
  { name: "host", headerText: "SERVER_IP", dataType: "string", width: "100", editable: false, visible: true },
  { name: "port", headerText: "SERVER_PORT", dataType: "string", width: "100", editable: false, visible: true },
  { name: "connection", headerText: "SERVER_CONN", dataType: "string", width: "100", editable: false, visible: true },
]

function ServerStatus() {
  const [servGrid, setservGrid] = useState(null);
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo])
  const { control, getValues, formState: { errors } } = useForm({
    defaultValues: {
    }
  })
  const globalButtons = [
    { name: "search", action: (e) => { loadData() }, visible: true, disable: false }
  ]

  useEffect(() => {
    setservGrid(getViewInfo(vom.active, 'servGrid'))
  }, [viewData])

  useEffect(() => {
    if (servGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)
      setOption();

      loadData()
    }
  }, [servGrid]);

  function setOption() {
    servGrid.gridView.onCellEdited = function (grid) {
      grid.commit(true);
    }
  }
  function loadData() {
    servGrid.gridView.commit(true);

    servGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'engine/REGISTRY/GetServerStatus')
      .then(function (res) {
        servGrid.dataProvider.fillJsonData(res.data[RESULT_DATA]);
      }).catch(function (err) {
        console.log(err);
      }).then(function () {
        servGrid.gridView.hideToast();
      });
  }

  const readConfiguration = (name, prevOperationCallId, currentOperationCallId) => {
    axios({
      method: 'post',
      url: baseURI() + 'engine/REGISTRY/ReadConfiguration',
      headers: { 'content-type': 'application/json' },
      params: {
        timeout: 0,
        PREV_OPERATION_CALL_ID: prevOperationCallId,
        CURRENT_OPERATION_CALL_ID: currentOperationCallId
      }
    }).then(function (res) {
      if(res.data['RESULT_CODE'] === 'RESULT_CODE_SUCCESS') {
        showMessage(transLangKey('MSG_CONFIRM'), name + ' Configuration Reload Success', { close: false })
      }
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      
    })
  }

  return (
    <ContentInner>
      <ButtonArea>
        <LeftButtonArea>
        <Tooltip title={transLangKey("CFG_RELOAD")} placement='bottom' arrow>
          <Button variant="soft" endIcon={<SyncIcon />} color="success" onClick={() => { readConfiguration('Data server', 'ds_wait_on', 'lg') }}>{'Data Server'}</Button>
        </Tooltip>
        <Tooltip title={transLangKey("CFG_RELOAD")} placement='bottom' arrow>
          <Button title={transLangKey("CFG_RELOAD")}  variant="soft" endIcon={<SyncIcon />} color="success" onClick={() => { readConfiguration('SupplyNet Server', 'sn_wait_on', 'sn_load') }}>{'SupplyNet Server'}</Button>
        </Tooltip>
        </LeftButtonArea>
        <RightButtonArea></RightButtonArea>
      </ButtonArea>
      <ResultArea sizes={[100]} direction={"vertical"}>
        <BaseGrid id="servGrid" items={servGridItems}></BaseGrid>
      </ResultArea>
    </ContentInner>
  )
}

export default ServerStatus;