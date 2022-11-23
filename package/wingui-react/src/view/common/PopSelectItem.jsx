import React, { useState, useEffect } from "react";
import PopupDialog from "../../component/PopupDialog";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { SearchArea, InputField, BaseGrid, useViewStore, zAxios } from "@zionex/imports";
import { transLangKey } from "@zionex";

let popupGrid1Items = [
  { name: "ID", dataType: "text", headerText: "ID", visible: false, editable: false, width: "200" },
  { name: "ITEM_CD", dataType: "text", headerText: "ITEM_CD", visible: true, editable: false, width: "90" },
  { name: "ITEM_NM", dataType: "text", headerText: "ITEM_NM", visible: true, editable: false, width: "160" },
  { name: "UOM_CD", dataType: "text", headerText: "UOM_CD", visible: false, editable: false, width: "80" },
  { name: "UOM_NM", dataType: "text", headerText: "UOM", visible: true, editable: false, width: "80" },
  {
    name: "PARENT_ITEM_LV_NM",
    dataType: "text",
    headerText: "PARENT_ITEM_LV_NM",
    visible: true,
    editable: false,
    width: "120",
  },
  { name: "IF_YN", dataType: "bool", headerText: "IF_YN", visible: false, editable: false, width: "100" },
  { name: "USE_YN", dataType: "text", headerText: "USE_YN", visible: false, editable: false, width: "100" },
  { name: "RTS", dataType: "text", headerText: "STRT_DATE_SALES", visible: true, editable: false, width: "110" },
  { name: "EOS", dataType: "text", headerText: "END_DATE_SALES", visible: true, editable: false, width: "110" },
];

function PopSelectItem(props) {
  const [itemSelectGrid, setItemSelectGrid] = useState(null);

  const [itemLevelOption, setItemLevelOption] = useState([]);

  const [viewData, getViewInfo, setViewInfo] = useViewStore((state) => [state.viewData, state.getViewInfo, state.setViewInfo]);

  const { handleSubmit, getValues, setValue, control, clearErrors } = useForm({
    defaultValues: {
      itemCd: "",
      itemNm: "",
      itemLvCd: "",
    },
  });

  const globalButtons = [
    {
      name: "search",
      action: (e) => {
        loadPopupItem();
      },
      visible: true,
      disable: false,
    },
    {
      name: "save",
      action: (e) => {},
      visible: false,
      disable: false,
    },
    {
      name: "refresh",
      action: (e) => {
        reset();
      },
      visible: false,
      disable: false,
    },
  ];

  const loadItemLevel = async () => {
    const arr = await loadComboList({
      URL: "engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_USER_ITEM_LV_Q1",
      CODE_KEY: "CD",
      CODE_VALUE: "CD_NM",
      PARAM: { EMP_NO: "", AUTH_TP_ID: "", LEAF_YN: "Y", TYPE: "" },
      ALLFLAG: true,
      TRANSLANG_LABEL: true,
    });
    setItemLevelOption(arr);
    setValue("itemLvCd", props.itemLvCd ? props.itemLvCd : arr[0].value);
  };

  useEffect(() => {
    loadItemLevel();
  }, []);

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_PopSelectItemGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (itemSelectGrid !== grdObjPopup) setItemSelectGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    if (itemSelectGrid) {
      //setViewInfo(vom.active, "globalButtons", globalButtons);

      loadPopupItem(getValues());
      setGridOptions();
    }
  }, [itemSelectGrid]);

  const setGridOptions = () => {
    itemSelectGrid.dataProvider.setOptions({ restoreMode: "auto" });
    itemSelectGrid.gridView.setFooters({ visible: false });
    itemSelectGrid.gridView.setStateBar({ visible: false });
    itemSelectGrid.gridView.setEditOptions({ insertable: false, appendable: false });
    itemSelectGrid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
    });

    itemSelectGrid.gridView.onCellDblClicked = function (clickData, itemIndex) {
      let checkedRows = [];

      checkedRows.push(itemSelectGrid.dataProvider.getJsonRow(itemIndex.dataRow));

      props.confirm(checkedRows);
      props.onClose(false);
    };
    itemSelectGrid.gridView.setCheckBar({ exclusive: props.multiple });
  };
  const onError = (errors) => {
    if (typeof errors !== "undefined" && Object.keys(errors).length > 0) {
      $.each(errors, function (key, value) {
        showMessage(transLangKey("WARNING"), `[${value.ref.name}] ${value.message}`);
        clearErrors();
        return false;
      });
    }
  };

  const loadPopupItem = (data) => {
    itemSelectGrid.gridView.showToast(progressSpinner + "Load Data...", true);
    let param = new URLSearchParams();
    param.append("ITEM_CD", data.itemCd);
    param.append("ITEM_NM", data.itemNm);
    param.append("ITEM_LV_CD", data.itemLvCd);
    param.append("timeout", 0);
    zAxios({
      method: "post",
      header: { "content-type": "application/json" },
      url: "engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_POPUP_ITEM_Q1",
      data: param,
    })
      .then(function (res) {
        itemSelectGrid.dataProvider.fillJsonData(res.data.RESULT_DATA);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        itemSelectGrid.gridView.hideToast();
      });
  };

  const onPopupSubmit = (data) => {
    loadPopupItem(data);
  };

  // popup 확인
  const saveSubmit = () => {
    let checkedRows = [];

    itemSelectGrid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(itemSelectGrid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  };

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="ITEM_POP" resizeHeight={400} resizeWidth={800}>
      <SearchArea submit={handleSubmit(onPopupSubmit, onError)} searchButton={true}>
        <InputField name="itemCd" label={transLangKey("ITEM_CD")} readonly={false} disabled={false} control={control} />
        <InputField name="itemNm" label={transLangKey("ITEM_NM")} control={control} readonly={false} disabled={false} />
        <InputField type="select" name="itemLvCd" label={transLangKey("ITEM_LV_CD")} control={control} readonly={false} disabled={false} options={itemLevelOption} />
      </SearchArea>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_PopSelectItemGrid`} items={popupGrid1Items} />
      </Box>
    </PopupDialog>
  );
}

PopSelectItem.propTypes = {
  itemCd: PropTypes.string,
  itemNm: PropTypes.string,
  itemLvCd: PropTypes.string,
};

PopSelectItem.displayName = "PopSelectItem";

export default PopSelectItem;
