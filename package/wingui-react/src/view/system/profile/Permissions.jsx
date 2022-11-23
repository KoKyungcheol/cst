import React, { useEffect, forwardRef, useImperativeHandle } from "react";
import BaseGrid from '../../../component/BaseGrid';
import { useViewStore } from "../../../imports";
import { useUserStore } from "../../../store/userStore";

let perGrid = null;

const Permissions = forwardRef((props, ref) => {
  const [username] = useUserStore(state => [state.username])
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo]);
  let filter = [];

  useImperativeHandle(ref, () => ({
    doRefresh() {
      perGrid.gridView.resetSize();
    }
  }));
  useEffect(() => {
    perGrid = getViewInfo(vom.active, 'perGrid')
    setFieldAndColumn();

    loadData();
  }, [viewData])
  function loadData() {
    perGrid.gridView.showToast({ message: 'Loading...' }, true);

    axios.get(baseURI() + 'system/user/permissions/union', {
      params: {
        'username': username
      }
    })
      .then(function (res) {
        res.data.forEach(function (data) {
          data.menuNm = transLangKey(data.menuCd);
          filter.push({ name: data.menuCd, criteria: "values['menuCd']='" + data.menuCd + "'", text: data.menuNm });
        });
        perGrid.dataProvider.fillJsonData(res.data);
        perGrid.gridView.addColumnFilters("menuNm", filter, true);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        perGrid.gridView.hideToast();
      });
  }
  function setFieldAndColumn() {
    perGrid.dataProvider.setOptions({ restoreMode: "auto" });
    perGrid.gridView.setStateBar({ visible: false });
    perGrid.gridView.setCheckBar({ visible: false });
    perGrid.gridView.setFooters({ visible: false });
    perGrid.gridView.setDisplayOptions({
      fitStyle: "evenFill",
      showChangeMarker: false,
      useFocusClass: true
    });
    perGrid.gridView.setEditOptions({
      insertable: false,
      appendable: false
    });

    perGrid.dataProvider.setFields([
      { fieldName: "menuCd" },
      { fieldName: "menuNm" },
      { fieldName: "PERMISSION_TYPE_READ", dataType: "boolean" },
      { fieldName: "PERMISSION_TYPE_CREATE", dataType: "boolean" },
      { fieldName: "PERMISSION_TYPE_UPDATE", dataType: "boolean" },
      { fieldName: "PERMISSION_TYPE_DELETE", dataType: "boolean" },
      { fieldName: "PERMISSION_TYPE_IMPORT", dataType: "boolean" }
    ]);
    perGrid.gridView.setColumns([
      {
        name: "menuCd", fieldName: "menuCd",
        header: { text: transLangKey("MENU_CD") },
        editable: false, width: 100
      },
      {
        name: "menuNm", fieldName: "menuNm",
        header: { text: transLangKey("MENU_NM") },
        styleName: "left-column",
        editable: false, width: 100
      },
      {
        name: "PERMISSION_TYPE_READ", fieldName: "PERMISSION_TYPE_READ",
        header: { text: transLangKey("READ") },
        editable: false, width: 100,
        renderer: {
          type: "check",
          editable: false
        }
      },
      {
        name: "PERMISSION_TYPE_CREATE", fieldName: "PERMISSION_TYPE_CREATE",
        header: { text: transLangKey("CREATE") },
        editable: false, width: 100,
        renderer: {
          type: "check",
          editable: false
        }
      },
      {
        name: "PERMISSION_TYPE_UPDATE", fieldName: "PERMISSION_TYPE_UPDATE",
        header: { text: transLangKey("UPDATE") },
        editable: false, width: 100,
        renderer: {
          type: "check",
          editable: false
        }
      },
      {
        name: "PERMISSION_TYPE_DELETE", fieldName: "PERMISSION_TYPE_DELETE",
        header: { text: transLangKey("DELETE") },
        editable: false, width: 100,
        renderer: {
          type: "check",
          editable: false
        }
      },
      {
        name: "PERMISSION_TYPE_IMPORT", fieldName: "PERMISSION_TYPE_IMPORT",
        header: { text: transLangKey("IMPORT") },
        editable: false, width: 100,
        renderer: {
          type: "check",
          editable: false
        }
      }
    ]);
  }

  return (
    <div style={{ height: 'calc(100vh - 240px)', width: '100%' }}>
      <BaseGrid id="perGrid" className="white-skin"></BaseGrid>
    </div>
  )
});

export default Permissions;