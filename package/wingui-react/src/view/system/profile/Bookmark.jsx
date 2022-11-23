import axios from "axios";
import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import TreeGrid from '../../../component/TreeGrid';
import { useViewStore } from "../../../imports";

const Bookmark = forwardRef((props, ref) => {
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo, state.setViewInfo])
  const [bookMarkGrid, setBookMarkGrid] = useState(null);
  const { control } = useForm({
    defaultValues: {
    }
  });

  useImperativeHandle(ref, () => ({
    doRefresh() {
      bookMarkGrid.gridView.resetSize();
    },
  }));
  // 그리드 Object 초기화
  useEffect(() => {
    setBookMarkGrid(getViewInfo(vom.active, 'bookMarkGrid'))
  }, [viewData])
  useEffect(() => {
    if (bookMarkGrid) {
      setGridFieldAndColumn(bookMarkGrid.dataProvider, bookMarkGrid.gridView);
      loadData();
    }
  }, [bookMarkGrid])
  function loadData() {
    bookMarkGrid.gridView.showToast({ message: 'Loading...' }, true);

    axios.get(baseURI() + 'system/menus')
      .then(function (res) {
        let responseData = { "items": res.data };
        bookMarkGrid.dataProvider.setObjectRows(responseData, "items", "", "");
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        bookMarkGrid.gridView.hideToast()
      });
  }
  function setGridFieldAndColumn(dataProvider, gridView) {
    dataProvider.setOptions({ restoreMode: "auto" });
    bookMarkGrid.gridView.setFooters({ visible: false });
    bookMarkGrid.gridView.setStateBar({ visible: false });
    bookMarkGrid.gridView.setCheckBar({ visible: false });
    bookMarkGrid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
      showChangeMarker: false,
      useFocusClass: true
    });

    dataProvider.setFields([
      { fieldName: "id" },
      { fieldName: "bookmarked", dataType: "boolean" },
    ]);

    bookMarkGrid.gridView.setColumns([
      {
        name: "id", fieldName: "id",
        header: { text: transLangKey("MENU_ID") },
        editable: false, width: 100,
        displayCallback: function (grid, index, value) {
          return transLangKey(value);
        }
      },
      {
        name: "bookmarked", fieldName: "bookmarked",
        header: { text: transLangKey("BOOKMARK") },
        editable: false, width: 100,
        styleName: 'editable-column',
        renderer: {
          type: "check",
          editable: true
        }
      }
    ]);

    bookMarkGrid.gridView.onCellDblClicked = function (grid, clickData) {
      bookMarkGrid.gridView.expand(clickData.itemIndex, true, true);
    }

    bookMarkGrid.gridView.onCellEdited = function (grid, itemIndex, row, field) {
      grid.commit();

      if (field === 1) {
        grid.expand(itemIndex, true, true, 0);
        let useYn = grid.getValue(itemIndex, "bookmarked");

        checkSibling(grid, row, useYn);
        checkChildren(grid, row, useYn);

        function checkChildren(grid, row, useYn) {
          let desRows = dataProvider.getDescendants(row);
          if (desRows) {
            desRows.forEach(function (row) {
              dataProvider.setValue(row, "bookmarked", useYn);
            })
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
              let value = dataProvider.getValue(i, "bookmarked");
              if (useYn != value) {
                useYn = true;
              }
            });
          }

          if (parent > -1) {
            dataProvider.setValue(parent, "bookmarked", useYn);
            checkSibling(grid, parent, useYn);
          }
        }
      }
    }
  }
  const saveBookmark = () => {
    bookMarkGrid.gridView.commit(true);

    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let changes = [];
        changes = changes.concat(
          bookMarkGrid.dataProvider.getAllStateRows().created,
          bookMarkGrid.dataProvider.getAllStateRows().updated,
          bookMarkGrid.dataProvider.getAllStateRows().deleted,
          bookMarkGrid.dataProvider.getAllStateRows().createAndDeleted
        );

        let changeRowData = [];
        changes.forEach(function (row) {
          changeRowData.push(bookMarkGrid.dataProvider.getJsonRow(row));
        });

        if (!changeRowData.length) {
          showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'));
        } else {
          bookMarkGrid.gridView.showToast(progressSpinner + 'Saving data...', true);
          axios({
            method: 'post',
            headers: { 'content-type': 'application/json' },
            url: baseURI() + 'system/menus/bookmarks',
            data: changeRowData
          })
            .then(function (response) { })
            .catch(function (err) {
              console.log(err);
            })
            .then(function () {
              bookMarkGrid.gridView.hideToast();
              loadData();
            });
        }
      }
    })
  }
  return (
    <form style={{ height: 'calc(100vh - 240px)' }} >
      <div className="mb-2" style={{ height: '96%' }}>
        <TreeGrid id="bookMarkGrid" className="white-skin"></TreeGrid>
      </div>
      <div className="mb-2">
        <button type="button" className="btn btn-primary" onClick={saveBookmark} >{transLangKey('SAVE')}</button>
      </div>
    </form>
  )
});

export default Bookmark;