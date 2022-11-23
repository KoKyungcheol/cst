import { Box, Checkbox, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { GridView, LocalDataProvider, gridVersion } from 'realgrid';
import { initI18n, transLangKey } from '../lang/i18n-func';
import { useUserStore } from '../store/userStore';
import { useViewStore } from '../store/viewStore';
import { useInputStyles } from './CommonStyle';
import { isDeepOrderlessEqual } from '@zionex/utils/common'
import wingui3 from '@zionex/utils/wingui3-custom'
import { zAxios } from '@zionex/imports';
import {
  setDTFUneditableStyle, setNullValueCellStyle, preventColumnSort, setCellCommnetButton, propColumnTitle, getArrangedColumns, getColumnProp, hasColumnProp2, getColumnProp2, arrangeLookups,
  isIterationColumn, isFixedColumn, createDataColumn, cleanupNoChildGroupColumns, columnsSort, setGridSortOrder, setInitGroupOrder, fitGridData, updateParentWidth2, updateParentWidth, gridOnCellEdited, setNumberComparer, setnullValueToZero,
  getRowTotalMeasures, applyEditMeasureStyle, setBaselineStyle, setMergeCell, checkVersionBucket,
} from '@zionex/utils/stdGridWrapper'
import PopupDialog from './PopupDialog';
import { useContentStore } from '../store/contentStore';

let dataProvider;
let gridView;
let columnLayout = []

function BaseGrid(props) {
  const [username, systemAdmin] = useUserStore(state => [state.username, state.systemAdmin])

  const gridViewId = vom.active + "-" + props.id;
  const [gridId, setGridId] = useState(gridViewId);

  const classes = useInputStyles();
  const setViewInfo = useViewStore(state => state.setViewInfo)
  const oldCurrent = useRef(-1);
  const [layoutName, setLayoutName] = useState('');
  const [allUser, setAllUser] = useState(false);

  const prefInfoObj = useRef(props.prefInfoObj)
  const griddata = useRef(props.griddata)

  const viewCd = useRef(props.viewCd)
  const grpCd = useRef(props.grpCd)
  const userName = useRef(props.userName)

  const curGridStatus = useRef({ created: false, gridItemCreating: false });

  const viewId = vom.active;

  const resetLangEvent = useContentStore(state => state.resetLangEvent)
  const [curLayoutName, setCurLayoutName] = useState('default');
  const dynamicCSS = useRef([])

  const flatItems = useRef([]);
  const __realGrid = useRef({});
  const firstUpdate = useRef(true);
  const [bOpenLayoutDlg, openLayoutDlg] = useState(false);

  function setData(jsonData) {
    const gridView = __realGrid.current.gridView;
    const dataProvider = __realGrid.current.dataProvider;

    if (gridView.prefInfo || gridView.crossTabInfo) {
      makeGridColumnWithPrefInfo(gridView, dataProvider, jsonData)
    }
    else {
      dataProvider.fillJsonData(jsonData);
      if (dataProvider.getRowCount() == 0) {
        gridView.setDisplayOptions({ showEmptyMessage: true, emptyMessage: transLangKey('MSG_NO_DATA') });
      }
    }
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

  useEffect(() => {
    initI18n(localStorage.getItem('languageCode'))
    createGrid();
    getItems(props.items);

    __realGrid.current.loadData = loadData;
    __realGrid.current.loadDataPost = loadDataPost;
    __realGrid.current.isUpdated = isUpdated;
    __realGrid.current.reloadLayout = reloadLayout;
    __realGrid.current.addGridItems = addGridItems;
    __realGrid.current.addGridItem = addGridItem;
    __realGrid.current.removeGridItems = removeGridItems;
    __realGrid.current.removeGridItem = removeGridItem;
    __realGrid.current.findGroupItem = findGroupItem;
    __realGrid.current.setData = setData;

    //layout 설정을 위한 함수 설치
    __realGrid.current.gridView.loadLayoutInfos = loadLayoutInfos;
    __realGrid.current.gridView.setCurLayoutName = setCurLayoutName;
    __realGrid.current.registerCustomRenderer = registerCustomRenderer
    __realGrid.current.getChangedValues = getChangedValues
    __realGrid.current.setColumnProperty = setColumnProperty
    __realGrid.current.loadCrossTabInfoAndPrefInfo = loadCrossTabInfoAndPrefInfo
    __realGrid.current.getGridItems = getGridItems
    __realGrid.current.findGridItem = findGridItem

    __realGrid.current.gridView.setCellStyles = setCellStyles
    __realGrid.current.gridView.setCellStyle = setCellStyle
    __realGrid.current.gridView.unSetCellStyles = unSetCellStyles
    __realGrid.current.gridView.unSetCellStyle = unSetCellStyle
    __realGrid.current.gridView.addCellStyle = addCellStyle
    __realGrid.current.gridView.dynamicCSSSelector = dynamicCSSSelector
    __realGrid.current.gridView.clearCSSSelector = clearCSSSelector

    __realGrid.current.gridView.resetSize();

    if (props.griddata) {
      setData(props.griddata)
    }
    setViewInfo(viewId, props.id, __realGrid.current)
    useGridStatTrace(viewId, __realGrid.current);

    const gridView = __realGrid.current.gridView;
    const dataProvider = __realGrid.current.dataProvider
    gridView.id = props.id;

    saveDefaultLayout(gridView, props.id)
    //loadLayoutInfos(gridView, 'layout', true);
    loadGridLayouts(gridView, {username, systemAdmin})
    
    setGridContextMenu(gridView, {username, systemAdmin}, openLayoutDlg);
    return unmount;
  }, [])

  useEffect(() => {
    let reload = false;
    if (viewCd.current != props.viewCd)
      reload = true;
    if (grpCd.current != props.grpCd)
      reload = true;
    if (userName.current != props.userName)
      reload = true;

    if (reload) {
      loadCrossTabInfoAndPrefInfo(props.viewCd, props.grpCd, props.userName)
    }
  }, [props.viewCd, props.grpCd, props.userName])

  useEffect(() => {
    const gridView = __realGrid.current.gridView;
    const dataProvider = __realGrid.current.dataProvider

    if (props.prefInfoObj) {
      if (isDeepOrderlessEqual(griddata.current, props.griddata))
        return;

      prefInfoObj.current = props.prefInfoObj;
      const prefInfo = props.prefInfoObj.prefInfo;
      const crossTabInfo = props.prefInfoObj.crossTabInfo;
      const resultData = props.griddata || dataProvider.getJsonRows();
      makeGridWithPreferenceInfos(gridView, dataProvider, prefInfo, crossTabInfo, resultData)
    }
  }, [props.prefInfoObj, props.griddata])

  useEffect(() => {
    if (bOpenLayoutDlg) {
      let psnl = JSON.parse(localStorage.getItem('personalization'))
      if (psnl !== null) {
        if (psnl.layout === 'default') {
          setLayoutName('')
        } else {
          setLayoutName(psnl.layout)
        }
      }
    }
  }, [bOpenLayoutDlg])

  function createGrid() {
    destroy();

    if (props.version === '1') {
      dataProvider = new RealGridJS.LocalDataProvider();
      gridView = new RealGridJS.GridView(gridViewId);
      gridView.setDataSource(dataProvider);
      gridView.getVersion = function () { return RealGridJS.getVersion() }
    } else if (props.version === undefined || props.version === '2') {
      dataProvider = new LocalDataProvider(false);
      gridView = new GridView(gridViewId);
      gridView.setDataSource(dataProvider);
      gridView.getVersion = function () { return gridVersion };
    }
    gridView.id = props.id;
    gridView.columnProps = props.items;

    gridView.dynamic = props.dynamic != undefined ? props.dynamic : false;
    gridView.gridComboItems = props.comboItem;

    setGridComponent();

    gridView.gridCd = props.gridCd
    gridView.orgId = props.gridCd
    gridView.gridItems = props.items;
    gridView.dataColumns = [];
    gridView.lookupReference = {};
    gridView.lookups = {};
    gridView.invisibleColumnIds = [];
    gridView.colFixed = false;
    gridView.styleExceptCells = [];
    gridView.customAddedColumns = [];
    gridView.chartActivated = false;
    gridView.chartCategory = '';
    gridView.chartCategories = [];
    gridView.chartSeries = [];
    gridView.chartSeriesItems = [];
    gridView.chartAxes = [];
    gridView.axisCrossingValues = [];
    const grid1 = __realGrid.current;

    let xmlGridOption = props.xmlGridOption || {};
    let gridW = new wingui3.util.grid.GridWrap(grid1, gridView, xmlGridOption);
    gridView.gridWrap = gridW;

    if (prefInfoObj.current) {
      const prefInfo = prefInfoObj.current.prefInfo;
      const crossTabInfo = prefInfoObj.current.crossTabInfo;
      const resultData = props.griddata;

      if (prefInfo)
        makeGridWithPreferenceInfos(gridView, dataProvider, prefInfo, crossTabInfo, resultData)
    }
    else if (props.viewCd)
      loadCrossTabInfoAndPrefInfo(props.viewCd, props.grpCd)
    else if (gridView.columnProps) {
      reCreateGridItem()
    }

    curGridStatus.current.created = true;
  }
  function destroy() {
    let gridView = __realGrid.current.gridView;
    let dataProvider = __realGrid.current.dataProvider;

    if (gridView)
      gridView.destroy();
    if (dataProvider)
      dataProvider.destroy();

    __realGrid.current.gridView = null;
    __realGrid.current.dataProvider = null;
  }
  function setGridComponent() {
    let gridObject = {
      [props.id]: {
        type: 'grid',
        dataProvider: dataProvider,
        gridView: gridView
      }
    };
    com.get(vom.active).set(gridObject)

    __realGrid.current.type = 'grid'
    __realGrid.current.dataProvider = dataProvider
    __realGrid.current.gridView = gridView
  }
  function ApplyI18n(column) {
    if (column.dataType == 'group') {
      column.childs.map(childCol => {
        ApplyI18n(childCol)
      })
    }
    else if (column.lang && column.lang == true) {
      column.displayCallback = function (grid, index, value) {
        let tmp = transLangKey(value);
        return tmp;
      }
    }
  }
  function reloadLayout() {
    let gridView = __realGrid.current.gridView;
    const layout = gridView.currentLayout;

    gridView.setColumnLayout([]);
    gridView.setColumnLayout(layout)
    gridView.setFocus();
  }

  function createGridItem(gridView, dataProvider, items) {
    if (curGridStatus.current.gridItemCreating == true)
      return;

    curGridStatus.current.gridItemCreating = true;
    try {
      dataProvider.setFields([]);
      gridView.setColumnLayout([]);
      gridView.setColumns([]);

      items.map(column => {
        ApplyI18n(column)
      })

      let headerGrd1Headers = {
        fields: [],
        columns: [],
        columnProps: [],
        layouts: [],
        validRules: [],
        columns_remind: items
      }

      let tmp_rtn = createGridHeader(headerGrd1Headers);
      let fields = tmp_rtn.fields;
      let columns = tmp_rtn.columns;
      let layouts = createGridLayout(headerGrd1Headers);

      dataProvider.setFields(fields);
      gridView.setColumns(columns);
      gridView.setColumnLayout(layouts);
      
      gridView.currentLayout = layouts

      //fixed 칼럼 처리
      let isFixed = false;
      let columnFixIndex = 0;
      for (let i = 0, columnsLen = columns.length; i < columnsLen; i++) {
        let column = columns[i];
        if (gridView.invisibleColumnIds.length > 0) {
          if (column.visible && !gridView.invisibleColumnIds.includes(column.name)) {
            columnFixIndex++;
          }
        } else {
          if (column.visible) {
            columnFixIndex++;
          }
        }

        if (column.isFixed) {
          gridView.colFixed = true;
          gridView.fixedColumn = column;
          isFixed = true;
          break;
        }
      }

      if (isFixed) {
        if (columnFixIndex > 0) {
          let fixedOptions = {};
          gridView.fixedColCount = columnFixIndex;
          fixedOptions.colCount = columnFixIndex;
          fixedOptions.resizable = true;

          gridView.setFixedOptions(fixedOptions);
        }
      }

    } catch (e) {
      console.log(e)
    } finally {
      //gridView.endUpdate();
    }

    gridView.onValidateColumn = (grid, column, inserting, value, itemIndex) => {
      let error = {};
      if (inserting) {
        return;
      }

      let headerText = getHeaderText(grid, column.name);

      const rules = getColumnValidRules(column.fieldName);

      if (rules !== undefined) {
        rules.forEach((rule) => {
          let valid = rule.valid;
          if (rule.criteria === 'required' && (value === undefined || value === null || value.length <= 0)) {
            error.level = 'error';
            //MSG_CHECK_VALID_002 : '{{headerText}}는 필수값입니다.'
            error.message = transLangKey('MSG_CHECK_VALID_002', { headerText })
          } else if (rule.criteria === 'values') {
            if (Array.isArray(valid) && !valid.inclues(value)) {
              error.level = 'error';
              //MSG_CHECK_VALID_001 : '{{headerText}}값은 {{val}}중 하나여야 합니다.'
              error.message = transLangKey('MSG_CHECK_VALID_001', { headerText, valid })
            }
          } else if (rule.criteria === 'maxLength' && (value && value.length > valid)) {
            error.level = 'error';
            //MSG_CHECK_VALID_003 : '{{headerText}}길이는 {{val}}보다 작아야 합니다.'
            error.message = transLangKey('MSG_CHECK_VALID_003', { headerText, valid })
          }
          // min
          if (rule.criteria === 'min' && (value < valid)) {
            error.level = 'error';
            //MSG_CHECK_VALID_004 : '{{headerText}}값은 {{val}}보다 커야 합니다.'
            error.message = transLangKey('MSG_CHECK_VALID_004', { headerText, valid })
          } else if (rule.criteria === 'max' && (value > rule.valid)) {
            error.level = 'error';
            //MSG_CHECK_VALID_005 : '{{headerText}}값은 {{val}}보다 작아야 합니다.'
            error.message = transLangKey('MSG_CHECK_VALID_005', { headerText, valid })
          } else if (rule.criteria === 'lessThan') {

            let val = grid.getValue(itemIndex, valid);
            if (value && value >= val) {
              error.level = 'error';
              //MSG_CHECK_VALID_005 : '{{headerText}}값은 {{val}}보다 작아야 합니다.'
              error.message = transLangKey('MSG_CHECK_VALID_005', { headerText, valid })
            }
          } else if (rule.criteria === 'lessOrEqualThan') {
            let val = grid.getValue(itemIndex, valid);
            if (value && value > val) {
              let aHeadText = getHeaderText(grid, valid)

              error.level = 'error';
              //MSG_CHECK_VALID_007 : '{{headerText}}값은 {{val}}값보다 작거나 같아야 합니다.'
              error.message = transLangKey('MSG_CHECK_VALID_007', { headerText, aHeadText })
            }
          } else if (rule.criteria === 'biggerThan') {
            let val = grid.getValue(itemIndex, valid);
            if (value && value <= val) {
              let aHeadText = getHeaderText(grid, valid)

              error.level = 'error';
              //MSG_CHECK_VALID_008 : '{{headerText}}값은 {{aHeadText}}값보다 커야 합니다.'
              error.message = transLangKey('MSG_CHECK_VALID_008', { headerText, aHeadText })
            }
          } else if (rule.criteria === 'biggerOrEqualThan') {
            let val = grid.getValue(itemIndex, valid);
            if (value && value < val) {
              let aHeadText = getHeaderText(grid, valid)

              error.level = 'error';
              //MSG_CHECK_VALID_009 : '{{headerText}}값은 {{aHeadText}}값보다 크거나 같아야 합니다.'
              error.message = transLangKey('MSG_CHECK_VALID_009', { headerText, aHeadText })
            }
          } else if (rule.criteria == 'inputChar') {
            err = checkInputCharValid(headerText, valid, value);
            if (err != true) {
              error.level = 'error';
              error.message = err.message;
            } else {
              error.level = 'ignore'
            }
          } else if (rule.criteria == 'validFunc') {
            let err = valid(grid, column, value, itemIndex);
            if (err != true) {
              error.level = 'error';
              error.message = err.message;
            }
          }
        });
      }

      return error;
    }
    curGridStatus.current.gridItemCreating = false;
  }
  function createGridHeader(hgh) {
    const layouts = [];
    for (let i = 0; i < hgh.columns_remind.length; i++) {
      switch (hgh.columns_remind[i].dataType) {
        case 'group':
          let tmp_group = hgh.columns_remind[i];

          for (let j = 0; j < tmp_group.childs.length; j++) {
            let rtn = createGridHeader({
              fields: [],
              columns: [],
              layouts: [],
              validRules: [],
              columns_remind: [tmp_group.childs[j]]
            });
            hgh.fields = hgh.fields.concat(rtn.fields);
            hgh.columns = hgh.columns.concat(rtn.columns);
            if (tmp_group.childs[j].validRules) {
              hgh.validRules.push(tmp_group.childs[j]);
            }
          }
          break;
        default:
          hgh.fields = hgh.fields.concat(setFieldsProps([hgh.columns_remind[i]]));
          let tmp_columns = setColumnProp(hgh.columns_remind[i]);
          hgh.columns = hgh.columns.concat(tmp_columns);
          hgh.layouts.push(hgh.columns_remind[i].name);
          if (hgh.columns_remind[i].validRules) {
            hgh.validRules.push(hgh.columns_remind[i]);
          }
          break;
      }
    }
    return hgh;
  }
  function createGridLayout(hgh) {
    let layouts = [];
    for (let i = 0; i < hgh.columns_remind.length; i++) {
      switch (hgh.columns_remind[i].dataType) {
        case 'group':
          let tmp_group = hgh.columns_remind[i];
          //console.log(tmp_group);
          layouts.push(createGroupLayout(tmp_group));
          break;
        default:
          layouts.push(hgh.columns_remind[i].name);
          break;
      }
    }
    return layouts;
  }
  function createGroupColumn(group, columns) {
    return {
      type: 'group',
      name: group.name,
      orientation: group.orientation,
      header: {
        text: transLangKey(group.headerText),
        visible: group.headerVisible,
        styles: {
          fontBold: false
        }
      },
      columns: columns,
      hideChildHeaders: group.hideChildHeaders,
      width: group.orientation === 'horizontal' ?
        (function () {
          let width = 0;

          for (let i = 0, len = columns.length; i < len; i++) {
            width += columns[i].width;
          }

          return width;
        }(columns)) :
        columns[0].width
    };
  }
  function createGroupLayout(group) {
    let columns = group.childs;
    return {
      name: group.name,
      direction: group.orientation,
      expandable: group.expandable,
      expanded: group.expanded,
      items: (function () {
        const items = [];
        for (let i = 0, len = columns.length; i < len; i++) {
          if (columns[i].childs) {
            items.push(createGroupLayout(columns[i]))
          }
          else {
            if(group.expandable || group.expanded) {
              items.push({column: columns[i].name, groupShowMode: columns[i].groupShowMode});
            } else {
              items.push(columns[i].name);
            }
          }
        }
        return items;
      }(columns)),
      header: {
        visible: group.headerVisible != undefined ? group.headerVisible : true,
        text: transLangKey(group.headerText.text ? group.headerText.text : group.headerText),
        styleName: group.expandable ? 'header-text-align-left' : ''
      },
      hideChildHeaders: group.hideChildHeaders != undefined ? group.hideChildHeaders : false,
    };
  }
  function setFieldsProps(props) {
    let fields = [];

    for (let i = 0, len = props.length; i < len; i++) {
      let prop = props[i];
      let objField = {};

      objField.fieldName = prop.name;
      objField.dataType = prop.dataType;


      if (prop.valueExpression)
        objField.valueExpression = prop.valueExpression;
      if (prop.valueCallback)
        objField.valueCallback = prop.valueCallback;

      if (prop.dataType.toUpperCase() === 'BOOLEAN') {
        objField.booleanFormat = 'false,N,0,f,off:true,Y,1,t,on:0';
      } else if (prop.dataType.toUpperCase() === 'DATETIME') {
        objField.datetimeFormat = 'iso';
      } else if (prop.dataType.toUpperCase() === 'NUMBER') {
        if (prop.min !== undefined) {
          objField.min = prop.min;
        }
        if (prop.max !== undefined) {
          objField.max = prop.max;
        }
      }

      fields.push(objField);
    }

    return fields;
  }

  function setColumnProp(prop) {
    let objColumn = Object.assign({}, prop);
    objColumn.type = 'data';
    objColumn.name = prop.name;
    objColumn.fieldName = prop.fieldName ? prop.fieldName : prop.name;
    objColumn.visible = prop.visible !== undefined ? prop.visible : true;
    objColumn.editable = prop.editable;
    if(!objColumn.visible) {
      objColumn.width = 0;
    } else if (objColumn.visible && prop.width !== undefined){
      objColumn.width = prop.width;
    }
    objColumn.fillWidth = prop.fillWidth ? prop.fillWidth : 0;
    objColumn.styleName = objColumn.styleName ? objColumn.styleName : '';

    let columnHeader = objColumn.header ? objColumn.header : {};
    let columnHeaderStyles = objColumn.header && objColumn.header.styles ? objColumn.header.styles : {};

    if (prop.columnType === 'D') {
      objColumn.header = {
        ...columnHeader,
        text: prop.headerText
      };
    } else {
      objColumn.header = prop.headerText ? {
        ...columnHeader,
        text: transLangKey(prop.headerText),//gI18n.tc(prop.headerText)
      } : {
        ...columnHeader,
        text: transLangKey(convertCamelToSnake((prop.name).replace(/([A-Z])/g, function (x, y) { return '_' + y.toLowerCase() }).replace(/^_/, '')).toUpperCase())
      };
    }

    objColumn.header.styles = {
      ...columnHeaderStyles,
      fontBold: prop.requisite === true
    }

    objColumn.header.visible = prop.headerVisible !== undefined ? prop.headerVisible : true;

    let styles = Object.assign({}, prop.styles);
    let editor = Object.assign({}, prop.editor);
    let renderer = Object.assign({}, prop.renderer);

    if (prop.dataType.toUpperCase() === 'TEXT') {
      objColumn.styleName += ' ' + (prop.textAlignment ? 'column-textAlignt-' + prop.textAlignment : 'column-textAlignt-near');

      editor = {
        textWrap: 'normal'
      };

      editor.type = 'text';
    } else if (prop.dataType.toUpperCase() === 'NUMBER') {
      objColumn.styleName += ' ' + (prop.textAlignment ? 'column-textAlignt-' + prop.textAlignment : 'column-textAlignt-far');

      editor = {
        ...editor,
        numberFormat: prop.numberFormat ? prop.numberFormat : (prop.format ? prop.format : '#,###.###'),
        prefix: prop.prefix ? prop.prefix : '',
        suffix: prop.suffix ? prop.suffix : '',
      }

      editor.type = 'number';
      editor.positiveOnly = prop.positiveOnly != undefined ? prop.positiveOnly : editor.positiveOnly;
      editor.integerOnly = prop.integerOnly != undefined ? prop.integerOnly : editor.integerOnly;
      editor.editFormat = prop.editFormat ? prop.editFormat : (prop.format ? prop.format : '#,###.###')
      objColumn.numberFormat = prop.numberFormat ? prop.numberFormat : (prop.format ? prop.format : '#,###.###')
    } else if (prop.dataType.toUpperCase() === 'DATETIME') {
      objColumn.styleName += ' ' + (prop.textAlignment ? 'column-textAlignt-' + prop.textAlignment : 'column-textAlignt-center');

      prop.format = prop.format ? prop.format : 'yyyy-MM-dd HH:mm:ss';

      editor = {
        ...editor,
        type: 'date',
        mask: {
          ...editor.mask,
          editMask: prop.format.replace(/\w/gm, '9'),
          placeHolder: prop.format,
          includedFormat: true
        },
        datetimeFormat: prop.datetimeFormat ? prop.datetimeFormat : prop.format
      }
      objColumn.datetimeFormat = prop.format
    } else if (prop.dataType.toUpperCase() === 'BOOLEAN') {
      objColumn.styleName += ' ' + (prop.textAlignment ? 'column-textAlignt-' + prop.textAlignment : 'column-textAlignt-center');

      renderer = {
        ...renderer,
        type: 'check',
        editable: prop.editable,
        startEditOnClick: true,
        labelPosition: 'hidden',
        shape: 'box',
        trueValues: 'true,TRUE,True,Y,y,1,T,t,on,ON,On',
        falseValues: 'false,FALSE,False,N,n,0,F,f,off,OFF,Off'
      };

      editor = {
        booleanFormat: 'false,N,0,f,off:true,Y,1,t,on:0',
        emptyValue: false
      }

      objColumn.editable = false;
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
      editor.type = 'dropdown';
      editor.textReadOnly = false;
      editor.domainOnly = true;
      editor.dropDownWhenClick = false;
      editor.dropDownCount = 10;

      objColumn.values = prop.values ? prop.values : [];
      objColumn.labels = prop.labels ? prop.labels : [];
      objColumn.lookupDisplay = prop.lookupDisplay !== undefined ? prop.lookupDisplay : true;

      objColumn.styleName += ' ' + (prop.textAlignment ? 'column-textAlignt-' + prop.textAlignment : 'column-textAlignt-near');
    }

    if (prop.editable || prop.renderer && prop.renderer.editable) {
      objColumn.header.styleName += ' editable-header';
      objColumn.styleName += ' editable-column';
      styles.background = '#FFFFFFD2';
    } else {
      styles.background = '#FFF9F9F9';
    }

    if (prop.validRules && prop.validRules.length > 0) {
      if (prop.validRules.findIndex(v => v.criteria === 'required') > -1) {
        objColumn.header.styleName += ' required-header';
      }
    }

    if (prop.imageUrl) {
      objColumn.header.imageUrl = prop.imageUrl;
      objColumn.header.imageLocation = prop.imageLocation ? prop.imageLocation : 'right';
    }

    styles.textWrap = 'explicit';

    if (prop.inputCharacters) {
      editor.inputCharacters = prop.inputCharacters;
    }

    objColumn.styles = styles;
    objColumn.editor = editor;
    objColumn.renderer = renderer;

    if (prop.dynamicStyles) objColumn.dynamicStyles = prop.dynamicStyles;
    if (prop.mergeRule) objColumn.mergeRule = prop.mergeRule;
    if (prop.button) objColumn.button = prop.button;
    if (prop.renderer) objColumn.renderer = Object.assign(objColumn.renderer, prop.renderer);
    if (prop.header) objColumn.header = Object.assign(objColumn.header, prop.header);

    //styleName들을 props에 저장
    if ((prop.accStyle instanceof Set) == false) {
      prop.accStyle = new Set();
    }

    const styleArr = objColumn.styleName ? objColumn.styleName.split(' ') : [];
    styleArr.forEach((style, inx) => {
      if (inx > 0) {
        prop.accStyle.add(style)
      }
    })
    return objColumn;
  }

  const unmount = () => {
    clearCSSSelector();
  }

  const useGridStatTrace = function (viewId, grid) {
    const gridView = grid.gridView;
    const dataProvider = grid.dataProvider;

    const prevHandler = dataProvider.onValueChanged;

    dataProvider.onValueChanged = function (provider, row, field) {
      try {
        commitGrid(gridView)
        let statRows = dataProvider.getAllStateRows();
        let stats = Object.getOwnPropertyNames(statRows);
        let updated = false;
        for (let i = 0, n = stats.length; i < n; i++) {
          let stat = statRows[stats[i]];
          if (stat.length > 0) {
            updated = true;
          }
        }
        setViewGridUpdated(viewId, gridId, updated)
        if (prevHandler)
          prevHandler(provider, row, field)
      }
      catch (e) { }
    };

    const prevonCurrentChanging = gridView.onCurrentChanging;
    gridView.onCurrentChanging = function (grid, oldIndex, newIndex) {
      oldCurrent.current = oldIndex;
      if (prevonCurrentChanging)
        prevonCurrentChanging(grid, oldIndex, newIndex)
    };
  }
  function setOptions(gridView, dataProvider) {
    let editorOptions = {};
    editorOptions.viewGridInside = true;
    if (themeSkin === 'waveDarkBlueSkin') {
      editorOptions.useCssStyleDropDownList = true;
    }

    editorOptions.yearDisplayFormat = '{Y}';
    editorOptions.months = [
      transLangKey('CALENDAR_JAN'), transLangKey('CALENDAR_FEB'), transLangKey('CALENDAR_MAR'), transLangKey('CALENDAR_APR'),
      transLangKey('CALENDAR_MAY'), transLangKey('CALENDAR_JUN'), transLangKey('CALENDAR_JUL'), transLangKey('CALENDAR_AUG'),
      transLangKey('CALENDAR_SEP'), transLangKey('CALENDAR_OCT'), transLangKey('CALENDAR_NOV'), transLangKey('CALENDAR_DEC')
    ]
    editorOptions.weekDays = [
      transLangKey('CALENDAR_SUN'), transLangKey('CALENDAR_MON'), transLangKey('CALENDAR_TUE'), transLangKey('CALENDAR_WED'), transLangKey('CALENDAR_THU'),
      transLangKey('CALENDAR_FRI'), transLangKey('CALENDAR_SAT')
    ]

    dataProvider.setOptions({
      restoreMode: 'auto',
    })

    gridView.setEditorOptions(editorOptions);

    gridView.setEditOptions({
      insertable: true,
      appendable: true,
      commitLevel: 'warning'
    })

    dataProvider.setOptions({ restoreMode: 'auto' });
    gridView.setFooters({ visible: false });
    gridView.setStateBar({ visible: false });
    gridView.setCheckBar({ visible: false })
    gridView.setDisplayOptions({
      showEmptyMessage: true,
      emptyMessage: transLangKey('MSG_NO_DATA'),
      fitStyle: 'evenFill',
      showChangeMarker: false,
      useFocusClass: true
    });

    const cellStyleCallback = function (grid, cell, index) {
      if (index % 2) { return 'rg-alternate-row' } else { return 'rg-white-rowbarcontainer' }
    }

    window.requestAnimationFrame(function () {
      if (props.afterGridCreate) {
        props.afterGridCreate(__realGrid.current, gridView, dataProvider);
      }
    })

    gridView.rowIndicator.cellStyleCallback = cellStyleCallback;
    gridView.stateBar.cellStyleCallback = cellStyleCallback;
    gridView.checkBar.cellStyleCallback = cellStyleCallback;
  }

  const getItems = (arr) => {
    arr && arr.map((item) => {
      if (item.dataType.toLowerCase() === 'group') {
        getItems(item.childs); //그룹 일경우 재귀
      } else {
        flatItems.current.push(item);
      }
    })
  }

  const getColumnValidRules = (colName) => {
    const itemInfos = flatItems.current.filter((item) => {
      return item.name === colName;
    });

    let validRules = [];
    if (itemInfos.length > 0) {
      validRules = itemInfos[0].validRules;
    }
    return validRules;
  }

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    } else {
      reCreateGridItem();
    }
  }, [resetLangEvent])

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    } else {
      if (curGridStatus.current.created == true && curGridStatus.current.gridItemCreating == false && !isDeepOrderlessEqual(__realGrid.current.gridView.columnProps, props.items)) {
        __realGrid.current.gridView.columnProps = props.items
        reCreateGridItem();
      }
    }
  }, [props.items])

  function getGridItem(name) {
    return findGridItem(__realGrid.current.gridView.columnProps, name)
  }

  function getGridItems() {
    return __realGrid.current.gridView.columnProps
  }

  function setGridItems(items) {
    __realGrid.current.gridView.columnProps = items
    reCreateGridItem();
  }

  function registerCustomRenderer(renderName, renderer) {
    let render = [...customRenderer]
    render.push({ name: renderName, renderer: renderer, regist: false })
    setCustomRender(render)
  }

  function getChangedValues(state) {
    const grid1 = __realGrid.current;
    state = state == undefined ? ['created', 'updated', 'deleted'] : state;
    let changes = [];

    grid1.gridView.commit(true);
    changes = changes.concat(
      state.includes('created') ? grid1.dataProvider.getAllStateRows().created : [],
      state.includes('updated') ? grid1.dataProvider.getAllStateRows().updated : [],
      state.includes('deleted') ? grid1.dataProvider.getAllStateRows().deleted : [],
      state.includes('createAndDeleted') ? grid1.dataProvider.getAllStateRows().createAndDeleted : []
    );

    let changeRowData = [];
    changes.forEach(function (row) {
      changeRowData.push(grid1.dataProvider.getJsonRow(row));
    });
    return changeRowData;
  }

  function reCreateGridItem() {
    let gridView = __realGrid.current.gridView;

    const gItems = gridView.columnProps
    const gComboItems = gridView.gridComboItems

    let dataProvider = __realGrid.current.dataProvider;

    if (__realGrid && gItems) {
      createGridItem(gridView, dataProvider, gItems);

      gridView.resetSize();
      saveDefaultLayout(gridView, props.id)
    }

    if (__realGrid && gComboItems) {
      createGridComboItem(gridView, dataProvider, gComboItems);
    }

    if (gItems && Array.isArray(gItems)) {
      gItems.map(col => {
        if (col.lookupData) {
          let lookupCol = gridView.columnByName(col.name)
          if (lookupCol) {
            gridView.setColumnProperty(col.name, 'lookupData', lookupCol.lookupData)
            //lookupCol.lookupData = lookupCol.lookupData
          }
        }
      })
    }
    setOptions(gridView, dataProvider);
  }

  function setColumnProperty(colName, propName, propValue) {

    let items = getGridItems()
    let column = findGridItem(items, colName)

    if (column) {
      column[propName] = propValue;
    }
  }
  /* RealGrid 1.0 처럼 cell Style 적용위해서 */
  /**
   * 
   * @param {*} gridView 
   * @param {*} rowIdx 
   * @param {*} colName 
   * @param {*} styleName 
   */
  function setCellStyles(gridView, rowIdx, colName, styleName) {
    if (!gridView.customStyles)
      gridView.customStyles = []

    if (Array.isArray(rowIdx)) {
      if (Array.isArray(colName)) {
        for (let r = 0; r < rowIdx.length; r++) {
          for (let c = 0; c < colName.length; c++) {
            setCellStyle(gridView, rowIdx[r], colName[c], styleName)
          }
        }
      }
      else {
        for (let r = 0; r < rowIdx.length; r++) {
          setCellStyle(gridView, rowIdx[r], colName, styleName)
        }
      }
    }
    else {
      if (Array.isArray(colName)) {
        for (let c = 0; c < colName.length; c++) {
          setCellStyle(gridView, rowIdx, colName[c], styleName)
        }

      }
      else {
        setCellStyle(gridView, rowIdx, colName, styleName)
      }
    }
  }

  function setCellStyle(gridView, rowIdx, colName, styleName) {

    if (!gridView.customStyles)
      gridView.customStyles = []


    let idx = gridView.customStyles.findIndex(v => v.rowIdx === rowIdx && v.colName === colName)

    if (idx < 0) {

      let style = { rowIdx: rowIdx, colName: colName, styleName: styleName, accStyle: new Set() }
      const column = getGridItem(colName)
      if (column && column.accStyle) {
        [...column.accStyle].forEach(style.accStyle.add, style.accStyle)
      }

      style.accStyle.add(styleName)
      style.accStyle.delete("")
      gridView.customStyles.push(style)
    }
    else {
      let style = gridView.customStyles[idx]
      const column = getGridItem(colName)
      if (column && column.accStyle) {
        [...column.accStyle].forEach(style.accStyle.add, style.accStyle)
      }
      style.accStyle.add(styleName)
      style.accStyle.delete("")
      gridView.customStyles.splice(idx, 1, style)
    }
  }

  function unSetCellStyles(gridView, rowIdx, colName, styleName) {
    if (!gridView.customStyles)
      gridView.customStyles = []

    if (Array.isArray(rowIdx)) {
      if (Array.isArray(colName)) {
        for (let r = 0; r < rowIdx.length; r++) {
          for (let c = 0; c < colName.length; c++) {
            unSetCellStyle(gridView, rowIdx[r], colName[c], styleName)
          }
        }
      }
      else {
        for (let r = 0; r < rowIdx.length; r++) {
          unSetCellStyle(gridView, rowIdx[r], colName, styleName)
        }
      }
    }
    else {
      if (Array.isArray(colName)) {
        for (let c = 0; c < colName.length; c++) {
          unSetCellStyle(gridView, rowIdx, colName[c], styleName)
        }

      }
      else {
        unSetCellStyle(gridView, rowIdx, colName, styleName)
      }
    }
  }

  function unSetCellStyle(gridView, rowIdx, colName, styleName) {

    if (!gridView.customStyles)
      return;
    let idx = gridView.customStyles.findIndex(v => v.rowIdx === rowIdx && v.colName === colName)

    if (idx >= 0) {
      let style = gridView.customStyles[idx]
      style.accStyle.delete(styleName)
      gridView.customStyles.splice(idx, 1, style)
    }
  }

  function addCellStyle(gridView, styleName, style) {
    if (!gridView.specificStyle)
      gridView.specificStyle = {}

    if (gridView.specificStyle && gridView.specificStyle[styleName]) {
      let selectorName = gridView.specificStyle[styleName];
      dynamicCSSSelector(style, selectorName)
    }
    else {
      let selectorName = `${styleName}_${createUniqueKey()}_styles`
      selectorName = dynamicCSSSelector(style, selectorName)
      gridView.specificStyle[styleName] = selectorName;
    }

    if (!gridView.styleItems)
      gridView.styleItems = []

    let styleObj = { styleName: styleName, style: style }
    let idx = gridView.styleItems.findIndex(v => v.styleName === styleName);

    if (idx < 0)
      gridView.styleItems.push(styleObj)
    else
      gridView.styleItems.splice(idx, 1, styleObj)
  }

  function findGroupItem(items, grpName) {
    let justThat = items.filter(v => (v.dataType == 'group') && v.name == grpName)
    if (justThat && justThat.length > 0)
      return justThat[0];

    let grps = items.filter(v => v.dataType == 'group')
    for (let i = 0; i < grps.length; i++) {
      let grp = grps[i]
      let isThis = findGroupItem(grp.childs, grpName)
      if (isThis)
        return isThis;
    }
  }

  function findGridItem(items, name) {
    let justThat = items.filter(v => v.name == name)
    if (justThat && justThat.length > 0)
      return justThat[0];

    let grps = items.filter(v => v.dataType == 'group')
    for (let i = 0; i < grps.length; i++) {
      let grp = grps[i]
      let isThis = findGridItem(grp.childs, name)
      if (isThis)
        return isThis;
    }
  }

  function findParentArray(itemArr, name) {
    for (let i = 0; i < itemArr.length; i++) {
      const item = itemArr[i];
      if (item.name === name)
        return itemArr;

      if (item.dataType == 'group') {
        return findParentArray(item.childs, name)
      }
    }
  }

  function removeGridItems(columnIds, all) {
    if (all) {
      setGridItems([])
    }
    else {
      let reCreate = false;
      let newItems = [...getGridItems()];
      if (newItem) {
        if (Array.isArray(columnIds)) {
          for (let i = 0; i < columnIds.length; i++) {
            const columnId = columnIds[i];
            let arrItems = findParentArray(newItems, columnId)
            if (arrItems) {
              let idx = arrItems.findIndex(v => v.name == columnId)
              if (idx) {
                arrItems = arrItems.splice(idx, 1)
                reCreate = true;
              }
            }
          }
          if (reCreate) {
            setGridItems(newItems)
          }
        }
        else {
          const columnId = columnIds;
          let arrItems = findParentArray(newItems, columnId)
          if (arrItems) {
            let idx = arrItems.findIndex(v => v.name == columnId)
            if (idx) {
              arrItems = arrItems.splice(idx, 1)
              setGridItems(newItems)
            }
          }
        }
      }
    }
  }

  function removeGridItem(itemName) {
    let items = [...getGridItems()]

    let itemContains = findParentArray(items, itemName)
    if (itemContains) {
      const idx = itemContains.findIndex(v => v.name == itemName)
      itemContains.splice(idx, 1)
    }

    if (items) {
      setGridItems(items)
    }
  }

  function addGridItem(newItem, grpName, idx) {

    let items = [...getGridItems()]
    if (grpName) {
      //find group
      let grpItem = findGroupItem(items, grpName)
      if (grpItem && grpItem.childs) {
        grpItem.childs.splice(idx, 0, newItem);
      }
    }
    else {
      items.splice(idx, 0, newItem);
    }

    if (items) {
      setGridItems(items)
    }
  }

  function addGridItems(newItems, recreate) {
    let items = []
    if (recreate)
      items = [...newItems];
    else {
      let columnProps = getGridItems();
      items = columnProps.concat(newItems)
    }

    if (items) {
      setGridItems(items)
    }
  }

  function dynamicCSSSelector(styles, name) {
    let selectorName;

    if (!name)
      selectorName = `dynamic_${createUniqueKey()}_styles`
    else
      selectorName = name;

    selectorName = selectorName.replace(/[,\.-]/gi, '_')
    if (typeof styles === 'string')
      createCSSSelector(selectorName, styles);
    else
      createCSSSelector(selectorName, JSonToStyleString(styles));

    if (dynamicCSS.current.findIndex(v => v === selectorName) < 0)
      dynamicCSS.current.push(selectorName);
    return selectorName;
  }

  function clearCSSSelector(selectorName) {
    if (selectorName) {
      deleteCSSSelector(selectorName);
      let idx = dynamicCSS.current.findIndex(v => v === selectorName)
      if (idx >= 0) {
        dynamicCSS.current.splice(idx, 1);
      }
    }
    else {
      for (let i = 0; i < dynamicCSS.current.length; i++) {
        deleteCSSSelector(dynamicCSS.current[i]);
      }
      dynamicCSS.current.splice(0, dynamicCSS.current.length)
    }
  }

  function checkInputCharValid(headerText, valid, value) {
    let inputReg;

    let err = { level: "error", message: '' };
    if (value !== undefined && value !== null && value !== "") {

      if ("positive" == valid) {
        inputReg = new RegExp(/^\d*[.]*\d*$/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("number" == valid) {
        inputReg = new RegExp(/^[0-9]+$/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("alphaonly" == valid) {
        inputReg = new RegExp(/^[a-zA-Z]+$/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("notspecial" == valid) {
        inputReg = new RegExp(/^[a-zA-Z0-9]+$/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("email" == valid) {
        inputReg = new RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }

      } else if ("tel" == valid) {
        inputReg = new RegExp(/^\d{2,3}-\d{3,4}-\d{4}$/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("jumin" == valid) {
        inputReg = new RegExp(/\d{6} \- [1-4]\d{6}/);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("nothangul" == valid) {
        inputReg = new RegExp(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]+/g);

        if (inputReg.test(value) == true) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else if ("color" == valid) {
        inputReg = new RegExp(/^#[a-fA-F0-9]{6}$/g);

        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      } else {
        inputReg = new RegExp(valid);
        if (inputReg.test(value) == false) {
          err.message = `[${headerText}]` + transLangKey("MSG_CHECK_VALID_INPUT");
          return err;
        }
      }
      return true;
    }
    return true;
  }
  function getHeaderText(gridView, colName) {
    let sHeaderText = '';

    if (colName) {
      let oCol = gridView.columnByName(colName);
      if (oCol) {
        let sParentText = (oCol.parent ? getHeaderText(gridView, oCol.parent) : '');
        sHeaderText = (sParentText ? sParentText + '-' : '') + oCol.header.text;
      }
    }
    return sHeaderText;
  }

  function loadLayoutInfos(gridView, layouttype, defaultApply) {
    if (props.gridCd) {
      gridView.usingPrefInfo = true;
      setGridContextMenu(gridView, {username, systemAdmin}, openLayoutDlg);
    } else {
      gridView.usingPrefInfo = false;
      zAxios.get(baseURI() + 'system/users/grid-layouts', {
        params: {
          username: username,
          menuCode: vom.active,
          gridCode: gridView.id,
          layoutType: 'layout'
        },
        waitOn: false
      }).then(function (response) {
        const layoutDt = response.data;
        setGridContextMenu(gridView, {username, systemAdmin}, openLayoutDlg, layoutDt);

        if (defaultApply && layoutDt && layoutDt.length > 0) {
          let layoutInfo = getLayout(layoutDt, 'default')
          if (layoutInfo) {
            applyLayoutGrid(gridView, layoutInfo, setCurLayoutName)
          }
        }
        if (layoutDt && layoutDt.length > 0)
          setHeaderLayouts(layoutDt);
      })
        .catch(function (err) {
          setGridContextMenu(gridView, {username, systemAdmin}, openLayoutDlg);
        })
    }
  }

  function loadGridLayouts(gridView, userinfo) {
    if (props.gridCd) {
      gridView.usingPrefInfo = true;
    } else {
      gridView.usingPrefInfo = false;
      axios.get(baseURI() + "system/users/grid-layouts", {
        params: {
          username: userinfo.username,
          menuCode: vom.active,
          gridCode: gridView.id,
          layoutType: 'layout'
        }
      }).then(function (response) {
        if (response.data.length > 0) {
          let decodeData = response.data;
          decodeData.forEach(layout => {
            let type = 'normal';
            let objPsnl = JSON.parse(localStorage.getItem('personalization'))
            if (layout.layoutName === objPsnl.layout && gridView.id === objPsnl.grid) {
              type = 'check';
            }
            gridView.layouts.push({ label: layout.layoutName, tag: "LOAD_GRID_LAYOUT_" + layout.layoutName, type: type });
  
            if ((userinfo.systemAdmin || layout.allUser !== 'Y') && userinfo.username === layout.username) {
              gridView.dlayouts.push({ label: layout.layoutName, tag: "DELETE_GRID_LAYOUT_" + layout.layoutName });
            }
          });
        }
      })
    }
  
  }
  const loadCrossTabInfoAndPrefInfo = async (viewCd, grpCd) => {
    viewCd = props.viewCd
    grpCd = props.grpCd

    const crossTabInfo = await loadCrossTabInfo(viewCd, grpCd, __realGrid.current);
    const prefInfo = await loadPrefInfo(viewCd, grpCd, __realGrid.current);

    const gridView = __realGrid.current.gridView
    const dataProvider = __realGrid.current.dataProvider
    const resultData = props.griddata || dataProvider.getJsonRows();

    makeGridWithPreferenceInfos(gridView, dataProvider, prefInfo, crossTabInfo, resultData)
  }

  function setGridPreferenceInfo(gridView, prefInfo) {
    if (prefInfo !== undefined) {
      gridView.prefInfo = prefInfo.filter(item => item.gridCd == gridView.orgId || !item.gridCd);
    }
  }

  function makeGridWithPreferenceInfos(gridView, dataProvider, prefInfo, crossTab, resultData) {
    if (prefInfo !== undefined) {
      gridView.prefInfo = prefInfo.filter(item => item.gridCd == gridView.orgId || !item.gridCd);
    }

    if (crossTab) {
      if (crossTab instanceof Array && crossTab.length > 0) {
        gridView.crossTabInfo = crossTab[0][gridView.orgId];
      } else {
        gridView.crossTabInfo = crossTab[gridView.orgId];
      }
    }
    makeGridColumnWithPrefInfo(gridView, dataProvider, resultData)
  }

  const makeGridColumnWithPrefInfo = (gridView, dataProvider, resultData) => {
    if (props.grid_doBeforeSetData) {
      props.grid_doBeforeSetData(gridView, dataProvider, resultData)
    }

    gridView.bindingStatus = 'INIT';

    let prefInfoDB;
    if (gridView.prefInfo) {
      prefInfoDB = TAFFY(gridView.prefInfo);
    }

    gridView.dataColumns = [];

    dataProvider.clearRows();
    dataProvider.clearSavePoints();

    let fixedOptions = gridView.getFixedOptions();
    fixedOptions.rowCount = 0;
    gridView.setFixedOptions(fixedOptions);

    let columns = [];
    let arrArrangedColumns = getArrangedColumns(gridView);

    let dataFieldNames = [];
    if (resultData && resultData.length > 0) {
      dataFieldNames = Object.keys(resultData[0]);
    }

    let columnFixIndex = 0;
    let isFixed = false;
    let fixedColumnMap = {};

    let staticColumnsMap = {};
    let staticGridGroupHeaders = [];

    let columnIndexNo = 0;
    gridView.headerDepth = 0;

    for (let arrIdx = 0, arrLen = arrArrangedColumns.length; arrIdx < arrLen; arrIdx++) {
      let arrangedColumns = arrArrangedColumns[arrIdx];

      if (!isIterationColumn(gridView, arrangedColumns[0])) {
        let groupWidth = 0;
        let dataColumns = [];

        for (let arrangedColumnsIdx = 0, length = arrangedColumns.length; arrangedColumnsIdx < length; arrangedColumnsIdx++) {
          let columnId = arrangedColumns[arrangedColumnsIdx];
          let dataColumn = createDataColumn(gridView, columnId, columnId, false);
          dataColumn.columnIndexNo = columnIndexNo;
          columnIndexNo++;

          if (!isFixed) {
            let isFixedCol = isFixedColumn(gridView, arrangedColumns);
            dataColumn.isFixed = isFixedCol;
            isFixed = isFixedCol;
            if (isFixedCol) {
              fixedColumnMap[arrangedColumns.toString()] = true;
            }
          } else {
            dataColumn.isFixed = false;
          }

          groupWidth = groupWidth + dataColumn.width;
          dataColumns.push(dataColumn);
        }

        let groupHeaders = [];
        let groupHeader = getColumnProp(gridView, arrangedColumns[0], 'groups')
        if (groupHeader) {
          groupHeaders = groupHeader.split(',');
          staticGridGroupHeaders.push(groupHeaders);
        }

        if (groupHeaders.length > 0) {
          for (let groupHeadersIndex = 0, groupHeadersLen = groupHeaders.length; groupHeadersIndex < groupHeadersLen; groupHeadersIndex++) {
            let groupHeader = groupHeaders[groupHeadersIndex];
            let groupColumnVisible = false;
            let headerBackgroundColors = [];

            for (let columnIdx = 0, arrangedColumnsLen = arrangedColumns.length; columnIdx < arrangedColumnsLen; columnIdx++) {
              if (getColumnProp(gridView, arrangedColumns[columnIdx], 'visible')) {
                groupColumnVisible = true;
              }

              let headerBackground = getColumnProp(gridView, arrangedColumns[columnIdx], 'headerBackground')
              if (headerBackground) {
                headerBackgroundColors.push(headerBackground);
              }
            }

            let headerStyles = {};

            if (headerBackgroundColors.length > 0) {
              headerStyles.background = headerBackgroundColors[0];
            }

            let header = {};
            header.text = transLangKey(groupHeader);
            header.styleName = gridView.dynamicCSSSelector(headerStyles);

            let groupColumn = {};
            groupColumn.dataType = 'group';
            groupColumn.name = arrangedColumns.toString() + '_' + groupHeader;
            groupColumn.width = 0;
            groupColumn.header = header.text;
            groupColumn.headerText = header;
            groupColumn.visible = groupColumnVisible;
            groupColumn.orientation = 'horizontal';
            groupColumn.childs = [];
            groupColumn.level = groupHeadersIndex;

            if (gridView.headerDepth < groupHeadersIndex + 1) {
              gridView.headerDepth = groupHeadersIndex + 1;
            }

            if (!isFixed || fixedColumnMap.hasOwnProperty(arrangedColumns.toString())) {
              let isFixedCol = isFixedColumn(gridView, arrangedColumns);
              groupColumn.isFixed = isFixedCol;
              isFixed = isFixedCol;
              if (isFixedCol) {
                fixedColumnMap[arrangedColumns.toString()] = true;
              }
            } else {
              groupColumn.isFixed = false;
            }

            if (groupHeaders.length === groupHeadersIndex + 1) {
              groupColumn.childs = groupColumn.childs.concat(dataColumns);

              groupColumn.width = groupWidth;
              updateParentWidth(staticColumnsMap, groupHeaders, groupWidth, groupHeadersIndex);
            }

            if (groupHeadersIndex === 0) {
              groupColumn.columnIndexNo = columnIndexNo;
              columnIndexNo++;
            }

            let columnsConcatFlag = true;
            if (!staticColumnsMap.hasOwnProperty(groupHeader)) {
              staticColumnsMap[groupHeader] = groupColumn;
            } else {
              staticColumnsMap[groupHeader].childs = staticColumnsMap[groupHeader].childs.concat(groupColumn.childs);
              staticColumnsMap[groupHeader].width = staticColumnsMap[groupHeader].width + groupColumn.width;
              columnsConcatFlag = false;
            }

            let parent = groupHeaders[groupHeadersIndex - 1];
            if (parent && columnsConcatFlag) {
              staticColumnsMap[parent].childs.push(groupColumn);
            }
          }
        } else {
          staticColumnsMap[dataColumns[0].name] = dataColumns[0];
        }
      }
      else {
        let columnsMap = {};
        let dynamicFieldNames = [];

        for (let arrangedColumnsIdx = 0, arrangedColumnsLen = arrangedColumns.length; arrangedColumnsIdx < arrangedColumnsLen; arrangedColumnsIdx++) {
          let columnId = arrangedColumns[arrangedColumnsIdx];

          let columnPrefix = getColumnProp2(gridView, columnId, 'iteration', 'prefix')
          let columnPostfix = getColumnProp2(gridView, columnId, 'iteration', 'postfix')

          let names = [];

          for (let dataFieldIdx = 0, dataFieldLen = dataFieldNames.length; dataFieldIdx < dataFieldLen; dataFieldIdx++) {
            let fieldName = dataFieldNames[dataFieldIdx];
            if ((fieldName.startsWith(columnPrefix) && fieldName.endsWith(columnPostfix))
              || (fieldName.startsWith(columnPrefix) && fieldName.endsWith(transLangKey(columnPostfix)))) {
              names.push(fieldName);
            }
          }

          let ordinalPosition = getColumnProp2(gridView, columnId, 'iteration', 'ordinalPosition')
          names.sort(function (a, b) {
            let ac = a.replace(columnPrefix, '').replace(columnPostfix, '');
            let bc = b.replace(columnPrefix, '').replace(columnPostfix, '');

            if (ordinalPosition) {
              let acPos = ordinalPosition.indexOf(ac);
              let bcPos = ordinalPosition.indexOf(bc);

              if (acPos !== -1 && bcPos !== -1) {
                ac = acPos;
                bc = bcPos;
              } else if (acPos !== bcPos) {
                if (acPos === -1) {
                  return 1;
                } else if (bcPos === -1) {
                  return -1;
                }
              }
            }

            if (ac > bc) {
              return 1;
            } else if (ac < bc) {
              return -1;
            } else {
              return 0;
            }
          });

          dynamicFieldNames = dynamicFieldNames.concat(names);
        }

        for (let dynamicFieldNamesIdx = 0, dynamicFieldNamesLen = dynamicFieldNames.length; dynamicFieldNamesIdx < dynamicFieldNamesLen; dynamicFieldNamesIdx++) {
          let fieldName = dynamicFieldNames[dynamicFieldNamesIdx];
          let groupWidth = 0;

          for (let arrangedColumnsIdx = 0, arrangedColumnsLen = arrangedColumns.length; arrangedColumnsIdx < arrangedColumnsLen; arrangedColumnsIdx++) {
            let iterationColumnId = arrangedColumns[arrangedColumnsIdx];

            let columnIterationPrefix = getColumnProp2(gridView, iterationColumnId, 'iteration', 'prefix')
            let columnIterationPostfix = getColumnProp2(gridView, iterationColumnId, 'iteration', 'postfix')

            if ((fieldName.startsWith(columnIterationPrefix) && fieldName.endsWith(columnIterationPostfix))
              || (fieldName.startsWith(columnIterationPrefix) && fieldName.endsWith(transLangKey(columnIterationPostfix)))) {

              let dataColumn = createDataColumn(gridView, fieldName, iterationColumnId, true);
              dataColumn.columnIndexNo = columnIndexNo;
              columnIndexNo++;

              if (!isFixed) {
                let isFixedCol = isFixedColumn(gridView, arrangedColumns);
                dataColumn.isFixed = isFixedCol;
                isFixed = isFixedCol;
                if (isFixedCol) {
                  fixedColumnMap[arrangedColumns.toString()] = true;
                }
              } else {
                dataColumn.isFixed = false;
              }

              groupWidth = groupWidth + dataColumn.width;

              let seqPattern = /SEQ\d{3}|,SEQ_\d{3}/gi;
              let seqMatchTest = fieldName.match(seqPattern);
              if (seqMatchTest != undefined && seqMatchTest != '' && seqMatchTest.length > 0) {
                for (let matchIdx = 0, matchLen = seqMatchTest.length; matchIdx < matchLen; matchIdx++) {
                  let matchedStr = seqMatchTest[matchIdx];
                  fieldName = fieldName.replace(matchedStr, '');
                }
              }

              let groupHeader = fieldName;

              let colorTest = groupHeader.match(/,COLOR_\w{6}/gi);
              if (colorTest && colorTest.length > 0) {
                groupHeader = groupHeader.replace(colorTest[0], '');
              }

              let remarkTest = groupHeader.match(/REMARK_\w+/gi);
              if (remarkTest && remarkTest.length > 0) {
                groupHeader = groupHeader.replace('REMARK_', '');
              }

              if (getColumnProp2(gridView, iterationColumnId, 'iteration', 'prefixRemove')) {
                groupHeader = groupHeader.replace(columnIterationPrefix, '');
                groupHeader = groupHeader.replace(transLangKey(columnIterationPrefix), '');
              }

              if (getColumnProp2(gridView, iterationColumnId, 'iteration', 'postfixRemove')) {
                groupHeader = groupHeader.replace(columnIterationPostfix, '');
                groupHeader = groupHeader.replace(transLangKey(columnIterationPostfix), '');
              }

              let groupHeaders = [];
              if (groupHeader.length > 0) {
                if (hasColumnProp2(gridView, iterationColumnId, 'iteration', 'delimiter')) {
                  let delimiterOnColumn = getColumnProp2(gridView, iterationColumnId, 'iteration', 'delimiter')

                  if (groupHeader.lastIndexOf(delimiterOnColumn) == groupHeader.length - 1) {
                    groupHeader = groupHeader.substring(0, groupHeader.length - 1);
                  }

                  let groupHeaderSplitResult_1 = groupHeader.split(delimiterOnColumn);

                  let delimiterOnCrosstabInfo = ',';
                  let crossTabInfo = gridView.crossTabInfo;
                  if (crossTabInfo && Object.keys(crossTabInfo).includes('itc2to1')) {
                    delimiterOnCrosstabInfo = crossTabInfo['itc2to1']['delimiter'] ? crossTabInfo['itc2to1']['delimiter'] : ',';
                  }

                  for (let ghIdx = 0, ghSplitResultLen = groupHeaderSplitResult_1.length; ghIdx < ghSplitResultLen; ghIdx++) {
                    let groupHeaderSplitResult_2 = groupHeaderSplitResult_1[ghIdx].split(delimiterOnCrosstabInfo);
                    groupHeaders.push.apply(groupHeaders, groupHeaderSplitResult_2);
                  }
                } else {
                  groupHeaders.push(groupHeader);
                }
              }

              if (getColumnProp2(gridView, iterationColumnId, 'iteration', 'headerSeq') === 'desc') {
                groupHeaders.reverse();
              }

              let title = getColumnProp2(gridView, iterationColumnId, 'title')
              if (title && title.toUpperCase() !== PREF_FIELD_NM) {
                dataColumn.header.text = transLangKey(title);
              } else {
                let dataColumnHeaderText = groupHeaders[groupHeaders.length - 1];
                let prefFieldApplyCd, prefFieldApplyCdLang;

                if (prefInfoDB) {
                  let prefField = prefInfoDB().filter({ fldCd: dataColumnHeaderText }).get()[0];
                  if (prefField) {
                    prefFieldApplyCd = prefField['fldApplyCd'];
                    prefFieldApplyCdLang = transLangKey(prefField['fldApplyCdLang']);
                  }
                }

                if (prefFieldApplyCdLang) {
                  dataColumnHeaderText = prefFieldApplyCdLang;
                } else if (prefFieldApplyCd) {
                  dataColumnHeaderText = prefFieldApplyCd;
                } else {
                  dataColumnHeaderText = transLangKey(dataColumnHeaderText);
                }

                dataColumn.header.text = dataColumnHeaderText;

                groupHeaders.pop();
              }

              if (groupHeaders.length > 0) {
                for (let groupHeadersIndex = 0, groupHeadersLen = groupHeaders.length; groupHeadersIndex < groupHeadersLen; groupHeadersIndex++) {
                  let groupHeaderText = groupHeaders[groupHeadersIndex];
                  let header = {};
                  let headerBackgroundColors = [];
                  let groupColumnVisible = false;
                  for (let columnIdx = 0, arrangedColumnsLen = arrangedColumns.length; columnIdx < arrangedColumnsLen; columnIdx++) {
                    if (getColumnProp(gridView, arrangedColumns[columnIdx], 'visible')) {
                      groupColumnVisible = true;
                    }

                    let headerBackground = getColumnProp(gridView, arrangedColumns[columnIdx], 'headerBackground')
                    if (headerBackground) {
                      headerBackgroundColors.push(headerBackground);
                    }
                  }

                  let headerStyles = {};

                  if (headerBackgroundColors.length > 0) {
                    headerStyles.background = headerBackgroundColors[0];
                  }

                  let groupColumn = {};
                  groupColumn.dataType = 'group';
                  groupColumn.name = arrangedColumns.toString() + '_' + groupHeaderText;
                  groupColumn.width = 0;
                  groupColumn.visible = groupColumnVisible;
                  groupColumn.orientation = 'horizontal';
                  groupColumn.childs = [];
                  groupColumn.level = groupHeadersIndex;

                  if (gridView.headerDepth < groupHeadersIndex + 1) {
                    gridView.headerDepth = groupHeadersIndex + 1;
                  }

                  let tempColumnTitle = propColumnTitle(gridView, iterationColumnId);
                  if (groupColumn.level === 0 && tempColumnTitle) {
                    if (tempColumnTitle.toUpperCase() === PREF_FIELD_NM) {
                      if (prefInfoDB) {
                        let columnPrefInfo = prefInfoDB().filter({ fldCd: iterationColumnId }).get()[0];

                        if (columnPrefInfo) {
                          let fieldNM = columnPrefInfo['fldApplyCd'];
                          if (fieldNM) {
                            groupHeaderText = fieldNM;
                          }
                        }
                      }
                    }
                  }

                  header.text = transLangKey(groupHeaderText);
                  header.styleName = gridView.dynamicCSSSelector(headerStyles);
                  groupColumn.header = header;
                  groupColumn.headerText = header.text;

                  groupColumn.columnIdOrg = iterationColumnId;
                  if (!isFixed || fixedColumnMap.hasOwnProperty(arrangedColumns.toString())) {
                    let isFixedCol = isFixedColumn(gridView, arrangedColumns);
                    groupColumn.isFixed = isFixedCol;
                    isFixed = isFixedCol;

                    if (isFixedCol) {
                      fixedColumnMap[arrangedColumns.toString()] = true;
                    }
                  } else {
                    groupColumn.isFixed = false;
                  }

                  let groupIdentifier = '_';
                  for (let i = 0; i < groupHeadersIndex; i++) {
                    groupIdentifier = groupIdentifier + groupHeaders[i];
                  }

                  if (groupHeadersIndex === 0) {
                    groupColumn.columnIndexNo = columnIndexNo;
                    columnIndexNo++;
                  }

                  if (groupHeaders.length === groupHeadersIndex + 1) {
                    if (columnsMap.hasOwnProperty(groupHeadersIndex + '_' + groupHeaderText + groupIdentifier)) {
                      columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier].childs.push(dataColumn);
                      columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier].width = columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier].width + groupWidth;
                    } else {
                      groupColumn.childs.push(dataColumn);
                      groupColumn.width = groupWidth;
                    }
                    updateParentWidth2(columnsMap, groupHeaders, groupWidth, groupHeadersIndex);
                  }

                  if (!columnsMap.hasOwnProperty(groupHeadersIndex + '_' + groupHeaderText + groupIdentifier)) {
                    columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier] = groupColumn;
                  }

                  let parent = groupHeaders[groupHeadersIndex - 1];
                  if (parent) {
                    groupIdentifier = '_';
                    for (let i = 0; i < groupHeadersIndex - 1; i++) {
                      groupIdentifier = groupIdentifier + groupHeaders[i];
                    }
                    columnsMap[(groupHeadersIndex - 1) + '_' + parent + groupIdentifier].childs.push(groupColumn);
                  }
                }
              } else {
                columnsMap[dataColumn.name] = dataColumn;
              }
            }
          }
        }

        let columnKeys = Object.keys(columnsMap);
        for (let columnKeysIdx = 0, columnKeysLen = columnKeys.length; columnKeysIdx < columnKeysLen; columnKeysIdx++) {
          let column = columnsMap[columnKeys[columnKeysIdx]];
          if (column) {
            if (column.dataType === 'group') {
              if (column.level === 0) {
                columns.push(column);
              }
            } else {
              columns.push(column);
            }
          }
        }
      }
    }

    gridView.staticColumnsMap = staticColumnsMap;

    let staticColumns = [];

    cleanupNoChildGroupColumns(columns);
    let columnKeys = Object.keys(staticColumnsMap);

    for (let columnKeysIdx = 0, columnKeysLen = columnKeys.length; columnKeysIdx < columnKeysLen; columnKeysIdx++) {
      let key = columnKeys[columnKeysIdx];
      for (let i = 0; i < staticGridGroupHeaders.length; i++) {
        if (staticGridGroupHeaders[i].includes(key) && staticGridGroupHeaders[i].indexOf(key) > 0) {
          delete staticColumnsMap[key];
        }
      }
    }

    for (let columnKeysIdx = 0, columnKeysLen = columnKeys.length; columnKeysIdx < columnKeysLen; columnKeysIdx++) {
      let key = columnKeys[columnKeysIdx];

      let column = staticColumnsMap[key];
      if (typeof column !== 'undefined' && column.dataType === 'group') {
        if (column.childs.length < 1) {
          delete staticColumnsMap[key];
        } else {
          cleanupNoChildGroupColumns(column.childs);
        }
      }
    }

    for (let columnKeysIdx = 0, columnKeysLen = columnKeys.length; columnKeysIdx < columnKeysLen; columnKeysIdx++) {
      let key = columnKeys[columnKeysIdx];
      if (typeof staticColumnsMap[key] !== 'undefined') {
        staticColumns.push(staticColumnsMap[key]);
      }
    }

    columns = staticColumns.concat(columns);
    columns = columnsSort(columns);

    const grid1 = __realGrid.current;
    grid1.addGridItems(columns, true)

    if (resultData) {
      dataProvider.fillJsonData(resultData);
    }

    setGridSortOrder(gridView, dataFieldNames);
    setInitGroupOrder(gridView);

    gridView.styleExceptCells = [];
    window.requestAnimationFrame(function () {
      gridView.bindingStatus = 'RDY';
    });

    gridView.resetSize();

    if (gridView.lookups && Object.getOwnPropertyNames(gridView.lookups).length > 0) {
      arrangeLookups(this, dataProvider);
    }

    if (gridView.invisibleColumnIds && gridView.invisibleColumnIds.length > 0) {
      let invisible = gridView.invisibleColumnIds.unique();
      let dataColumnDB = TAFFY(gridView.dataColumns);

      setTimeout(function () {
        for (let i = 0, invisibleLength = invisible.length; i < invisibleLength; i++) {
          let actualColumns = dataColumnDB().filter({ columnIdOrg: invisible[i] }).get();
          for (let j = 0, actualColumnsLength = actualColumns.length; j < actualColumnsLength; j++) {
            gridView.setColumnProperty(actualColumns[j].name, 'visible', false);
            if (gridView.prefInfo && gridView.prefInfo.length > 0 && prefInfoDB.length > 0) {
              gridView.setColumnProperty(actualColumns[j].name, 'width', prefInfoDB().filter({ fldCd: actualColumns[j].columnIdOrg }).get()[0].fldWidth);
            }
          }
        }
      }, 300);

      gridView.invisibleColumnIds = [];
    }
    window.requestAnimationFrame(function () {
      gridView.activatedColumnFilters = {};
    });

    window.requestAnimationFrame(function () {
      fitGridData(gridView);
    });
    if (props.grid_doAfterSetData) {
      props.grid_doAfterSetData(gridView, dataProvider, resultData)
    }
  }

  function setGridCrosstabInfo(gridView, crossTab) {
    if (crossTab) {
      if (crossTab instanceof Array && crossTab.length > 0) {
        gridView.crossTabInfo = crossTab[0][gridView.orgId];
      } else {
        gridView.crossTabInfo = crossTab[gridView.orgId];
      }
    }
  }

  function addLayout(data) {
    if (layoutName === '') {
      //MSG_VALID_CHECK_GRID_LAYOUT_001 : 레이아웃 이름을 입력해주세요.
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_VALID_CHECK_GRID_LAYOUT_001'), { close: false })
      return;
    } else if (layoutName === 'default') {
      //MSG_VALID_CHECK_GRID_LAYOUT_002 : 레이아웃 이름으로 default 는 사용할 수 없습니다.
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_VALID_CHECK_GRID_LAYOUT_002'), { close: false })
      return;
    }
    addGridLayout(gridView, { username, systemAdmin }, { allUser, layoutName })
    openLayoutDlg(false);
  }
  function handlePopLayoutNameChange(event) {
    setLayoutName(event.target.value);
  }
  function handlePopAllUserChange(event) {
    setAllUser(event.target.checked);
  }
  function saveLayout(data) {

    let lm = refPopLayoutName.current;
    let lt = refPopLayoutType.current;
    let allUser = refPopAllUser.current;
    const gridView = __realGrid.current.gridView;
    //console.log('saveLayout',lm,lt, allUser)
    saveGridLayout(gridView, lm, lt, allUser)

    openLayoutDlg(false);
  }
  const loadCrossTabInfo = async (viewCd, grpCd, grid) => {
    if (!viewCd || !grid)
      return;

    let retData = null;
    let param = {
      'view-cd': viewCd,
      username: username || ''
    }
    if (grpCd)
      param['grp-cd'] = grpCd;

    await zAxios({
      method: 'get',
      header: { 'content-type': 'application/json' },
      url: 'system/users/preferences/crosstab-info',
      params: param,
      waitOn: false,
    })
      .then(function (res) {
        retData = res.data
        setGridCrosstabInfo(grid.gridView, res.data)
      })
      .catch(function (err) {
        console.log(err);
      })
    return retData;
  }

  const loadPrefInfo = async (viewCd, grpCd, grid) => {
    if (!viewCd || !grid)
      return;

    let retData = null;
    let param = {
      'view-cd': viewCd,
      username: username || ''
    }
    if (grpCd)
      param['grp-cd'] = grpCd;

    await zAxios({
      method: 'get',
      header: { 'content-type': 'application/json' },
      url: 'system/users/preferences/pref-info',
      params: param,
      waitOn: false
    })
      .then(function (res) {
        retData = res.data
        setGridPreferenceInfo(grid.gridView, res.data)
      })
      .catch(function (err) {
        console.log(err);
      })
    return retData;
  }
  function createGridComboItem(gridView, dataProvider, comboArray) {
    let dataArr;
    $.each(comboArray, function (key, props) {
      dataArr = [];
      if (props.type === 'url') {
        zAxios.get(baseURI() + props.url, {
          params: props.param,
          waitOn: false,
        })
          .then(function (res) {
            if (res.status === gHttpStatus.SUCCESS) {
              dataArr = res.data;
            };
          })
          .catch(function (err) {
            console.log(err);
          })
          .then(function () {
            gridView.setColumnProperty(
              props.name,
              'lookupData',
              {
                value: props.valueName,
                label: props.labelName,
                list: dataArr
              }
            );
          });
      } else if (props.type === 'array') {
        dataArr = props.array;
        gridView.setColumnProperty(
          props.name,
          'lookupData',
          {
            value: props.valueName,
            label: props.labelName,
            list: dataArr
          }
        );
      }
    });
  }
  function loadData(uri, params, fromPopup) {
    const gridView = __realGrid.current.gridView;
    const dataProvider = __realGrid.current.dataProvider;

    commitGrid(gridView)

    return zAxios.get(baseURI() + uri, {
      fromPopup: fromPopup ? true : false,
      params: params
    }).then(function (res) {
      dataProvider.fillJsonData(res.data);
      if (dataProvider.getRowCount() == 0) {
        gridView.setDisplayOptions({ showEmptyMessage: true, emptyMessage: transLangKey('MSG_NO_DATA') });
      }
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
    });
  }
  function loadDataPost(uri, params, fromPopup) {
    const gridView = __realGrid.current.gridView;
    const dataProvider = __realGrid.current.dataProvider;

    commitGrid(gridView)

    return zAxios({
      fromPopup: fromPopup ? true : false,
      method: "post",
      url: baseURI() + uri,
      headers: { "content-type": "application/json" },
      data: params
    }).then(function (res) {
      dataProvider.fillJsonData(res.data);
      if (dataProvider.getRowCount() == 0) {
        gridView.setDisplayOptions({ showEmptyMessage: true, emptyMessage: transLangKey('MSG_NO_DATA') });
      }
    }).catch(function (err) {
      console.log(err);
    }).then(function () {
    });
  }
  return <>
    <div id={gridId} style={{ height: "100%", width: "100%" }} className={"realgrid " + props.className ? props.className : ""}></div>
    <PopupDialog open={bOpenLayoutDlg} title={transLangKey('ADD_GRID_LAYOUT')} onSubmit={addLayout} onClose={() => openLayoutDlg(false)} resizeHeight={300} resizeWidth={400}>
      <Box styles={{ position: 'absolute', p: 1, height: 400 }}>
        <Box className={`${classes.wrapBox} ${classes.required}`}>
          <Box className={classes.label}>{transLangKey("GRID_LAYOUT_NAME")}</Box>
          <Box className={classes.inputDiv} >
            <TextField id="layoutName" variant="outlined" size={"small"} hiddenLabel={true} InputProps={{ readOnly: false, }} value={layoutName} onChange={handlePopLayoutNameChange} />
          </Box>
        </Box>
        {
          systemAdmin ? (
            <Box className={`${classes.wrapBox} ${classes.required}`}>
              <Box className={classes.label} style={props.labelStyle}>{transLangKey("APPLY_ALL_USER")}</Box>
              <Box className={classes.checkboxInput} >
                <Checkbox checked={allUser} onChange={handlePopAllUserChange} />
              </Box>
            </Box>) : null
        }
      </Box>
    </PopupDialog>
  </>;
}

export default BaseGrid;
