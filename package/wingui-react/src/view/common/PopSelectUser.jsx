import React, { useState, useEffect } from "react";
import PopupDialog from "../../component/PopupDialog";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { SearchArea, InputField, BaseGrid, useViewStore, zAxios } from "@zionex/imports";
import PropTypes from "prop-types";
import {baseURI, setVisibleProps, showMessage, transLangKey} from "@zionex";

function PopSelectUser(props) {
  const popupGrid1Items = [
    {
      name: "id",
      dataType: "text",
      headerText: "ID",
      visible: false,
      editable: false,
      textAlignment: "center",
      width: 100,
    },
    {
      name: "username",
      dataType: "text",
      headerText: "USER_ID",
      visible: true,
      editable: false,
      width: 100,
      textAlignment: "center",
    },
    {
      name: "displayName",
      dataType: "text",
      headerText: "USER_NM",
      visible: true,
      editable: false,
      width: 100,
      textAlignment: "center",
    },
  ];

  const [grid, setGrid] = useState(null);

  const [viewData, getViewInfo] = useViewStore((state) => [state.viewData, state.getViewInfo]);
  const { handleSubmit, control, getValues, clearErrors } = useForm({
    defaultValues: {
      groupName: "",
      username: "",
    },
  });

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, `${props.id}_PopSelectUserGrid`);
    if (grdObjPopup) {
      if (grdObjPopup.dataProvider) {
        if (grid !== grdObjPopup) setGrid(grdObjPopup);
      }
    }
  }, [viewData]);

  useEffect(() => {
    if (grid) {
      setOptions();
      loadUsers();
    }
  }, [grid]);

  const loadUsers = () => {
    zAxios
      .get(baseURI() + "system/users", {
        params: {
          username: getValues("username"),
          "display-name": getValues("displayName"),
        },
      })
      .then(function (res) {
        if (res.data && res.data.length === 0) {
          grid.gridView.setDisplayOptions({ showEmptyMessage: true, emptyMessage: transLangKey("MSG_NO_DATA") });
        }
        grid.dataProvider.fillJsonData(res.data);
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  const setOptions = () => {
    setVisibleProps(grid, true, true, true);
    grid.gridView.setDisplayOptions({ fitStyle: "evenFill" });

    //하나의 행만 체크 가능
    if (props.multiple === false) {
      grid.gridView.setCheckBar({
        exclusive: true,
      });
    }
    grid.gridView.onCellDblClicked = function (clickData, itemIndex) {
      let checkedRows = [];

      checkedRows.push(grid.dataProvider.getJsonRow(itemIndex.dataRow));

      props.confirm(checkedRows);
      props.onClose(false);
    };
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

  const saveSubmit = () => {
    let checkedRows = [];

    grid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(grid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  };

  return (
    <PopupDialog open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="USER_POP" resizeHeight={400} resizeWidth={770}>
      <SearchArea>
        <InputField name="username" displaySize="small" label={transLangKey("USER_ID")} readonly={false} disabled={false} control={control} />
        <InputField name="displayName" displaySize="small" label={transLangKey("USER_NM")} control={control} readonly={false} disabled={false} />
      </SearchArea>
      <Box style={{ height: "100%" }}>
        <BaseGrid id={`${props.id}_PopSelectUserGrid`} items={popupGrid1Items} />
      </Box>
    </PopupDialog>
  );
}

PopSelectUser.propTypes = {
  groupName: PropTypes.string,
  username: PropTypes.string,
};

PopSelectUser.displayName = "PopSelectUser";

export default PopSelectUser;
