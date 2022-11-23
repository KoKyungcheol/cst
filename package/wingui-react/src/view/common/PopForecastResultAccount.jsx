import React, { useState, useEffect, useContext ,useRef} from "react";
import PropTypes from 'prop-types';
import PopupDialog from "@zionex/component/PopupDialog";
import { useForm } from "react-hook-form";
import { Grid, Box, ButtonGroup, Button, Paper, IconButton } from '@mui/material';
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
  SplitPanel,
  InputField,
  GridAddRowButton,
  GridDelRowButton,
  CommonBtn,
  BaseGrid, 
  GridCnt,
  useViewStore,
  useStyles,
  zAxios
 } from '@zionex/imports';
import { showMessage } from "@zionex";

//품목 조회
function PopForecastResultAccount(props) {

  const [popupGrid1Items, setPopupGrid1Items] = useState ([

  {name:"ATTR_01",dataType:"text",headerText:"ATTR_01",visible:false,editable:false,width:"150"},
  {name:"ATTR_02",dataType:"text",headerText:"ATTR_02",visible:false,editable:false,width:"150"},
  {name:"ATTR_03",dataType:"text",headerText:"ATTR_03",visible:false,editable:false,width:"150"},
  {name:"ATTR_04",dataType:"text",headerText:"ATTR_04",visible:false,editable:false,width:"150"},
  {name:"ATTR_05",dataType:"text",headerText:"ATTR_05",visible:false,editable:false,width:"150"},
  {name:"ATTR_06",dataType:"text",headerText:"ATTR_06",visible:false,editable:false,width:"150"},
  {name:"ATTR_07",dataType:"text",headerText:"ATTR_07",visible:false,editable:false,width:"150"},
  {name:"ATTR_08",dataType:"text",headerText:"ATTR_08",visible:false,editable:false,width:"150"},
  {name:"ATTR_09",dataType:"text",headerText:"ATTR_09",visible:false,editable:false,width:"150"},
  {name:"ATTR_10",dataType:"text",headerText:"ATTR_10",visible:false,editable:false,width:"150"},
  {name:"ATTR_11",dataType:"text",headerText:"ATTR_11",visible:false,editable:false,width:"150"},
  {name:"ATTR_12",dataType:"text",headerText:"ATTR_12",visible:false,editable:false,width:"150"},
  {name:"ATTR_13",dataType:"text",headerText:"ATTR_13",visible:false,editable:false,width:"150"},
  {name:"ATTR_14",dataType:"text",headerText:"ATTR_14",visible:false,editable:false,width:"150"},
  {name:"ATTR_15",dataType:"text",headerText:"ATTR_15",visible:false,editable:false,width:"150"},
  {name:"ATTR_16",dataType:"text",headerText:"ATTR_16",visible:false,editable:false,width:"150"},
  {name:"ATTR_17",dataType:"text",headerText:"ATTR_17",visible:false,editable:false,width:"150"},
  {name:"ATTR_18",dataType:"text",headerText:"ATTR_18",visible:false,editable:false,width:"150"},
  {name:"ATTR_19",dataType:"text",headerText:"ATTR_19",visible:false,editable:false,width:"150"},
  {name:"ATTR_20",dataType:"text",headerText:"ATTR_20",visible:false,editable:false,width:"150"},
  
  //거래처 코드
  {name:"ACCOUNT_CD",dataType:"text",headerText:"ACCOUNT_CD",visible:true,editable:false,width:"120",textAlignment: "center"},
  //거래처 명  
  {name:"ACCOUNT_NM",dataType:"text",headerText:"ACCOUNT_NM",visible:true,editable:false,width:"120",textAlignment: "center"},
  {name:"ACTV_YN",dataType:"text",headerText:"ACTV_YN",visible:false,editable:false,width:"120"},
  
  {name:"PARENT_SALES_LV_CD",dataType:"text",headerText:"PARENT_SALES_LV_CD",visible:false,editable:false,width:"120"},
  {name:"PARENT_SALES_LV_ID",dataType:"text",headerText:"PARENT_SALES_LV_ID",visible:false,editable:false,width:"120"},
  //Parent Sales Level
  {name:"PARENT_SALES_LV_NM",dataType:"text",headerText:"PARENT_SALES_LV_NM",visible:true,editable:false,width:"120",textAlignment: "center"},
  //통화
  {name:"CURCY_CD",dataType:"text",headerText:"CURCY_CD",visible:true,editable:false,width:"120",textAlignment: "center"},
  {name:"CURCY_CD_ID",dataType:"text",headerText:"CURCY_CD_ID",visible:false,editable:false,width:"120",textAlignment: "center"},
  {name:"COUNTRY_ID",dataType:"text",headerText:"COUNTRY_ID",visible:false,editable:false,width:"120",textAlignment: "center"},
  //국가 ID
  {name:"COUNTRY_NM",dataType:"text",headerText:"COUNTRY_NM",visible:true,editable:false,width:"120",textAlignment: "center"},
  //채널 Id
  {name:"CHANNEL_ID",dataType:"text",headerText:"CHANNEL_ID",visible:true,editable:false,width:"120",textAlignment: "center"},
  {name:"CHANNEL_NM",dataType:"text",headerText:"CHANNEL_NM",visible:false,editable:false,width:"120"},
  {name:"SOLD_TO_CD",dataType:"text",headerText:"SOLD_TO_CD",visible:false,editable:false,width:"120"},
  {name:"SOLD_TO_ID",dataType:"text",headerText:"SOLD_TO_ID",visible:false,editable:false,width:"120"},
  //Sold to 명
  {name:"SOLD_TO_NM",dataType:"text",headerText:"SOLD_TO_NM",visible:true,editable:false,width:"120",textAlignment: "center"},
  {name:"SHIP_TO_CD",dataType:"text",headerText:"SHIP_TO_CD",visible:false,editable:false,width:"120"},
  {name:"SHIP_TO_ID",dataType:"text",headerText:"SHIP_TO_ID",visible:false,editable:false,width:"120"},
  //Ship to 명
  {name:"SHIP_TO_NM",dataType:"text",headerText:"SHIP_TO_NM",visible:true,editable:false,width:"120",textAlignment: "center"},
  {name:"BILL_TO_CD",dataType:"text",headerText:"BILL_TO_CD",visible:false,editable:false,width:"120"},
  {name:"BILL_TO_ID",dataType:"text",headerText:"BILL_TO_ID",visible:false,editable:false,width:"120"},
  //Bill to 명
  {name:"BILL_TO_NM",dataType:"text",headerText:"BILL_TO_NM",visible:true,editable:false,width:"120",textAlignment: "center"},
  {name:"CREATE_BY",dataType:"text",headerText:"CREATE_BY",visible:false,editable:false,width:"120"},
  {name:"CREATE_DTTM",dataType:"text",headerText:"CREATE_DTTM",visible:false,editable:false,width:"120"},
  {name:"DIRECT_SHPP_YN",dataType:"text",headerText:"DIRECT_SHPP_YN",visible:false,editable:false,width:"120"},
  {name:"ID",dataType:"text",headerText:"ID",visible:false,editable:false,width:"120"},
  {name:"INCOTERMS_ID",dataType:"text",headerText:"INCOTERMS_ID",visible:false,editable:false,width:"120"},
  {name:"MODIFY_BY",dataType:"text",headerText:"MODIFY_BY",visible:false,editable:false,width:"120"},
  {name:"MODIFY_DTTM",dataType:"text",headerText:"MODIFY_DTTM",visible:false,editable:false,width:"120"},
  {name:"SRP_YN",dataType:"text",headerText:"SRP_YN",visible:false,editable:false,width:"120"},
  {name:"VMI_YN",dataType:"text",headerText:"VMI_YN",visible:false,editable:false,width:"120"},
  {name:"ITEM_CD",dataType:"text",headerText:"ITEM_CD",visible:false,editable:false,width:"120"},
  {name:"ITEM_NM",dataType:"text",headerText:"ITEM_NM",visible:false,editable:false,width:"120"},
  {name:"ITEM_DESCRIP",dataType:"text",headerText:"ITEM_DESCRIP",visible:false,editable:false,width:"120"},
  {name:"ITEM_TP_NM",dataType:"text",headerText:"ITEM_TP_NM",visible:false,editable:false,width:"120"},
  {name:"ITEM_UOM_NM",dataType:"text",headerText:"ITEM_UOM_NM",visible:false,editable:false,width:"120"},
  ]);
   
  const refPopupGrid1 = useRef({});
  const [accountGrid, setAccountGrid]  = useState(null);
  const [itemsTpOptions,setItemsTpOptions] = useState([]);

  const [viewData,getViewInfo] = useViewStore(state => [state.viewData,state.getViewInfo])
  const { handleSubmit, getValues, setValue, control, formState: { errors }, clearErrors } = useForm({
  defaultValues: {
    accountCd:"",
    accountNm:"",
    salesLvCd:"",
    ...props.defaultValues
  }
  });

  useEffect( () => {
  const loadItemComboList = async () =>{
    await loadItemLvComboListFromEngine();
  };
  loadItemComboList();
   }, []);

  useEffect(() => {
  const grdObjPopup = getViewInfo( vom.active,`${props.id}_ForecastResultAccountGrid`);
  if(grdObjPopup) {
    if(grdObjPopup.dataProvider) {
    if(accountGrid != grdObjPopup)
    setAccountGrid(grdObjPopup);
    }
  }
  },[viewData]);

  useEffect(()=>{
  if(accountGrid){
    popupLoadData();
    setOptions();
  }
  },[accountGrid]);
  
  const setOptions = () => {
  let grid = accountGrid;
  grid.dataProvider.setOptions({ restoreMode: "auto" });
  grid.gridView.setFooters({ visible: false });
  grid.gridView.setStateBar({ visible: false });
  grid.gridView.setEditOptions({ insertable: false, appendable: false });
  grid.gridView.setRowIndicator({ visible: false });
  grid.gridView.setDisplayOptions({fitStyle: "none"});

  grid.gridView.onCellDblClicked = function (clickData, itemIndex) {
    const checkedRows = [];

    checkedRows.push(grid.dataProvider.getJsonRow(itemIndex.dataRow));

    props.confirm("PopForecastResultAccount",checkedRows);
    props.onClose(false);
  }
  }
  const onError = (errors, e) => {
  if(typeof errors !== "undefined" && Object.keys(errors).length > 0 ){
    $.each(errors, function (key, value) {
    showMessage(transLangKey('WARNING'), `[${value.ref.name}] ${value.message}`);
    clearErrors();
    return false;
    });
  }
  }

  const loadItemLvComboListFromEngine = () => {
  let param={
    LEAF_YN: "Y",
    TYPE: "ALL",
    timeout: 0,
    CURRENT_OPERATION_CALL_ID:'OPC_ACCT_POP_SRH_CPT_T1_01_06_LOAD_INIT_001'
  }
  zAxios({
    method: 'post',
    header: { 'content-type': 'application/json' },
    url: 'engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_USER_SALES_LV_Q1',
    params: param
  })
  .then(function (res) {
    let array = [];
    res.data.RESULT_DATA.forEach(function (data) {
    array.push( {
      label: data.SALES_LV_NM,
      value: data.SALES_LV_CD,
    });
    });
    setItemsTpOptions(array);
  })
  .catch(function (err) {
    console.log(err);
  })
  }

  const popupLoadData = () => {
  
    let param = new URLSearchParams();
  
    param.append('ACCT_CD', getValues('accountCd'));
    param.append('ACCT_NM', getValues('accountNm'));
    param.append('SALES_LV_CD', getValues('salesLvCd'));

    param.append('timeout', 0);
    param.append('CURRENT_OPERATION_CALL_ID', 'OPC_init3');

    zAxios({
    method: 'post',
    header: { 'content-type': 'application/json' },
    url: 'engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_POPUP_ACCOUNT_Q1',
    data: param
    })
    .then(function (res) {
    let resultData = res.data.RESULT_DATA;
    if(resultData && resultData.length == 0){
      showMessage(transLangKey('WARNING'), transLangKey('MSG_NO_DATA'), { close: false })
    }
    console.log(res.data.RESULT_DATA)
    accountGrid.dataProvider.fillJsonData(res.data.RESULT_DATA);
    })
    .catch(function (err) {
    console.log(err);
    })
  }

  // popup 확인
  const saveSubmit = () => {
  let checkedRows = [];

  accountGrid.gridView.getCheckedRows().forEach(function (index) {
    checkedRows.push(accountGrid.dataProvider.getJsonRow(index));
  });

  props.confirm("PopForecastResultAccount",checkedRows);
  props.onClose(false);
  }

  // popup 조회 클릭시 조회
  const onPopupSubmit = () => {
  popupLoadData();
  }

  return (
  <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit,onError)} title={props.title} resizeHeight={400} resizeWidth={1150}>
    <SearchArea displaySize='small' submit={handleSubmit(onPopupSubmit, onError)} expandButton={false} searchButton={true}>
       <InputField name="accountCd"
        label={transLangKey("ACCOUNT_CD")}
        readonly={false}
        disabled={false}
        control={control}
        displaySize='small'
      />
      <InputField
        name="accountNm"
        label={transLangKey("ACCOUNT_NM")}
        control={control}
        readonly={false}
        disabled={false}
        displaySize='small'
      />
      <InputField
        type={"select"}
        name={"salesLvCd"}
        label={transLangKey("SALES_LV_CD")}
        control={control}
        options={itemsTpOptions}
        readonly={false}
        disabled={false}
        displaySize='small'
      />
      {/* <IconButton onClick={()=> {onPopupSubmit() }}><Icon.Search/></IconButton> */}
    </SearchArea>
    <Box style={{height:"100%"}}>
    <BaseGrid id={`${props.id}_ForecastResultAccountGrid`} items={popupGrid1Items} ref={refPopupGrid1}></BaseGrid>
    </Box>
  </PopupDialog>
  );
}

PopForecastResultAccount.propTypes = {
  accountCd: PropTypes.string,
  accountNm: PropTypes.string,
};

PopForecastResultAccount.displayName ='PopForecastResultAccount'


export default PopForecastResultAccount;