import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  InputField, BaseGrid, GridSaveButton, useIconStyles, useViewStore
} from "../../../../imports";

let userGridItems = [
  { name: "username", dataType: "text", headerText: "USER_ID", editable: false, width: 100, validRules: [{ criteria: "required" }] },
  { name: "displayName", dataType: "text", headerText: "USER_NM", editable: false, width: 100 },
  { name: "uniqueValue", dataType: "text", headerText: "UNIQUE_VALUE", editable: false, width: 100 },
  { name: "department", dataType: "text", headerText: "DEPARTMENT", editable: false, width: 100 },
  { name: "businessValue", dataType: "text", headerText: "BUSINESS", editable: false, width: 100 },
  { name: "email", dataType: "text", headerText: "EMAIL", editable: false, width: 100, validRules: [{ criteria: "inputChar", valid: "email" }] },
  { name: "etc", dataType: "text", headerText: "ETC", editable: false, width: 100 },
]

let pmsnGridItems = [
  { name: "username", dataType: "text", headerText: "USER_ID", visible: false, editable: false, width: 100 },
  { name: "menuCd", dataType: "text", headerText: "MENU_CD", editable: false, width: 100 },
  { name: "menuNm", dataType: "text", headerText: "MENU_NM", editable: false, width: 100 },
  { name: "PERMISSION_TYPE_READ", dataType: "boolean", headerText: "READ", editable: true, width: 100, header: { checkLocation: "left" } },
  { name: "PERMISSION_TYPE_CREATE", dataType: "boolean", headerText: "CREATE", editable: true, width: 100, header: { checkLocation: "left" } },
  { name: "PERMISSION_TYPE_UPDATE", dataType: "boolean", headerText: "UPDATE", editable: true, width: 100, header: { checkLocation: "left" } },
  { name: "PERMISSION_TYPE_DELETE", dataType: "boolean", headerText: "DELETE", editable: true, width: 100, header: { checkLocation: "left" } },
  { name: "PERMISSION_TYPE_IMPORT", dataType: "boolean", headerText: "IMPORT", editable: true, width: 100, header: { checkLocation: "left" } },
]

function UserPermission() {
  const classes = useIconStyles();
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const [userGrid, setUserGrid] = useState(null);
  const [pmsnGrid, setPmsnGrid] = useState(null);
  const { control, getValues } = useForm({
    defaultValues: {
    }
  });
  const globalButtons = [
    {
      name: "search",
      action: (e) => { userGridLoadData() },
      visible: true,
      disable: false
    }
  ]

  useEffect(() => {
    setUserGrid(getViewInfo(vom.active, 'userGrid'))
    setPmsnGrid(getViewInfo(vom.active, 'pmsnGrid'))
  }, [viewData])
  useEffect(() => {
    if (userGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)

      setOptions()
      userGridLoadData()
    }
  }, [userGrid])
  useEffect(() => {
    if (pmsnGrid) {
      setPOptions()
    }
  }, [pmsnGrid])
  function setOptions() {
    userGrid.gridView.onCellEdited = function (grid) {
      grid.commit(true);
    }

    userGrid.gridView.onCellClicked = function (grid, clickData) {
      if (clickData.cellType != "header") {
        let username = grid.getValue(clickData.itemIndex, "username");
        if (username != null) {
          pmsnGridLoadData(username);
        }
      }
    }
  }
  function setPOptions() {
    pmsnGrid.gridView.setCheckBar({ visible: true });
    pmsnGrid.gridView.onCellEdited = function (grid, itemIndex, row, field) {
      grid.commit(true);

      let editedValue = grid.getValue(itemIndex, field);
      let values = grid.getValues(itemIndex);
      let readField = grid.getDataSource().getFieldIndex("PERMISSION_TYPE_READ");
      if (field != readField) {
        if (editedValue && !values.PERMISSION_TYPE_READ) {
          grid.setValue(itemIndex, readField, true);
        }
      } else {
        let permissions = [values.PERMISSION_TYPE_CREATE, values.PERMISSION_TYPE_UPDATE, values.PERMISSION_TYPE_DELETE, values.PERMISSION_TYPE_IMPORT];
        if (!editedValue && permissions.indexOf(true) != -1) {
          grid.setValue(itemIndex, field, true);
        }
      }
      setHeaderCheck();
    }

    pmsnGrid.gridView.onColumnCheckedChanged = function (grid, column, checked) {
      grid.commit(true);

      grid.getDataSource().beginUpdate();
      let columnName = column.name;
      let readColumnName = "PERMISSION_TYPE_READ";
      let itemCount = grid.getItemCount();
      try {
        if (columnName != readColumnName) {
          for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
            if (checked) {
              grid.setColumnProperty(readColumnName, "checked", checked);
              grid.setValue(itemIndex, readColumnName, checked);
            }
            grid.setValue(itemIndex, columnName, checked);
          }
        } else {
          if (checked) {
            for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
              grid.setValue(itemIndex, columnName, checked);
            }
          } else {
            let isHeaderChecked = false;
            let columnNames = ["PERMISSION_TYPE_CREATE", "PERMISSION_TYPE_UPDATE", "PERMISSION_TYPE_DELETE", "PERMISSION_TYPE_IMPORT"];
            columnNames.forEach(function (name) {
              if (grid.getColumnProperty(name, "checked")) {
                isHeaderChecked = true;
              }
            });
            grid.setColumnProperty(readColumnName, "checked", true);
            if (!isHeaderChecked) {
              for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                let values = grid.getValues(itemIndex);
                let permissions = [values.PERMISSION_TYPE_CREATE, values.PERMISSION_TYPE_UPDATE, values.PERMISSION_TYPE_DELETE, values.PERMISSION_TYPE_IMPORT];
                if (permissions.indexOf(true) != -1) {
                  grid.setValue(itemIndex, columnName, true);
                } else {
                  grid.setColumnProperty(readColumnName, "checked", false);
                  grid.setValue(itemIndex, columnName, false);
                }
              }
            }
          }
        }
      } finally {
        grid.getDataSource().endUpdate();
      }
    }

    pmsnGrid.gridView.onFilteringChanged = function (grid, column, filter) {
      setHeaderCheck();
    }
  }
  function setHeaderCheck() {
    let itemCount = pmsnGrid.gridView.getItemCount();

    let columnNames = ["PERMISSION_TYPE_READ", "PERMISSION_TYPE_CREATE", "PERMISSION_TYPE_UPDATE", "PERMISSION_TYPE_DELETE", "PERMISSION_TYPE_IMPORT"];
    columnNames.forEach(function (name) {
      let headerCheck = true;
      for (let index = 0; index < itemCount; index++) {
        if (!pmsnGrid.gridView.getValue(index, name)) {
          headerCheck = false;
          break;
        }
      }
      pmsnGrid.gridView.setColumnProperty(name, "checked", headerCheck);
    });
  }
  function menuFilter() {
    let filterValues = [];
    let filters = [];

    let menuCodeValues = pmsnGrid.dataProvider.getFieldValues("menuCd", 0, -1);
    menuCodeValues.forEach(function (menuCode) {
      filterValues.push(menuCode.split("_")[1]);
    });

    filterValues.unique().sort().forEach(function (mainMenuCode, index) {
      filters.push({
        name: mainMenuCode,
        text: mainMenuCode,
        tag: index,
        description: mainMenuCode,
        callback: function (ds, dataRow, level, field, filter, value) {
          if (value.split("_")[1] === filter.text) {
            return true;
          }
        }
      });
    });

    pmsnGrid.gridView.setColumnFilters("menuCd", filters);
    pmsnGrid.gridView.setFilteringOptions({ selector: { searchIgnoreCase: true } });
  }
  function userGridLoadData() {
    userGrid.gridView.commit(true);

    userGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/users', {
      params: {
        'username': getValues('username'),
        'display-name': getValues('displayName'),
        'unique-value': getValues('uniqueValue')
      }
    }).then(function (res) {
      userGrid.dataProvider.fillJsonData(res.data);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      userGrid.gridView.hideToast();
    });
  }
  function pmsnGridLoadData(username) {
    pmsnGrid.gridView.commit(true);

    pmsnGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/users/' + username + '/permissions')
      .then(function (res) {
        if (res.data.length > 0) {
          res.data.forEach(function (data) {
            data.menuNm = transLangKey(data.menuCd);
          });
          pmsnGrid.dataProvider.fillJsonData(res.data);
          setHeaderCheck();
          menuFilter();
        }
      }).catch(function (err) {
        console.log(err);
      }).then(function () {
        pmsnGrid.gridView.hideToast();
      });
  }
  function pmsnGridSaveData() {
    pmsnGrid.gridView.commit(true);

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          pmsnGrid.dataProvider.getAllStateRows().created,
          pmsnGrid.dataProvider.getAllStateRows().updated,
          pmsnGrid.dataProvider.getAllStateRows().deleted,
          pmsnGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          changeRowData.push(pmsnGrid.dataProvider.getJsonRow(row));
        });

        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          pmsnGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/users/permissions',
            data: changeRowData
          }).then(function (response) {
          }).catch(function (err) {
            console.log(err);
          }).then(function () {
            pmsnGrid.gridView.hideToast();
            let current = userGrid.gridView.getCurrent();
            let username = current.itemIndex != -1 ? userGrid.gridView.getValue(current.itemIndex, "username") : "";
            pmsnGridLoadData(username);
          });
        }
      }
    });
  }
  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField control={control} label={transLangKey("USER_ID")} name="username" onKeyPress={(e) => { if (e.key === 'Enter') { userGridLoadData() } }}></InputField>
          <InputField control={control} label={transLangKey("USER_NM")} name="displayName" onKeyPress={(e) => { if (e.key === 'Enter') { userGridLoadData() } }}></InputField>
          <InputField control={control} label={transLangKey("UNIQUE_VALUE")} name="uniqueValue" onKeyPress={(e) => { if (e.key === 'Enter') { userGridLoadData() } }}></InputField>
        </SearchRow>
      </SearchArea>
      <ResultArea sizes={[30, 63]} direction={"vertical"}>
        <Box className={classes.resultAreaBox}>
          <BaseGrid id="userGrid" items={userGridItems} className="white-skin"></BaseGrid>
        </Box>
        <Box className={classes.resultAreaBox}>
          <ButtonArea>
            <LeftButtonArea></LeftButtonArea>
            <RightButtonArea>
              <GridSaveButton title={transLangKey("SAVE")} onClick={pmsnGridSaveData}></GridSaveButton>
            </RightButtonArea>
          </ButtonArea>
          <BaseGrid id="pmsnGrid" items={pmsnGridItems} className="white-skin"></BaseGrid>
        </Box>
      </ResultArea>
    </ContentInner>
  );
}

export default UserPermission