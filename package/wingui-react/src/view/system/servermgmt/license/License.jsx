import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, Button, Tooltip } from "@mui/material";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import {
  ContentInner, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, CommonButton,
  BaseGrid, useViewStore
} from "../../../../imports";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

let servGridItems = [
  { name: "SERVER_ID", headerText: "SERVER_ID", dataType: "string", width: "150", editable: false, visible: true },
  { name: "STATUS", headerText: "STATUS", dataType: "string", width: "100", editable: false, visible: true },
  { name: "EXPIRE_DATE", headerText: "EXPIRE_DATE", dataType: "string", width: "100", editable: false, visible: true },
  { name: "MESSAGE", headerText: "MSG", dataType: "string", width: "500", editable: false, visible: true },
]

let possessionItems = [
  { name: "SERVER_ID", headerText: "SERVER_ID", dataType: "string", width: "150", editable: false, visible: true },
  { name: "VERSION", headerText: "VERSION", dataType: "string", width: "80", editable: false, visible: true },
  { name: "PRODUCT", headerText: "PRODUCT", dataType: "string", width: "100", editable: false, visible: true },
  { name: "HWADDR", headerText: "HARDWARE_ADDRESS", dataType: "string", width: "150", editable: false, visible: true },
  { name: "EXPIRE_DATE", headerText: "EXPIRE_DATE", dataType: "string", width: "80", editable: false, visible: true },
  { name: "INSTANCE_COUNT", headerText: "INSTANCE_COUNT", dataType: "string", width: "120", editable: false, visible: true },
  { name: "DIR", headerText: "DIR", dataType: "string", width: "400", editable: false, visible: true },
]

function License() {
  const [servGrid, setservGrid] = useState(null);
  const [servDetailGrid, setservDetailGrid] = useState(null);
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo])
  const { control, getValues, formState: { errors } } = useForm({
    defaultValues: {
    }
  })
  const globalButtons = [
    { name: "search", action: (e) => { getLicenseResult() }, visible: true, disable: false }
  ]

  useEffect(() => {
    setservGrid(getViewInfo(vom.active, 'servGrid'))
    setservDetailGrid(getViewInfo(vom.active, 'servDetailGrid'))
  }, [viewData])

  useEffect(() => {
    if (servGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)
      setOption();

      getLicenseResult()
      getLicensePossession()
    }
  }, [servGrid]);

  function setOption() {
    servGrid.gridView.onCellEdited = function (grid) {
      grid.commit(true);
    }
  }
  function getLicenseResult() {
    servGrid.gridView.commit(true);

    servGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios({
      method: 'post',
      url: baseURI() + 'engine/LicenseServer/GetLicenseResultInfo',
      headers: { 'content-type': 'application/json' },
      params: {
        timeout: 0,
        PREV_OPERATION_CALL_ID: 'validate_wait_on',
        CURRENT_OPERATION_CALL_ID: 'loadNorthGrid'
      }
    }).then(function (res) {
      servGrid.dataProvider.fillJsonData(res.data[RESULT_DATA]);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      servGrid.gridView.hideToast();
    })
  }
  function getLicensePossession() {
    servDetailGrid.gridView.commit(true);

    servDetailGrid.gridView.showToast(progressSpinner + 'Load Data...', true);
    axios({
      method: 'post',
      url: baseURI() + 'engine/LicenseServer/GetLicensePossessionInfo',
      headers: { 'content-type': 'application/json' },
      params: {
        timeout: 0,
        PREV_OPERATION_CALL_ID: 'loadNorthGrid',
        PREV_OPERATION_RESULT_CODE: 'RESULT_CODE_SUCCESS',
        PREV_OPERATION_RESULT_MESSAGE: 'SUCCESS',
        PREV_OPERATION_RESULT_SUCCESS: true,
        CURRENT_OPERATION_CALL_ID: 'reloadCenterGrid'
      }
    }).then(function (res) {
      servDetailGrid.dataProvider.fillJsonData(res.data[RESULT_DATA]);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      servDetailGrid.gridView.hideToast();
    })
  }
  function getServerLicenseInfo() {
    axios({
      method: 'post',
      url: baseURI() + 'engine/LicenseServer/GetServerLicenseInfo',
      headers: { 'content-type': 'application/json' },
      params: {
        timeout: 0,
        CURRENT_OPERATION_CALL_ID: 'LoadTextArea'
      }
    }).then(function (res) {
      setLicenseInfo(res.data[RESULT_DATA]['SERVER_LICENSE_INFO'])
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
    })
  }
  return (
    <ContentInner>
      <ResultArea sizes={[30, 30, 40]} direction={"vertical"}>
        <Box >
          <ButtonArea title={transLangKey('LICENSE_CONFIRMATION_INFO')} >
            <LeftButtonArea></LeftButtonArea>
            <RightButtonArea></RightButtonArea>
          </ButtonArea>
          <Box style={{ height: "calc(100% - 53px" }}>
            <BaseGrid title={transLangKey('LICENSE_CONFIRMATION_INFO')} id="servGrid" items={servGridItems}></BaseGrid>
          </Box>
        </Box>
        <Box >
          <ButtonArea title={transLangKey('LICENSE_POSSESSION_INFO')} >
            <LeftButtonArea></LeftButtonArea>
            <RightButtonArea>
              <CommonButton title={transLangKey('LICENSE_POSSESSION_INFO')} onClick={() => { getLicensePossession() }} ><Icon.Search /></CommonButton>
            </RightButtonArea>
          </ButtonArea>
          <Box style={{ height: "calc(100% - 53px" }}>
            <BaseGrid id="servDetailGrid" items={possessionItems}></BaseGrid>
          </Box>
        </Box>
        <Box >
          <ButtonArea title={transLangKey('LICENSE_KEY_INFO')}>
            <LeftButtonArea></LeftButtonArea>
            <RightButtonArea>
              <Tooltip title={transLangKey("CFG_RELOAD")} placement='bottom' arrow>
                <Button title={transLangKey("LICENSE_KEY_CREATION")} variant="outlined" endIcon={<ArrowCircleDownIcon />} color="success" onClick={() => { getServerLicenseInfo() }}>{transLangKey('LICENSE_KEY_CREATION')}</Button>
              </Tooltip>
            </RightButtonArea>
          </ButtonArea>
          <TextareaAutosize aria-label="minimum height" style={{ width: '100%', height: 280, overflow: 'auto' }} value={licenseInfo} />
        </Box>
      </ResultArea>
    </ContentInner>
  )
}

export default License;