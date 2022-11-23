import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import PopupDialog from "../../component/PopupDialog";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { SearchArea, InputField, BaseGrid, useViewStore, zAxios } from "@zionex/imports";
import { transLangKey } from "@zionex";
import { showMessage } from "@zionex";

let popupGrid1Items = [
  { name: "ID", dataType: "text", headerText: "ID", visible: false, editable: false, width: "200" },
  { name: "ACCOUNT_CD", dataType: "text", headerText: "ACCOUNT_CD", visible: true, editable: false, width: "100" },
  { name: "ACCOUNT_NM", dataType: "text", headerText: "ACCOUNT_NM", visible: true, editable: false, width: "100" },
  {
    name: "PARENT_SALES_LV_NM",
    dataType: "text",
    headerText: "PARENT_SALES_LV_NM",
    visible: true,
    editable: false,
    width: "120",
  },
  { name: "CURCY_CD", dataType: "text", headerText: "CURCY_CD_ID", visible: true, editable: false, width: "100" },
  { name: "COUNTRY_NM", dataType: "text", headerText: "COUNTRY_ID", visible: true, editable: false, width: "100" },
  { name: "CHANNEL_NM", dataType: "text", headerText: "CHANNEL_ID", visible: true, editable: false, width: "100" },
  { name: "SOLD_TO_CD", dataType: "text", headerText: "SOLD_TO_CD", visible: false, editable: false, width: "100" },
  { name: "SOLD_TO_NM", dataType: "text", headerText: "SOLD_TO_NM", visible: false, editable: false, width: "100" },
  { name: "SHIP_TO_CD", dataType: "text", headerText: "SHIP_TO_CD", visible: false, editable: false, width: "100" },
  { name: "SHIP_TO_NM", dataType: "text", headerText: "SHIP_TO_NM", visible: false, editable: false, width: "100" },
  { name: "BILL_TO_CD", dataType: "text", headerText: "BILL_TO_CD", visible: false, editable: false, width: "100" },
  { name: "BILL_TO_NM", dataType: "text", headerText: "BILL_TO_NM", visible: false, editable: false, width: "100" },
];

function PopSelectAccount(props) {
  const [accountSelectGrid, setAccountSelectGrid] = useState(null);
  const [salesLevelOption, setSalesLevelOption] = useState([]);

  const [viewData, getViewInfo, setViewInfo] = useViewStore((state) => [state.viewData, state.getViewInfo, state.setViewInfo]);

  const { handleSubmit, getValues, setValue, control, clearErrors } = useForm({
    defaultValues: {
      accountCd: "",
      accountNm: "",
      salesLvCd: "",
    },
  });

  const loadSalesLevel = async () => {
    const arr = await loadComboList({
      URL: "engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_USER_SALES_LV_Q1",
      CODE_KEY: "SALES_LV_CD",
      CODE_VALUE: "SALES_LV_NM",
      PARAM: { EMP_NO: "", AUTH_TP_ID: "", LEAF_YN: "Y", TYPE: "ALL" },
      ALLFLAG: false,
      TRANSLANG_LABEL: true,
    });
    setSalesLevelOption(arr);
    setValue("salesLvCd", props.salesLvCd ? props.salesLvCd : arr[0].value);
  };

  useEffect(() => {
    loadSalesLevel();
  }, []);

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_PopSelectAccountGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (accountSelectGrid !== grdObjPopup) setAccountSelectGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    if (accountSelectGrid) {
      loadPopupAccount(getValues());
      setGridOptions();
    }
  }, [accountSelectGrid]);

  const setGridOptions = () => {
    accountSelectGrid.dataProvider.setOptions({ restoreMode: "auto" });
    accountSelectGrid.gridView.setFooters({ visible: false });
    accountSelectGrid.gridView.setStateBar({ visible: false });
    accountSelectGrid.gridView.setEditOptions({ insertable: false, appendable: false });
    accountSelectGrid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
    });

    accountSelectGrid.gridView.onCellDblClicked = function (clickData, itemIndex) {
      let checkedRows = [];

      checkedRows.push(accountSelectGrid.dataProvider.getJsonRow(itemIndex.dataRow));

      props.confirm(checkedRows);
      props.onClose(false);
    };
    accountSelectGrid.gridView.setCheckBar({ exclusive: props.multiple });
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

  const loadPopupAccount = (data) => {
    accountSelectGrid.gridView.showToast(progressSpinner + "Load Data...", true);

    let param = new URLSearchParams();
    param.append("ACCT_CD", data.accountCd);
    param.append("ACCT_NM", data.accountNm);
    param.append("SALES_LV_CD", data.salesLvCd);
    param.append("timeout", 0);
    zAxios({
      method: "post",
      header: { "content-type": "application/json" },
      url: "engine/T3SeriesDataServer/SRV_GET_SP_UI_DP_00_POPUP_ACCOUNT_Q1",
      data: param,
    })
      .then(function (res) {
        let resultData = res.data.RESULT_DATA;
        if (resultData && resultData.length === 0) {
          showMessage(transLangKey("WARNING"), transLangKey("MSG_NO_DATA"), { close: false });
        }
        accountSelectGrid.dataProvider.fillJsonData(res.data.RESULT_DATA);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        accountSelectGrid.gridView.hideToast();
      });
  };

  const onPopupSubmit = (data) => {
    loadPopupAccount(data);
  };

  // popup 확인
  const saveSubmit = () => {
    let checkedRows = [];

    accountSelectGrid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(accountSelectGrid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  };

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="ACCOUNT_POP" resizeHeight={400} resizeWidth={800}>
      <SearchArea submit={handleSubmit(onPopupSubmit, onError)} searchButton={true}>
        <InputField name="accountCd" label={transLangKey("ACCOUNT_CD")} readonly={false} disabled={false} control={control} />
        <InputField name="accountNm" label={transLangKey("ACCOUNT_NM")} control={control} readonly={false} disabled={false} />
        <InputField type="select" name="salesLvCd" label={transLangKey("SALES_LV_CD")} control={control} readonly={false} disabled={false} options={salesLevelOption} />
      </SearchArea>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_PopSelectAccountGrid`} items={popupGrid1Items} />
      </Box>
    </PopupDialog>
  );
}

PopSelectAccount.propTypes = {
  accountCd: PropTypes.string,
  accountNm: PropTypes.string,
  salesLvCd: PropTypes.string,
};

PopSelectAccount.displayName = "PopSelectAccount";

export default PopSelectAccount;