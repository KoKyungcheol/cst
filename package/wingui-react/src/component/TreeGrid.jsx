import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
import { LocalTreeDataProvider, TreeView } from 'realgrid';
import { useContentStore } from '../store/contentStore'
import { useViewStore } from '../store/viewStore'

let defExportOpt = {
  headerDepth: 1,
  footer: "default",
  allColumns: true,
  lookupDisplay: true,
  separateRows: false
}

function commitGrid(gridView, flag) {
  try {
    if (flag === undefined)
      gridView.commit(true);
    else
      gridView.commit(flag);
  }
  catch (e) {
    gridView.cancel();
  }
}

const TreeGrid = forwardRef((props, ref) => {
  const setViewGridUpdated = useContentStore(state => state.setViewGridUpdated)
  const setViewInfo = useViewStore(state => state.setViewInfo)

  const oldCurrent = useRef(-1);

  let gridViewId = vom.active + "-" + props.id;
  const [gridId, setGridId] = useState(gridViewId);

  let __realGrid = useRef({});

  let dataProvider;
  let gridView;
  useEffect(() => {
    initI18n(localStorage.getItem('languageCode'))
    createGrid();
    //생성후 최초 resetSize
    __realGrid.current.gridView.resetSize();
  }, [])

  useImperativeHandle(ref, () => ({
    gridView: () => { return __realGrid.current.gridView },
    dataProvider: () => { return __realGrid.current.dataProvider },
    getGrid: () => { return __realGrid.current },
    getGridViewId: () => { return gridId }
  }));

  function createGrid() {
    dataProvider = new LocalTreeDataProvider(false);
    gridView = new TreeView(gridViewId);
    gridView.id = props.id;

    gridView.setDataSource(dataProvider);
    setGridComponent(gridView, dataProvider);

    if (props.items) {
      createGridItem(gridView, dataProvider, props.items);
    }
  }

  function setGridComponent(gridView, dataProvider) {

    setContextGridComponent()

    let gridObject = {
      type: 'treeView',
      dataProvider: dataProvider,
      gridView: gridView
    };
    /* 편의함수 설정 */
    gridObject.getOldCurrent = getOldCurrent;
    gridObject.resetPrevCurrent = resetPrevCurrent;
    gridObject.exportExcel = exportExcel;

    __realGrid.current = gridObject;
    __realGrid.current.isUpdated = isUpdated;

    setViewInfo(vom.active, props.id, gridObject)
    useGridStatTrace(vom.active, gridObject);
  }

  function isUpdated() {
    const gridView = __realGrid.current.gridView;
    const dataProvider = __realGrid.current.dataProvider;

    commitGrid(gridView)
    let statRows = dataProvider.getAllStateRows();
    let stats = Object.getOwnPropertyNames(statRows);
    let updated = false;
    for (let i = 0, n = stats.length; i < n; i++) {
      let stat = statRows[stats[i]];
      if (stat.length > 0) {
        return true;
      }
    }

    return false;
  }

  function setContextGridComponent() {
    let gridObject = {
      [props.id]: {
        type: 'treeView',
        dataProvider: dataProvider,
        gridView: gridView
      }
    };
    let activeView = com.get(vom.active);
    if (activeView) {
      activeView.set(gridObject)
    }

  }

  function exportExcel(options, callback) {
    let opt = options || defExportOpt;
    const gridView = __realGrid.current.gridView;

    exportGridtoExcel(gridView, opt, callback);

  }

  function getOldCurrent() {
    return oldCurrent.current;
  }

  function resetPrevCurrent() {
    const gridView = __realGrid.current.gridView;
    gridView.setCurrent(oldCurrent.current);
  }

  const useGridStatTrace = function (viweId, grid) {
    const gridView = grid.gridView;
    const dataProvider = grid.dataProvider;

    const prevHandler = dataProvider.onValueChanged;

    dataProvider.onValueChanged = function (provider, row, field) {
      gridView.commit(true);
      let statRows = dataProvider.getAllStateRows();
      let stats = Object.getOwnPropertyNames(statRows);
      let updated = false;
      for (let i = 0, n = stats.length; i < n; i++) {
        let stat = statRows[stats[i]];
        if (stat.length > 0) {
          updated = true;
        }
      }
      setViewGridUpdated(viweId, gridId, updated)
      if (prevHandler)
        prevHandler(provider, row, field)
    };

    const prevonCurrentChanging = gridView.onCurrentChanging;
    gridView.onCurrentChanging = function (grid, oldIndex, newIndex) {
      oldCurrent.current = oldIndex;
      if (prevonCurrentChanging)
        prevonCurrentChanging(grid, oldIndex, newIndex)
      // return false; 를 하는 경우 위치 변경이 되지 않는다.
    };
  }

  function createGridItem(gridView, dataProvider, items) {
    dataProvider.setFields(null);
    gridView.setColumnLayout(null);
    gridView.setColumns(null);

    let headerGrd1Headers = {
      fields: [],
      columns: [],
      columnProps: [],
      columns_remind: items
    }

    let tmp_rtn = createGridHeader(headerGrd1Headers);

    let fields = tmp_rtn.fields;
    let columns = tmp_rtn.columns;
    let columnProps = tmp_rtn.columnProps;
    dataProvider.setFields(fields);
    gridView.setColumns(columns);
  }

  function createGridHeader(hgh) {
    for (let i = 0; i < hgh.columns_remind.length; i++) {
      // 필드 생성
      hgh.fields = hgh.fields.concat(setFieldsProps([hgh.columns_remind[i]]));
      // 컬럼 생성
      let tmp_columns = setColumnProp(hgh.columns_remind[i]);
      hgh.columns = hgh.columns.concat(tmp_columns);
      hgh.columnProps = hgh.columnProps.concat(tmp_columns);
    }
    return hgh;
  }

  function setFieldsProps(props) {
    let fields = [];

    for (let i = 0, len = props.length; i < len; i++) {
      let prop = props[i];
      let objField = {};

      objField.fieldName = prop.name;
      objField.dataType = prop.dataType;

      if (prop.dataType.toUpperCase() === "BOOLEAN") {
        objField.booleanFormat = "false,N,0,f,off:true,Y,1,t,on:0";
      } else if (prop.dataType.toUpperCase() === "DATETIME") {
        objField.datetimeFormat = "iso";
      } else if (prop.dataType.toUpperCase() === "NUMBER") {
        if (prop.min !== undefined) {
          objField.min = prop.min;
        }
        if (prop.max !== undefined) {
          objField.max = prop.max;
        }
      }

      if (prop.valueCallback) {
        objField.valueCallback = prop.valueCallback;
      }

      fields.push(objField);
    }
    return fields;
  }

  function setColumnProp(prop) {
    let objColumn = {};

    objColumn.type = "data";
    objColumn.name = prop.name;
    objColumn.fieldName = prop.fieldName ? prop.fieldName : prop.name;
    objColumn.visible = prop.visible;
    objColumn.editable = prop.editable;
    objColumn.width = prop.visible ? prop.width : 0;
    objColumn.fillWidth = prop.fillWidth ? prop.fillWidth : 0;
    objColumn.autoFilter = prop.autoFilter ? prop.autoFilter : false;

    if (prop.columnType === "D") {
      objColumn.header = {
        text: prop.headerText
      };
    } else {
      objColumn.header = prop.headerText ? {
        text: transLangKey(prop.headerText),//gI18n.tc(prop.headerText)
      } : {
        text: transLangKey(comn.convertCamelToSnake((prop.name).replace(/([A-Z])/g, function (x, y) { return "_" + y.toLowerCase() }).replace(/^_/, "")).toUpperCase())
      };
    }

    objColumn.header.styles = {
      fontBold: prop.requisite === true
    }

    objColumn.header.visible = prop.headerVisible;

    let styles = {};
    let editor = {};
    let renderer = {};

    if (prop.dataType.toUpperCase() === "TEXT") {
      objColumn.styleName = prop.textAlignment ? prop.textAlignment : "rg-near",
        editor = {
          textWrap: "normal"
        };

      editor.type = 'text';
    } else if (prop.dataType.toUpperCase() === "NUMBER") {
      objColumn.styleName += prop.textAlignment ? prop.textAlignment : "rg-far";
      editor = {
        numberFormat: prop.format ? prop.format : "#,###.###",
        prefix: prop.prefix ? prop.prefix : "",
        suffix: prop.suffix ? prop.suffix : "",
      }

      editor.type = 'number';
      editor.positiveOnly = prop.positiveOnly ? prop.positiveOnly : false;
      editor.integerOnly = prop.integerOnly ? prop.integerOnly : false;

      editor.editFormat = prop.format ? prop.format : "#,###.###";
    } else if (prop.dataType.toUpperCase() === "DATETIME") {
      objColumn.styleName += prop.textAlignment ? prop.textAlignment : "rg-center",
        prop.format = prop.format ? prop.format : "yyyy-MM-dd HH:mm:ss";
      editor = {
        datetimeFormat: prop.format
      };

      editor = {
        type: "date",
        mask: {
          editMask: prop.format.replace(/\w/gm, "9"),
          placeHolder: prop.format,
          includedFormat: true
        },
        datetimeFormat: prop.format
      }
    } else if (prop.dataType.toUpperCase() === "BOOLEAN") {
      renderer = {
        type: "check",
        editable: prop.editable,
        startEditOnClick: true,
        labelPosition: "hidden",
        shape: "box",
        trueValues: "true,TRUE,True,Y,y,1,T,t,on,ON,On",
        falseValues: "false,FALSE,False,N,n,0,F,f,off,OFF,Off"
      };

      editor = {
        booleanFormat: 'false,N,0,f,off:true,Y,1,t,on:0',
        emptyValue: false
      }

      objColumn.editable = prop.editable;
    }

    if (prop.defaultValue) {
      objColumn.defaultValue = prop.defaultValue;
    }
    if (prop.displayCallback) {
      objColumn.displayCallback = prop.displayCallback;
    }
    if (prop.styleCallback) {
      objColumn.styleCallback = prop.styleCallback;
    }

    if (prop.useDropdown) {
      editor.type = "dropdown";
      editor.textReadOnly = false;
      editor.domainOnly = true;
      editor.dropDownWhenClick = false;
      editor.dropDownCount = 10;

      objColumn.values = prop.values ? prop.values : [];
      objColumn.labels = prop.labels ? prop.labels : [];
      objColumn.lookupDisplay = prop.lookupDisplay !== undefined ? prop.lookupDisplay : true;
    }

    //editable class
    if (prop.editable) {
      objColumn.header.styleName += " editable-header";
      objColumn.styleName += " editable-column";
      styles.background = "#FFFFFFD2";
    } else {
      styles.background = "#FFF9F9F9";
    }

    //required class
    if (prop.validRules && prop.validRules.length > 0) {
      if (prop.validRules.findIndex(v => v.criteria === 'required') > -1) {
        objColumn.header.styleName += " required-header";
      }
    }

    if (prop.imageUrl) {
      objColumn.header.imageUrl = prop.imageUrl;
      objColumn.header.imageLocation = prop.imageLocation ? prop.imageLocation : "right";
    }

    styles.textWrap = "explicit";

    if (prop.inputCharacters) {
      editor.inputCharacters = prop.inputCharacters;
    }

    objColumn.styles = styles;
    objColumn.editor = editor;
    objColumn.renderer = renderer;

    if (prop.dynamicStyles) objColumn.dynamicStyles = prop.dynamicStyles;
    if (prop.mergeRule) objColumn.mergeRule = prop.mergeRule;
    if (prop.button) objColumn.button = prop.button;
    if (prop.renderer) {
      let propRenderer = prop.renderer;
      objColumn.renderer = { ...renderer, ...propRenderer };
    }

    return objColumn;
  }

  return (
    <div id={gridViewId} style={{ height: "100%", width: "100%" }} className={"realgrid " + props.className}></div>
  );
}
);

TreeGrid.propTypes = {
};

TreeGrid.displayName = 'TreeGrid'


export default TreeGrid;
