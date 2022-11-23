import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box } from "@mui/material";
import { ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow, 
  InputField, BaseGrid, GridSaveButton, useIconStyles, useViewStore } from "@zionex/imports";
import "./grouppermission.css"

let groupGridItems = [
  { name: "grpCd", dataType: "text", headerText: "GRP_CD", editable: false, validRules: [{ criteria: "required" }] },
  {
    name: "grpNm", dataType: "text", headerText: "GRP_NM", editable: false,
    styleCallback: function (grid, dataCell) {
      let res = {}
      res.styleName = 'link-column';
      return res;
    }
  },
  { name: "grpDescrip", dataType: "text", headerText: "DESCRIP", editable: false }
];

let viewPermissionGridItems = [
  { name: "grpCd", dataType: "text", headerText: "GRP_CD", editable: false, validRules: [{ criteria: "required" }] },
  { name: "menuCd", dataType: "text", headerText: "MENU_CD", editable: false },
  { name: "menuNm", dataType: "text", headerText: "MENU_NM", editable: false },
  {
    name: "PERMISSION_TYPE_READ", dataType: "boolean", headerText: "READ", editable: false,
    renderer: {
      type: "check",
      editable: true,
      trueValues: "true",
      falseValues: "false"
    }
  },
  {
    name: "PERMISSION_TYPE_CREATE", dataType: "boolean", headerText: "CREATE", editable: false,
    renderer: {
      type: "check",
      editable: true,
      trueValues: "true",
      falseValues: "false"
    }
  },
  {
    name: "PERMISSION_TYPE_UPDATE", dataType: "boolean", headerText: "UPDATE", editable: false,
    renderer: {
      type: "check",
      editable: true,
      trueValues: "true",
      falseValues: "false"
    }
  },
  {
    name: "PERMISSION_TYPE_DELETE", dataType: "boolean", headerText: "DELETE", editable: false,
    renderer: {
      type: "check",
      editable: true,
      trueValues: "true",
      falseValues: "false"
    }
  },
  {
    name: "PERMISSION_TYPE_IMPORT", dataType: "boolean", headerText: "IMPORT", editable: false,
    renderer: {
      type: "check",
      editable: true,
      trueValues: "true",
      falseValues: "false"
    }
  },
];

function GroupPermission() {
  const classes = useIconStyles();
  const history = useHistory();
  const [viewData, getViewInfo, setViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo]);
  const [groupGrid, setGroupGrid] = useState(null);
  const [viewPermissionGrid, setViewPermissionGrid] = useState(null);
  const { control, getValues } = useForm({
    defaultValues: {
    }
  });
  const globalButtons = [
    {
      name: "search",
      action: (e) => { groupGridLoadData() },
      visible: true,
      disable: false
    }
  ]

  useEffect(() => {
    setGroupGrid(getViewInfo(vom.active, 'groupGrid'))
    setViewPermissionGrid(getViewInfo(vom.active, 'viewPermissionGrid'))
  }, [viewData])
  useEffect(() => {
    if (groupGrid) {
      setViewInfo(vom.active, 'globalButtons', globalButtons)

      setOptions()
      groupGridLoadData()
    }
  }, [groupGrid])
  useEffect(() => {
    if (viewPermissionGrid) {
      setPOptions()
    }
  }, [viewPermissionGrid])

  function setOptions() {
    groupGrid.gridView.onCellClicked = function (grid, clickData) {
      if (clickData.cellType != "header") {
        let grpCd = grid.getValue(clickData.itemIndex, "grpCd");
        if (grpCd != null) {
          viewPermissionGridLoadData(grpCd);
        }
      }
      let clickedRow = grid.getJsonRows()[clickData.dataRow]
      if (clickData.column === 'grpNm') {
        history.push({ pathname: '/system/usermgmt/usergroup', state: { grpNm: clickedRow.grpNm } })
      }
    }
  }
  function setPOptions() {
    viewPermissionGrid.gridView.setCheckBar({ visible: true });
    viewPermissionGrid.gridView.onCellEdited = function (grid, itemIndex, row, field) {
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

    viewPermissionGrid.gridView.onColumnCheckedChanged = function (grid, column, checked) {
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

    viewPermissionGrid.gridView.onFilteringChanged = function (grid, column, filter) {
      setHeaderCheck();
    }
  }
  function setHeaderCheck() {
    let itemCount = viewPermissionGrid.gridView.getItemCount();

    let columnNames = ["PERMISSION_TYPE_READ", "PERMISSION_TYPE_CREATE", "PERMISSION_TYPE_UPDATE", "PERMISSION_TYPE_DELETE", "PERMISSION_TYPE_IMPORT"];
    columnNames.forEach(function (name) {
      let headerCheck = true;
      for (let index = 0; index < itemCount; index++) {
        if (!viewPermissionGrid.gridView.getValue(index, name)) {
          headerCheck = false;
          break;
        }
      }
      viewPermissionGrid.gridView.setColumnProperty(name, "checked", headerCheck);
    });
  }
  function menuFilter() {
    let filterValues = [];
    let filters = [];

    let menuCodeValues = viewPermissionGrid.dataProvider.getFieldValues("menuCd", 0, -1);
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

    viewPermissionGrid.gridView.setColumnFilters("menuCd", filters);
    viewPermissionGrid.gridView.setFilteringOptions({ selector: { searchIgnoreCase: true } });
  }
  function groupGridLoadData() {
    groupGrid.gridView.commit(true);

    groupGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/groups', {
      params: {
        'group-nm': getValues('grpNm')
      }
    }).then(function (res) {
      groupGrid.dataProvider.fillJsonData(res.data);
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
      groupGrid.gridView.hideToast();
    });
  }
  function viewPermissionGridLoadData(grpCd) {
    viewPermissionGrid.gridView.commit(true);

    viewPermissionGrid.gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/groups/' + grpCd + '/permissions')
      .then(function (res) {
        if (res.data.length > 0) {
          res.data.forEach(function (data) {
            data.menuNm = transLangKey(data.menuCd);
          });
          viewPermissionGrid.dataProvider.fillJsonData(res.data);
          setHeaderCheck();
          menuFilter();
        }
      }).catch(function (err) {
        console.log(err);
      }).then(function () {
        viewPermissionGrid.gridView.hideToast();
      });
  }
  function viewPermissionGridSaveData() {
    viewPermissionGrid.gridView.commit(true);

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          viewPermissionGrid.dataProvider.getAllStateRows().created,
          viewPermissionGrid.dataProvider.getAllStateRows().updated,
          viewPermissionGrid.dataProvider.getAllStateRows().deleted,
          viewPermissionGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          changeRowData.push(viewPermissionGrid.dataProvider.getJsonRow(row));
        });

        if (changeRowData.length === 0) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          viewPermissionGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/groups/permissions',
            data: changeRowData
          }).then(function (response) {
          }).catch(function (err) {
            console.log(err);
          }).then(function () {
            viewPermissionGrid.gridView.hideToast();
            let current = groupGrid.gridView.getCurrent();
            let grpCd = current.itemIndex != -1 ? groupGrid.gridView.getValue(current.itemIndex, "grpCd") : "";
            viewPermissionGridLoadData(grpCd);
          });
        }
      }
    });
  }
  return (
    <ContentInner>
      <SearchArea>
        <SearchRow>
          <InputField control={control} label={transLangKey("GRP_NM")} name="grpNm" onKeyPress={(e) => { if (e.key === 'Enter') { groupGridLoadData() } }}></InputField>
        </SearchRow>
      </SearchArea>
      <ResultArea sizes={[30, 63]} direction={"vertical"}>
        <Box className={classes.resultAreaBox}>
          <BaseGrid id="groupGrid" items={groupGridItems} className="white-skin"></BaseGrid>
        </Box>
        <Box className={classes.resultAreaBox}>
          <ButtonArea>
            <LeftButtonArea></LeftButtonArea>
            <RightButtonArea>
              <GridSaveButton title={transLangKey("SAVE")} onClick={viewPermissionGridSaveData}></GridSaveButton>
            </RightButtonArea>
          </ButtonArea>
          <BaseGrid id="viewPermissionGrid" items={viewPermissionGridItems} className="white-skin"></BaseGrid>
        </Box>
      </ResultArea>
    </ContentInner>
  );
}

export default GroupPermission