import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, IconButton } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, SearchRow,
  InputField, BaseGrid, useStyles, useIconStyles, useViewStore, PageNavigator
} from "../../../../imports";

let historyGridItems = [
  { name: "username", dataType: "text", headerText: "USER_ID", visible: false, editable: false },
  { name: "displayName", dataType: "text", headerText: "USER_NM", visible: true, editable: false },
  { name: "accessIp", dataType: "text", headerText: "USER_IP", visible: true, editable: false },
  { name: "accessDttm", dataType: "datetime", datetimeFormat: "iso", headerText: "LOGIN_DTTM", visible: true, editable: false },
  { name: "logoutDttm", dataType: "datetime", datetimeFormat: "iso", headerText: "LOGOUT_DTTM", visible: true, editable: false }
];

function LoginHistory() {
  const iconClasses = useIconStyles();
  const classes = useStyles();
  const [historyGrid, setHistoryGrid] = useState(null);
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const { control, getValues, setValue } = useForm({
    defaultValues: {
      displayName: '',
      accessDttmFrom: (new Date()).format('yyyy-MM-dd 00:00:00'),
      accessDttmTo: (new Date()).format('yyyy-MM-dd HH:mm:ss')
    }
  });
  const globalButtons = [
    {
      name: "search",
      action: (e) => { loadData(1, settings.perPageSize) },
      visible: true,
      disable: false
    }
  ]
  const [settings, setSettings] = useState({
    currentPage: 0,
    totalPages: 0,
    perPageSize: 500,
    comboboxUse: true,
    dataSourceArray: [500, 1000, 2000, 5000, 10000]
  });
  

  useEffect(() => {
    setHistoryGrid(getViewInfo(vom.active, 'historyGrid'))
  }, [viewData])
  useEffect(() => {
    if (historyGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)
      
      setOptions()
    }
  }, [historyGrid])

  function loadData(page, size) {
    axios.get(baseURI() + 'system/logs/system-access', {
      params: {
        'display-name': getValues('displayName'),
        'accessdttm-from': (new Date(getValues('accessDttmFrom'))).format('yyyy-MM-ddTHH:mm:ss'),
        'accessdttm-to': (new Date(getValues('accessDttmTo'))).format('yyyy-MM-ddTHH:mm:ss'),
        'page': page - 1,
        'size': size
      }
    })
      .then(function (res) {
        if (res.status === gHttpStatus.SUCCESS) {
          historyGrid.dataProvider.fillJsonData(res.data.content);
          setSettings({
            currentPage: parseInt(res.data.number) + 1,
            totalPages: parseInt(res.data.totalPages),
            perPageSize: parseInt(res.data.size),
            comboboxUse: settings.comboboxUse,
            dataSourceArray: settings.dataSourceArray
          });
        } else if (res.status === gHttpStatus.NO_CONTENT) {
          historyGrid.dataProvider.clearRows();
          setSettings({
            currentPage: 0,
            totalPages: 0,
            perPageSize: settings.perPageSize,
            comboboxUse: settings.comboboxUse,
            dataSourceArray: settings.dataSourceArray
          });
        }
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
      });
  }
  function setOptions() {
  }
  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField control={control} label={transLangKey("USER_NM")} name="displayName"></InputField>
          <InputField control={control} type="datetime" dateformat="yyyy-MM-dd HH:mm:ss" name="accessDttmFrom" style={{ width: '220px' }} label={transLangKey("LOGIN_DTTM")}></InputField>
          <InputField control={control} type="datetime" dateformat="yyyy-MM-dd HH:mm:ss" name="accessDttmTo" style={{ width: '220px' }} label={transLangKey("LOGOUT_DTTM")} />
        </SearchRow>
      </SearchArea>
      <ResultArea sizes={[100]} direction={"vertical"}>
        <BaseGrid id="historyGrid" items={historyGridItems} className="white-skin"></BaseGrid>
      </ResultArea>
      <PageNavigator onClick={loadData} settings={settings} />
    </ContentInner>
  );
}

export default LoginHistory