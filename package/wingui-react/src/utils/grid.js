
import { GridView, LocalDataProvider, TreeView } from 'realgrid';
import { zAxios } from '../imports';
import { transLangKey } from '../lang/i18n-func';

export function getGridThemeSkin() {
  themeSkin = 'generalGraySkin';

  if (generalGraySkin && !settings.style.gridCustomSkin) {
    let fontFamily = window.lo.getFontFamily();
    let fontSize = window.lo.getFontSize();

    generalGraySkin.grid.font = `${fontFamily},${fontSize - 1}`;
    generalGraySkin.panel.font = `${fontFamily},${fontSize - 2}`;
    generalGraySkin.body.font = `${fontFamily},${fontSize - 2}`;
    generalGraySkin.header.font = `${fontFamily},${fontSize - 2},bold`;
    generalGraySkin.header.group.font = `${fontFamily},${fontSize - 2},bold`;
    generalGraySkin.rowGroup.header.font = `${fontFamily},${fontSize - 2}`;
    generalGraySkin.rowGroup.footer.font = `${fontFamily},${fontSize - 2},bold`;
    generalGraySkin.rowGroup.panel.font = `${fontFamily},${fontSize - 2}`;
    generalGraySkin.checkBar.font = `${fontFamily},${fontSize - 2}`;
  }

  return generalGraySkin;
}

export function createGrid(id) {
  let dataProvider = new LocalDataProvider(false);
  let gridView = new GridView(id);
  gridView.setDataSource(dataProvider);

  let obj = {};
  obj[id] = {
    dataProvider: dataProvider,
    gridView: gridView
  };

  return obj[id];
}

export function checkChanges() {
  let returnValue = false;
  if (vom.get(vom.active).includeVue()) {
    Object.keys(Vue.grids).forEach(gridId => {
      let gridView = Vue.grids[gridId].gridView;
      if (gridView && Object.keys(gridView).length > 0) {
        gridView.commit(true);

        let dataProvider = gridView.getDataProvider();
        let statRows = dataProvider.getAllStateRows();

        let stats = Object.getOwnPropertyNames(statRows);
        for (let i = 0, n = stats.length; i < n; i++) {
          let stat = statRows[stats[i]];
          if (stat.length > 0) {
            returnValue = true;
          }
        }
      }
    })
  } else {
    for (let componentId in com.get(com.active).getComponents()) {
      let component = com.get(com.active).getComponent(componentId);
      if (component.type !== 'R_GRID' && component.type !== 'R_TREE') {
        continue;
      }

      if (component.ignoreChange) {
        continue;
      }

      let gridView = component.getActualComponent();

      if (gridView && Object.keys(gridView).length > 0) {
        gridView.cancel();
        gridView.commit(true);

        let dataProvider = gridView.getDataProvider();
        let statRows = dataProvider.getAllStateRows();

        let stats = Object.getOwnPropertyNames(statRows);
        for (let i = 0, n = stats.length; i < n; i++) {
          let stat = statRows[stats[i]];
          if (stat.length > 0) {
            returnValue = true;
          }
        }
      }
    }
  }
  return returnValue;
}

export function setGridContextMenu(gridView, { username, systemAdmin }, opneLayoutDlg, layoutDt) {
  if (layoutDt) {
    gridView.layoutInfos = layoutDt;
  }
  let psnl = JSON.parse(localStorage.getItem('personalization'));
  if (localStorage.getItem('personalization') === null) {
    localStorage.setItem('personalization', JSON.stringify({ grid: gridView.id, layout: 'default' }))
  }
  gridView.hideCancelChildren = [{ label: "ALL", tag: "COLUMN_HIDE_CANCEL_ALL", enabled: true }, { label: "-", tag: "" }];
  gridView.layouts = [{ label: 'default', tag: "LOAD_GRID_LAYOUT_DEFAULT", type: (psnl && psnl.layout !== 'default' ? 'normal' : 'check') }];
  gridView.dlayouts = [];

  let contextMenuItems = [
    { label: transLangKey("EXCEL_EXPORT"), tag: "EXCEL_EXPORT", enabled: true },
    { label: "-", tag: "" },
    { label: transLangKey("COLUMN_FIX"), tag: "COLUMN_FIX", enabled: true },
    { label: transLangKey("COLUMN_FIX_CANCEL"), tag: "COLUMN_FIX_CANCEL", enabled: true },
    { label: "-", tag: "" },
    { label: transLangKey("COLUMN_FILTER"), tag: "COLUMN_FILTER", enabled: true },
    { label: transLangKey("COLUMN_FILTER_CANCEL"), tag: "COLUMN_FILTER_CANCEL", enabled: true },
    { label: "-", tag: "" },
    { label: transLangKey("COLUMN_HIDE"), tag: "COLUMN_HIDE", enabled: true },
    { label: transLangKey("COLUMN_HIDE_CANCEL"), tag: "COLUMN_HIDE_CANCEL", enabled: true }
  ];

  if (!gridView.usingPrefInfo && !gridView.dynamic) {
    contextMenuItems.push({ label: "-", tag: "" })
    contextMenuItems.push({ label: transLangKey("SAVE_GRID_LAYOUT"), tag: "SAVE_GRID_LAYOUT", enabled: true })
    contextMenuItems.push({ label: transLangKey("DELETE_GRID_LAYOUT"), tag: "DELETE_GRID_LAYOUT", enabled: true })
  }

  if (opneLayoutDlg && !gridView.usingPrefInfo && !gridView.dynamic) {
    contextMenuItems.push({ label: transLangKey("LOAD_GRID_LAYOUT"), tag: "LOAD_GRID_LAYOUT", enabled: true })
    contextMenuItems.push({ label: transLangKey("ADD_GRID_LAYOUT"), tag: "ADD_GRID_LAYOUT", enabled: true })
  }

  gridView.contextMenuItems = contextMenuItems;
  gridView.setContextMenu(contextMenuItems);

  gridView.onContextMenuPopup = function (grid, x, y, clickData) {
    let contextMenuAcceptedArea = ["DataCell", "MergedDataCell", "FooterCell", "RowGroupHeaderCell", "GroupFooterCell", "RowGroupFootCell", "HeaderCell"];
    let contextMenuItems = grid.contextMenuItems;
    let dataProvider = grid.getDataSource();
    let index = grid.mouseToIndex(x, y);
    if (gridView.getVersion()[0].match(2)) {
      index = clickData != undefined ? clickData : index;
    }
    let customFilterColumns = [];
    grid.defaultLayout.forEach(function (col) {
      let column = grid.columnByName(col.columnId);
      if (col.type !== 'group') {
        let columnFilters = grid.getColumnFilters(column);
        if (columnFilters.length > 0) {
          let filterDescriptions = columnFilters.map(function (filter) {
            return filter.description;
          });
          if (filterDescriptions.indexOf("CONTEXT_MENU_FILTER") == -1) {
            customFilterColumns.push(column.name);
          }
        }
      }
    });

    contextMenuItems.forEach(function (item) {
      if (item.tag === 'EXCEL_EXPORT') {
        item.enabled = dataProvider.getRowCount() > 0;
      }
      if (item.tag === 'COLUMN_FIX_CANCEL') {
        item.enabled = grid.colFixed !== undefined && grid.colFixed;
      }
      if (item.tag === 'COLUMN_FILTER') {
        if (customFilterColumns.indexOf(index.column) != -1 || gridView.getColumnProperty(index.column, 'autoFilter') || gridView.getColumnFilters(index.column).length > 0) {
          item.enabled = false;
        } else {
          item.enabled = true;
        }
      }
      if (item.tag === 'COLUMN_FILTER_CANCEL') {
        grid.resetSize();

        if (grid.getColumnNames(true).includes(index.column)) {
          let columnFilters = grid.getColumnFilters(index.column);
          if (columnFilters !== null) {
            if (customFilterColumns.indexOf(index.column) != -1) {
              item.enabled = false;
            } else {
              item.enabled = columnFilters.length > 0;
            }
          } else {
            item.enabled = false;
          }
        } else {
          item.enabled = false;
        }
      }
      if (item.tag === 'COLUMN_HIDE_CANCEL') {
        if (grid.hidedColumnNames.length > 0) {
          item.children = grid.hideCancelChildren;
          item.enabled = true;
        } else {
          delete item.children;
          item.enabled = false;
        }
      }
      if (item.tag === 'SAVE_GRID_LAYOUT') {
        if (gridView.enableLayoutSaving) {
          item.enabled = true;
        } else {
          item.enabled = false;
        }
      }
      if (item.tag === 'LOAD_GRID_LAYOUT') {
        if (grid.layouts.length > 0) {
          item.children = grid.layouts;
          item.enabled = true;
        } else {
          delete item.children;
          item.enabled = false;
        }
      }
      if (item.tag === 'DELETE_GRID_LAYOUT') {
        if (grid.dlayouts.length > 0) {
          item.children = grid.dlayouts;
          item.enabled = true;
        } else {
          delete item.children;
          item.enabled = false;
        }
      }
    })

    gridView.setContextMenu(contextMenuItems);

    if (contextMenuAcceptedArea.includes(clickData)) {
      return true;
    }
  };

  gridView.onContextMenuItemClicked = function (grid, label, index) {
    if (gridView.getVersion()[0].match(2)) {
      if (index === undefined) {
        return;
      }
    }

    let column = grid.columnByName(index.column);
    let fixedOptions = grid.getFixedOptions();

    if (label.tag === "EXCEL_EXPORT") {
      exportGridtoExcel(grid, {})
    } else if (label.tag === "COLUMN_FIX") {
      // https://github.com/zionex/roadmap/issues/165 - 2nd issue
      if (grid.getVersion()[0].match(1)) {
        grid.getColumnNames(false, true).forEach(function (columnName) {
          let displayWidth = grid.getColumnProperty(columnName, "displayWidth");
          grid.setColumnProperty(columnName, "width", displayWidth);
        });
        let colCount = getDisplayIndex(grid, column, colCount);
        fixedOptions.colCount = colCount + 1;
        grid.setFixedOptions(fixedOptions);
        grid.colFixed = true;
      } else if (grid.getVersion()[0].match(2)) {
        //TODO: Removed from RealGrid version 2.5.0.
        grid.getColumnNames(true, true).forEach(function (columnName) {
          let displayWidth = grid.getColumnProperty(columnName, "displayWidth");
          grid.setColumnProperty(columnName, "layout", { cellWidth: displayWidth });
          grid.setColumnProperty(columnName, "width", displayWidth);
        });
        let columnLayout = grid.layoutByName(column.name);
        let colCount = getDisplayIndex(grid, columnLayout, colCount);
        fixedOptions.colCount = colCount + 1;
        grid.setFixedOptions(fixedOptions);
        grid.colFixed = true;
      }
    } else if (label.tag === "COLUMN_FIX_CANCEL") {
      fixedOptions.colCount = 0;
      grid.setFixedOptions(fixedOptions);
      grid.colFixed = false;
    } else if (label.tag === "COLUMN_FILTER") {
      setColumnFilter(grid, grid.getDataSource(), index.column);
    } else if (label.tag === "COLUMN_FILTER_CANCEL") {
      grid.clearColumnFilters(index.column);
    } else if (label.tag === "COLUMN_HIDE") {
      if (gridView.getVersion()[0].match(1)) {
        grid.setColumnProperty(column, 'visible', false);
        grid.hideCancelChildren.push({ label: column.header.text, tag: "COLUMN_HIDE_CANCEL_" + column.name });
        let parentVisible = false;
        if (column.parent) {
          let parent = grid.columnByName(column.parent);
          parent.columns.forEach(function (col) {
            if (col.visible) {
              parentVisible = true;
            }
          });
          if (!parentVisible) {
            grid.setColumnProperty(parent, "visible", false);
          }
        }

        if (grid.colFixed) {
          let fixedOptions = grid.getFixedOptions();
          if (getDisplayIndex(grid, column, column.displayIndex) <= fixedOptions.colCount - 1) {
            if (column.parent) {
              if (!parentVisible) {
                fixedOptions.colCount = fixedOptions.colCount - 1;
              }
            } else {
              fixedOptions.colCount = fixedOptions.colCount - 1;
            }
            grid.setFixedOptions(fixedOptions);
          }
        }
      } else if (gridView.getVersion()[0].match(2)) {
        grid.columnByName(column.name).visible = false;
        grid.hideCancelChildren.push({ label: column.displayText, tag: "COLUMN_HIDE_CANCEL_" + column.name });

        if (grid.colFixed) {
          let fixedOptions = grid.getFixedOptions();
          let columnLayout = grid.layoutByName(column.name);
          if (getDisplayIndex(grid, columnLayout, column.displayIndex) <= fixedOptions.colCount - 1) {
            let columnLayout = grid.layoutByName(column.name);
            if (!columnLayout.isRoot) {
              let parentVisible = false;
              columnLayout.parent.items.forEach(function (layout) {
                let col = grid.columnByName(layout.column);
                if (col.visible) {
                  parentVisible = true;
                }
              });
              if (!parentVisible) {
                fixedOptions.colCount = fixedOptions.colCount - 1;
              }
            } else {
              fixedOptions.colCount = fixedOptions.colCount - 1;
            }
            grid.setFixedOptions(fixedOptions);
          }
        }
      }

      grid.hidedColumnNames.push(column.name);
    }
    else if (label.tag.includes("COLUMN_HIDE_CANCEL_")) {
      if (label.tag === "COLUMN_HIDE_CANCEL_ALL") {
        grid.hidedColumnNames.forEach(function (colname) {
          grid.setColumnProperty(colname, 'visible', true);
          if (gridView.getVersion()[0].match(1)) {
            let parent = grid.columnByName(colname).parent;
            if (parent) {
              if (!parent.visible) {
                grid.setColumnProperty(parent, "visible", true);
              }
            }
          }
        });

        grid.hidedColumnNames = [];
        grid.hideCancelChildren = [{ label: "ALL", tag: "COLUMN_HIDE_CANCEL_ALL", enabled: true }, { label: "-", tag: "" }];
      } else {
        let name = label.tag.replace("COLUMN_HIDE_CANCEL_", "");

        grid.setColumnProperty(name, 'visible', true);
        if (gridView.getVersion()[0].match(1)) {
          let parent = grid.columnByName(name).parent;
          if (parent) {
            if (!parent.visible) {
              grid.setColumnProperty(parent, "visible", true);
            }
          }
        }
        let inx = grid.hideCancelChildren.findIndex(function (item) {
          return item.tag.includes(name)
        });
        grid.hideCancelChildren.splice(inx, 1)
        grid.hidedColumnNames.splice(grid.hidedColumnNames.indexOf(name), 1);
      }
    } else if (label.tag === "SAVE_GRID_LAYOUT") {
      addGridLayout(gridView, { username, systemAdmin }, { layoutName: JSON.parse(localStorage.getItem('personalization')).layout })
    } else if (label.tag === "ADD_GRID_LAYOUT") {
      if (opneLayoutDlg) {
        opneLayoutDlg(true)
      }
    } else if (label.tag.includes("LOAD_GRID_LAYOUT_")) {
      let labelName = label.label;
      loadGridLayout(gridView, username, labelName)

      localStorage.setItem('personalization', JSON.stringify({ grid: gridView.id, layout: labelName }))
      gridView.layouts.forEach(la => {
        if (la.label.includes(labelName)) {
          la.label = labelName;
          la.type = 'check';
        } else {
          la.type = 'normal';
        }
      })
    } else if (label.tag.includes("DELETE_GRID_LAYOUT_")) {
      let labelName = label.tag.replace("DELETE_GRID_LAYOUT_", "");
      deleteGridLayout(gridView, username, labelName)
    }
  };
}

export function setColumnFilter(gridView, dataProvider, columnId) {
  // gridView.onFilteringChanged = null;
  let filters = [];
  let column = gridView.columnByName(columnId);

  let columnDataType = dataProvider.fieldByName(columnId).dataType.toUpperCase();

  if (columnDataType === "BOOLEAN") {
    filters = [
      { name: 'true', criteria: 'value', description: "CONTEXT_MENU_FILTER" },
      { name: 'false', criteria: 'not value', description: "CONTEXT_MENU_FILTER" }
    ];
  } else {
    let filterValues = [];
    let filterObj = {};

    let itemCount = gridView.getItemCount();
    let displayCallback = gridView.getColumnProperty(columnId, "displayCallback");
    let dropDownColumn = false;
    if (column.editor != undefined) {
      if (column.editor === "dropDown") {
        dropDownColumn = true;
      }
      if (column.editor.hasOwnProperty("type")) {
        if (column.editor.type === "list") {
          dropDownColumn = true;
        }
      }
    }
    for (let i = 0; i < itemCount; i++) {
      if (gridView.getDataRow(i) !== -1) {
        let value;
        if (displayCallback != undefined || columnDataType == "NUMBER" || dropDownColumn) {
          let originalValue = gridView.getValue(i, columnId);
          value = gridView.getDisplayValues(i)[columnId];
          filterObj[originalValue] = value;
        } else {
          value = gridView.getValue(i, columnId);
        }
        filterValues.push(value);
      }
    }

    filterValues = filterValues.unique();

    if (filterValues.includes(null) || filterValues.includes(undefined) || filterValues.includes('')) {
      filters.push({
        name: 'No Value',
        criteria: 'value is empty'
      });
    }

    if (NUMBER_DATA_TYPE.includes(columnDataType)) {
      let temp = [];
      for (let tempIdx = 0, filterValuesLen = filterValues.length; tempIdx < filterValuesLen; tempIdx++) {
        if (!isNaN(Number(filterValues[tempIdx]))) {
          temp.push(Number(filterValues[tempIdx]));
        }
      }
      filterValues = temp;
      filterValues = filterValues.sort(function sortNumber(a, b) {
        return a - b;
      });
    } else {
      filterValues = filterValues.sort();
    }

    for (let i = 0, len = filterValues.length; i < len; i++) {
      let filterValue = filterValues[i];
      let filterText = filterValue;

      if (columnDataType === "DATETIME") {
        let datetimeFormat = "yyyy/MM/dd";
        if (gridView.getVersion()[0].match(1)) {
          if (column.styles.datetimeFormat != undefined) {
            datetimeFormat = column.styles.datetimeFormat;
          }
        } else if (gridView.getVersion()[0].match(2)) {
          if (column.datetimeFormat != undefined) {
            datetimeFormat = column.datetimeFormat;
          }
        }
        filterText = new Date(filterValue).format(datetimeFormat);
      }

      let condition;
      if (displayCallback != undefined || columnDataType === "NUMBER" || dropDownColumn) {
        let conditionValues = [];
        Object.keys(filterObj).forEach(function (key) {
          if (filterObj[key] == filterValue) {
            conditionValues.push("(value=" + '\'' + key + '\'' + ")");
          }
        });
        condition = conditionValues.join("or");
      }

      if (filterValue !== null && filterValue !== undefined) {
        let defaultCondition = 'value=' + '\'' + filterValue + '\'';
        filters.push({
          name: filterValue.toString(),
          text: filterText.toString(),
          criteria: condition != undefined ? condition : defaultCondition,
          description: "CONTEXT_MENU_FILTER"
        });
      }
    }
  }

  gridView.setColumnFilters(columnId, filters);
  gridView.setFilteringOptions({ selector: { searchIgnoreCase: true, allCheckText: transLangKey("ALL_SELECT"), filtersResetText: transLangKey("RESET_FILTERING"), searchPlaceholder: transLangKey("SEARCH") } });

}

function array_diff(a, b) {
  return a.filter(function (x) {
    return b.indexOf(x) < 0
  });
}
export function addGridLayout(gridView, userinfo, opts) {
  let layoutProps = [];

  if (gridView.getVersion()[0].match(1)) {
    gridView.getColumnNames().forEach(function (columnName) {
      let column = gridView.columnByName(columnName);
      let rowData = {};

      let name = column["name"];
      rowData["columnId"] = name;
      rowData["columnNm"] = column.header.text;
      rowData["visibleYn"] = gridView.getColumnProperty(name, "visible"); //visiable
      rowData["fixCnt"] = gridView.getFixedOptions()["colCount"]; //fix
      if (column["type"] === "data") {
        rowData["filter"] = gridView.isFiltered(name) ? gridView.getColumnFilters(name) : null;
      } else {
        rowData["filter"] = null;
      }
      rowData["width"] = gridView.getColumnProperty(name, "width"); //visiable
      rowData["seq"] = gridView.getColumnProperty(name, "displayIndex");

      layoutProps.push(rowData);
    });
  } else if (gridView.getVersion()[0].match(2)) {
    gridView.getColumns().forEach(function (column) {
      let rowData = {};

      let name = column["name"];
      rowData["columnId"] = name;
      rowData["columnNm"] = column.header.text;
      rowData["visibleYn"] = gridView.columnByName(name).visible;
      rowData["fixCnt"] = gridView.getFixedOptions()["colCount"];
      rowData["filter"] = gridView.isFiltered(name) ? gridView.getColumnFilters(name) : null;
      rowData["width"] = gridView.layoutByName(name).cellWidth;
      rowData["seq"] = gridView.layoutByColumn(name).vindex;

      layoutProps.push(rowData);
    });
  }
  layoutProps.push({ layout: gridView.saveColumnLayout() })
  axios
    .post(baseURI() + "system/users/grid-layouts", {
      username: userinfo.username,
      menuCode: vom.active,
      gridCode: gridView.id,
      layoutName: opts.layoutName,
      layoutType: 'layout',
      allUser: (userinfo.systemAdmin && opts.allUser ? 'Y' : 'N'),
      gridLayout: JSON.stringify(layoutProps)
    }
    ).then(function (res) {
      //현재 레이아웃을 저장했습니다.
      showToast(transLangKey(res.data.message), 2000);

      if (!gridView.layouts.find(la => la.label === opts.layoutName)) {
        gridView.layouts.push({ label: opts.layoutName, tag: "LOAD_GRID_LAYOUT_" + opts.layoutName, type: 'normal' });
      }

      if (!gridView.dlayouts.find(la => la.label === opts.layoutName)) {
        gridView.dlayouts.push({ label: opts.layoutName, tag: "DELETE_GRID_LAYOUT_" + opts.layoutName, type: 'normal' });
      }

      //레이아웃 로드
      // loadGridLayout(gridView, username)
    }).catch(function (err) {
      showMessage(transLangKey('WARNING'), transLangKey(err.response.data.message), { close: false });
    })
}
function saveGridLayout(gridView, username) {
  let layoutProps = [];

  if (gridView.getVersion()[0].match(1)) {
    gridView.getColumnNames().forEach(function (columnName) {
      let column = gridView.columnByName(columnName);
      let rowData = {};

      let name = column["name"];
      rowData["columnId"] = name;
      rowData["columnNm"] = column.header.text;
      rowData["visibleYn"] = gridView.getColumnProperty(name, "visible"); //visiable
      rowData["fixCnt"] = gridView.getFixedOptions()["colCount"]; //fix
      if (column["type"] === "data") {
        rowData["filter"] = gridView.isFiltered(name) ? gridView.getColumnFilters(name) : null;
      } else {
        rowData["filter"] = null;
      }
      rowData["width"] = gridView.getColumnProperty(name, "width"); //visiable
      rowData["seq"] = gridView.getColumnProperty(name, "displayIndex");

      layoutProps.push(rowData);
    });
  } else if (gridView.getVersion()[0].match(2)) {
    gridView.getColumns().forEach(function (column) {
      let rowData = {};

      let name = column["name"];
      rowData["columnId"] = name;
      rowData["columnNm"] = column.header.text;
      rowData["visibleYn"] = gridView.columnByName(name).visible;
      rowData["fixCnt"] = gridView.getFixedOptions()["colCount"];
      rowData["filter"] = gridView.isFiltered(name) ? gridView.getColumnFilters(name) : null;
      rowData["width"] = gridView.layoutByName(name).cellWidth;
      rowData["seq"] = gridView.layoutByColumn(name).vindex;

      layoutProps.push(rowData);
    });
  }
  layoutProps.push({ layout: gridView.saveColumnLayout() })
  axios
    .post(baseURI() + "system/users/grid-layouts", {
      username: username,
      menuCode: vom.active,
      gridCode: gridView.id,
      gridLayout: JSON.stringify(layoutProps)
    }
    ).then(function (res) {
      //현재 레이아웃을 저장했습니다.
      showToast(transLangKey('MSG_SAVE_GRID_LAYOUT'), 2000);
    })
}

export function loadGridLayout(gridView, username, layoutName = '') {
  if (layoutName === 'default') {
    resetGridLayout(gridView)
  } else {
    axios.get(baseURI() + "system/users/grid-layouts", {
      params: {
        username: username,
        menuCode: vom.active,
        gridCode: gridView.id,
        layoutType: 'layout',
        layoutName: layoutName
      }
    }).then(function (response) {
      if (gridView.getVersion()[0].match(1)) {
        let resData = response.data;
        resData.forEach(function (column, inx) {
          gridView.setColumnProperty(column.columnId, "displayIndex", column.seq);
          gridView.setColumnProperty(column.columnId, "visible", column.visibleYn);
          if (!column.visibleYn) {
            if (!gridView.initHiddenColumn.includes(column.columnId)) {
              gridView.hidedColumnNames.push(column.columnId);
              gridView.hideCancelChildren.push({ label: column.columnNm, tag: "COLUMN_HIDE_CANCEL_" + column.columnId })
            }
          }
          gridView.setColumnProperty(column.columnId, "width", column.width);
          if (column.filter !== null && column.filter.length > 0) {
            gridView.setColumnFilters(column.columnId, column.filter);
          }
        })
        if (resData[0].fixCnt > 0) {
          gridView.setFixedOptions({ colCount: resData[0].fixCnt });
          gridView.colFixed = true;
        }
      } else if (gridView.getVersion()[0].match(2)) {
        let decodeData = response.data;

        //레이아웃명 null이 아닐 경우
        if (layoutName !== '') {
          if (decodeData.allUser === 'Y') {
            gridView.enableLayoutSaving = false;
          } else {
            gridView.enableLayoutSaving = true;
          }
          JSON.parse(decodeData.gridLayout).filter(v => !v.layout).forEach((column, inx) => {
            gridView.layoutByColumn(column.columnId).vindex = column.seq;

            if (inx === 0 && column.fixCnt > 0) {
              gridView.setFixedOptions({ colCount: column.fixCnt });
              gridView.colFixed = true;
            }
            gridView.columnByName(column.columnId).visible = column.visibleYn;
            if (!column.visibleYn) {
              if (!gridView.initHiddenColumn.includes(column.columnId)) {
                gridView.hidedColumnNames.push(column.columnId);
                gridView.hideCancelChildren.push({ label: column.columnNm, tag: "COLUMN_HIDE_CANCEL_" + column.columnId })
              }
            }
            if (column.filter !== null && column.filter.length > 0) {
              gridView.setColumnProperty(column.columnId, "autoFilter", false);
              gridView.setColumnFilters(column.columnId, column.filter);
            }
            gridView.layoutByName(column.columnId).cellWidth = column.width;

            if (Object.keys(column).includes("layout")) {
              column.layout.forEach(v => {
                gridView.setColumnLayout(v.layout)
              })
            }
          })
        }
      }
    })
  }
}

export function saveDefaultLayout(gridView, gridId) {
  gridView.hidedColumnNames = [];
  gridView.initHiddenColumn = [];
  gridView.defaultLayout = [];
  gridView.id = gridId;

  gridView.defaultColumnLayout = gridView.saveColumnLayout();

  if (gridView instanceof TreeView) {
    gridView.getColumns().forEach(function (column) {
      let rowData = {};

      let name = column["name"];
      rowData["columnId"] = name;
      rowData["columnNm"] = column.header.text;
      rowData["visibleYn"] = gridView.getColumnProperty(name, "visible");
      if (!gridView.getColumnProperty(name, "visible")) {
        gridView.initHiddenColumn.push(name);
      }
      rowData["fixCnt"] = gridView.getFixedOptions()["colCount"];
      rowData["filter"] = column["type"] === "data" ? gridView.getFilters(name) : null;
      rowData["width"] = gridView.getColumnProperty(name, "width");
      rowData["seq"] = gridView.getColumnProperty(name, "displayIndex");
      rowData["layout"] = gridView.layoutByName(name);

      gridView.defaultLayout.push(rowData);
    });
  } else {
    if (gridView.getVersion()[0].match(1)) {
      //console.log("RealGridJs")
      gridView.getColumnNames().forEach(function (columnName) {
        let column = gridView.columnByName(columnName);
        let rowData = {};

        let name = column["name"];
        rowData["columnId"] = name;
        rowData["columnNm"] = column.header.text;
        rowData["visibleYn"] = gridView.getColumnProperty(name, "visible");
        rowData["fixCnt"] = gridView.getFixedOptions()["colCount"];
        rowData["filter"] = column["type"] === "data" ? gridView.getColumnFilters(name) : null;
        rowData["width"] = gridView.getColumnProperty(name, "width");
        rowData["seq"] = gridView.getColumnProperty(name, "displayIndex");
        rowData["type"] = column.type;

        gridView.defaultLayout.push(rowData);
      });
    } else if (gridView.getVersion()[0].match(2)) {
      //console.log("RealGrid2")
      gridView.getColumns().forEach(function (column) {
        let rowData = {};

        let name = column["name"];
        rowData["columnId"] = name;
        rowData["columnNm"] = column.header.text;
        rowData["visibleYn"] = gridView.getColumnProperty(name, "visible");
        if (!gridView.getColumnProperty(name, "visible")) {
          gridView.initHiddenColumn.push(name);
        }
        rowData["fixCnt"] = gridView.getFixedOptions()["colCount"];
        rowData["filter"] = column["type"] === "data" ? gridView.getFilters(name) : null;
        rowData["width"] = gridView.getColumnProperty(name, "width");
        rowData["seq"] = gridView.getColumnProperty(name, "displayIndex");

        gridView.defaultLayout.push(rowData);
      });
    }
  }

}
function deleteGridLayout(gridView, username, layoutName) {
  let customFilterColumns = [];
  gridView.getColumnNames(true).forEach(function (columnName) {
    let column = gridView.columnByName(columnName);
    if (column.type !== 'group') {
      let columnFilters = gridView.getColumnFilters(column);
      if (columnFilters.length > 0) {
        let filterDescriptions = columnFilters.map(function (filter) {
          return filter.description;
        });
        if (filterDescriptions.indexOf("CONTEXT_MENU_FILTER") == -1) {
          customFilterColumns.push(column.name);
        }
      }
    }
  });
  if (gridView.getVersion()[0].match(1)) {
    gridView.defaultLayout.forEach(function (column, inx) {
      gridView.setColumnProperty(column.columnId, "displayIndex", column.seq);
      gridView.setColumnProperty(column.columnId, "visible", column.visibleYn);
      gridView.setColumnProperty(column.columnId, "width", column.width);
      if (column.filter !== null && column.filter.length > 0) {
        gridView.setColumnFilters(column.columnId, column.filter);
      } else if (column.filter !== null && column.filter.length == 0) {
        if (customFilterColumns.indexOf(column.columnId) == -1) {
          gridView.clearColumnFilters(column.columnId);
        }
      }
    })
    gridView.setFixedOptions({ colCount: gridView.defaultLayout[0].fixCnt });

    gridView.hidedColumnNames = [];
    gridView.colFixed = false;

  } else if (gridView.getVersion()[0].match(2)) {
    gridView.defaultLayout.forEach(function (column, inx) {
      gridView.columnByName(column.columnId).visible = column.visibleYn;
      if (customFilterColumns.indexOf(column.columnId) == -1) {
        gridView.clearColumnFilters(column.columnId);
      }
      gridView.layoutByName(column.columnId).cellWidth = column.width;
    })
    gridView.setFixedOptions({ colCount: gridView.defaultLayout[0].fixCnt });

    gridView.hidedColumnNames = [];
    gridView.colFixed = false;

  }

  axios({
    method: "post",
    headers: { "content-type": "application/json" },
    url: baseURI() + "system/users/grid-layouts/delete",
    params: {
      username: username,
      menuCode: vom.active,
      gridCode: gridView.id,
      layoutType: 'layout',
      layoutName: layoutName
    }
  }).then(function (res) {
    //레이아웃을 삭제했습니다.
    showToast(transLangKey('MSG_DELETE_GRID_LAYOUT'), 2000);

    gridView.dlayouts = gridView.dlayouts.filter(dl => { return dl.label !== layoutName })
    gridView.layouts = gridView.layouts.filter(l => { return l.label !== layoutName })

  }).catch(function (err) {
    showToast(transLangKey('MSG_FAIL_DELETE_GRID_LAYOUT'), "error", 2000);
  }).then(function () {
    gridView.defaultLayout.forEach(function (column, inx) {
      if (gridView.getVersion()[0].match(1)) {
        gridView.setColumnProperty(column.columnId, "displayIndex", column.seq);
      } else if (gridView.getVersion()[0].match(2)) {
        if (!gridView.layout) {
          gridView.layoutByColumn(column.columnId).vindex = column.seq;
        }
      }
    })
    if (gridView.layout && gridView.getVersion()[0].match(2)) {
      gridView.setColumnLayout(gridView.layout)
    }
  });
}

function resetGridLayout(gridView) {
  let customFilterColumns = [];
  gridView.getColumnNames(true).forEach(function (columnName) {
    let column = gridView.columnByName(columnName);
    if (column.type !== 'group') {
      let columnFilters = gridView.getColumnFilters(column);
      if (columnFilters.length > 0) {
        let filterDescriptions = columnFilters.map(function (filter) {
          return filter.description;
        });
        if (filterDescriptions.indexOf("CONTEXT_MENU_FILTER") == -1) {
          customFilterColumns.push(column.name);
        }
      }
    }
  });
  if (gridView.getVersion()[0].match(1)) {
    gridView.defaultLayout.forEach(function (column, inx) {
      gridView.setColumnProperty(column.columnId, "displayIndex", column.seq);
      gridView.setColumnProperty(column.columnId, "visible", column.visibleYn);
      gridView.setColumnProperty(column.columnId, "width", column.width);
      if (column.filter !== null && column.filter.length > 0) {
        gridView.setColumnFilters(column.columnId, column.filter);
      } else if (column.filter !== null && column.filter.length == 0) {
        if (customFilterColumns.indexOf(column.columnId) == -1) {
          gridView.clearColumnFilters(column.columnId);
        }
      }
    })
    gridView.setFixedOptions({ colCount: gridView.defaultLayout[0].fixCnt });

    gridView.hidedColumnNames = [];
    gridView.colFixed = false;

  } else if (gridView.getVersion()[0].match(2)) {
    gridView.defaultLayout.forEach(function (column, inx) {
      gridView.columnByName(column.columnId).visible = column.visibleYn;
      if (customFilterColumns.indexOf(column.columnId) == -1) {
        gridView.clearColumnFilters(column.columnId);
      }
      gridView.layoutByName(column.columnId).cellWidth = column.width;
    })
    gridView.setFixedOptions({ colCount: gridView.defaultLayout[0].fixCnt });

    gridView.hidedColumnNames = [];
    gridView.colFixed = false;
  }
}

export function exportGridtoExcel(gridView, options) {
  if (gridView.isFiltered()) {
    showMessage(transLangKey('MSG_GRID_EXPORT_01'), transLangKey('MSG_GRID_EXPORT_02'), function (answer) {
      if (answer) {
        exportFilteringExcel(gridView, options, true)
      } else {
        exportFilteringExcel(gridView, options, false)
      }
    })
  } else {
    exportFilteringExcel(gridView, options, false)
  }
}

function exportFilteringExcel(gridView, options, exportAll) {
  let dataProvider = gridView.getDataSource();

  let bindingFields = {};
  let fieldTypes = {};
  let activatedColumnFilters = {};

  let headerDepth = options.headerDepth;
  if (headerDepth === undefined) {
    headerDepth = 1;
  }
  let fileName = options.fileName;
  if (fileName === undefined) {
    let dateString = new Date().toCurrentDateString();
    dateString = dateString.replace(/\:/g, '-').replace('.', '-').replace(' ', '-');
    fileName = transLangKey(vom.active) + '_' + gridView.id + '_' + dateString + ".xlsx"
  }
  let footer = options.footer;
  if (footer === undefined) {
    footer = "default";
  }
  let allColumns = options.allColumns;
  if (allColumns === undefined) {
    allColumns = false;
  }
  let lookupDisplay = options.lookupDisplay;
  if (lookupDisplay === undefined) {
    lookupDisplay = false;
  }
  let separateRows = options.separateRows;
  if (separateRows === undefined) {
    separateRows = false;
  }
  let importExceptFields = options.importExceptFields;
  if (importExceptFields === undefined) {
    importExceptFields = {};
  }


  const fieldNames = dataProvider.getFields().map(a => { return a.orgFieldName });
  for (let i = 0, n = fieldNames.length; i < n; i++) {
    let fieldName = fieldNames[i];

    bindingFields[i] = fieldName;
    fieldTypes[i] = dataProvider.fieldByName(fieldName).dataType;

    if (exportAll) {
      let column = gridView.columnByField(fieldName);
      let columnFilters = gridView.getColumnFilters(column);
      if (columnFilters && columnFilters.length > 0) {
        activatedColumnFilters[column.name] = gridView.getActiveColumnFilters(column, true);
        gridView.onFilteringChanged = null;
        gridView.activateAllColumnFilters(column, false);
      }
    }
  }

  let dataBeginIdx = headerDepth + 1;
  let bindingInfo = {
    BINDING_FIELDS: bindingFields,
    FIELD_TYPES: fieldTypes,
    DATA_BEGIN_IDX: dataBeginIdx,
    IMPORT_EXCEPT_FIELDS: importExceptFields,
    CATEGORY_LANG: {}
  };
  gridView.exportGrid({
    type: "excel",
    target: "local",
    fileName: fileName,
    indicator: 'hidden',
    header: 'default',
    footer: footer,
    linear: false,
    showProgress: true,
    progressMessage: "Export to Excel.",
    compatibility: true,
    allItems: true,
    allColumns: allColumns,
    lookupDisplay: lookupDisplay,
    applyDynamicStyles: true,
    separateRows: separateRows,
    documentTitle: {
      message: JSON.stringify(bindingInfo),
      visible: true,
      styleName: 'realgrid-document-title',
      spaceTop: 0,
      spaceBottom: 0,
      height: 1
    },
    done: function () {
      let filteredColumnIds = Object.keys(activatedColumnFilters);
      if (exportAll && filteredColumnIds.length > 0) {
        for (let i = 0, filteredColumnIdsLen = filteredColumnIds.length; i < filteredColumnIdsLen; i++) {
          let filteredColumnId = filteredColumnIds[i];
          let filteredItems = activatedColumnFilters[filteredColumnId];
          let filteredItemsLen = filteredItems.length;
          if (filteredItems && filteredItemsLen > 0) {
            let filterNames = [];
            for (let j = 0; j < filteredItemsLen; j++) {
              let filterItem = filteredItems[j];
              filterNames.push(filterItem['name']);
            }
            gridView.activateColumnFilters(gridView.columnByName(filteredColumnId), filterNames, true);
          }
        }
      }
    }
  })
}

function getDisplayIndex(grid, column, displayIndex) {
  if (grid.getVersion()[0].match(1)) {
    if (column.parent !== null) {
      column = grid.columnByName(column.parent);
      displayIndex = getDisplayIndex(grid, column, displayIndex);
    } else {
      displayIndex = column.displayIndex;
    }
  } else if (grid.getVersion()[0].match(2)) {
    if (column.isRoot) {
      if (column.hasOwnProperty("items")) {
        displayIndex = column.index;
      } else {
        displayIndex = column.vindex;
      }
    } else {
      column = column.parent;
      displayIndex = getDisplayIndex(grid, column, displayIndex);
    }
  }
  return displayIndex;
}

export function setColorPickerRenderer(gridView, columnName) {
  const colorPickerRenderer = 'colorPickerRenderer';
  if (!gridView.existsCustomRenderer(colorPickerRenderer)) {
    gridView.registerCustomRenderer(colorPickerRenderer, {
      initContent: function (parent) {
        let input = this._input = document.createElement('input');
        input.type = 'hidden';
        parent.appendChild(input);
      },
      render: function (grid, model, width, height, info) {
        const topItem = grid.getTopItem();
        let pickerPosition;
        if (model.index.itemIndex < topItem + 5) {
          pickerPosition = 'bottom'
        } else {
          pickerPosition = 'top left'
        }
        let input = this._input;
        $(input).minicolors && $(input).minicolors({
          control: input.getAttribute('data-control') || 'hue',
          format: input.getAttribute('data-format') || 'hex',
          inline: input.getAttribute('data-inline') === 'true',
          letterCase: input.getAttribute('data-letterCase') || 'lowercase',
          opacity: false,
          position: input.getAttribute('data-position') || pickerPosition,
          change: function (hex, opacity) {
            if (!hex) {
              return;
            }
            const index = grid.getIndexOfElement(this);
            if (index) {
              const itemIndex = index.itemIndex;
              grid.setValue(itemIndex, index.fieldIndex, hex);
              grid.commit(true);
            }
          }
        });
        if (model.value != null) {
          if (model.value !== this._input.value) {
            this._input.value = model.value;
            $(this._input).minicolors("value", model.value);
          }
        } else {
          $(this._input).minicolors("value", null);
        }
      },
      clearContent: function (parent) {
        $(this._input).minicolors('destroy');
        parent.innerHTML = '';
      }
    });
  }
  gridView.setColumnProperty(columnName, 'renderer', colorPickerRenderer);
}

export function setVisibleProps(targetGrid, indicatorVisible, stateBarVisible, checkBarVisible) {
  targetGrid.gridView.setRowIndicator({ visible: indicatorVisible });
  targetGrid.gridView.setStateBar({ visible: stateBarVisible });
  targetGrid.gridView.setCheckBar({ visible: checkBarVisible });
}


export const loadCrossTabInfo = async (viewCd, grpCd, userName) => {
  if (!viewCd || !userName)
    return;

  let retData = null;
  let param = {
    'view-cd': viewCd,
    //'grp-cd': grpCd || 'COMMON',
    username: userName || ''
  }
  await zAxios({
    method: 'get',
    header: { 'content-type': 'application/json' },
    url: 'system/users/preferences/crosstab-info',
    params: param
  })
    .then(function (res) {
      retData = res.data
    })
    .catch(function (err) {
      console.log(err);
    })
  return retData;
}

export const loadPrefInfo = async (viewCd, grpCd, userName) => {
  if (!viewCd || !userName)
    return;

  let retData = null;
  let param = {
    'view-cd': viewCd,
    //'grp-cd': grpCd || 'COMMON',
    username: userName || ''
  }
  await zAxios({
    method: 'get',
    header: { 'content-type': 'application/json' },
    url: 'system/users/preferences/pref-info',
    params: param
  })
    .then(function (res) {
      retData = res.data
      //setGridPreferenceInfo(grid.gridView, res.data)
    })
    .catch(function (err) {
      console.log(err);
    })
  return retData;
}

export const loadCrossTabInfoAndPrefInfo = async (viewCd, userName) => {
  let grpCd = '';
  //이넘은 grpCd에 대한 ID를 넘겨야 함.
  const crossTabInfo = await loadCrossTabInfo(viewCd, grpCd, userName);
  const prefInfo = await loadPrefInfo(viewCd, grpCd, userName);

  return { prefInfo: prefInfo, crossTabInfo: crossTabInfo }
}