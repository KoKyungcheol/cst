import React, { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { ButtonGroup } from "@mui/material";
import {
  ContentInner, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea,
  TreeGrid, GridSaveButton, GridAddRowButton, GridDeleteRowButton, useViewStore
} from "@zionex/imports";
import IconPicker from "../../common/IconPicker";
import "./menu.css";

function Menu() {
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo])
  const [menuGrid, setMenuGrid] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(0);

  useEffect(() => {
    setMenuGrid(getViewInfo(vom.active, 'menuGrid'))
  }, [viewData])
  useEffect(() => {
    if (menuGrid) {
      setGridFieldAndColumn(menuGrid.dataProvider, menuGrid.gridView);
      if (menuGrid.dataProvider) {
        loadData();
      }
    }
  }, [menuGrid])

  const { formState: { errors }, clearErrors } = useForm({
    defaultValues: {
      langCd: 'all'
    }
  });
  function setGridFieldAndColumn(dataProvider, gridView) {
    dataProvider.setOptions({ restoreMode: "auto" });
    gridView.setFooters({ visible: false });
    gridView.setCheckBar({ visible: true });
    gridView.setDisplayOptions({
      showEmptyMessage: true,
      emptyMessage: transLangKey('MSG_NO_DATA'),
      fitStyle: "evenFill",
      showChangeMarker: false,
      useFocusClass: true,
      columnMovable: false
    });
    gridView.setEditOptions({
      movable: true,
      rowMovable: true
    });

    gridView.setContextMenu([
      { label: transLangKey("INSERT_MENU") },
      { label: transLangKey("INSERT_UI") }
    ]);

    let fields = [
      { fieldName: "id" },
      { fieldName: "menuNm" },
      { fieldName: "parentId" },
      { fieldName: "path" },
      { fieldName: "type" },
      { fieldName: "seq", dataType: "number" },
      { fieldName: "usable", dataType: "boolean" },
      { fieldName: "icon" },
      { fieldName: "insertFlag" }
    ]

    let columns = [
      {
        name: "id", fieldName: "id",
        header: { text: transLangKey("MENU_ID") },
        editable: false, width: 150,
        styleCallback: function (gird, dataCell) {
          let ret = {};
          let rowState = dataProvider.getRowState(dataCell.index.dataRow)
          if (rowState === "created") {
            ret.editable = true;
            ret.styleName = 'editable-text-column';
          } else {
            ret.styleName = 'text-column';
          }
          return ret;
        }
      },
      {
        name: "id", fieldName: "id",
        header: { text: transLangKey("MENU_NM") },
        width: 150, editable: false,
        styleName: "text-column",
        displayCallback: function (grid, index, value) {
          return transLangKey(value);
        }
      },
      {
        name: "parentId", fieldName: "parentId",
        header: { text: transLangKey("MENU_PARENT_ID") },
        styleName: "text-column",
        width: 150, visible: false, editable: false,
        styleCallback: function (gird, dataCell) {
          let ret = {};
          if (!dataCell.value || dataCell.value.length === 0) {
            ret.editable = false;
            ret.styleName = '';
            return ret;
          }
        },
        displayCallback: function (grid, index, value) {
          return transLangKey(value);
        }
      },
      {
        name: "path", fieldName: "path",
        header: { text: transLangKey("MENU_PATH") },
        styleCallback: function (gird, dataCell) {
          let ret = {}

          if (dataCell.dataColumn.editable) {
            ret.styleName = 'editable-text-column';
          }

          if (dataCell.value === null) {
            ret.styleName = '';
            ret.editable = false;
          }

          return ret;
        },
        width: 200, editable: true
      },
      {
        name: "type", fieldName: "type",
        header: { text: transLangKey("MENU_VIEWCONFIG_YN") },
        width: 50, editable: false,
        renderer: {
          type: "check",
          editable: true,
          trueValues: "viewconfig",
          falseValues: "false"
        },
        styleCallback: function (grid, dataCell) {
          let styles = {}
          let parentId = grid.getValue(dataCell.index.itemIndex, "parentId");
          let insertFlag = grid.getValue(dataCell.index.itemIndex, "insertFlag");

          if (parentId === null || insertFlag === "R") {
            styles.styleName = '';
            styles.editable = false;
            styles.readonly = true;
          } else if (parentId !== null && insertFlag === "M") {
            styles.styleName = '';
            styles.editable = false;
            styles.readonly = true;
          } else {
            styles.readonly = false;
            styles.styleName = 'editable-column';
          }

          return styles;
        }
      },
      {
        name: "seq", fieldName: "seq",
        width: 50, editable: true,
        header: { text: transLangKey("MENU_SEQ") },
        styleName: "editable-number-column",
        numberFormat: "#,##0.###"
      },
      {
        name: "usable", fieldName: "usable",
        header: { text: transLangKey("USE_YN") },
        width: 50, editable: false,
        renderer: {
          type: "check",
          editable: true,
        },
        styleCallback: function () {
          let style = {};
          style.styleName = 'editable-column';

          return style;
        }
      },
      {
        name: "icon", fieldName: "icon",
        header: { text: transLangKey("MENU_ICON") },
        width: 100, editable: false,
        button: "action",
        styleCallback: function (grid, dataCell) {
          let res = {}
          if (dataCell.item.rowState == 'inserting' || dataCell.item.itemState == 'appending') {
            res.editable = true;
            res.styleName = 'editable-text-column';
          } else if (dataCell.item.itemState == 'created') {
            if (grid.getInvalidCells().length > 0) {
              res.editable = false;
            } else {
              res.editable = true;
            }
          } else {
            res.editable = false;
          }
          return res;
        },
        renderer: {
          type: "html",
          inputFocusable: true,
          callback: function (grid, cell, w, h) {
            let icon = ''
            if (cell.value !== undefined) {
              let iconNm = cell.value;
              if (iconNm !== null) {
                iconNm = cameCaseToHyphen(iconNm)
                if (feather.icons[iconNm] !== undefined) {
                  icon = "<i data-feather='" + iconNm + "'/>"
                }
              }
            }
            return icon
          },
          editable: false
        },
        editable: false
      },
    ];
    dataProvider.setFields(fields);
    gridView.setColumns(columns);

    gridView.onItemChecked = function (grid, itemIndex, checked) {
      let dataRow = grid.getDataRow(itemIndex);
      grid.expand(itemIndex, true, true);
      checkNode(grid, dataRow, checked);
    }
    gridView.onContextMenuPopup = function (grid, x, y, elementName) {
      if (elementName) {
        let selectRow = gridView.getValues(elementName.itemIndex);
        let hasChildren = dataProvider.getChildren(gridView.getDataRow(elementName.itemIndex)) !== null ? true : false;
        let rowState = dataProvider.getRowState(gridView.getDataRow(elementName.itemIndex)) === "created" ? true : false;
        let insertFlag = gridView.getValue(elementName.itemIndex, 'insertFlag');

        if (selectRow.parentId === null || rowState ? selectRow.parentId === null : selectRow.parentId.length === 0) {
        } else if (selectRow.parentId !== null && rowState ? insertFlag === 'M' : hasChildren) {
        } else {
          return false;
        }
      }
    };
    gridView.onCellDblClicked = function (grid, clickData) {
      gridView.expand(clickData.itemIndex, true, true);
    }
    gridView.onCellButtonClicked = function (grid, index, column) {
      let row = grid.getValues(index.itemIndex);
      setSelectedRow(grid.getDataRow(index.itemIndex));

      if (row.insertFlag === "R") {
        if (isActive) {
          setDialogOpen(false);
          setDialogOpen(true);
        }
        setDialogOpen(true);
      } else {
        setDialogOpen(false);
      }
    };
    dataProvider.onRowsSiblingMoved = function (provider, row, offset) {
      let rowId = row[0].rowId;
      let parent = dataProvider.getParent(rowId);
      let sibling = parent == -1 ? dataProvider.getChildren() : dataProvider.getChildren(parent);
      let index = sibling.indexOf(rowId);
      let seq = 0;

      if (index !== 0) {
        seq = dataProvider.getValue(sibling[index - 1], "seq") + 1;
      }

      dataProvider.setValue(rowId, "seq", seq);
    };
    gridView.onCellEdited = function (grid, itemIndex, row, field) {
      grid.commit();

      if (field === 0) {
        let id = grid.getValue(itemIndex, "id");
        let desRows = dataProvider.getChildren(row);
        if (desRows) {
          desRows.forEach(function (row) {
            dataProvider.setValue(row, "parentId", id);
          });
        }
      }

      if (field === 6) {
        grid.expand(itemIndex, true, true, 0);
        let useYn = grid.getValue(itemIndex, "usable");

        checkSibling(grid, row, useYn);
        checkChildren(grid, row, useYn);

        function checkChildren(grid, row, useYn) {
          let desRows = dataProvider.getDescendants(row);
          if (desRows) {
            desRows.forEach(function (row) {
              dataProvider.setValue(row, "usable", useYn);
            });
          }
        }

        function checkSibling(grid, row, useYn) {
          let parent = dataProvider.getParent(row);
          let sibling = parent == -1 ? dataProvider.getChildren() : dataProvider.getChildren(parent);
          let index = sibling.indexOf(row);

          if (index !== -1) {
            sibling.splice(index, 1);
          }

          if (useYn) {
            useYn = true;
          } else {
            sibling.forEach(function (i) {
              let value = dataProvider.getValue(i, "usable");
              if (useYn != value) {
                useYn = true;
              }
            });
          }

          if (parent > -1) {
            dataProvider.setValue(parent, "usable", useYn);
            checkSibling(grid, parent, useYn);
          }
        }
      }
    }
    gridView.onContextMenuItemClicked = function (grid, item, clickData) {
      let selectRow = gridView.getValues(clickData.itemIndex);
      let menuId = gridView.getValue(clickData.itemIndex, "id");
      gridView.expand(clickData.itemIndex);
      let children = dataProvider.getChildren(selectRow['__rowId']);
      let defaultSeq = 1;

      if (children) {
        defaultSeq = dataProvider.getValue(children[children.length - 1], "seq") + 1;
      }

      if (item.label === transLangKey("INSERT_MENU")) {
        dataProvider.addChildRow(selectRow['__rowId'], ['', '', menuId, '', null, defaultSeq, true, '', 'M'], -1, true);
      } else {
        dataProvider.addChildRow(selectRow['__rowId'], ['', '', menuId, '', '', defaultSeq, true, null, 'S']);
      }
      setTimeout(() => { feather.replace() }, 0);
    };
    gridView.onDataLoadComplated = function (grid) {
      feather.replace()
    }
    gridView.onCellClicked = function (grid, clickData) {
      if (clickData.cellType === 'header') {
        setTimeout(() => { feather.replace() }, 0);
      }
    }
    gridView.onTreeItemChanged = function (tree, itemIndex, rowId) {
      setTimeout(() => { feather.replace() }, 0);
    };
    gridView.onTreeItemExpanded = function (tree, itemIndex, rowId) {
      setTimeout(() => { feather.replace() }, 0);
    };
    gridView.onTreeItemCollapsed = function (tree, itemIndex, rowId) {
      setTimeout(() => { feather.replace() }, 0);
    };
  }
  function setIcon(icon) {
    menuGrid.dataProvider.setValue(selectedRow, "icon", icon);
    menuGrid.gridView.commit(true);
    setTimeout(() => { feather.replace() }, 0);
  }
  function setActive(active) {
    setIsActive(active);
    setPopupVisible(active);
  }
  async function loadData() {
    let gridView = menuGrid.gridView;
    let dataProvider = menuGrid.dataProvider;

    gridView.commit(true);

    gridView.showToast(progressSpinner + 'Load Data...', true);

    axios.get(baseURI() + 'system/menus?all-menus=true')
      .then(function (res) {
        res.data.map(function (data) {
          if (data.id !== "" && data.path === "" && data.parentId === "") {
            let allPath = getMenuPath(data);
            data.path = allPath.split("/")[1];
            data.insertFlag = "R";
            setMenuPath(data.items, 1);
          }
        });
        let responseData = { "items": res.data };
        dataProvider.setObjectRows(responseData, "items", "", "");
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        gridView.hideToast();
      });

    gridView.expandAll();
  }
  function getMenuPath(menu) {
    let type = menu.items.length === 0 ? true : false
    if (type) {
      return menu.path;
    } else {
      return getMenuPath(menu.items[0]);
    }
  }
  function setMenuPath(menu, level) {
    menu.map(function (data) {
      let type = data.items.length === 0 ? true : false
      if (type) {
        let tempPath = data.path.split("/");
        data.path = tempPath[tempPath.length - 1];
        data.insertFlag = "S";
      } else {
        let tempAllPath = getMenuPath(data).split("/");
        data.path = tempAllPath[level + 1];
        data.insertFlag = "M";
        setMenuPath(data.items, level + 1);
      }
    });
  }
  function insertMenu() {
    let defaultSeq = 1;
    let menuList = menuGrid.dataProvider.getChildren();
    if (menuList) {
      defaultSeq = menuGrid.dataProvider.getValue(menuList[menuList.length - 1], "seq") + 1;
    }

    menuGrid.dataProvider.addChildRow(0, ['', '', null, '', null, defaultSeq, true, '', 'R'], -1, true);
  }
  function deleteMenu() {
    menuGrid.gridView.commit(true);

    let checkedRows = menuGrid.gridView.getCheckedRows();
    if (checkedRows.length === 0) {
      showMessage(transLangKey('WARNING'), transLangKey('MSG_5039'), { close: false }, function (answer) {
      });
    } else {
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_DELETE'), function (answer) {
        if (answer) {
          let deleteRows = [];
          let deleteList = [];

          checkedRows.forEach(function (row) {
            if (menuGrid.dataProvider.getRowState(row) !== "created") {
              let deleteRow = menuGrid.dataProvider.getJsonRow(row);
              deleteRows.push(deleteRow);
            }
          });
          menuGrid.dataProvider.removeRows(menuGrid.dataProvider.getAllStateRows().created);
          if (deleteRows.length > 0) {
            deleteRows.forEach(function (row) {
              deleteList.push(row.id);
            });
            axios({
              method: 'post',
              headers: { 'content-type': 'application/json' },
              url: baseURI() + 'system/menus/delete',
              data: deleteList
            })
              .then(function (response) {
                if (response.status === gHttpStatus.SUCCESS) {
                  menuGrid.dataProvider.clearRows();
                  loadData();
                }
              })
              .catch(function (err) {
                console.log(err);
              });
          }
        }
      });
    }
  }
  function saveMenu() {
    menuGrid.gridView.commit(true);

    let changes = [];
    changes = changes.concat(
      menuGrid.dataProvider.getAllStateRows().created,
      menuGrid.dataProvider.getAllStateRows().updated,
      menuGrid.dataProvider.getAllStateRows().deleted
    );
    if (changes.length === 0) {
      showMessage(transLangKey('WARNING'), transLangKey('MSG_5039'), { close: false }, function (answer) {
      });
    } else {
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
        if (answer) {
          let err = "";
          changes.forEach(function (row) {
            let changeRow = menuGrid.dataProvider.getJsonRow(row);
            if (!changeRow.id || changeRow.id.length === 0) err = "1";
            if (!changeRow.path || changeRow.path.length === 0) err = "2";
            if (!changeRow.seq || changeRow.seq.length === 0) err = "3";
            if (!changeRow.insertFlag || changeRow.insertFlag !== "R" && changeRow.parentId.length === 0) err = "4";
          });

          menuGrid.dataProvider.getAllStateRows().created.forEach(function (row) {
            let changeRow = menuGrid.dataProvider.getJsonRow(row);
            if (changeRow.insertFlag !== "S" && menuGrid.dataProvider.getChildren(row) === null) {
              err = "5";
            }
          });

          if (err.length !== 0) {
            let errorMessage = 'MSG_MENU_ERROR_0' + err;
            showMessage(transLangKey('WARNING'), transLangKey(errorMessage));
          } else {
            let changeRowData = [];
            changes.forEach(function (row) {
              let changeRow = menuGrid.dataProvider.getJsonRow(row);
              if (changeRow.insertFlag === "S") {
                changeRow.path = getAllPath(row, changeRow.path);
                changeRow.type = changeRow.type === "viewconfig" ? "viewconfig" : null;
                changeRowData.push(changeRow);
              } else {
                if (menuGrid.dataProvider.getRowState(row) !== "created") {
                  setAllPath(row, changeRow.path, menuGrid.dataProvider.getLevel(row));
                }
                changeRow.path = null;
                changeRow.type = null;
                changeRowData.push(changeRow);
              }
            });

            function getAllPath(row, path) {
              let allPath = "/" + path;
              if (menuGrid.dataProvider.getParent(row) !== -1) {
                let middlePath = (!menuGrid.dataProvider.getJsonRow(menuGrid.dataProvider.getParent(row)).path) ? "" : menuGrid.dataProvider.getJsonRow(menuGrid.dataProvider.getParent(row)).path;
                let updatePath = middlePath + allPath;
                return getAllPath(menuGrid.dataProvider.getParent(row), updatePath);
              } else {
                return allPath
              }
            }

            function setAllPath(row, path, level) {
              let type = menuGrid.dataProvider.getChildren(row) ? true : false
              if (type) {
                menuGrid.dataProvider.getChildren(row).forEach(function (childRow) {
                  setAllPath(childRow, path);
                });
              } else {
                let changeRow = menuGrid.dataProvider.getJsonRow(row);
                let allPath = getAllPath(row, changeRow.path);
                allPath.split("/")[level] = path;
                changeRow.path = allPath;
                changeRowData.push(changeRow);
              }
            }

            axios({
              method: 'post',
              headers: { 'content-type': 'application/json' },
              url: baseURI() + 'system/menus',
              data: changeRowData
            })
              .then(function (response) {
                if (response.status === gHttpStatus.SUCCESS) {
                  menuGrid.dataProvider.clearRows();
                  loadData();
                }
              })
              .catch(function (err) {
                console.log(err);
              });
          }
        }
      });
    }
  }
  function checkNode(grid, dataRow, checked) {
    let dataProvider = grid.getDataSource();

    checkSiblingNode(grid, dataRow, checked);

    let desRows = dataProvider.getDescendants(dataRow);
    if (desRows) {
      grid.checkRows(desRows, checked, false);
    }
  };
  function checkSiblingNode(grid, dataRow, checked) {
    let dataProvider = grid.getDataSource();
    let parent = dataProvider.getParent(dataRow);
    let sibling = parent == -1 ? dataProvider.getChildren() : dataProvider.getChildren(parent);
    let index = sibling.indexOf(dataRow);

    if (index !== -1) {
      sibling.splice(index, 1);
    }

    if (checked) {
      sibling.forEach(function (i) {
        let value = grid.isCheckedRow(i);
        if (checked != value) {
          checked = false;
        }
      });
    } else {
      checked = false;
    }

    if (parent > -1) grid.checkRow(parent, checked, false, false);
    if (parent == -1) grid.setAllCheck(checked, false);
    if (parent > -1) {
      checkSiblingNode(grid, parent, checked);
    }
  }

  function cameCaseToHyphen(value) {
    return value.replace(/(?:^|\.?)([A-Z+0-9])/g, function (x, y) { return "-" + y.toLowerCase() }).replace(/^-/, "")
  }
  return (
    <>
      <ContentInner>
        <ButtonArea>
          <LeftButtonArea></LeftButtonArea>
          <RightButtonArea>
            <ButtonGroup variant="outlined">
              <GridAddRowButton onClick={() => { insertMenu() }}></GridAddRowButton>
              <GridDeleteRowButton onClick={() => { deleteMenu() }}></GridDeleteRowButton>
              <GridSaveButton title={transLangKey("SAVE")} onClick={() => { saveMenu() }}></GridSaveButton>
            </ButtonGroup>
          </RightButtonArea>
        </ButtonArea>
        <ResultArea sizes={[100]} direction={"vertical"}>
          <TreeGrid id="menuGrid" className="white-skin" ></TreeGrid>
        </ResultArea>
      </ContentInner>
      <IconPicker open={dialogOpen} onClose={() => setDialogOpen(false)} confirm={setIcon}></IconPicker>
    </>
  );
}

export default Menu