import React, { useState, useEffect, useContext , useRef, forwardRef } from "react";
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
import { ConnectingAirportsOutlined, ConstructionOutlined } from "@mui/icons-material";

//품목 조회
function PopForecastResultItem(props) {
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
  
  {name:"CREATE_BY",dataType:"text",headerText:"CREATE_BY",visible:false,editable:false,width:"150"},
  {name:"CREATE_DTTM",dataType:"text",headerText:"CREATE_DTTM",visible:false,editable:false,width:"150"},
  {name:"DEL_YN",dataType:"text",headerText:"DEL_YN",visible:false,editable:false,width:"150"},
  {name:"DESCRIP",dataType:"text",headerText:"DESCRIP",visible:false,editable:false,width:"150"},
  {name:"DP_PLAN_YN",dataType:"text",headerText:"DP_PLAN_YN",visible:false,editable:false,width:"150"},
  {name:"ID",dataType:"text",headerText:"ID",visible:false,editable:false,width:"150"},
  {name:"MODIFY_BY",dataType:"text",headerText:"MODIFY_BY",visible:false,editable:false,width:"150"},
  {name:"MODIFY_DTTM",dataType:"text",headerText:"MODIFY_DTTM",visible:false,editable:false,width:"150"},
  {name:"PARENT_ITEM_LV_CD",dataType:"text",headerText:"PARENT_ITEM_LV_CD",visible:false,editable:false,width:"150"},
  {name:"PARENT_ITEM_LV_ID",dataType:"text",headerText:"PARENT_ITEM_LV_ID",visible:false,editable:false,width:"150"},
  {name:"UOM_CD",dataType:"text",headerText:"UOM_CD",visible:false,editable:false,width:"150"},
  {name:"UOM_ID",dataType:"text",headerText:"UOM_ID",visible:false,editable:false,width:"150"},

  //품목코드
  {name:"ITEM_CD",dataType:"text",headerText:"ITEM_CD",visible:true,editable:false,width:"150",textAlignment: "center"},
  //품목명
  {name:"ITEM_NM",dataType:"text",headerText:"ITEM_NM",visible:true,editable:false,width:"150",textAlignment: "center"},
  //단위
  {name:"UOM_NM",dataType:"text",headerText:"UOM_NM",visible:true,editable:false,width:"150",textAlignment: "center"},
  //상위 품목 레벨명
  {name:"PARENT_ITEM_LV_NM",dataType:"text",headerText:"PARENT_ITEM_LV_NM",visible:true,editable:false,width:"150",textAlignment: "center"},
  //Start Date of Sales
  {name:"RTS",dataType:"text",headerText:"STRT_DATE_SALES",visible:true,editable:false,width:"150",textAlignment: "center"},
  //판매 종료일자
  {name:"EOS",dataType:"text",headerText:"END_DATE_SALES",visible:true,editable:false,width:"150",textAlignment: "center"},

  ]);
   
  const refPopupGrid1 = useRef({});
  const [itemGrid, setItemGrid]  = useState(null);
  const [itemsTpOptions,setItemsTpOptions] = useState([]);

  const [viewData,getViewInfo] = useViewStore(state => [state.viewData,state.getViewInfo])
  const { handleSubmit, getValues, setValue, control, formState: { errors }, clearErrors } = useForm({
  defaultValues: {
    itemCd:"",
    itemNm:"",
    itemLvCd:"",
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
  const grdObjPopup = getViewInfo( vom.active,`${props.id}_ForecastResultItemGrid`);
  if(grdObjPopup) {
    if(grdObjPopup.dataProvider) {
    if(itemGrid != grdObjPopup)
    setItemGrid(grdObjPopup);
    }
  }
  },[viewData]);

  useEffect(()=>{
  if(itemGrid){
    popupLoadData1();
    setOptions();
  }
  },[itemGrid]);
  
  const setOptions = () => {
  const grid = itemGrid;
  grid.dataProvider.setOptions({ restoreMode: "auto" });
  grid.gridView.setFooters({ visible: false });
  grid.gridView.setStateBar({ visible: false });
  grid.gridView.setEditOptions({ insertable: false, appendable: false });
  grid.gridView.setRowIndicator({ visible: false });
  grid.gridView.setDisplayOptions({fitStyle: "none"});
  grid.gridView.setCheckBar({exclusive: props.multiple});
  
  grid.gridView.onCellDblClicked = function (clickData, itemIndex) {
    const checkedRows = [];

    checkedRows.push(grid.dataProvider.getJsonRow(itemIndex.dataRow));

    props.confirm("PopForecastResultItem",checkedRows);
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
    CURRENT_OPERATION_CALL_ID:'OPC_ITEM_POP_SRH_CPT_T1_01_06_LOAD_default_value'
  }
  zAxios({
    method: 'post',
    header: { 'content-type': 'application/json' },
    url: 'engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_USER_ITEM_LV_Q1',
    params: param
  })
  .then(function (res) {
    let array = [];
    res.data.RESULT_DATA.forEach(function (data) {
    array.push( {
      label: data.CD_NM,
      value: data.CD,
    });
    });
    setItemsTpOptions(array);
    setValue("itemTpId", 'ALL');
  })
  .catch(function (err) {
    console.log(err);
  })
  }

  const popupLoadData1 = () => {
  
    let param = new URLSearchParams();
    param.append('ITEM_CD',getValues('itemCd'))
    param.append('ITEM_NM',getValues('itemNm'))
    param.append('ITEM_LV_CD',getValues('itemLvCd'))

    param.append('timeout', 0);
    param.append('CURRENT_OPERATION_CALL_ID', 'op_item_pop1');

    zAxios({
    method: 'post',
    header: { 'content-type': 'application/json' },
    url: '/engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_POPUP_ITEM_Q1',
    data: param
    })
    .then(function (res) {
    itemGrid.dataProvider.fillJsonData(res.data.RESULT_DATA);
    })
    .catch(function (err) {
    console.log(err);
    })
  }
  const saveSubmit = () => {
  let checkedRows = [];

  itemGrid.gridView.getCheckedRows().forEach(function (index) {
    checkedRows.push(itemGrid.dataProvider.getJsonRow(index));
  });
  
  props.confirm("PopForecastResultItem",checkedRows);
  props.onClose(false);
  }
  
  // popup 조회 클릭시 조회
  const onPopupSubmit = () => {
  popupLoadData1();
  }

  return (
  <PopupDialog open={props.open} onClose={props.onClose} title={props.title} onSubmit={handleSubmit(saveSubmit,onError)} resizeHeight={400} resizeWidth={960}>
    <SearchArea displaySize='small' submit={handleSubmit(onPopupSubmit, onError)} expandButton={false} searchButton={true}>
       <InputField name="itemCd"
        label={transLangKey("ITEM_CD")}
        readonly={false}
        disabled={false}
        control={control}
        displaySize='small'
      />
      <InputField
        name="itemNm"
        label={transLangKey("ITEM_NM")}
        control={control}
        readonly={false}
        disabled={false}
        displaySize='small'
      />
      <InputField
        type={"select"}
        name={"itemLvCd"}
        label={transLangKey("ITEM_LV_CD")}
        control={control}
        options={itemsTpOptions}
        readonly={false}
        disabled={false}
        displaySize='small'
      />
      {/* <IconButton onClick={()=> {onPopupSubmit() }}><Icon.Search/></IconButton> */}
    </SearchArea>
    <Box style={{height:"100%"}}>
    <BaseGrid id={`${props.id}_ForecastResultItemGrid`} items={popupGrid1Items} ref={refPopupGrid1}></BaseGrid>
    </Box>
  </PopupDialog>
  );
}

PopForecastResultItem.propTypes = {
  itemCd: PropTypes.string,
  itemNm: PropTypes.string,
  itemLvCd: PropTypes.string,
};

PopForecastResultItem.displayName ='PopForecastResultItem'


export default PopForecastResultItem;