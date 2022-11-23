/*
  그리드 관련 표준변환
  1. 표준 XML 파일에 정의된 Grid 관련 property 는 GridWrap을 생성할 때 
  xmlOption 프로퍼티로 gridView 객체에 넘겨준다.
  
*/
import {
  isEmpty,
  isEquivalent,
  clone,
  getDateFromDateString,
} from './common';

import { format } from "@zionex/utils/format"
import wingui3 from '@zionex/utils/wingui3-custom'

let checkCtrl = false;

const initData = (gridView, dataProvider) => {
  //gridView.setAllCheck(false);
  gridView.colFixed = false;
  gridView.rowFixed = false;

  //restore default layout
  if (gridView.hidedColumnNames) {
    for (let i = 0, n = gridView.hidedColumnNames.length; i < n; i++) {
      let column = gridView.columnByName(gridView.hidedColumnNames[i]);
      if (column) {
        gridView.setColumnProperty(column, 'visible', true);
      }
    }
    gridView.hidedColumnNames = [];
  }

  dataProvider.clearRows();
  dataProvider.clearSavePoints();
}

function hasColumnProp(gridView, columnId, propName) {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);

  let prop = dataColumn[propName];
  return prop ? true : false;
}

function isColumnFilterable(gridView, columnId) {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);
  let filterable = dataColumn.filterable
  if (filterable) {
    return true;
  }
  return false;
}

function getColumnProp(gridView, columnId, propName) {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);

  let prop = dataColumn[propName];
  return prop;
}

function hasColumnProp2(gridView, columnId, propName, propName2) {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);

  let prop = dataColumn[propName];
  return prop && prop[propName2] ? true : false;
}

function getColumnProp2(gridView, columnId, propName, propName2) {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);

  let prop = dataColumn[propName];
  if (prop)
    return prop[propName2]
}


const getColumnGroups = (column) => {
  if (column.iteration && column.iteration.group) {
    return column.iteration.group;
  }
  if (column.groups) {
    return column.groups;
  }
  return '';
}

const isIterationColumn = (gridView, columnId) => {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);
  if (!dataColumn)
    return false;

  let iteration = dataColumn.iteration;
  if (iteration) {
    return true;
  }
  return false;
}

function propColumnTitle(gridView, columnId) {
  let dataColumn = gridView.gridItems.find(v => v.name === columnId);

  return dataColumn.headerText
}

const isColumnFix = (gridView, columnId) => {
  let col = gridView.gridItems.find(v => v.name == columnId)
  if (!col)
    return false;

  let fix = col.fix;
  if (fix) {
    return true;
  }
  return false;
}

const isColumnVisible = (gridView, columnId) => {
  let col = gridView.gridItems.find(v => v.name == columnId)
  if (!col)
    return false;

  let fix = col.visible;
  if (fix) {
    return true;
  }
  return false;
}

function isFixedColumn(gridView, arrangedColumns) {
  let isFixedCol = false;
  for (let i = 0; i < arrangedColumns.length; i++) {
    let arrangedColumn = arrangedColumns[i];
    isFixedCol = isColumnFix(gridView, arrangedColumn)
      && isColumnVisible(gridView, arrangedColumn)
      && !isFixedCol;
  }
  return isFixedCol;
}

function refineTaffyResult(data) {
  data = clone(data);
  data = data.filter(function (props) {
    delete props.___id;
    delete props.___s;
    return true;
  });

  return data;
}

function getColumnProperty(columns, columnId, propName) {
  if (!columns)
    return undefined;

  const col = columns.find(col => col.name === columnId)
  if (col) {
    return col[propName]
  }
}

function propColumnCalc(columns, columnId) {
  let calc = getColumnProperty(columns, columnId, 'calc');
  if (calc) {
    let exp = calc.replace(/\${/gi, "values['");
    exp = exp.replace(/}/gi, "']");
    return exp;
  }
  return '';
}

/**
 * gridItems(표준 xml에 정의된 그리드 칼럼정보)를 기준으로 prefInfo(개인화정보) 를 이용해서 
 * 칼럼들을 원하는 순서대로 만든다. 
 * 리턴값은 [[columnId1],[columnId2],[columnId3,columnId4],...] 같은 형태 
 * @param {*} gridView 
 * @returns 
 */
const getArrangedColumns = (gridView) => {
  let columnIds = []
  gridView.gridItems.map(v => columnIds.push(v.name))

  let prefInfo = gridView.prefInfo

  if (prefInfo) {
    //console.log('prefInfo',prefInfo)
    prefInfo = prefInfo.filter(prefRow => prefRow.gridCd === gridView.gridCd);
    if (prefInfo.length > 0) {
      let columnObj = prefInfo.filter(prefRow => columnIds.includes(prefRow.fldCd)).map(function (prefRow) {
        return { name: prefRow.fldCd, seq: prefRow.fldSeq === undefined ? 10000 : prefRow.fldSeq };
      });

      columnObj = columnObj.sort((x, y) => x.seq < y.seq ? -1 : x.seq === y.seq ? 0 : 1);
      columnIds = columnObj.map(item => item.name);
    }
  }

  let arrangedColumns = [];
  let processedColumns = [];

  for (let i = 0, n = columnIds.length; i < n; i++) {
    let columnId = columnIds[i];
    let dataColumn = gridView.gridItems.find(v => v.name === columnId)

    if (processedColumns.includes(columnId)) {
      continue;
    }

    let groups = getColumnGroups(dataColumn);
    if (groups) {
      let columnObj = [];
      for (let j = 0; j < n; j++) {
        let targetColumnId = columnIds[j];
        let targetDataColumn = gridView.gridItems.find(v => v.name === targetColumnId)

        let targetGroups = getColumnGroups(targetDataColumn);
        if (targetGroups === groups) {
          columnObj.push({ name: targetColumnId, seq: columnIds.indexOf(targetColumnId) });
          processedColumns.push(targetColumnId);
        }
      }

      columnObj = columnObj.sort((x, y) => x.seq < y.seq ? -1 : x.seq === y.seq ? 0 : 1);
      arrangedColumns.push(columnObj.map(item => item.name));
    } else {
      arrangedColumns.push([columnId]);
    }
  }

  return arrangedColumns;
}

function setNumberComparer(dataProvider, dataColumns) {

  for (let i = 0, len = dataColumns.length; i < len; i++) {
    let dataColumn = dataColumns[i];
    let columnIdOrg = dataColumn.columnIdOrg;
    if (getColumnProperty(dataColumns, columnIdOrg, 'useNumberComparer')) {
      dataProvider.setDataComparer(dataColumn.fieldName, function (field, row1, row2) {
        let val1 = dataProvider.getValue(row1, field);
        let val2 = dataProvider.getValue(row2, field);
        if (val1 === undefined || val1 === null) {
          return (val2 === undefined || val2 === null) ? 0 : -1;
        }
        if (val2 === undefined || val2 === null) {
          return 1;
        }
        try {
          let num1 = +val1;
          let num2 = +val2;
          if (isNaN(num1) || isNaN(num2)) {
            throw 'error';
          }
          return num1 > num2 ? 1 : (num1 === num2 ? 0 : -1);
        } catch (err) {
          return val1 > val2 ? 1 : (val1 === val2 ? 0 : -1);
        }
      })
    }
    columnIdOrg = null;
    dataColumn = null;
  }
}

function setMergeCell(gridView) {
  if (!gridView.prefInfo)
    return;

  const dimensions = gridView.prefInfo.filter(function (row) {
    return row["dimMeasureTp"] === "DIMENSION" && row["fldActiveYn"] === true && row["gridCd"].includes(gridView.orgId)
  }).map(function (row) {
    return row["fldCd"]
  });

  for (let i = 0, n = dimensions.length; i < n; i++) {
    //gridView.setColumnProperty(dimensions[i], "mergeRule", { criteria : "prevvalues+value"});
    gridView.columnByName(dimensions[i]).mergeRule = { criteria: "prevvalues+value" }
  }
}

function setBaselineStyle(gridView) {
  let dataProvider = gridView.getDataSource();
  let dates = dataProvider.getFieldNames().filter(function (col) {
    if (!col.startsWith("DATE_")) {
      return false;
    }
    let colDate = col.replace("DATE_", "").replace(",VALUE", "").substring(0, 10);
    return getDateFromString(colDate) <= new Date();
  })

  let baseColumnName = null;
  if (dates && dates.length) {
    baseColumnName = dates.reduce(function (previous, current) {
      return previous > current ? previous : current;
    });
  }
  if (baseColumnName != null) {
    let baselineColumnProperty = gridView.getColumnProperty(baseColumnName, "header");

    baselineColumnProperty.styleName = gridView.dynamicCSSSelector({ "background": "#87CEFA" });
    baselineColumnProperty.text = baselineColumnProperty.text + " (now)";
    gridView.setColumnProperty(baseColumnName, "header", baselineColumnProperty);
  }
}

function setGridPreferenceInfo(gridView, prefInfo) {
  if (prefInfo !== undefined) {
    /*
    let tempDB = TAFFY(prefInfo);
    gridView.prefInfo = tempDB().filter({gridCd: gridView.orgId}).get();

    tempDB = null;
    */
    gridView.prefInfo = prefInfo.filter(item => item.gridCd == gridView.orgId || !item.gridCd);

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

function propColumnTooltip(columnInfo) {
  let tooltip = columnInfo.tooltip;
  if (tooltip) {
    return tooltip.split(',').map(item => item.replace(/(^\s*)|(\s*$)/gi, ''));
  }
  return [];
}

function propColumnHeaderBackground(columnInfo) {
  let headerBackground = columnInfo.headerBackground;
  if (headerBackground) {
    if (/^(\#[\da-fA-F]{8})$/g.test(headerBackground)) {
      return headerBackground;
    }
  }
  return '';
}

function propColumnHeaderForeground(columnInfo) {
  let headerForeground = columnInfo.headerForeground;
  if (headerForeground) {
    if (/^(\#[\da-fA-F]{8})$/g.test(headerForeground)) {
      return headerForeground;
    }
  }
  return '';
}

function propColumnBackground(columnInfo) {
  let background = columnInfo.background;
  if (background) {
    if (/^(\#[\da-fA-F]{8})$/g.test(background)) {
      return background;
    }
  }
  return '';
}

function propColumnForeground(columnInfo) {
  let foreground = columnInfo.foreground;
  if (foreground) {
    if (/^(\#[\da-fA-F]{8})$/g.test(foreground)) {
      return foreground;
    }
  }
  return '';
}

function propColumnFormat(columnInfo, columnDataType) {
  let format = columnInfo.numberFormat;
  if (format) {
    return format;
  } else {
    if (columnDataType === "INT" || columnDataType === "NUMBER") {
      return '#,###'
    } else if (columnDataType === "FLOAT") {
      return '#,###.###'
    }

    if (DATETIME_DATA_TYPE.includes(columnDataType)) {
      return 'yyyy-MM-dd HH:mm:ss'
    }
  }
  return '';
}

function propColumnTextAlignment(columnInfo) {
  let textAlignment = columnInfo.textAlignment
  if (textAlignment) {
    textAlignment = textAlignment.toUpperCase();
    if (Object.getOwnPropertyNames(TEXT_ALIGNMENT).includes(textAlignment)) {
      return TEXT_ALIGNMENT[textAlignment];
    }
  }
  return '';
}

function propColumnHeaderCheckerPosition(columnInfo) {
  let headerCheckerPosition = columnInfo.headerCheckerPosition
  if (headerCheckerPosition) {
    if (['NONE', 'LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER'].includes(headerCheckerPosition.toUpperCase())) {
      return headerCheckerPosition.toLowerCase();
    }
  }
  return 'left';
}

function getColumnDataType(col) {
  if (col.type)
    return col.type;
  else if (col.dataType)
    return col.dataType
}

/**
 * 칼럼 동적 생성
 * @param {*} gridView 
 * @param {*} fieldName 
 * @param {*} columnId  column name
 * @param {*} isIterationColumn 
 * @returns 
 */
function createDataColumn(gridView, fieldName, columnId, isIterationColumn) {
  let columnInfo = gridView.gridItems.find(v => v.name === columnId)

  let columnVisible = columnInfo.visible;
  let columnWidth = parseInt(columnInfo.width);
  let columnTitle = columnId;

  let tempColumnTitle = columnInfo.headerText;
  if (tempColumnTitle && tempColumnTitle.toUpperCase() !== PREF_FIELD_NM) {
    columnTitle = tempColumnTitle;
  }

  let columnEditable = columnInfo.editable;
  let columnNewRowEditable = columnInfo.editableNew;
  let columnIterationApplyColor = columnInfo.applyColor;

  let dataColumn = Object.assign({}, columnInfo);
  let header = {};

  let prefInfoDB;
  if (gridView.prefInfo) {
    let tempDB = TAFFY(gridView.prefInfo);
    let gridPrefInfo = tempDB().filter({ gridCd: gridView.gridCd }).get();
    gridView.prefInfo = gridPrefInfo;
    prefInfoDB = TAFFY(gridPrefInfo);
  }

  if (prefInfoDB) {
    let columnPrefInfo = prefInfoDB().filter({ fldCd: columnId }).get()[0];
    dataColumn.columnPrefInfo = columnPrefInfo;

    if (columnPrefInfo) {
      if (columnPrefInfo['fldActiveYn'] != undefined) {
        columnVisible = columnPrefInfo['fldActiveYn'];
      }

      if (columnPrefInfo['fldWidth'] != undefined) {
        columnWidth = columnPrefInfo['fldWidth'];
      }

      if (!isIterationColumn) {
        if (columnPrefInfo['fldApplyCd'] != undefined) {
          columnTitle = transLangKey(columnPrefInfo['fldApplyCd']);
        }
      } else {
        if (columnPrefInfo['fldApplyCdLang'] != undefined) {
          columnTitle = transLangKey(columnPrefInfo['fldApplyCdLang']);
        } else if (columnPrefInfo['fldApplyCd']) {
          columnTitle = columnPrefInfo['fldApplyCd'];
        }
      }
    }
  }

  header.text = transLangKey(columnTitle);

  let fieldColor;
  if (fieldName) {
    let colorTest = fieldName.match(/,COLOR_\w{6}/gi);
    if (colorTest) {
      fieldColor = colorTest[0].match(/_\w{6}/gi)[0].replace('_', '#');
    }
  }

  if (!columnVisible) {
    columnWidth = 0;
    gridView.invisibleColumnIds.push(columnId);
  }

  dataColumn.type = getColumnDataType(columnInfo);
  dataColumn.dataType = getColumnDataType(columnInfo);
  dataColumn.headerText = header.text;
  dataColumn.name = fieldName ? fieldName : columnId;
  dataColumn.fieldName = fieldName ? fieldName : columnId;
  dataColumn.visible = columnVisible;
  dataColumn.width = columnWidth;
  dataColumn.editable = columnEditable;
  dataColumn.newRowEditable = columnNewRowEditable;
  dataColumn.columnIdOrg = columnId;
  dataColumn.isIterationColumn = isIterationColumn;


  let headerStyles = {};

  let headerBackground = columnInfo.headerBackground;
  if (headerBackground) {
    headerStyles.background = headerBackground;
  }

  let headerForeground = columnInfo.headerForeground;
  if (headerForeground) {
    headerStyles.foreground = headerForeground;
  }

  if (fieldColor !== undefined && columnIterationApplyColor !== undefined && (columnIterationApplyColor === 'both' || columnIterationApplyColor === 'header')) {
    headerStyles.background = fieldColor;
  }

  header.styleName = gridView.dynamicCSSSelector(headerStyles)

  let styles = {};
  let summaryStyles = {};
  let editor = {};
  let renderer = {};

  let tooltipTargets = propColumnTooltip(columnInfo);
  if (tooltipTargets !== undefined && tooltipTargets.length > 0) {
    renderer.showTooltip = true;
  }

  let columnDataType = getColumnDataType(columnInfo).toUpperCase();
  if (columnInfo.fontBold) {
    styles.fontWeight = columnInfo.fontBold;
  }

  let background = propColumnBackground(columnInfo);
  if (background.length === 9) {
    styles.background = background;
  }

  if (fieldColor !== undefined && columnIterationApplyColor !== undefined && (columnIterationApplyColor === 'both' || columnIterationApplyColor === 'cell')) {
    styles.background = fieldColor;
  }

  let foreground = propColumnForeground(columnInfo);
  if (foreground.length === 9) {
    styles.foreground = foreground;
  }

  if (TEXT_DATA_TYPE.includes(columnDataType)) {
    dataColumn.dataType = 'text'
    editor.type = 'text';
    dataColumn.textAlignment = 'near';
    editor.textAlignment = 'near';
    dataColumn.editor = editor;
  } else if (NUMBER_DATA_TYPE.includes(columnDataType)) {
    let columnFormat = propColumnFormat(columnInfo, columnDataType);

    dataColumn.dataType = 'number'
    editor.type = 'number';
    dataColumn.textAlignment = 'far';
    summaryStyles.textAlignment = 'far';
    editor.textAlignment = 'far';

    let positiveOnly = columnInfo.positiveOnly;
    if (positiveOnly != undefined)
      editor.positiveOnly = positiveOnly;
    dataColumn.editor = editor;

    if (columnFormat !== 'DS') {
      let formatPattern = /(#|,|\d|\.)/g;
      let columnFormats = [columnFormat.match(formatPattern).join(""), columnFormat.replace(formatPattern, '')];

      dataColumn.numberFormat = columnFormats[0];
      summaryStyles.numberFormat = columnFormats[0];

      if (columnFormats[1] !== undefined && columnFormats[1].length > 0) {

        dataColumn.suffix = columnFormats[1];
        summaryStyles.suffix = styles.suffix;
      }

      let excelFormat = columnInfo.excelFormat;
      if (excelFormat) {
        dataColumn.excelFormat = excelFormat;
      } else {
        if (!dataColumn.numberFormat) {
          if (columnDataType === 'INT' || columnDataType === 'INTEGER') {
            dataColumn.excelFormat = '#,###';
            dataColumn.editFormat = '#,###';
            dataColumn.displayCallback = function (grid, index, value) {
              return format('#,###', value);
            }
            editor.integerOnly = true;
          } else if (columnDataType === 'DOUBLE' || columnDataType === 'FLOAT') {
            let strFormats = dataColumn.numberFormat.split('.');
            strFormats[0] = strFormats[0].replaceAt(strFormats[0].length - 1, '0');
            if (strFormats[1]) {
              strFormats[1] = strFormats[1].replaceAt(0, '0');
            } else {
              strFormats[1] = '0##';
            }
            let numf = strFormats[0] + '.' + strFormats[1]
            dataColumn.excelFormat = numf;
            dataColumn.editFormat = numf;
            dataColumn.displayCallback = function (grid, index, value) {
              return format(numf, value);
            }
          } else {
            let numf = dataColumn.numberFormat;
            dataColumn.excelFormat = numf;
            dataColumn.editFormat = numf;
            dataColumn.displayCallback = function (grid, index, value) {
              return format(numf, value);
            }
          }
        }
      }
    }
  } else if (DATETIME_DATA_TYPE.includes(columnDataType)) {
    let columnFormat = propColumnFormat(columnInfo, columnDataType);

    dataColumn.dataType = 'datetime'
    dataColumn.textAlignment = 'center';
    dataColumn.datetimeFormat = columnFormat;

    if (columnInfo.datepicker) {
      editor.type = 'date';
      editor.datetimeFormat = columnFormat;
      editor.yearNavigation = true;
      editor.commitOnSelect = true;

      if (columnInfo.dateLimit) {
        let dateLimit = getDateLimit(componentId, columnId, activeId);
        if (dateLimit.minDate) {
          editor.minDate = dateLimit.minDate;
        }
        if (dateLimit.maxDate) {
          editor.maxDate = dateLimit.maxDate;
        }
      }

      dataColumn.editor = editor;
    }
  } else if (BOOL_DATA_TYPE.includes(columnDataType)) {

    dataColumn.dataType = 'boolean'
    renderer.type = 'check';
    renderer.editable = getColumnProp(gridView, columnId, 'editable')
    renderer.startEditOnClick = true;
    renderer.labelPosition = 'hidden';
    renderer.shape = 'box';
    renderer.trueValues = 'true,TRUE,True,Y,y,1,T,t,on,ON,On';
    renderer.falseValues = 'false,FALSE,False,N,n,0,F,f,off,OFF,Off';

    dataColumn.editable = false;

    if (getColumnProp(gridView, columnId, 'editable')) {
      if (hasColumnProp(gridView, columnId, 'headerCheckable')) {
        dataColumn.checked = false;
        header.checkLocation = propColumnHeaderCheckerPosition(columnInfo);
        header.itemGap = 5;
      }
    }

    styles.paddingLeft = 8;
    dataColumn.textAlignment = 'center';

    dataColumn.figureBackground = '#ff2F9D27';
    dataColumn.figureInactiveBackground = '#00FF0000';

    editor.booleanFormat = 'false,N,0,f,off:true,Y,1,t,on:0';
    editor.emptyValue = false;
  } else if (IMAGE_DATA_TYPE.includes(columnDataType)) {

    dataColumn.dataType = 'text'
    renderer.type = 'image';
    renderer.smoothing = true;
    dataColumn.contentFit = 'auto';
    dataColumn.editable = false;
  } else {
    dataColumn.textAlignment = 'center';
  }

  dataColumn.renderer = renderer;

  let columnTextAlignment = propColumnTextAlignment(columnInfo);
  if (columnTextAlignment !== undefined && columnTextAlignment.length > 0) {
    dataColumn.textAlignment = columnTextAlignment;
    if (dataColumn.editor !== undefined) {
      dataColumn.editor.textAlignment = columnTextAlignment;
    }
  }

  // TODO: fitRowHeightAll, fitRowHeight
  // (* displayOptions.eachRowResizable: true로 지정되어 있어야 한다. multiLine인 경우 textWrap: “explicit”로 지정 )
  if (gridView.gridDataFit === 'VERTICAL') {
    styles.textWrap = 'normal';
  } else if (gridView.gridDataFit === 'NONE') {
    styles.textWrap = 'ellipse';
  }

  if (!(styles && Object.keys(styles).length === 0 && Object.getPrototypeOf(styles) === Object.prototype)) {
    dataColumn.styleName = gridView.dynamicCSSSelector(styles);
  }

  if (propColumnMerge(gridView, columnId)) {
    let mergeRule = {};
    mergeRule.criteria = 'value';
    dataColumn.mergeRule = mergeRule;
  }

  dataColumn.header = header;

  let footer = {};
  let groupFooter = {};

  if (NUMBER_DATA_TYPE.includes(columnDataType)) {
    //footer.text = transLangKey("SUM")
    //footer.expression = "sum"
    if (summaryStyles.numberFormat)
      footer.numberFormat = summaryStyles.numberFormat;
    if (summaryStyles.suffix)
      footer.suffix = summaryStyles.suffix;

    //groupFooter.expression = "sum"  //이게 있으면 valueCallback이 호출안됨
    if (summaryStyles.numberFormat)
      groupFooter.numberFormat = summaryStyles.numberFormat;
    if (summaryStyles.suffix)
      groupFooter.suffix = summaryStyles.suffix;
  }


  if (Object.getOwnPropertyNames(footer).length > 0) {
    dataColumn.footer = footer;
  }
  if (Object.getOwnPropertyNames(groupFooter).length > 0) {
    dataColumn.groupFooter = groupFooter;
  }

  /**
   * dropDown editor
   */
  if (dataColumn.useDropdown) {
    dataColumn.editor = {
      type: 'dropdown',
      textReadOnly: false,
      domainOnly: true,
      dropDownWhenClick: false,
      dropDownCount: 10
    }

    dataColumn.values = dataColumn.values ? dataColumn.values : [];
    dataColumn.labels = dataColumn.labels ? dataColumn.labels : [];
    dataColumn.lookupDisplay = dataColumn.lookupDisplay !== undefined ? dataColumn.lookupDisplay : true;
  }

  /**
   * column lookup
   */
  if (hasColumnLookup(gridView, columnId)) {
    dataColumn.lookupDisplay = true;
    dataColumn.labelField = propColumnLookup(gridView, columnId);
    dataColumn.sortable = false;
  }

  /**
   * masking
   */
  if (isColumnMasking(gridView, columnId)) {
    dataColumn.displayRegExp = /([\w\W])/ig;
    dataColumn.displayReplace = '*';
  }

  if (propColumnButton(gridView, columnId)) {
    dataColumn.buttonVisibility = RealGridJS.ButtonVisibility.ALWAYS;
    dataColumn.button = RealGridJS.CellButton.ACTION;
  }

  dataColumn.isFixed = isColumnFix(gridView, columnId);

  gridView.dataColumns.push(dataColumn);

  return dataColumn;
}

function processCandidateColumn(columnId, gridView, dataColumn, viewId) {

  let referenceColumn = dataColumn.candidate ? dataColumn.candidate.referenceColumn : undefined

  if (referenceColumn) {
    setColumnLookupTree(gridView, dataColumn, componentId, columnId, activeId);
  } else {
    setColumnCandidate(dataColumn, componentId, columnId, activeId);
  }

  return dataColumn;
}

function hasColumnDateLimitInitValue(columnInfo, elementName) {
  let dateLimitValues = columnInfo.dateLimit && columnInfo.dateLimit.initValue && columnInfo.dateLimit.initValue[elementName];
  if (dateLimitValues) {
    return true;
  }
  return false;
}

function propColumnDateLimitInitValue(columnInfo, elementName) {
  return columnInfo.dateLimit.initValue[elementName];
}

function hasColumnDateLimitValues(columnInfo) {
  let dateLimitValues = columnInfo.dateLimit && columnInfo.dateLimit.values;
  if (dateLimitValues) {
    return true;
  }
  return false;
}

function isApplyI18nGridColumn(gridView, columnId) {
  let columnInfo = gridView.gridItems.find(v => v.name == columnId)
  let lang = columnInfo.lang
  if (lang) {
    return true;
  }
  return false;
}

function propColumnMerge(gridView, columnId) {
  let columnInfo = gridView.gridItems.find(v => v.name == columnId)

  let merge = columnInfo.merge
  if (merge) {
    return true;
  }
  return false;
}

function hasColumnCandidate(gridView, columnId) {
  let columnInfo = gridView.gridItems.find(v => v.name == columnId)
  let candidate = columnInfo.candidate
  if (candidate) {
    return true;
  }
  return false;
}

function hasColumnLookup(gridView, columnId) {
  let columnInfo = gridView.gridItems.find(v => v.name == columnId)

  let lookup = columnInfo.lookup
  if (lookup) {
    return true;
  }
  return false;
}
function isColumnMasking(gridView, columnId) {
  let columnInfo = gridView.gridItems.find(v => v.name == columnId)

  let masking = columnInfo.masking
  if (masking) {
    return true;
  }
  return false;
}

function propColumnButton(gridView, columnId) {
  let columnInfo = gridView.gridItems.find(v => v.name == columnId)

  let button = columnInfo.button
  if (button) {
    return true;
  }
  return false;
}

/**
 * get Date limit (min/max date) for DATE(DATETIME) column
 */
function getDateLimit(gridView, columnInfo) {

  let dateLimit = columnInfo.dateLimit;;

  let minDate;
  let maxDate;

  let dateLimitInitValue = dateLimit.initValue
  if (dateLimitInitValue) {
    /**
     * process min-date init
     */
    if (hasColumnDateLimitInitValue(columnInfo, vom.elements.minDate)) {
      minDate = propColumnDateLimitInitValue(columnInfo, vom.elements.minDate);
    }

    if (minDate !== undefined) {
      dateLimit.minDate = getDateFromDateString(minDate);
    }

    /**
     * process max-date init
     */
    if (hasColumnDateLimitInitValue(columnInfo, vom.elements.maxDate)) {
      maxDate = propColumnDateLimitInitValue(columnInfo, vom.elements.maxDate);
    }

    if (maxDate !== undefined) {
      dateLimit.maxDate = getDateFromDateString(maxDate);
    }
  }

  return dateLimit;
}

function setColumnCandidate(dataColumn, componentId, columnId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let labels = [];
  let values = [];

  dataColumn.editor = {
    type: RealGridJS.CellEditor.DROPDOWN,
    dropDownCount: vom.get(activeId).propColumnCandidateDropDownCount(componentId, columnId),
    domainOnly: true,
    dropDownWhenClick: true
  };
  dataColumn.lookupDisplay = true;

  if (vom.get(activeId).hasColumnCandidateInit(componentId, columnId)) {
    let initValues = vom.get(activeId).propColumnCandidateInitValues(componentId, columnId);
    for (let i = 0; i < initValues.length; i++) {
      let value = initValues[i];
      let label = vom.get(activeId).propColumnCandidateInitText(componentId, columnId, value);
      if (label !== undefined) {
        if (!labels.includes(label)) {
          labels.push(label);
          values.push(value);
        } else {
          if (!values.includes(value)) {
            labels.push(label);
            values.push(value);
          } else {
            let indexOfExistLabel = labels.indexOf(label);
            let indexOfExistValue = values.indexOf(value);
            if (indexOfExistLabel !== indexOfExistValue) {
              labels.push(label);
              values.push(value);
            }
          }
        }
      } else {
        if (!labels.includes(value)) {
          labels.push(value);
          values.push(value);
        } else {
          if (!values.includes(value)) {
            labels.push(value);
            values.push(value);
          }
        }
      }
    }
  }

  let resultData;
  if (vom.get(activeId).hasColumnCandidateService(componentId, columnId)) {
    resultData = callColumnService(componentId, columnId, vom.elements.candidate, activeId);

    /**
     * post process for dropdown list
     */
    labels = [];
    values = [];
    let labelId = vom.get(activeId).propColumnCandidateTextId(componentId, columnId);
    let valueId = vom.get(activeId).propColumnCandidateValueId(componentId, columnId);

    if (resultData !== undefined && resultData.length > 0 && !Object.keys(resultData[0]).includes(valueId)) {
      console.error('Incorrect value-id : ' + valueId + '\n' + 'Component : ' + componentId + ' / Column : ' + columnId);
    }

    for (let i = 0; i < resultData.length; i++) {
      let rowData = resultData[i];
      let label = rowData[labelId];
      let value = rowData[valueId];

      if (label !== undefined) {
        if (!labels.includes(label)) {
          labels.push(label);
          values.push(value);
        } else {
          if (!values.includes(value)) {
            labels.push(label);
            values.push(value);
          } else {
            let indexOfExistLabel = labels.indexOf(label);
            let indexOfExistValue = values.indexOf(value);
            if (indexOfExistLabel !== indexOfExistValue) {
              labels.push(label);
              values.push(value);
            }
          }
        }
      } else {
        if (!labels.includes(value)) {
          labels.push(value);
          values.push(value);
        } else {
          if (!values.includes(value)) {
            labels.push(value);
            values.push(value);
          }
        }
      }
    }
  }

  if (isApplyI18nGridColumn(gridView, columnId)) {
    for (let labelIdx = 0; labelIdx < labels.length; labelIdx++) {
      labels[labelIdx] = transLangKey(labels[labelIdx]);
    }
  }

  dataColumn.dropDownDataSource = resultData;
  dataColumn.labels = labels;
  dataColumn.values = values;
}

function setColumnLookupTree(gridView, dataColumn, referenceColumn, dropDownDataSource) {

  let referenceColumnId = dataColumn.candidate ? dataColumn.candidate.referenceColumn : undefined;

  let valueId = dataColumn.candidate.values.valueId
  let labelId = dataColumn.candidate.values.textId
  let actualReferenceField = referenceColumn.candidate.values.valueId

  dataColumn.editor = {
    type: RealGridJS.CellEditor.DROPDOWN,
    dropDownCount: dataColumn.candidate.dropDownCount,
    domainOnly: true,
    dropDownWhenClick: true
  };
  dataColumn.lookupDisplay = true;
  dataColumn.labelField = columnId + LABEL_FIELD;
  dataColumn.referenceColumnId = referenceColumnId;
  dataColumn.actualReferenceField = actualReferenceField;

  let resultData = dropDownDataSource;

  dataColumn.dropDownDataSource = resultData;

  let referenceLevelKeys = [];
  for (let i = 0; i < resultData.length; i++) {
    let row = resultData[i];
    let referenceLevelKey = row[actualReferenceField];
    referenceLevelKeys.push(referenceLevelKey);
  }
  referenceLevelKeys = referenceLevelKeys.unique();

  let currentLookup = {};
  for (let i = 0; i < referenceLevelKeys.length; i++) {
    let values = [];
    let labels = [];
    for (let j = 0; j < resultData.length; j++) {
      let row = resultData[j];
      if (row[actualReferenceField] === referenceLevelKeys[i]) {
        let value = row[valueId];
        let label = row[labelId];
        if (label !== undefined) {
          if (!labels.includes(label)) {
            labels.push(label);
            values.push(value);
          } else {
            if (!values.includes(value)) {
              labels.push(label);
              values.push(value);
            } else {
              let indexOfExistLabel = labels.indexOf(label);
              let indexOfExistValue = values.indexOf(value);
              if (indexOfExistLabel !== indexOfExistValue) {
                labels.push(label);
                values.push(value);
              }
            }
          }
        } else {
          if (!labels.includes(value)) {
            labels.push(value);
            values.push(value);
          } else {
            if (!values.includes(value)) {
              labels.push(value);
              values.push(value);
            }
          }
        }
      }
    }

    if (dataColumn.lang) {
      for (let labelIdx = 0; labelIdx < labels.length; labelIdx++) {
        labels[labelIdx] = transLangKey(labels[labelIdx]);
      }
    }

    currentLookup[referenceLevelKeys[i]] = { values: values, labels: labels };
  }
  gridView.lookups[columnId] = currentLookup;
  gridView.lookupReference[columnId] = referenceColumnId;

  setLookupEvent(gridView, viewId);
}

function setLookupEvent(gridView, viewId) {
  let lookupReference = gridView.lookupReference;

  let lookupColumnIds = Object.getOwnPropertyNames(lookupReference);
  let keyColumnIds = [];
  for (let i = 0; i < lookupColumnIds.length; i++) {
    keyColumnIds.push(lookupReference[lookupColumnIds[i]]);
  }

  gridView.onEditCommit = function (grid, index, oldValue, newValue) {
    let changedColumnId = index.column;

    if (keyColumnIds.includes(changedColumnId)) {
      for (let i = 0; i < lookupColumnIds.length; i++) {
        let keyColumnId = lookupReference[lookupColumnIds[i]];
        let lookupColumnId = lookupColumnIds[i];
        if (changedColumnId === keyColumnId) {
          changeLookupDropDown(grid, newValue, lookupColumnId);

          if (oldValue !== newValue) {
            grid.setValue(index.itemIndex, lookupColumnId, '');
            grid.setValue(index.itemIndex, lookupColumnId + LABEL_FIELD, '');
          }
        }
      }
    }
  };

  gridView.onCurrentRowChanged = function (grid, oldRow, newRow) {
    window.requestAnimationFrame(function () {
      if (newRow >= 0) {
        for (let i = 0; i < lookupColumnIds.length; i++) {
          let lookupColumnId = lookupColumnIds[i];
          let keyColumnId = lookupReference[lookupColumnId];
          let itemIndex = grid.getCurrent().itemIndex;
          changeLookupDropDown(grid, grid.getValue(itemIndex, keyColumnId), lookupColumnId);
        }
      }
    });
  };

  gridView.onGetEditValue = function (grid, index, editResult) {
    if (lookupColumnIds.includes(index.fieldName)) {
      grid.setValue(index.itemIndex, index.fieldName + LABEL_FIELD, editResult.text);
    }
  };
}

//use gridView.getDataColumn, i will add this method in some time
function changeLookupDropDown(gridView, key, lookupColumnId) {
  let lookupColumn = gridView.columnByName(lookupColumnId);

  if (key) {
    let lookup = gridView.lookups[lookupColumnId][key];
    if (lookup !== undefined) {
      let values = lookup.values;
      let labels = lookup.labels;
      let dataColumn = gridView.getDataColumn(lookupColumnId)
      if (dataColumn.lang) {
        for (let labelIdx = 0; labelIdx < labels.length; labelIdx++) {
          labels[labelIdx] = transLangKey(labels[labelIdx]);
        }
      }

      lookupColumn.labels = labels;
      lookupColumn.values = values;
    }
  } else {
    lookupColumn.labels = [];
    lookupColumn.values = [];
  }

  gridView.setColumn(lookupColumn);
}

function arrangeLookups(gridView, dataProvider) {

  let rowCount = dataProvider.getRowCount();

  let columnNames = gridView.getColumnNames(true);
  for (let i = 0; i < columnNames.length; i++) {
    let columnId = columnNames[i];

    let dataColumn = gridView.getDataColumn(columnId)
    if (dataColumn.candidate.referenceColumn) {
      let referenceColumnId = dataColumn.candidate.referenceColumn;
      let lookupColumnId = columnId;
      let lookupDataColumn = gridView.getDataColumn(lookupColumnId)

      for (let j = 0; j < rowCount; j++) {
        let referenceColumnValue = gridView.getValue(j, referenceColumnId);
        let currentColumnValue = gridView.getValue(j, lookupColumnId);

        if (lookupColumnId && referenceColumnValue) {
          let ownLookups = gridView.lookups[lookupColumnId];
          if (ownLookups) {
            let ownLookupsWithRef = ownLookups[referenceColumnValue];
            if (ownLookupsWithRef) {
              let values = ownLookupsWithRef.values;
              let labels = ownLookupsWithRef.labels;

              if (lookupDataColumn.lang) {
                for (let labelIdx = 0; labelIdx < labels.length; labelIdx++) {
                  labels[labelIdx] = transLangKey(labels[labelIdx]);
                }
              }

              if (gridView.getDataRow(j) === -1) {
                continue;
              }

              gridView.setValue(j, lookupColumnId + LABEL_FIELD, labels[values.indexOf(currentColumnValue)]);
            }
          }
        }
      }
    }
  }

  dataProvider.clearRowStates();
}

function setGridSortOrder(gridView, fieldNames) {

  let gridColumnIds = gridView.dataColumns;

  let sortFields = [];
  let sortDirs = [];

  for (let i = 0; i < gridColumnIds.length; i++) {
    let dataColumn = gridColumnIds[i];

    let gridSort = dataColumn.sort;

    if (gridSort !== undefined && (gridSort === 'asc' || gridSort === 'desc')) {
      let sortDir;
      if (gridSort === 'asc') {
        sortDir = RealGridJS.SortDirection.ASCENDING;
      } else if (gridSort === 'desc') {
        sortDir = RealGridJS.SortDirection.DESCENDING;
      }

      if (dataColumn.iteration) {
        let prefix = dataColumn.iteration.prefix;
        let postfix = dataColumn.iteration.postfix;

        for (let j = 0; j < fieldNames.length; j++) {
          let fieldName = fieldNames[j];
          if (fieldName.startsWith(prefix) && fieldName.endsWith(postfix)) {
            sortFields.push(fieldName);
            sortDirs.push(sortDir)
          }
        }
      } else {
        sortFields.push(dataColumn.name);
        sortDirs.push(sortDir)
      }
    }
  }

  gridView.orderBy(sortFields, sortDirs);
}

/**
 * <init-group-order>
 *   : true로 설정된 경우 개인화정보의 SEQ를 기준으로 grouping
 *   : 숫자로 설정된 경우 순서대로 grouping
 *   : 혼용된 경우 true로 설정된 필드가 SEQ 순서대로 이후 설정 숫자 순서대로 grouping
 */
function setInitGroupOrder(gridView) {

  let columnIds = [];
  gridView.gridItems.map(v => columnIds.push(v.name));

  let groupByFieldNames = [];
  let initGroupByTF = [];
  let initGroupOrderP = {};
  let initGroupOrderV = {};

  for (let i = 0; i < gridView.gridItems; i++) {
    let dataColumn = gridView.gridItems[i];
    let groupOrder = dataColumn.initGroupOrder;
    if (groupOrder !== undefined && groupOrder.length > 0) {
      if (groupOrder === 'true') {
        initGroupByTF.push(columnIds[i]);
      } else {
        initGroupOrderV[groupOrder] = columnIds[i];
      }
    }
  }

  let prefInfoDB = TAFFY(gridView.prefInfo);

  for (let i = 0; i < initGroupByTF.length; i++) {
    let groupingColumn = prefInfoDB().filter({ fldCd: initGroupByTF[i] }).get(0)[0];
    if (groupingColumn !== undefined) {
      initGroupOrderP[groupingColumn['fldSeq']] = groupingColumn['fldCd'];
    }
  }

  if (initGroupOrderP !== null && Object.keys(initGroupOrderP).length > 0) {
    let groupOrderKeys = Object.getOwnPropertyNames(initGroupOrderP);

    if (groupOrderKeys.length > 0) {
      groupOrderKeys = groupOrderKeys.sort(function (a, b) {
        return a - b;
      });

      for (let i = 0; i < groupOrderKeys.length; i++) {
        groupByFieldNames.push(initGroupOrderP[groupOrderKeys[i]]);
      }
    }
  }

  if (initGroupOrderV !== null && Object.keys(initGroupOrderV).length > 0) {
    let groupOrderKeys = Object.getOwnPropertyNames(initGroupOrderV);

    if (groupOrderKeys.length > 0) {
      groupOrderKeys = groupOrderKeys.sort(function (a, b) {
        return a - b;
      });

      for (let i = 0; i < groupOrderKeys.length; i++) {
        groupByFieldNames.push(initGroupOrderV[groupOrderKeys[i]]);
      }
    }
  }

  if (groupByFieldNames.length > 0) {
    gridView.groupBy(groupByFieldNames);
  }
}

function setColumnFilter(gridView, dataProvider, columnId) {
  gridView.onFilteringChanged = null;
  let filters = [];
  let dataColumnsDb = TAFFY(gridView.dataColumns);
  let currColumn = dataColumnsDb().filter({ name: columnId }).get()[0];
  let columnIdOrg = currColumn.columnIdOrg;

  let columnDataType = (vom.get(activeId).propColumnType(gridView.orgId, columnIdOrg)).toUpperCase();
  let dropDownDataSourceDb = TAFFY(currColumn.dropDownDataSource);

  if (BOOL_DATA_TYPE.includes(columnDataType)) {
    filters = [{ name: 'true', criteria: 'value' }, { name: 'false', criteria: 'not value' }];
  } else {
    let filterValues = [];

    let componentType = gridView.type;
    if (componentType === 'grid') {

      let itemCount = gridView.getItemCount();
      for (let i = 0; i < itemCount; i++) {
        if (gridView.getDataRow(i) !== -1) {
          let value = gridView.getValue(i, columnId);
          if (!filterValues.includes(value)) {
            filterValues.push(value);
          }
        }
      }
    } else if (componentType === 'tree') {
      for (let rowIdx = 1, rowCount = dataProvider.getRowCount(); rowIdx <= rowCount; rowIdx++) {
        let value = dataProvider.getValue(rowIdx, columnId);
        if (!filterValues.includes(value)) {
          filterValues.push(value);
        }
      }
    }

    if (filterValues.includes(null) || filterValues.includes(undefined) || filterValues.includes('')) {
      filters.push({
        name: 'No Value',
        criteria: 'value is empty'
      });
    }

    if (NUMBER_DATA_TYPE.includes(columnDataType)) {
      let temp = [];
      for (let tempIdx = 0, filterValuesLen = filterValues.length; tempIdx < filterValuesLen; tempIdx++) {
        temp.push(Number(filterValues[tempIdx]));
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

      if (currColumn.isCandidateColumn) {
        let textId = vom.get(activeId).propColumnCandidateTextId(gridView.orgId, columnIdOrg);
        let valueId = vom.get(activeId).propColumnCandidateValueId(gridView.orgId, columnIdOrg);
        let filter = {};
        filter[valueId] = filterValue;
        if (dropDownDataSourceDb().filter(filter).get().length > 0) {
          let textOnDataSource = dropDownDataSourceDb().filter(filter).get()[0][textId];

          if (textOnDataSource) {
            filterText = textOnDataSource;
          }
        }
      }

      if (isApplyI18nGridColumn(gridView, columnIdOrg)) {
        filterText = transLangKey(filterText);
      }

      filters.push({
        name: filterValue,
        criteria: 'value=' + '\'' + filterValue + '\'',
        text: filterText,
        description: filterValue
      });
    }
  }

  gridView.setColumnFilters(columnId, filters);

  gridView.onFilteringChanged = function (grid, column) {
    gridOnFilteringChanged(grid, column);
  }

}

function setGridFilters(gridView, dataProvider, staticColumnsMap) {
  let staticColumnIds = Object.keys(staticColumnsMap);

  for (let columnIdx = 0; columnIdx < staticColumnIds.length; columnIdx++) {
    let staticColumnId = staticColumnIds[columnIdx];

    if (isColumnFilterable(gridView, staticColumnId)) {
      gridView.activatedColumnFilters[staticColumnId] = [];
      setColumnFilter(gridView, dataProvider, staticColumnId);
    }
  }

  gridView.setFilteringOptions({
    clearWhenSearchCheck: true,
    selector: {
      showAll: true,
      showSearchInput: true,
      showButtons: true,
      acceptText: transLangKey('OK'),
      cancelText: transLangKey('CANCEL')
    }
  })
}

function updateParentWidth(columnsMap, groupHeaders, groupWidth, currentIndex) {
  let parentIndex = currentIndex - 1;
  let parent = groupHeaders[parentIndex];

  if (parent) {
    columnsMap[parent].width = columnsMap[parent].width + groupWidth;
    currentIndex = parentIndex;
    updateParentWidth(columnsMap, groupHeaders, groupWidth, currentIndex);
  }
}

function updateParentWidth2(columnsMap, groupHeaders, groupWidth, currentIndex) {
  let parentIndex = currentIndex - 1;
  let parent = groupHeaders[parentIndex];

  if (parent) {
    let groupIdentifier = '_';
    for (let i = 0; i < parentIndex; i++) {
      groupIdentifier = groupIdentifier + groupHeaders[i];
    }

    columnsMap[(currentIndex - 1) + '_' + parent + groupIdentifier].width = columnsMap[(currentIndex - 1) + '_' + parent + groupIdentifier].width + groupWidth;
    currentIndex = parentIndex;
    updateParentWidth2(columnsMap, groupHeaders, groupWidth, currentIndex);
  }
}

/**
 * 자식없는 그룹칼럼 삭제
 * @param {} columns 
 */
function cleanupNoChildGroupColumns(columns) {
  for (let i = 0, len = columns.length; i < len; i++) {
    if (typeof columns[i] !== 'undefined' && columns[i].dataType === 'group') {
      if (columns[i].childs.length < 1) {
        columns.splice(i, 1);
        cleanupNoChildGroupColumns(columns);
      } else {
        cleanupNoChildGroupColumns(columns[i].childs);
      }
    }
  }
}

function applyEditMeasureStyle(gridView) {

  let dataProvider = gridView.getDataSource();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);
  let columnIdOrgs = dataColumnsDB().select('columnIdOrg');
  let gridPrefInfoDB = TAFFY(gridView.prefInfo);
  let editMeasuresDB = TAFFY(gridPrefInfoDB().filter({ gridCd: gridView.gridCd, editMeasureYn: true }).get());
  let editTargetsDB = TAFFY(gridPrefInfoDB().filter({ gridCd: gridView.gridCd, editTargetYn: true }).get());
  let editMeasures = editMeasuresDB().select('fldApplyCd');
  let editTargets = editTargetsDB().select('fldCd');

  if (editMeasures !== undefined && editMeasures.length > 0 && editTargets !== undefined && editTargets.length > 0) {
    let targetRowIndexes = [];
    let targetFieldNames = [];

    let conditionColumn = 'CATEGORY';
    let conditionOperator = 'equal';
    let conditionValues = editMeasures;

    let conditionColumnValid = true;
    if (conditionColumn !== undefined && conditionColumn.length > 0) {
      conditionColumnValid = columnIdOrgs.includes(conditionColumn);
      if (!conditionColumnValid) {
        console.error('\nColumn', conditionColumn, 'is not exists in', targetComponentId + '.');
        return;
      }
    }

    let dataRowCount = dataProvider.getRowCount();
    for (let i = 0; i < dataRowCount; i++) {
      let conditionCellValue = (dataProvider.getFieldValues(conditionColumn, i, i))[0];

      let isTarget = isSatisfiedValue(conditionOperator, conditionCellValue, conditionValues);

      if (isTarget) {
        targetRowIndexes.push(i);
      }
    }

    let styleExceptCellsDB = TAFFY(gridView.styleExceptCells);

    for (let i = 0; i < editTargets.length; i++) {
      let editTargetDataColumns = TAFFY(dataColumns)().filter({ columnIdOrg: editTargets[i] }).get();

      let editTargetDataColumnFieldName = TAFFY(editTargetDataColumns)().select('fieldName');
      targetFieldNames = targetFieldNames.concat(editTargetDataColumnFieldName);
      targetFieldNames = targetFieldNames.unique();

      if (targetRowIndexes.length > 0 && targetFieldNames.length > 0) {
        if (styleExceptCellsDB().count() > 0) {
          gridView.beginUpdate();
          try {
            for (let r_idx = 0; r_idx < targetRowIndexes.length; r_idx++) {
              for (let f_idx = 0; f_idx < targetFieldNames.length; f_idx++) {
                if ((styleExceptCellsDB().filter({
                  rowIndex: targetRowIndexes[r_idx],
                  fieldName: targetFieldNames[f_idx]
                }).get()).length <= 0) {
                  gridView.setCellStyle(gridView, targetRowIndexes[r_idx], targetFieldNames[f_idx], STYLE_ID_EDIT_MEASURE);
                } else {
                  let styleID = (styleExceptCellsDB().filter({
                    rowIndex: targetRowIndexes[r_idx],
                    fieldName: targetFieldNames[f_idx]
                  }).get()[0]).styleID;
                  gridView.setCellStyle(gridView, targetRowIndexes[r_idx], targetFieldNames[f_idx], styleID);
                }
              }
            }
          } finally {
            gridView.endUpdate();
          }
        } else {
          //console.log(targetRowIndexes,targetFieldNames)
          gridView.setCellStyles(gridView, targetRowIndexes, targetFieldNames, STYLE_ID_EDIT_MEASURE);
        }
      }

      targetFieldNames = [];
    }
  }
}

/* cell editable 처리 */
function applyCellAttributes(gridView, clearAppliedStyles, itemIndex, dataRow, editedField) {

  let dataProvider = gridView.getDataSource();

  window.requestAnimationFrame(function () {
    let cellAttrsProps = {};

    let dataColumns = gridView.dataColumns;
    let dataColumnsDb = TAFFY(dataColumns);
    let columnIdOrgs = dataColumnsDb().select('columnIdOrg');
    let gridFields = dataProvider.getFields();
    let allFieldNames = dataProvider.getFieldNames();
    /*
    let relatedColumns = xml의 grid props 항목에 cellAttributes 값

    relatedColumns = relatedColumns.unique();

    if (editedField !== undefined && editedField !== null) {
      let editedColumnIdOrg = dataColumnsDb().filter({fieldName: dataProvider.getOrgFieldName(editedField)}).get()[0].columnIdOrg;

      if (!relatedColumns.includes(editedColumnIdOrg)) {
        return;
      }
    }
    */
    if (gridView.isColumnValidationFail) {
      return;
    } else {
      gridView.commit();
    }

    applyEditMeasureStyle(gridView);

    /*
    let cellAttrsIds = propCellAttributeIds(gridView);

    for (let i = 0, cellAttrsIdsLength = cellAttrsIds.length; i < cellAttrsIdsLength; i++) {
      let cellAttrsId = cellAttrsIds[i];
      let arrArngdCondIds = getCellAttributeArrangedConditions(gridView, cellAttrsId); // [[cond1, cond2], [cond3]] : 2dim array

      let tgtRowIndexes = [];
      let tgtFieldNames = [];
      let candTgt = {};
      let candTgtCells = [];

      for (let j = 0, arrArngdCondIdsLength = arrArngdCondIds.length; j < arrArngdCondIdsLength; j++) {
        let arngdCondIds = arrArngdCondIds[j]; // [cond1 ,cond2]

        let iterator = 0;
        for (let k = 0, arngdCondIdsLength = arngdCondIds.length; k < arngdCondIdsLength; k++) {
          let conditionId = arngdCondIds[k];

          let cellAttrCondColumn = getCellAttributeConditionColumn(gridView, cellAttrsId, conditionId);
          let cellAttrCondOperator = getCellAttributeConditionOperator(gridView, cellAttrsId, conditionId);
          let cellAttrCondValues = getCellAttributeConditionValues(gridView, cellAttrsId, conditionId);

          if (cellAttrCondColumn) {
            if (!columnIdOrgs.includes(cellAttrCondColumn)) {
              console.error('\nColumn', cellAttrCondColumn, 'is not exists in', targetComponentId + '.'
                , '\nCheck condition', conditionId, 'at cell-attribute', cellAttrsId + '.'
              );
              continue;
            }
          }

          let condDataColumns = dataColumnsDb().filter({columnIdOrg: cellAttrCondColumn}).get();
          let condFieldNames = TAFFY(condDataColumns)().select('fieldName');
          let rowCount = dataProvider.getRowCount();

          if (iterator === 0) {
            if (!isIterationColumn(gridView, cellAttrCondColumn)) { // cellAttrCondColumn is static column
              if (getComponentType(gridView) === 'R_GRID') {
                let condFieldValues = dataProvider.getFieldValues(cellAttrCondColumn, 0, -1);
                for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                  if (isSatisfiedValue(cellAttrCondOperator, condFieldValues[rowIdx], cellAttrCondValues)) {
                    tgtRowIndexes.push(rowIdx);
                  }
                }
              } else if (getComponentType(gridView) === 'R_TREE') {
                let condFieldValues = [];

                for (let rowIdx = 1; rowIdx <= rowCount; rowIdx++) {
                  condFieldValues.push(dataProvider.getValue(rowIdx, cellAttrCondColumn));
                }

                for (let rowIdx = 1; rowIdx <= rowCount; rowIdx++) {
                  if (isSatisfiedValue(cellAttrCondOperator, condFieldValues[rowIdx - 1], cellAttrCondValues)) {
                    tgtRowIndexes.push(rowIdx);
                  }
                }
              }
            } else { // cellAttrCondColumn is dynamic(iteration) column
              for (let condFieldIdx = 0, condFieldNamesLength = condFieldNames.length; condFieldIdx < condFieldNamesLength; condFieldIdx++) {
                if (!allFieldNames.includes(condFieldNames[condFieldIdx].toUpperCase())) {
                  continue;
                }

                let condFieldValues = dataProvider.getFieldValues(condFieldNames[condFieldIdx], 0, -1);
                for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                  if (isSatisfiedValue(cellAttrCondOperator, condFieldValues[rowIdx], cellAttrCondValues)) {
                    tgtRowIndexes.push(rowIdx);
                    candTgtCells.push([rowIdx, condFieldNames[condFieldIdx]]);
                  }
                }
              }
            }
            candTgt[cellAttrCondColumn] = candTgtCells;
          } else {
            let tempIndexes = [];
            for (let l = 0, tgtRowIndexesLength = tgtRowIndexes.length; l < tgtRowIndexesLength; l++) {
              if (!isIterationColumn(gridView, cellAttrCondColumn)) { // cellAttrCondColumn is static column
                if (isSatisfiedValue(cellAttrCondOperator, dataProvider.getValue(tgtRowIndexes[l], cellAttrCondColumn), cellAttrCondValues)) {
                  tempIndexes.push(tgtRowIndexes[l]);
                }
              } else { // cellAttrCondColumn is dynamic(iteration) column
                for (let o = 0, tgtFieldNamesLength = tgtFieldNames.length; o < tgtFieldNamesLength; o++) {
                  if (isSatisfiedValue(cellAttrCondOperator, dataProvider.getValue(l, condFieldNames[o]), cellAttrCondValues)) {
                    tempIndexes.push(tgtRowIndexes[l]);
                    candTgtCells.push([l, condFieldNames[o]]);
                  }
                }
              }
            }
            tgtRowIndexes = tempIndexes.unique();
            candTgt[cellAttrCondColumn] = candTgtCells;
          }
          iterator = iterator + 1;

          tgtRowIndexes = tgtRowIndexes.unique();
        }

        let cellAttrApplyIds = propCellAttributeApplyIds(gridView, cellAttrsId);
        for (let k = 0, cellAttrApplyIDsLength = cellAttrApplyIds.length; k < cellAttrApplyIDsLength; k++) {
          let cellAttrApplyId = cellAttrApplyIds[k];
          let cellAttrApplyTgtColumns = propCellAttributeApplyColumns(gridView, cellAttrsId, cellAttrApplyId);
          let cellAttrApplyTgtAttrs = propCellAttributeApplyAttrs(gridView, cellAttrsId, cellAttrApplyId);

          // default background by editable
          if (cellAttrApplyTgtAttrs.editable && cellAttrApplyTgtAttrs.editable === true && !cellAttrApplyTgtAttrs.background) {
            cellAttrApplyTgtAttrs.background = '#ffffffd2';
          } else if (cellAttrApplyTgtAttrs.editable && cellAttrApplyTgtAttrs.editable === false && !cellAttrApplyTgtAttrs.background) {
            cellAttrApplyTgtAttrs.background = '#fff9f9f9';
          }

          gridView.addCellStyle(gridView,cellAttrApplyId, cellAttrApplyTgtAttrs, true);

          if (cellAttrApplyTgtColumns.length > 0) {
            for (let l = 0, cellAttrApplyTgtColumnsLength = cellAttrApplyTgtColumns.length; l < cellAttrApplyTgtColumnsLength; l++) {
              let cellAttrApplyTgtColumn = cellAttrApplyTgtColumns[l];

              if (!candTgt.hasOwnProperty(cellAttrApplyTgtColumn) || candTgt[cellAttrApplyTgtColumn].length <= 0) {
                if (isIterationColumn(gridView, cellAttrApplyTgtColumn) && tgtFieldNames.length <= 0) {
                  let applyTgtDataColumns = dataColumnsDb().filter({columnIdOrg: cellAttrApplyTgtColumn}).get();
                  let applyTgtFieldNames = [];
                  for (let atdcIdx = 0, applyTgtDataColumnsLength = applyTgtDataColumns.length; atdcIdx < applyTgtDataColumnsLength; atdcIdx++) {
                    applyTgtFieldNames.push(applyTgtDataColumns[atdcIdx]['fieldName']);
                  }

                  for (let m = 0, gridFieldsLength = gridFields.length; m < gridFieldsLength; m++) {
                    let gridField = gridFields[m];

                    let fieldName = gridField.orgFieldName;
                    if (fieldName === undefined) {
                      fieldName = gridField.fieldName;
                    }

                    if (fieldName) {
                      fieldName = fieldName.toUpperCase();
                    }

                    if (applyTgtFieldNames.includes(fieldName) && allFieldNames.includes(fieldName)) {
                      tgtFieldNames.push(fieldName);
                    }
                  }
                } else {
                  if (allFieldNames.includes(cellAttrApplyTgtColumn.toUpperCase())) {
                    tgtFieldNames.push(cellAttrApplyTgtColumn);
                  }
                }
              }
            }
          } else {
            let fieldNames = [];
            for (let l = 0, gridFieldsLength = gridFields.length; l < gridFieldsLength; l++) {
              let gridField = gridFields[l];

              let fieldName = gridField.orgFieldName;
              if (fieldName === undefined) {
                fieldName = gridField.fieldName;
              }

              if (fieldName) {
                fieldName = fieldName.toUpperCase();
              }

              if (allFieldNames.includes(fieldName)) {
                fieldNames.push(fieldName);
              }
            }
            tgtFieldNames = fieldNames;
          }

          let cellAttrsProp = {};
          cellAttrsProp.allFieldNames = allFieldNames;
          cellAttrsProp.tgtRowIndexes = tgtRowIndexes;
          cellAttrsProp.tgtFieldNames = tgtFieldNames;
          cellAttrsProp.cellAttrApplyTgtAttrs = cellAttrApplyTgtAttrs;
          cellAttrsProp.cellAttrApplyID = cellAttrApplyId;
          cellAttrsProp.candTgt = candTgt;
          cellAttrsProp.cellAttrApplyTgtColumns = cellAttrApplyTgtColumns;
          cellAttrsProps[cellAttrApplyId] = cellAttrsProp;

          tgtFieldNames = [];
        }
      }
    }

    gridView.cellAttributesProps = cellAttrsProps;
    applyAttrsStyle(gridView, cellAttrsProps);
    */
  });
}

function applyAttrsStyle(gridView, cellAttrsProps) {
  if (isEmpty(cellAttrsProps)) {
    return;
  }

  let cellAttrsPropsKeys = Object.keys(cellAttrsProps);

  for (let i = 0, len = cellAttrsPropsKeys.length; i < len; i++) {
    let cellAttrApplyId = cellAttrsProps[cellAttrsPropsKeys[i]].cellAttrApplyID;
    let allFieldNames = cellAttrsProps[cellAttrsPropsKeys[i]].allFieldNames;
    let tgtRowIndexes = cellAttrsProps[cellAttrsPropsKeys[i]].tgtRowIndexes;
    let tgtFieldNames = cellAttrsProps[cellAttrsPropsKeys[i]].tgtFieldNames;
    let cellAttrApplyTgtAttrs = cellAttrsProps[cellAttrsPropsKeys[i]].cellAttrApplyTgtAttrs;
    let candTgt = cellAttrsProps[cellAttrsPropsKeys[i]].candTgt;
    let cellAttrApplyTgtColumns = cellAttrsProps[cellAttrsPropsKeys[i]].cellAttrApplyTgtColumns;

    let styleExceptCellsDb = TAFFY(gridView.styleExceptCells);
    for (let tgt = 0, cellAttrApplyTgtColumnsLength = cellAttrApplyTgtColumns.length; tgt < cellAttrApplyTgtColumnsLength; tgt++) {
      let cellAttributeApplyTargetColumn = cellAttrApplyTgtColumns[tgt];
      let targetCells = candTgt[cellAttributeApplyTargetColumn];
      if (targetCells !== undefined && targetCells.length > 0) {
        gridView.beginUpdate();
        try {
          for (let t = 0, targetCellsLength = targetCells.length; t < targetCellsLength; t++) {
            if (t !== targetCells.length - 1) {
              if ((styleExceptCellsDb().filter({
                rowIndex: targetCells[t][0],
                fieldIndex: targetCells[t][1]
              }).get()).length <= 0) {
                gridView.setCellStyle(gridView, targetCells[t][0], targetCells[t][1], cellAttrApplyId, true);
              } else {
                let styleID = (styleExceptCellsDb().filter({
                  rowIndex: targetCells[t][0],
                  fieldIndex: targetCells[t][1]
                }).get()[0]).styleID;
                gridView.setCellStyle(gridView, targetCells[t][0], targetCells[t][1], styleID, true);
              }
            } else {
              if ((styleExceptCellsDb().filter({
                rowIndex: targetCells[t][0],
                fieldIndex: targetCells[t][1]
              }).get()).length <= 0) {
                gridView.setCellStyle(gridView, gridView, targetCells[t][0], targetCells[t][1], cellAttrApplyId, true);
              } else {
                let styleID = (styleExceptCellsDb().filter({
                  rowIndex: targetCells[t][0],
                  fieldIndex: targetCells[t][1]
                }).get()[0]).styleID;
                gridView.setCellStyle(gridView, targetCells[t][0], targetCells[t][1], styleID, true);
              }
            }
          }
        } finally {
          gridView.endUpdate();
        }
      }
    }

    if (tgtRowIndexes.length > 0 && tgtFieldNames.length > 0) {
      if (styleExceptCellsDb().count() > 0) {
        gridView.beginUpdate();
        try {
          for (let r_idx = 0, tgtRowIndexesLength = tgtRowIndexes.length; r_idx < tgtRowIndexesLength; r_idx++) {
            for (let f_idx = 0, tgtFieldNamesLength = tgtFieldNames.length; f_idx < tgtFieldNamesLength; f_idx++) {
              if ((styleExceptCellsDb().filter({
                rowIndex: tgtRowIndexes[r_idx],
                fieldName: tgtFieldNames[f_idx]
              }).get()).length <= 0) {
                gridView.setCellStyle(gridView, tgtRowIndexes[r_idx], tgtFieldNames[f_idx], cellAttrApplyId);
              } else {
                let styleID = (styleExceptCellsDb().filter({
                  rowIndex: targetCells[t][0],
                  fieldIndex: targetCells[t][1]
                }).get()[0]).styleID;
                gridView.setCellStyle(gridView, tgtRowIndexes[r_idx], tgtFieldNames[f_idx], styleID);
              }
            }
          }
        } finally {
          gridView.endUpdate();
        }
      } else {
        gridView.setCellStyles(gridView, tgtRowIndexes, tgtFieldNames, cellAttrApplyId);
      }
    }

    applyEditableToRenderer(gridView, allFieldNames, tgtRowIndexes, tgtFieldNames, cellAttrApplyTgtAttrs, cellAttrApplyId);
  }
}

function applyEditableToRenderer(gridView, allFieldNames, tgtRowIndexes, tgtFieldNames, cellAttrApplyTgtAttrs, cellAttrApplyId) {
  for (let i = 0, tgtFieldNamesLength = tgtFieldNames.length; i < tgtFieldNamesLength; i++) {
    let tgtFieldName = tgtFieldNames[i];
    if (tgtFieldName) {
      tgtFieldName = tgtFieldName.toUpperCase();
    }

    if (!allFieldNames.includes(tgtFieldName)) {
      return;
    }

    if (tgtFieldName.endsWith(LABEL_FIELD)) {
      continue;
    }

    let columnName = gridView.columnByField(tgtFieldName).name;
    let renderer = gridView.getColumnProperty(columnName, 'renderer');

    if (renderer !== undefined && renderer.type === 'check') {
      let attr = cellAttrApplyTgtAttrs;

      if (tgtRowIndexes.includes(gridView.getCurrent().dataRow)) {
        renderer.editable = attr.editable;
      } else {
        renderer.editable = !attr.editable;
      }

      gridView.setColumnProperty(gridView.columnByName(columnName), 'renderer', renderer);
      gridView.setColumnProperty(gridView.columnByName(columnName), 'editable', false);

      let attributes = clone(attr);
      attributes.editable = false;
      gridView.addCellStyle(gridView, cellAttrApplyId + '_B', attributes, true);
      gridView.setCellStyles(gridView, tgtRowIndexes, [columnName], cellAttrApplyId + '_B');
    }
  }
}

function isSatisfiedValue(cellAttributeConditionOperator, conditionCellValue, cellAttributeConditionValues) {
  cellAttributeConditionOperator = cellAttributeConditionOperator.toUpperCase();

  let targetNullAcceptOperator = ['EQUAL', 'NOTEQUAL'];
  if (!targetNullAcceptOperator.includes(cellAttributeConditionOperator)) {
    if (conditionCellValue === undefined || conditionCellValue === null || conditionCellValue.length <= 0) {
      return false;
    }
  }

  if (cellAttributeConditionOperator === 'BETWEEN') {
    if (cellAttributeConditionValues.length >= 2) {
      return conditionCellValue >= cellAttributeConditionValues[0] * 1
        && conditionCellValue <= cellAttributeConditionValues[1] * 1;
    } else {
      return false;
    }
  } else {
    for (let m = 0; m < cellAttributeConditionValues.length; m++) {
      let cellAttributeConditionValue = cellAttributeConditionValues[m];

      if (typeof conditionCellValue === 'boolean') {
        cellAttributeConditionValue = (cellAttributeConditionValue === 'true');
      }

      if (cellAttributeConditionOperator === 'STARTSWITH') {
        if (conditionCellValue.toString().startsWith(cellAttributeConditionValue)) {
          return true;
        }
      } else if (cellAttributeConditionOperator === 'ENDSWITH') {
        if (conditionCellValue.toString().endsWith(cellAttributeConditionValue)) {
          return true;
        }
      } else if (cellAttributeConditionOperator === 'EQUAL') {
        if (typeof conditionCellValue === 'boolean') {
          if (conditionCellValue === cellAttributeConditionValue) {
            return true;
          }
        } else {
          if (cellAttributeConditionValue.toUpperCase() === 'EMPTY') {
            if (!conditionCellValue) {
              return true;
            }
          } else {
            if (conditionCellValue === cellAttributeConditionValue) {
              return true;
            }
          }
        }
      } else if (cellAttributeConditionOperator === 'NOTEQUAL') {
        if (typeof conditionCellValue === 'boolean') {
          if (conditionCellValue !== cellAttributeConditionValue) {
            return true;
          }
        } else {
          if (cellAttributeConditionValue.toUpperCase() === 'EMPTY') {
            if (conditionCellValue) {
              return true;
            }
          } else {
            if (conditionCellValue !== cellAttributeConditionValue) {
              return true;
            }
          }
        }
      } else if (cellAttributeConditionOperator === 'GREATEREQUAL') {
        if (conditionCellValue >= cellAttributeConditionValue) {
          return true;
        }
      } else if (cellAttributeConditionOperator === 'LESSEQUAL') {
        if (conditionCellValue <= cellAttributeConditionValue) {
          return true;
        }
      } else if (cellAttributeConditionOperator === 'GREATER') {
        if (conditionCellValue > cellAttributeConditionValue) {
          return true;
        }
      } else if (cellAttributeConditionOperator === 'LESS') {
        if (conditionCellValue < cellAttributeConditionValue) {
          return true;
        }
      } else if (cellAttributeConditionOperator === 'INCLUDES') {
        if (conditionCellValue.toString().includes(cellAttributeConditionValue)) {
          return true;
        }
      }
    }
  }

  return false;
}

function getTargetRowIndex(componentId, operationId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(componentId).getActualComponent();
  let dataProvider = gridView.getDataSource();
  let rowCount = dataProvider.getRowCount();

  let targetCriteriaColumn = vom.get(activeId).getTargetCriteriaColumn(componentId, operationId);
  let targetMeasure = vom.get(activeId).getTargetCriteriaValue(componentId, operationId);
  let targetMeasureReferId = vom.get(activeId).getTargetCriteriaReferId(componentId, operationId);
  if (targetMeasureReferId !== undefined && targetMeasureReferId.length > 0) {
    let referenceComponent = com.get(activeId).getComponent(targetMeasureReferId);
    if (referenceComponent) {
      let referVal = referenceComponent.getValue(targetMeasureReferId, targetMeasureReferId);
      if (referVal) {
        targetMeasure = referVal;
      }
    }
  }

  let targetRowIndexes = [];
  for (let i = 0; i < rowCount; i++) {
    let rowData = gridView.getValues(i);

    if (rowData !== null && rowData[targetCriteriaColumn] === targetMeasure) { // target
      let rowIndex = gridView.getDataRow(i);
      targetRowIndexes.push(rowIndex); // target index
    }
  }

  return targetRowIndexes;
}

function getTargetColumnIndexes(gridView, operationId) {

  let dataProvider = gridView.getDataSource();
  let fieldNames = dataProvider.getFieldNames();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);

  let targetColumn = vom.get(activeId).getTargetColumn(componentId, operationId);
  let targetColumnIndexes = [];

  if (isIterationColumn(gridView, targetColumn)) {
    let tgtDataColumns = dataColumnsDB().filter({ columnIdOrg: targetColumn }).get();
    let tgtFieldNames = [];
    for (let tdcIdx = 0, tgtDataColumnsLength = tgtDataColumns.length; tdcIdx < tgtDataColumnsLength; tdcIdx++) {
      tgtFieldNames.push(tgtDataColumns[tdcIdx]['fieldName']);
    }

    for (let j = 0; j < fieldNames.length; j++) {
      let fieldName = fieldNames[j];
      if (tgtFieldNames.includes(fieldName)) {
        targetColumnIndexes.push(dataProvider.getFieldIndex(fieldName));
      }
    }
  } else {
    targetColumnIndexes.push(dataProvider.getFieldIndex(targetColumn));
  }

  return targetColumnIndexes;
}

function getTargetFields(componentId, operationId) {
  let gridView = com.get(com.active).getComponent(componentId).getActualComponent();
  let dataProvider = gridView.getDataSource();
  let fieldNames = dataProvider.getFieldNames();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);

  let targetColumn = vom.get(vom.active).getTargetColumn(componentId, operationId);
  let targetFields = [];

  if (vom.get(vom.active).isIterationColumn(componentId, targetColumn)) {
    let tgtDataColumns = dataColumnsDB().filter({ columnIdOrg: targetColumn }).get();
    let tgtFieldNames = [];
    for (let tdcIdx = 0, tgtDataColumnsLength = tgtDataColumns.length; tdcIdx < tgtDataColumnsLength; tdcIdx++) {
      tgtFieldNames.push(tgtDataColumns[tdcIdx]['fieldName']);
    }

    for (let j = 0; j < fieldNames.length; j++) {
      let fieldName = fieldNames[j];
      if (tgtFieldNames.includes(fieldName)) {
        targetFields.push(fieldName);
      }
    }
  } else {
    targetFields.push(targetColumn);
  }

  return targetFields;
}

function getTargetReferValues(componentId, operationId, targetRowIndex, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(componentId).getActualComponent();

  let targetReferColumns = vom.get(activeId).getReferColumns(componentId, operationId);

  let targetReferValues = {};
  if (targetReferColumns !== undefined && targetReferColumns.length > 0) {
    for (let j = 0; j < targetReferColumns.length; j++) {
      targetReferValues[targetReferColumns[j]] = gridView.getValue(targetRowIndex, targetReferColumns[j]);
    }
  }

  return targetReferValues;
}

function getSourceRowIndexes(componentId, operationId, targetReferValues, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(componentId).getActualComponent();
  let dataProvider = gridView.getDataSource();

  let sourceCriteriaColumn = vom.get(activeId).getSourceCriteriaColumn(componentId, operationId);
  let sourceMeasures = vom.get(activeId).getSourceCriteriaValues(componentId, operationId);
  let sourceMeasuresReferId = vom.get(activeId).getSourceCriteriaReferId(componentId, operationId);

  if (sourceMeasuresReferId !== undefined && sourceMeasuresReferId.length > 0) {
    let referenceComponent = com.get(activeId).getComponent(sourceMeasuresReferId);
    if (referenceComponent) {
      let referVal = referenceComponent.getValue(sourceMeasuresReferId, sourceMeasuresReferId);
      if (referVal) {
        sourceMeasures = [referVal];
      }
    }
  }

  let sourceReferColumns = Object.getOwnPropertyNames(targetReferValues);
  let rowCount = dataProvider.getRowCount();
  let sourceRowIndexes = [];

  for (let i = 0; i < rowCount; i++) {
    let rowData = gridView.getValues(i);

    if (sourceMeasures.includes(rowData[sourceCriteriaColumn])) {
      let rowIndex = gridView.getDataRow(i);
      let sourceReferValues = {};

      for (let j = 0; j < sourceReferColumns.length; j++) {
        sourceReferValues[sourceReferColumns[j]] = gridView.getValue(rowIndex, sourceReferColumns[j]);
      }

      if (isEquivalent(targetReferValues, sourceReferValues)) {
        sourceRowIndexes.push(i);
      }
    }
  }

  return sourceRowIndexes;
}

function getSourceColumnIndexes(gridView, operationId) {

  let dataProvider = gridView.getDataSource();
  let fieldNames = dataProvider.getFieldNames();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);

  let sourceColumn = vom.get(activeId).getSourceColumn(componentId, operationId);

  let sourceColumnIndexes = [];

  if (isIterationColumn(gridView, sourceColumn)) {
    let srcDataColumns = dataColumnsDB().filter({ columnIdOrg: sourceColumn }).get();
    let srcFieldNames = [];
    for (let sdcIdx = 0, srcDataColumnsLength = srcDataColumns.length; sdcIdx < srcDataColumnsLength; sdcIdx++) {
      srcFieldNames.push(srcDataColumns[sdcIdx]['fieldName']);
    }

    for (let j = 0; j < fieldNames.length; j++) {
      let fieldName = fieldNames[j];
      if (srcFieldNames.includes(fieldName)) {
        sourceColumnIndexes.push(dataProvider.getFieldIndex(fieldName));
      }
    }
  } else {
    sourceColumnIndexes.push(dataProvider.getFieldIndex(sourceColumn));
  }

  return sourceColumnIndexes;
}

function getSourceValues(gridView, sourceRowItemIndexes, sourceColumnIndexes) {
  let sourceValuesMap = {};
  for (let i = 0; i < sourceRowItemIndexes.length; i++) {
    let valuesMap = {};
    for (let j = 0; j < sourceColumnIndexes.length; j++) {
      valuesMap[sourceColumnIndexes[j]] = gridView.getValue(sourceRowItemIndexes[i], sourceColumnIndexes[j]);
    }
    sourceValuesMap[sourceRowItemIndexes[i]] = valuesMap;
  }

  return sourceValuesMap;
}

function getCalculatedValues(sourceValues, formula, proportion) {
  let sourceValuesMapKeys = Object.getOwnPropertyNames(sourceValues);

  let calculatedValuesMap = {};
  for (let i = 0; i < sourceValuesMapKeys.length; i++) {
    let valuesMap = sourceValues[sourceValuesMapKeys[i]];
    let valuesMapKeys = Object.getOwnPropertyNames(valuesMap);
    for (let j = 0; j < valuesMapKeys.length; j++) {
      if (calculatedValuesMap.hasOwnProperty(valuesMapKeys[j])) {
        if (formula === 'SUM' || formula === 'AVG') {
          calculatedValuesMap[valuesMapKeys[j]] = calculatedValuesMap[valuesMapKeys[j]] + valuesMap[valuesMapKeys[j]];
        }
      } else {
        calculatedValuesMap[valuesMapKeys[j]] = valuesMap[valuesMapKeys[j]];
      }
    }
  }

  if (formula === 'AVG') {
    let calculatedValuesMapKeys = Object.getOwnPropertyNames(calculatedValuesMap);
    for (let i = 0; i < calculatedValuesMapKeys.length; i++) {
      calculatedValuesMap[calculatedValuesMapKeys[i]] = calculatedValuesMap[calculatedValuesMapKeys[i]] / sourceValuesMapKeys.length;
    }
  }

  // TODO: apply proportion as percent
  return calculatedValuesMap;
}

/**
 * grid paging
 */
function initPaging(targetComponentId, gridView, dataProvider, data, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let btnFirst = `<input type="button" id="btnFirst_${targetComponentId}" value="${transLangKey('First')}" class="button ${pagingButtonColors.pagingButtonColor} medium3" />`;
  let btnPrev = `<input type="button" id="btnPrev_${targetComponentId}" value="<" class="button ${pagingButtonColors.pagingButtonColor} medium3" />`;
  let pageNumbers = `<div id="pageNumbers_${targetComponentId}" style="display: inline-block; white-space: nowrap;" />`;
  let txtPage = `<input type="text" id="txtPage_${targetComponentId}" value="1" class="" style="text-align: right;" maxlength="5" size="5" />`;
  let btnGoPage = `<input type="button" id="btnPage_${targetComponentId}" value="Go" class="button ${pagingButtonColors.pagingButtonColor} medium3" />`;
  let btnNext = `<input type="button" id="btnNext_${targetComponentId}" value=">" class="button ${pagingButtonColors.pagingButtonColor} medium3" />`;
  let btnLast = `<input type="button" id="btnLast_${targetComponentId}" value="${transLangKey('Last')}" class="button ${pagingButtonColors.pagingButtonColor} medium3" />`;
  let pagingAreaElements = btnFirst + btnPrev + pageNumbers + txtPage + btnGoPage + btnNext + btnLast;

  let $targetComponent = $('#' + targetComponentId);
  let $ui_gridPaging = $targetComponent.find('.ui_gridPaging');
  if ($ui_gridPaging.length > 0) {
    $ui_gridPaging.remove();
  }

  let pagingArea = '<div class="ui_gridPaging" style="width: 100%; text-align: center; padding-top: 10px;">\
    <div style="width: 100%; text-align: center;">' + pagingAreaElements + '</div>\
    </div>';

  $targetComponent.append(pagingArea).addClass('activePaging');

  pagingData(targetComponentId, dataProvider, data, 0, activeId);

  let pageSize = vom.get(activeId).propPageRowCount(targetComponentId);
  let rowCount = parseInt(data.length);
  let remainder = rowCount % pageSize;
  let pageCount = Math.round((rowCount + pageSize / 2) / pageSize);
  if (remainder === 0) {
    pageCount = rowCount / pageSize;
  }
  gridView.setPaging(true, pageSize, pageCount);

  setPage(targetComponentId, gridView, dataProvider, data, 0, activeId);

  gridView.onPageChanging = function (grid, newPage) {
  };
  gridView.onPageChanged = function (grid, newPage) {
    $('input#txtPage' + '_' + targetComponentId).val(newPage + 1);
  };

  let pagingButtons = [
    'btnFirst' + '_' + targetComponentId,
    'btnPrev' + '_' + targetComponentId,
    'btnPage' + '_' + targetComponentId,
    'btnNext' + '_' + targetComponentId,
    'btnLast' + '_' + targetComponentId
  ];

  let eventType = 'click';
  let temp = {
    eventType: eventType,
    targetComponentId: targetComponentId,
    gridView: gridView,
    dataProvider: dataProvider,
    data: data
  };

  $(pagingButtons).each(function () {
    let buttonId = this;

    $('#' + buttonId).on(eventType, temp, function (event) {
      let eventData = event.data;
      let targetComponentId = eventData.targetComponentId;
      let gridView = eventData.gridView;
      let dataProvider = eventData.dataProvider;
      let data = eventData.data;

      if (buttonId.startsWith('btnFirst')) {
        btnFirstClickHandler(targetComponentId, gridView, dataProvider, data, activeId);
      } else if (buttonId.startsWith('btnPrev')) {
        btnPrevClickHandler(targetComponentId, gridView, dataProvider, data, activeId);
      } else if (buttonId.startsWith('btnPage')) {
        btnPageClickHandler(targetComponentId, gridView, dataProvider, data, activeId);
      } else if (buttonId.startsWith('btnNext')) {
        btnNextClickHandler(targetComponentId, gridView, dataProvider, data, activeId);
      } else if (buttonId.startsWith('btnLast')) {
        btnLastClickHandler(targetComponentId, gridView, dataProvider, data, activeId);
      }
    });
  });
}





function columnsSort(columns) {
  return columns.sort(function (a, b) {
    if (a.columnIndexNo === undefined) {
      a.columnIndexNo = 10000;
    }
    if (b.columnIndexNo === undefined) {
      b.columnIndexNo = 10000;
    }

    if (a.columnIndexNo === b.columnIndexNo) {
      return a.name > b.name ? 1 : (b.name > a.name ? -1 : 0)
    } else {
      return a.columnIndexNo > b.columnIndexNo ? 1 : (b.columnIndexNo > a.columnIndexNo ? -1 : 0);
    }
  });
}

function fitGridData(gridView) {
  if (gridView.gridDataFit === 'HORIZONTAL') {
    fitGridDataHorizontal(gridView);
  } else if (gridView.gridDataFit === 'VERTICAL') {
    fitGridDataVertical(gridView);
  }
}

function fitGridDataHorizontal(gridView) {
  let dataProvider = gridView.getDataSource();
  let dataColumnDB = TAFFY(gridView.dataColumns);

  window.requestAnimationFrame(function () {
    let buttonColumns = [];

    let dateColumns = [];
    let dropdownColumns = [];

    try {
      let fields = dataProvider.getFields();
      for (let i = 0, fieldsLen = fields.length; i < fieldsLen; i++) {
        let field = fields[i];
        let fieldName = field.orgFieldName;

        if (fieldName === undefined) {
          fieldName = field.fieldName;
        }

        let column = gridView.columnByField(fieldName);

        if (!column) {
          continue;
        }

        let dataColumn = dataColumnDB().filter({ name: column.name }).get()[0];
        if (dataColumn.width > 0) {
          let maxWidth = 0;
          let minWidth = 0;

          if (maxWidth !== undefined && minWidth !== undefined) {
            gridView.fitColumnWidth(column, maxWidth, minWidth, false);

            window.requestAnimationFrame(function () {
              if (column.button === 'action') {
                buttonColumns.push(column.name);
              }

              if (DATETIME_DATA_TYPE.includes(field.dataType.toUpperCase())) {
                dateColumns.push(column.name);
              }

              if (column.editor === 'dropDown') {
                dropdownColumns.push(column.name);
              }
            })
          }
        }
      }
    } catch (err) {
      console.warn(err);
    } finally {
      window.requestAnimationFrame(function () {
        for (let i = 0, len = buttonColumns.length; i < len; i++) {
          let column = gridView.columnByName(buttonColumns[i]);
          gridView.setColumnProperty(column, 'width', column.width + 25);
        }
        for (let i = 0, len = dateColumns.length; i < len; i++) {
          let column = gridView.columnByName(dateColumns[i]);
          gridView.setColumnProperty(column, 'width', column.width + 10);
        }
        for (let i = 0, len = dropdownColumns.length; i < len; i++) {
          let column = gridView.columnByName(dropdownColumns[i]);
          gridView.setColumnProperty(column, 'width', column.width + 25);
        }
      });
    }
  });
}

function fitGridDataVertical(gridView) {
  gridView.fitRowHeightAll(0, false);
}

function manualFitGridDataHorizontal(gridView, fitAction) {
  let dataProvider = gridView.getDataSource();
  let dataColumnDB = TAFFY(gridView.dataColumns);

  window.requestAnimationFrame(function () {
    let buttonColumns = [];
    let dateColumns = [];
    let dropdownColumns = [];

    try {
      let fields = dataProvider.getFields();
      for (let i = 0, fieldsLen = fields.length; i < fieldsLen; i++) {
        let field = fields[i];
        let fieldName = field.orgFieldName;
        if (fieldName === undefined) {
          fieldName = field.fieldName;
        }
        let column = gridView.columnByField(fieldName);
        let dataColumn = dataColumnDB().filter({ name: column.name }).get()[0];
        if (dataColumn.width > 0) {
          let maxWidth;
          let minWidth;
          if (fitAction === 'fit') {
            maxWidth = 0;
            minWidth = 0;
          } else if (fitAction === 'release') {
            maxWidth = dataColumn.width;
            minWidth = dataColumn.width;
          }

          if (maxWidth !== undefined && minWidth !== undefined) {
            gridView.fitColumnWidth(column, maxWidth, minWidth, false);

            window.requestAnimationFrame(function () {
              if (column.button === 'action' && fitAction === 'fit') {
                buttonColumns.push(column.name);
              }

              if (DATETIME_DATA_TYPE.includes(field.dataType.toUpperCase())) {
                dateColumns.push(column.name);
              }

              if (column.editor === 'dropDown') {
                dropdownColumns.push(column.name);
              }
            })
          }
        }
      }

      if (fitAction === 'release') {
        fitGridData(gridView);
      }
    } catch (err) {

    } finally {
      window.requestAnimationFrame(function () {
        for (let i = 0, len = buttonColumns.length; i < len; i++) {
          let column = gridView.columnByName(buttonColumns[i]);
          gridView.setColumnProperty(column, 'width', column.width + 25);
        }
        for (let i = 0, len = dateColumns.length; i < len; i++) {
          let column = gridView.columnByName(dateColumns[i]);
          gridView.setColumnProperty(column, 'width', column.width + 10);
        }
        for (let i = 0, len = dropdownColumns.length; i < len; i++) {
          let column = gridView.columnByName(dropdownColumns[i]);
          gridView.setColumnProperty(column, 'width', column.width + 25);
        }
      });
    }
  });
}

function setGridChart(gridView, chartAction, index, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let componentId = gridView.orgId;
  let dataProvider = gridView.getDataSource();
  let element = document.getElementById(componentId);
  let $component = $('#' + componentId);
  let chartElementId = componentId + '_gridchart';
  let gridChartHeight = vom.get(activeId).propChartHeight(componentId);

  if (chartAction === 'CLEAR_CHART' && document.getElementById(chartElementId) && gridView.chartActivated) {
    gridView.chartCategory = '';
    gridView.chartCategories = [];
    gridView.chartSeries = [];
    gridView.chartSeriesItems = [];
    gridView.chartAxes = [];
    gridView.axisCrossingValues = [];

    element.removeChild(document.getElementById(chartElementId));
    gridView.additionalHeight = gridView.additionalHeight - gridChartHeight;
    gridView.chartActivated = false;
    console.log('Chart for ' + componentId + ' is disabled.');
    $component.find('canvas').parent('div').css('height', 'calc(100% - ' + gridView.additionalHeight + 'px)');
    gridView.resetSize();
    return;
  }

  if (chartAction === 'SET_CHART') {
    let columnName = index.column;

    if (columnName) {
      let dataColumnsDb = TAFFY(gridView.dataColumns);
      let dataColumn = dataColumnsDb().filter({ name: columnName }).get()[0];
      let columnIdOrg = dataColumn.columnIdOrg;
      let candidDataColumns = dataColumnsDb().filter({ columnIdOrg: columnIdOrg }).get();
      let candidDataColumnsDb = TAFFY(candidDataColumns);
      let candidDataColumnNames = candidDataColumnsDb().select('name');

      let prefix = vom.get(activeId).propColumnIterationPrefix(componentId, columnIdOrg);
      let postfix = vom.get(activeId).propColumnIterationPostfix(componentId, columnIdOrg);

      gridView.chartCategory = columnIdOrg;
      let chartCategories = [];

      let seriesValues = [];
      for (let i = 0, candidDataColumnNamesLen = candidDataColumnNames.length; i < candidDataColumnNamesLen; i++) {
        seriesValues.push(dataProvider.getValue(index.dataRow, candidDataColumnNames[i]));

        let cat = candidDataColumnNames[i].replace(prefix, '');
        chartCategories.push(cat.replace(postfix, ''));
      }

      gridView.chartCategories = chartCategories;

      let seriesType = 'column';
      let measureColumn = vom.get(activeId).propMeasureColumn(componentId);
      let identifier = gridView.getValue(gridView.getCurrent().itemIndex, measureColumn);
      let seriesItem = {
        type: seriesType,
        name: identifier + '@' + columnIdOrg,
        data: seriesValues,
        axis: columnIdOrg,
        orgColumnId: columnIdOrg
      };

      let axis = {
        name: columnIdOrg,
        title: { text: columnIdOrg }
      };

      if (gridView.chartAxes.length > 0) {
        let chartAxisNames = [];
        for (let i = 0, len = gridView.chartAxes.length; i < len; i++) {
          let chartAxis = gridView.chartAxes[i];
          chartAxisNames.push(chartAxis.name);
        }

        if (!chartAxisNames.includes(axis.name)) {
          gridView.chartAxes.push(axis);
        }
      } else {
        gridView.chartAxes.push(axis);
      }

      gridView.chartSeries.push(columnIdOrg);
      gridView.chartSeriesItems.push(seriesItem);
    }

  } else {
    let fieldName = index.fieldName;
    let columnName = index.column;
    let columnTitle = gridView.getColumnProperty(gridView.columnByName(columnName), 'header').text;

    if (chartAction === 'SET_CATEGORY') {
      if (gridView.chartCategory === columnName) {
        console.warn(columnName + ' is already category.');
        return;
      } else if (gridView.chartSeries.includes(columnName)) {
        console.warn(columnName + ' is already in series.');
        return;
      }

      gridView.chartCategory = columnName;
      gridView.chartCategories = dataProvider.getFieldValues(fieldName, 0, -1);
      console.log(columnTitle + '(' + columnName + ')' + ' is set to Category');
    }

    if (chartAction === 'ADD_SERIES') {
      if (gridView.chartSeries.includes(columnName)) {
        console.warn(columnName + ' is already in series.');
        return;
      } else if (gridView.chartCategory === columnName) {
        console.warn(columnName + ' is already category.');
        return;
      }

      let seriesData = dataProvider.getFieldValues(fieldName, 0, -1);
      let nanFlag = true;
      let field = dataProvider.fieldByName(fieldName);
      let fieldDataType = field.dataType;

      if (fieldDataType !== 'number') {
        for (let i = 0, seriesDataLen = seriesData.length; i < seriesDataLen; i++) {
          if (seriesData[i] !== null && !isNaN(seriesData[i])) {
            nanFlag = false;
            break;
          }
        }
      } else {
        nanFlag = false;
      }

      if (nanFlag || fieldDataType === 'datetime') {
        showDialog('Error', 'Cannot this column(' + columnName + ') set to chart series.', DIALOG_TYPE.ALERT, true);
        console.warn('Cannot this column(' + columnName + ') set to chart series.');
        return;
      }

      let seriesType = 'column';

      let seriesItem = {
        type: seriesType,
        name: columnTitle,
        data: seriesData,
        axis: columnTitle,
        orgColumnId: columnName
      };

      let axis = {
        name: columnTitle,
        title: { text: columnTitle }
      };

      gridView.chartAxes.push(axis);
      gridView.chartSeries.push(columnName);
      gridView.chartSeriesItems.push(seriesItem);
      console.log(columnTitle + '(' + columnName + ')' + ' is add to Series');
    }
  }

  if (gridView.chartCategories.length > 0 && gridView.chartSeries.length > 0) {
    if (!gridView.chartActivated) {
      let chartDiv = document.createElement('div');
      chartDiv.id = chartElementId;
      chartDiv.classList.add('ui_gridChartWrap');
      chartDiv.style.height = gridChartHeight + 'px';
      element.insertBefore(chartDiv, document.getElementById('fileUploadForm_' + componentId));
      gridView.additionalHeight = gridView.additionalHeight + gridChartHeight;
      gridView.chartActivated = true;
    }

    gridView.axisCrossingValues = [];
    for (let i = 0, chartSeriesLen = gridView.chartAxes.length; i < chartSeriesLen; i++) {
      if (i < chartSeriesLen / 2) {
        gridView.axisCrossingValues.push(0);
      } else {
        gridView.axisCrossingValues.push(1000000);
      }
    }

    let chartData = {
      chartCategories: gridView.chartCategories,
      chartSeriesItems: gridView.chartSeriesItems
    };

    if (chartAction !== 'SET_CHART') {
      chartData = getRefinedChartData(gridView);
    }

    $component.find('canvas').parent('div').css('height', 'calc(100% - ' + gridView.additionalHeight + 'px)');
    gridView.resetSize();

    $('#' + chartElementId).kendoChart({
      legend: {
        visible: true,
        position: 'bottom'
      },
      seriesDefaults: {
        type: 'bar'
      },
      series: chartData.chartSeriesItems,
      valueAxes: gridView.chartAxes,
      categoryAxis: {
        categories: chartData.chartCategories,
        majorGridLines: {
          visible: false
        },
        labels: {
          rotation: 'auto'
        },
        axisCrossingValues: gridView.axisCrossingValues
      },
      tooltip: {
        visible: true,
        template: '#= series.name #: #= value #'
      },
      theme: 'bootstrap'
    });
  }
}

function getRefinedChartData(gridView) {
  let chartCategory = clone(gridView.chartCategory);
  let chartCategories = clone(gridView.chartCategories);
  let chartSeriesItems = clone(gridView.chartSeriesItems);
  let temp = [];

  for (let i = 0, categoryLen = chartCategories.length; i < categoryLen; i++) {
    let tempCategory = TAFFY(temp)().select(chartCategory);

    if (tempCategory.includes(chartCategories[i])) {
      let filter = {};
      filter[chartCategory] = chartCategories[i];
      let dataItem = TAFFY(temp)().filter(filter).get()[0];

      for (let j = 0, seriesItemsLen = chartSeriesItems.length; j < seriesItemsLen; j++) {
        dataItem[chartSeriesItems[j].orgColumnId] = (dataItem[chartSeriesItems[j].orgColumnId] * 1) + (chartSeriesItems[j].data[i] * 1);
      }
    } else {
      let dataItem = {};
      dataItem[chartCategory] = chartCategories[i];
      for (let j = 0, seriesItemsLen = chartSeriesItems.length; j < seriesItemsLen; j++) {
        dataItem[chartSeriesItems[j].orgColumnId] = chartSeriesItems[j].data[i] * 1;
      }
      temp.push(dataItem);
    }
  }

  for (let i = 0, seriesItemsLen = chartSeriesItems.length; i < seriesItemsLen; i++) {
    chartSeriesItems[i].data = TAFFY(temp)().select(chartSeriesItems[i].orgColumnId);
  }

  let refinedChartData = {
    chartCategories: TAFFY(temp)().select(gridView.chartCategory),
    chartSeriesItems: chartSeriesItems
  };

  return refinedChartData;
}

function getDisplayIndex(grid, column, displayIndex) {
  if (column.parent !== null) {
    column = grid.columnByName(column.parent);
    displayIndex = getDisplayIndex(grid, column, displayIndex);
  } else {
    displayIndex = column.displayIndex;
  }

  return displayIndex;
}

function setGridContextMenu(componentId, gridView, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let menu = {};
  menu.SEPARATOR = { label: '-', type: 'separator' };
  menu.IMPORT = { label: transLangKey('IMPORT'), tag: 'IMPORT', enabled: true };
  menu.EXPORT = { label: transLangKey('EXPORT'), tag: 'EXPORT', enabled: true };
  menu.LOAD = { label: transLangKey('LOAD'), tag: 'LOAD', enabled: true };
  menu.SAVE = { label: transLangKey('SAVE'), tag: 'SAVE', enabled: true };
  menu.ROLLBACK = { label: transLangKey('ROLLBACK'), tag: 'ROLLBACK', enabled: true };
  menu.REFRESH = { label: transLangKey('REFRESH'), tag: 'REFRESH', enabled: true };
  menu.INIT = { label: transLangKey('INIT'), tag: 'INIT', enabled: true };
  menu.COPY = { label: transLangKey('COPY'), tag: 'COPY', enabled: true };
  menu.INSERT_ROW = { label: transLangKey('INSERT_ROW'), tag: 'INSERT_ROW', enabled: true };
  menu.REMOVE_ROW = { label: transLangKey('REMOVE_ROW'), tag: 'REMOVE_ROW', enabled: true };
  menu.ROW_FIX = { label: transLangKey('ROW_FIX'), tag: 'ROW_FIX', enabled: true };
  menu.ROW_FIX_CANCEL = { label: transLangKey('ROW_FIX_CANCEL'), tag: 'ROW_FIX_CANCEL', enabled: false };
  menu.COLUMN_FIX = { label: transLangKey('COLUMN_FIX'), tag: 'COLUMN_FIX', enabled: true };
  menu.COLUMN_FIX_CANCEL = { label: transLangKey('COLUMN_FIX_CANCEL'), tag: 'COLUMN_FIX_CANCEL', enabled: false };
  menu.COLUMN_HIDE = { label: transLangKey('COLUMN_HIDE'), tag: 'COLUMN_HIDE', enabled: true };
  menu.COLUMN_HIDE_CANCEL = { label: transLangKey('COLUMN_HIDE_CANCEL'), tag: 'COLUMN_HIDE_CANCEL', enabled: false };
  menu.SET_COLUMN_FILTER = { label: transLangKey('SET_COLUMN_FILTER'), tag: 'SET_COLUMN_FILTER', enabled: true };
  menu.DEL_COLUMN_FILTER = { label: transLangKey('DEL_COLUMN_FILTER'), tag: 'DEL_COLUMN_FILTER', enabled: false };
  menu.DATA_FIT = { label: transLangKey('DATA_FIT'), tag: 'DATA_FIT', enabled: true };
  menu.FIT_RELEASE = { label: transLangKey('FIT_RELEASE'), tag: 'FIT_RELEASE', enabled: false };
  menu.COLLAPSE_GROUP_LEVEL = { label: transLangKey('COLLAPSE_GROUP_LEVEL'), tag: 'COLLAPSE_GROUP_LEVEL', enabled: true };
  menu.EXPAND_GROUP_LEVEL = { label: transLangKey('EXPAND_GROUP_LEVEL'), tag: 'EXPAND_GROUP_LEVEL', enabled: true };

  menu.SHOW_CHART = {
    label: transLangKey('SHOW_CHART'),
    tag: 'SHOW_CHART',
    enabled: true,
    children: [{
      label: transLangKey('SET_CATEGORY'),
      tag: 'SET_CATEGORY',
      enabled: true
    }, {
      label: transLangKey('ADD_SERIES'),
      tag: 'ADD_SERIES',
      enabled: true
    }, {
      label: transLangKey('CLEAR_CHART'),
      tag: 'CLEAR_CHART',
      enabled: false
    }, {
      label: transLangKey('SET_CHART'),
      tag: 'SET_CHART',
      enabled: false
    }]
  };

  let gridContextMenuItems = [];
  gridContextMenuItems.push(menu.ROW_FIX);
  gridContextMenuItems.push(menu.ROW_FIX_CANCEL);
  gridContextMenuItems.push(menu.COLUMN_FIX);
  gridContextMenuItems.push(menu.COLUMN_FIX_CANCEL);
  gridContextMenuItems.push(menu.COLUMN_HIDE);
  gridContextMenuItems.push(menu.COLUMN_HIDE_CANCEL);
  gridContextMenuItems.push(menu.DATA_FIT);
  gridContextMenuItems.push(menu.FIT_RELEASE);
  gridContextMenuItems.push(menu.SET_COLUMN_FILTER);
  gridContextMenuItems.push(menu.DEL_COLUMN_FILTER);
  gridContextMenuItems.push(menu.SHOW_CHART);

  gridView.setContextMenu(gridContextMenuItems);

  gridView.gridContextMenuItems = gridContextMenuItems;

  gridView.onContextMenuPopup = function (grid, x, y, elementName) {
    let contextMenuAcceptedArea = ['DataCell', 'MergedDataCell', 'FooterCell', 'RowGroupHeaderCell', 'GroupFooterCell', 'RowGroupFootCell'];

    let gridContextMenuItems = grid.gridContextMenuItems;

    for (let i = 0; i < gridContextMenuItems.length; i++) {
      if (gridContextMenuItems[i].tag === 'ROW_FIX_CANCEL') {
        gridContextMenuItems[i].enabled = grid.rowFixed;
      }
      if (gridContextMenuItems[i].tag === 'COLUMN_FIX_CANCEL') {
        gridContextMenuItems[i].enabled = grid.colFixed;
      }
      if (gridContextMenuItems[i].tag === 'COLUMN_HIDE_CANCEL') {
        gridContextMenuItems[i].enabled = grid.hidedColumnNames !== undefined && grid.hidedColumnNames.length > 0;
      }
      if (gridContextMenuItems[i].tag === 'DEL_COLUMN_FILTER') {
        let current = grid.getCurrent();
        let columnFilters = grid.getColumnFilters(current.column);
        gridContextMenuItems[i].enabled = columnFilters !== undefined && columnFilters.length > 0;
      }
      if (gridContextMenuItems[i].tag === 'FIT_RELEASE') {
        gridContextMenuItems[i].enabled = grid.widthFitted;
      }
      if (gridContextMenuItems[i].tag === 'SHOW_CHART') {
        let index = grid.mouseToIndex(x, y);
        let columnName = index && index.column;
        let setChartShowFlag = false;

        if (columnName) {
          let dataColumnsDb = TAFFY(grid.dataColumns);
          let dataColumn = dataColumnsDb().filter({ name: columnName }).get()[0];

          if (dataColumn.isIterationColumn) {
            setChartShowFlag = true;
          }
        }

        let children = gridContextMenuItems[i].children;
        for (let j = 0, childrenLen = children.length; j < childrenLen; j++) {
          let childMenu = children[j];
          if (childMenu.tag === 'CLEAR_CHART') {
            childMenu.enabled = grid.chartActivated;
          }

          if (childMenu.tag === 'SET_CHART') {
            childMenu.enabled = setChartShowFlag;
          }

          if (childMenu.tag === 'SET_CATEGORY' || childMenu.tag === 'ADD_SERIES') {
            childMenu.enabled = !setChartShowFlag;
          }
        }
      }
    }

    grid.setContextMenu(gridContextMenuItems);
    if (elementName === 'RowGroupHeaderCell') {
      gridContextMenuItems = [];
      gridContextMenuItems.push(menu.COLLAPSE_GROUP_LEVEL);
      gridContextMenuItems.push(menu.EXPAND_GROUP_LEVEL);
      grid.setContextMenu(gridContextMenuItems);
    }

    return contextMenuAcceptedArea.includes(elementName);
  };

  gridView.onContextMenuItemClicked = function (grid, menuItem, index) {
    let operation = menuItem.tag;
    let current, fixedOptions, column;
    let currentItemIndex, currentModel, currentModelLevel;
    let itemIndex;

    switch (operation) {
      case 'ROW_FIX':
        current = grid.getCurrent();
        fixedOptions = grid.getFixedOptions();
        fixedOptions.rowCount = current.itemIndex;

        grid.setFixedOptions(fixedOptions);
        grid.rowFixed = true;
        break;

      case 'ROW_FIX_CANCEL':
        fixedOptions = grid.getFixedOptions();
        fixedOptions.rowCount = 0;

        grid.setFixedOptions(fixedOptions);
        grid.rowFixed = false;
        break;

      case 'COLUMN_FIX':
        current = grid.getCurrent();
        column = grid.columnByName(current.column);
        let colCount = getDisplayIndex(grid, column, colCount);

        fixedOptions = grid.getFixedOptions();
        fixedOptions.colCount = colCount;

        grid.setFixedOptions(fixedOptions);
        grid.colFixed = true;
        break;

      case 'COLUMN_FIX_CANCEL':
        fixedOptions = grid.getFixedOptions();
        fixedOptions.colCount = 0;

        grid.setFixedOptions(fixedOptions);
        grid.colFixed = false;
        break;

      case 'COLUMN_HIDE':
        current = grid.getCurrent();
        column = grid.columnByName(current.column);
        if (column.parent !== null) {
          return;
        }

        if (grid.colFixed) {
          let fixedOptions = grid.getFixedOptions();
          if (column.displayIndex <= fixedOptions.colCount - 1) {
            fixedOptions.colCount = fixedOptions.colCount - 1;
            grid.setFixedOptions(fixedOptions);
          }
        }

        grid.setColumnProperty(column, 'visible', false);
        if (grid.hidedColumnNames === undefined) {
          grid.hidedColumnNames = [];
        }
        grid.hidedColumnNames.push(current.column);

        break;

      case 'COLUMN_HIDE_CANCEL':
        for (let i = 0; i < grid.hidedColumnNames.length; i++) {
          let column = grid.columnByName(grid.hidedColumnNames[i]);
          grid.setColumnProperty(column, 'visible', true);
        }
        grid.hidedColumnNames = [];

        if (grid.colFixed) {
          let fixedOptions = grid.getFixedOptions();
          fixedOptions.colCount = grid.fixedColCount;
          grid.setFixedOptions(fixedOptions);
        }

        break;

      case 'SET_COLUMN_FILTER':
        setColumnFilter(grid, grid.getDataSource(), index.column);
        break;

      case 'DEL_COLUMN_FILTER':
        grid.clearColumnFilters(index.column);

        let dataColumns = grid.dataColumns;

        for (let i = 0, len = dataColumns.length; i < len; i++) {
          let columnName = dataColumns[i].name;
          let columnFilters = grid.getColumnFilters(columnName);

          if (columnFilters.length > 0) {
            let activeColumnFilters = grid.getActiveColumnFilters(columnName, true);
            let activeColumnFilterNames = activeColumnFilters.map(filterItem => filterItem.name);
            setColumnFilter(grid, grid.getDataSource(), columnName);

            window.requestAnimationFrame(function () {
              grid.activateColumnFilters(columnName, activeColumnFilterNames, true);
            });
          }
        }

        break;

      case 'DATA_FIT':
        manualFitGridDataHorizontal(grid, 'fit');
        grid.widthFitted = true;
        break;

      case 'FIT_RELEASE':
        manualFitGridDataHorizontal(grid, 'release');
        grid.widthFitted = false;
        break;

      case 'COLLAPSE_GROUP_LEVEL':
        currentItemIndex = grid.getCurrent().itemIndex;
        currentModel = grid.getModel(currentItemIndex, true);
        currentModelLevel = currentModel.level;

        itemIndex = 0;
        while (grid.getModel(itemIndex, true) !== null) {
          let itemModel = grid.getModel(itemIndex, true);
          if (itemModel.type === 'group' && itemModel.level === currentModelLevel) {
            grid.collapseGroup(itemIndex, false);
          }
          itemIndex = itemIndex + 1;
        }
        break;

      case 'EXPAND_GROUP_LEVEL':
        currentItemIndex = grid.getCurrent().itemIndex;
        currentModel = grid.getModel(currentItemIndex, true);
        currentModelLevel = currentModel.level;

        itemIndex = 0;
        while (grid.getModel(itemIndex, true) !== null) {
          let itemModel = grid.getModel(itemIndex, true);
          if (itemModel.type === 'group' && itemModel.level === currentModelLevel) {
            grid.expandGroup(itemIndex, false, false);
          }
          itemIndex = itemIndex + 1;
        }
        break;

      case 'SET_CATEGORY':
        setGridChart(gridView, 'SET_CATEGORY', index, activeId);
        break;

      case 'ADD_SERIES':
        setGridChart(gridView, 'ADD_SERIES', index, activeId);
        break;

      case 'CLEAR_CHART':
        setGridChart(gridView, 'CLEAR_CHART');
        break;

      case 'SET_CHART':
        setGridChart(gridView, 'SET_CHART', index, activeId);
        break;

      default:
        let rGridView = com.get(activeId).getComponent(componentId);
        let component = rGridView;

        let successFunc = function (a, b, data) {
          component.doToolbarSuccessOperation(componentId, operation, data)
        };

        let failFunc = function (a, b, data) {
          component.doToolbarFailOperation(componentId, operation, data)
        };

        let completeFunc = function (a, b, data) {
          component.doToolbarCompleteOperation(componentId, operation, data)
        };

        component.doOperation(componentId, operation, {}, successFunc, failFunc, completeFunc);
    }
  }
}

function gridOnKeyDown(grid, key, ctrl, shift, alt) {
  let componentId = grid.orgId;
  com.get(com.active).getComponent(componentId).onRGridOnKeyDown(vom.active, componentId, grid, key, ctrl, shift, alt);

  if (key === 13) {
    grid.commitEditor(true);
  }

  checkCtrl = ctrl;

  if (checkCtrl) {
    if (key === 65) { // Ctrl + A
      grid.setSelection({ style: 'rows', startItem: 0, endItem: grid.getItemCount() });
    }
  }
}

function gridOnKeyUp(grid, key, ctrl, shift, alt) {
  let componentId = grid.orgId;
  com.get(com.active).getComponent(componentId).onRGridOnKeyUp(vom.active, componentId, grid, key, ctrl, shift, alt);

  checkCtrl = ctrl;
}

function gridOnDataCellClicked(grid, index) {
  let componentId = grid.orgId;
  com.get(com.active).getComponent(componentId).onRGridCellClicked(vom.active, componentId, grid, index);
}

function gridOnDataCellDblClicked(grid, index) {
  let componentId = grid.orgId;
  com.get(com.active).getComponent(componentId).onRGridCellDoubleClicked(vom.active, componentId, grid, index);
}

function gridOnCellButtonClicked(grid, itemIndex, column) {
  let componentId = grid.orgId;
  com.get(com.active).getComponent(componentId).onRGridCellButtonClicked(vom.active, componentId, grid, itemIndex, column);
}
function getDateFromString(dateString) {
  if (dateString) {
    let temp = dateString.replaceAll(/\D/gi, '');
    if (temp.length > 6) {
      dateString = new Date(temp.substr(0, 4) + '-' + temp.substr(4, 2) + '-' + temp.substr(6, 2));
    } else {
      dateString = new Date(temp.substr(0, 4) + '-' + temp.substr(4, 2));
    }
  }
  return dateString;
}

function getDTF(gridView) {
  let versionInfo = getVersionInfo(gridView);
  if (versionInfo) {
    let dateTimeFence = versionInfo['DTF_DATE'];
    return dateTimeFence;
  }
}

function getStartDate(gridView) {
  let versionInfo = getVersionInfo(gridView);
  if (versionInfo) {
    let dateTimeFence = versionInfo['FROM_DATE'];
    return dateTimeFence;
  }
}

const getVersionInfo = (gridView) => {
  if (gridView.gridWrap.versionData)
    return gridView.gridWrap.versionData[0];
}

function getDTFdateFormat(gridView) {
  let dtf = getDTF(gridView);
  if (dtf) {
    let date = getDateFromString(dtf);
    if (dtf == getStartDate(gridView) && getVersionInfo(gridView).BUKT !== 'D') {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }
  return;
}

function preventColumnSort(gridView) {
  let dateFieldNames = gridView.getColumnNames(true, true).filter(function (columnName) {
    return columnName.includes("DATE_") && columnName.includes("VALUE");
  });
  //console.log("===>dateFieldNames:",dateFieldNames)
  for (let j in dateFieldNames) {
    let colName = dateFieldNames[j];
    let proxy = gridView.columnByName(colName);
    if (proxy) {
      proxy.sortable = false;
      gridView.setColumn(proxy);
    }
  }
  let proxy = gridView.columnByName("CATEGORY");
  if (proxy) {
    proxy.sortable = false;
    gridView.setColumn(proxy);
  }
}

function setDTFUneditableStyle(gridView) {
  let dataProvider = gridView.getDataSource();
  gridView.beginUpdate();
  try {
    let dateColumnNames = gridView.dataColumns.filter(function (dataColumn) {
      return dataColumn.columnIdOrg == 'DATE';
    }).map(function (dataColumn) {
      return dataColumn.name;
    });
    let unEditableStyle1_Rows = [];//default
    for (let i = 0; i < dataProvider.getRowCount(); i++) {
      unEditableStyle1_Rows.push(i);
    }

    let dtfDate = getDTFdateFormat(gridView);
    if (unEditableStyle1_Rows.length) {
      let unEditableStyle1_Fields = dateColumnNames.filter(function (columnName) {
        return getDateFromString(columnName.replace("DATE_", "").substring(0, 10)) <= dtfDate
      });

      gridView.unSetCellStyles(gridView, unEditableStyle1_Rows, unEditableStyle1_Fields, STYLE_ID_EDIT_MEASURE);
      gridView.setCellStyles(gridView, unEditableStyle1_Rows, unEditableStyle1_Fields, 'uneditable'); //cellStyle in wingui-custom.js
    }
  } finally {
    gridView.endUpdate();
  }
}

function setNullValueCellStyle(gridView) {
  let dataProvider = gridView.getDataSource();
  gridView.beginUpdate();
  try {
    let editMeasures = [];
    if (gridView.prefInfo) {
      editMeasures = gridView.prefInfo.filter(function (columnInfo) {
        return columnInfo.gridCd == gridView.orgId && columnInfo.crosstabItemCd == "GROUP-VERTICAL-VALUES" && columnInfo.editMeasureYn;
      }).map(function (columnInfo) { return columnInfo.fldApplyCd });
    }

    let data = dataProvider.getJsonRows();
    //console.log("#######@@@data", data);
    let validationData = data.map(function (rw) {
      let keys = Object.keys(rw).filter(function (key) {
        return key.includes(",VALUE") && editMeasures.includes(rw["CATEGORY"])
      }).filter(function (key) {
        return rw[key] == null
      });
      //console.log("keys", keys);
      return keys;
    });
    let rowsIndex = Object.keys(validationData).filter(function (key) {
      return validationData[key].length
    });
    rowsIndex.map(function (Index) {
      if (validationData[Index].length !== 0)
        gridView.setCellStyles(gridView, Index, validationData[Index], 'uneditable');
      return;
    });
  } finally {
    gridView.endUpdate();
  }
}

const onRGridCellEdited = (gridView, itemIndex, dataRow, field) => {
  setDTFUneditableStyle(gridView);
  setNullValueCellStyle(gridView);
  gridView.gridWrap.setChangedValue(dataRow, field);
  gridView.gridWrap.setDefaultValue(dataRow, field);
};

function gridOnCellEdited(grid, itemIndex, dataRow, field) {

  grid.commit();

  let componentId = grid.orgId;
  let dataProvider = grid.getDataSource();


  /**
   * process for cell attrs. immediately
   */
  //applyCellAttributes(grid, null, null, null, null);

  /**
   * execute extend function prototype
   
  window.requestAnimationFrame(function () {
    onRGridCellEdited(grid, itemIndex, dataRow, field);
  });
  */
}

function gridOnCurrentChanged(grid, newIndex, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let componentId = grid.orgId;

  com.get(activeId).getComponent(componentId).onRGridCurrentChanged(activeId, componentId, grid, newIndex);
}

function gridOnCurrentChanging(grid, oldIndex, newIndex, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let componentId = grid.orgId;

  com.get(activeId).getComponent(componentId).onRGridCurrentChanging(activeId, componentId, grid, oldIndex, newIndex);

  let dataProvider = grid.getDataSource();
  let statRows = dataProvider.getAllStateRows();
  let statRowIndexes = [];
  statRowIndexes = statRowIndexes.concat(statRows.created, statRows.updated, statRows.deleted, statRows.createAndDeleted);

  let cellAttributesProps = grid.cellAttributesProps;
  let caFlag = false;
  if (cellAttributesProps && !isEmpty(cellAttributesProps)) {
    let keys = Object.keys(cellAttributesProps);

    for (let keyIdx = 0, keysLength = keys.length; keyIdx < keysLength; keyIdx++) {
      let cellAttributesProp = cellAttributesProps[keys[keyIdx]];

      if (cellAttributesProp.tgtFieldNames.includes(newIndex.fieldName)) {
        caFlag = true;
        break;
      }
    }
  }

  let dataColumnsDB = TAFFY(grid.dataColumns);
  let newIndexRenderer = grid.getColumnProperty(newIndex.column, 'renderer');

  if (newIndexRenderer && newIndexRenderer.type === 'check') {
    if (statRows.created.includes(newIndex.dataRow)) {
      newIndexRenderer.editable = true;
    } else {
      let columnIdOrg = dataColumnsDB().filter({ name: newIndex.column }).get()[0].columnIdOrg;
      newIndexRenderer.editable = getColumnProp(gridView, columnIdOrg, 'editable');
    }

    grid.setColumnProperty(grid.columnByName(newIndex.column), 'renderer', newIndexRenderer);
    grid.setColumnProperty(grid.columnByName(newIndex.column), 'editable', false);
  }

  if (statRowIndexes.length > 0 || caFlag) {
    if (cellAttributesProps !== undefined && !isEmpty(cellAttributesProps)) {
      let keys = Object.keys(cellAttributesProps);

      for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
        let cellAttributesProp = cellAttributesProps[keys[keyIdx]];
        let tgtFieldNames = cellAttributesProp.tgtFieldNames;

        let labelFieldIdx = [];
        for (let i = 0, tgtFieldNamesLen = tgtFieldNames.length; i < tgtFieldNamesLen; i++) {
          if (tgtFieldNames[i].endsWith(LABEL_FIELD)) {
            labelFieldIdx.push(i);
          }
        }

        labelFieldIdx = labelFieldIdx.reverse();
        for (let i = 0; i < labelFieldIdx.length; i++) {
          tgtFieldNames.splice(labelFieldIdx[i], 1);
        }

        for (let i = 0, tgtFieldNamesLen = tgtFieldNames.length; i < tgtFieldNamesLen; i++) {
          let currntFieldName = tgtFieldNames[i];
          if (currntFieldName) {
            currntFieldName = currntFieldName.toUpperCase();
          }

          if (!cellAttributesProp.allFieldNames.includes(currntFieldName)) {
            return;
          }

          if (currntFieldName) {
            let column = grid.columnByField(currntFieldName);
            if (!column) {
              continue;
            }
            let columnName = column.name;
            let renderer = grid.getColumnProperty(columnName, 'renderer');

            let attr = cellAttributesProp.cellAttrApplyTgtAttrs;
            if (renderer !== undefined && renderer.type === 'check') {
              if (cellAttributesProp.tgtRowIndexes.includes(newIndex.dataRow)) {
                renderer.editable = attr.editable;
              } else {
                renderer.editable = !attr.editable;
              }
              grid.setColumnProperty(grid.columnByName(columnName), 'renderer', renderer);
              grid.setColumnProperty(grid.columnByName(columnName), 'editable', false);

              let attributes = clone(attr);

              attributes.editable = false;
              grid.addCellStyle(grid, cellAttributesProp.cellAttrApplyID + '_B', attributes, true);
              grid.setCellStyles(grid, cellAttributesProp.tgtRowIndexes, [columnName], cellAttributesProp.cellAttrApplyID + '_B');
            }

            if (attr.hasOwnProperty('editor') && newIndex.fieldName === currntFieldName) {
              let dataColumnDB = TAFFY(grid.dataColumns);
              let dataColumn = dataColumnDB().filter({ fieldName: newIndex.fieldName }).get()[0];

              let editor = {};
              if (attr.editor === 'number') {
                editor.type = 'number';
                editor.editFormat = '#,###.###';
              }

              if (cellAttributesProp.tgtRowIndexes.includes(newIndex.itemIndex)) {
                grid.setColumnProperty(grid.columnByName(newIndex.column), 'editor', editor);
              } else {
                grid.setColumnProperty(grid.columnByName(newIndex.column), 'editor', dataColumn.editor);
              }
            }
          }
        }
      }
    }
  }
}

function gridOnColumnHeaderClicked(grid, column, rightClicked, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let componentId = grid.orgId;

  com.get(activeId).getComponent(componentId).onRGridColumnHeaderClicked(activeId, componentId, grid, column, rightClicked);
}

function gridOnFilteringChanged(grid, column) {
  if (grid.bindingStatus === 'RDY' && column) {
    let dataColumnNames = TAFFY(grid.dataColumns)().select('name');
    let targetColumnNames = [];

    for (let i = 0, dColumnslen = dataColumnNames.length; i < dColumnslen; i++) {
      let dataColumnName = dataColumnNames[i];

      if (dataColumnName !== column.name) {
        let dataColumnFilters = grid.getColumnFilters(dataColumnName);
        if (dataColumnFilters.length > 0) {
          targetColumnNames.push(dataColumnName);
        }
      }

      if (!grid.isFiltered(column.name)) {
        targetColumnNames.push(column.name);
      }
    }

    for (let i = 0, tColumnsLen = targetColumnNames.length; i < tColumnsLen; i++) {
      let targetColumnName = targetColumnNames[i];
      let targetColumnFilters = grid.getColumnFilters(targetColumnName);
      let hideFilters = [];
      let visibleFilters = [];
      let targetColumnFiltersOrg = [];

      for (let j = 0, filtersLen = targetColumnFilters.length; j < filtersLen; j++) {
        let filter = targetColumnFilters[j];
        targetColumnFiltersOrg.push(filter.name);
      }

      grid.beginUpdate();
      try {
        let itemCount = grid.getItemCount();
        for (let k = 0; k < itemCount; k++) {
          if (grid.getDataRow(k) !== -1) {
            let value = grid.getValue(k, targetColumnName);
            if (!visibleFilters.includes(value)) {
              visibleFilters.push(value);
            }
          }
        }

        hideFilters = targetColumnFiltersOrg.filter(x => visibleFilters.indexOf(x) < 0);
        grid.hideColumnFilters(targetColumnName, hideFilters, true);
        grid.hideColumnFilters(targetColumnName, visibleFilters, false);
      } finally {
        grid.endUpdate();
      }
    }
  }
}

function gridOnEditRowPasted(grid, itemIndex, dataRow, fields, oldValues, newValues, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  grid.commit();

  let componentId = grid.orgId;

  com.get(activeId).getComponent(componentId).onRGridEditRowPasted(activeId, componentId, grid, itemIndex, dataRow, fields, oldValues, newValues);
}

function gridOnRowsPasted(grid, items, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  grid.commit();

  let componentId = grid.orgId;

  com.get(activeId).getComponent(componentId).onRGridRowsPasted(activeId, componentId, grid, items);
}

/*
function gridOnEditCommit(grid, index, oldValue, newValue) {
  let componentId = grid.orgId;

  com.get(com.active).getComponent(componentId).onRGridOnEditCommit(vom.active, componentId, grid, index, oldValue, newValue);
};

function gridOnCurrentRowChanged(grid, oldRow, newRow) {
  let componentId = grid.orgId;

  com.get(com.active).getComponent(componentId).onRGridOnCurrentRowChanged(vom.active, componentId, grid, oldRow, newRow);
};

function gridOnGetEditValue(grid, index, editResult) {
  let componentId = grid.orgId;

  com.get(com.active).getComponent(componentId).onRGridOnGetEditValue(vom.active, componentId, grid, index, editResult);
};
*/

function insertRowActual(gridView, dataProvider, insertRowPosition, editOnCell, setDefaultValues) {
  if (dataProvider.getRowCount() === 0) {
    window.requestAnimationFrame(function () {
      gridView.beginAppendRow();
    });

    window.requestAnimationFrame(function () {
      gridView.resetCurrent();
    });
  } else {
    if (!INSERT_ROW_POSITION.hasOwnProperty(insertRowPosition)) {
      insertRowPosition = INSERT_ROW_POSITION.BELOW;
    }

    if (insertRowPosition === INSERT_ROW_POSITION.ABOVE) {
      let current = gridView.getCurrent();
      gridView.beginInsertRow(Math.max(0, current.itemIndex));
    } else if (insertRowPosition === INSERT_ROW_POSITION.BELOW) {
      let current = gridView.getCurrent();
      if (dataProvider.getRowCount() === current.itemIndex + 1) {
        gridView.beginAppendRow();
      } else {
        gridView.beginInsertRow(Math.max(0, current.itemIndex + 1));
      }
    } else if (insertRowPosition === INSERT_ROW_POSITION.TOP) {
      gridView.beginInsertRow(0);
    } else if (insertRowPosition === INSERT_ROW_POSITION.BOTTOM) {
      gridView.beginAppendRow();
    }
  }

  window.requestAnimationFrame(function () {
    let current = gridView.getCurrent();
    let statRows = dataProvider.getAllStateRows();
    let created = statRows.created;
    let newRow = gridView.getDataRow(current.itemIndex);

    current.column = gridView.getDisplayColumns()[0];
    current.fieldName = dataProvider.fieldByName(current.fieldName).fieldName;
    current.fieldIndex = dataProvider.getFieldIndex(current.fieldName);
    gridView.setCurrent(current);

    if (created.includes(newRow) || newRow === -1) {
      window.requestAnimationFrame(function () {
        if (created.includes(newRow)) {
          if (setDefaultValues) {
            gridView.setValues(current.itemIndex, setDefaultValues);
          }

          let dataColumns = gridView.dataColumns;
          let editableColumns = [];
          let uneditableColumns = [];
          for (let i = 0, len = dataColumns.length; i < len; i++) {
            let dataColumn = dataColumns[i];
            if (dataColumn.newRowEditable) {
              editableColumns.push(dataColumn.fieldName);
            } else {
              uneditableColumns.push(dataColumn.fieldName);
            }
          }

          gridView.setCellStyles(gridView, created, editableColumns, STYLE_ID_EDITABLE);
        }

        if (newRow === -1) {
          if (setDefaultValues) {
            gridView.setValues(current.itemIndex, setDefaultValues);
          }

          let dataColumns = gridView.dataColumns;
          let editableColumns = [];
          let uneditableColumns = [];
          for (let i = 0, len = dataColumns.length; i < len; i++) {
            let dataColumn = dataColumns[i];
            if (dataColumn.newRowEditable) {
              editableColumns.push(dataColumn.fieldName);
            } else {
              uneditableColumns.push(dataColumn.fieldName);
            }
          }

          gridView.setCellStyles(gridView, [newRow], editableColumns, STYLE_ID_EDITABLE);
        }
      });
    }

    if (editOnCell) {
      window.requestAnimationFrame(function () {
        gridView.showEditor();
      });
    }
    gridView.setFocus();

  });
}

function extractRows(gridView, rows, strRowExtractor) {

  let prefInfoDB = TAFFY(gridView.prefInfo);

  if (strRowExtractor === undefined || strRowExtractor.length <= 0) {
    return rows;
  }

  let filters = [];
  let arrRowExtractor = strRowExtractor.split(',');
  for (let extractorIdx = 0; extractorIdx < arrRowExtractor.length; extractorIdx++) {
    let rowExtractor = arrRowExtractor[extractorIdx];
    let rowExtractorSplit = rowExtractor.split(':');
    let criteria = rowExtractorSplit[0].trim();
    let criteriaValue = rowExtractorSplit[1].trim();

    if (criteria === 'EDIT_MEASURE') {
      criteriaValue = criteriaValue.toUpperCase();
      if (criteriaValue === 'TRUE') {
        criteriaValue = true;
      } else if (criteriaValue === 'FALSE') {
        criteriaValue = false;
      } else {
        console.warn('Value is not correct! Only \'true\' or \'false\' can use for \'EDIT_MEASURE\'');
        return rows;
      }

      let measureFieldsNm = TAFFY(prefInfoDB().filter({ editMeasureYn: criteriaValue }).get())().select('fldApplyCd');

      for (let nmValIdx = 0; nmValIdx < measureFieldsNm.length; nmValIdx++) {
        let filter = {};
        filter['CATEGORY'] = measureFieldsNm[nmValIdx];
        filters.push(filter);
      }
    } else {
      let filter = {};

      if (criteria === 'CATEGORY') {
        let measureField = prefInfoDB().filter({ fldCd: criteriaValue }).get(0)[0];
        criteriaValue = measureField['fldApplyCd'];
      }

      if (!isNaN(criteriaValue * 1)) {
        criteriaValue = criteriaValue * 1;
      }

      filter[criteria] = criteriaValue;
      filters.push(filter)
    }
  }

  let rowsDB = TAFFY(rows);
  let extractedRows = rowsDB().filter(filters).get();
  extractedRows = refineTaffyResult(extractedRows);

  return extractedRows;
}

function setCellCommnetButton(gridView, measureName) {
  let dtfDate = getDTFdateFormat(gridView);
  let dateColNames = gridView.getColumnNames(true, true).filter(function (column) {
    return column.includes("DATE_");
  }).filter(function (fieldName) {
    return getDateFromString(fieldName.replace("DATE_", "").substring(0, 10)) > dtfDate;
  });

  const onCellButtonClicked = function (grid, itemIndex, column) {
    let dataProvider = grid.getDataSource();
    let dataRow = grid.getDataRow(itemIndex);
    let colName = column.fieldName;

    let row = dataProvider.getJsonRow(dataRow)

    let comCol = colName.replace("VALUE", "COMMENT")
    let cmt = row[comCol];
    let dateStr = colName.replace(",VALUE", "");
    dateStr = dateStr.replace("DATE_", "");

    let commentData = { ROW_IDX: dataRow, COL_IDX: dataProvider.getFieldIndex(colName), CM_COL_NAME: comCol, DATE_STR: dateStr, CMT: cmt, VAL_COL_NAME: colName }
    if (gridView.gridWrap.showPopComment)
      gridView.gridWrap.showPopComment(commentData)
  };

  const render_span = {
    flex: 1,
    textAlign: 'right',
    overflow: 'hidden'
  }
  const cmtBtn = {
    "min-height": '16px',
    "min-width": '16px',
    "margin-left": '2px',
    "border": '1px solid #efefef',
    background: 'url(\"' + baseURI() + "images/icons/document.png" + '\") center center no-repeat',
    display: 'none'
  }
  const marker = {
    width: 0,
    height: 0,
    'border-left': '3px solid #0d3773',
    'border-top': '3px solid #0d3773',
    'border-bottom': '3px solid #0d3773',
    'border-right': '3px solid #0d3773',
    position: 'absolute', top: '0px', left: '0px', display: 'block',
    visibility: 'hidden'
  }

  const render_span_class = gridView.dynamicCSSSelector(render_span);
  const cmtBtn_class = gridView.dynamicCSSSelector(cmtBtn)
  const marker_class = gridView.dynamicCSSSelector(marker);

  gridView.registerCustomRenderer('imgbtn_render', {
    initContent: function (parent) {
      let span = this._span = document.createElement("span");
      span.className = render_span
      parent.appendChild(span);

      let cmt_marker = this._cmt_marker = document.createElement("div");
      cmt_marker.className = marker_class
      this._rightOffset = parent.offsetWidth - 2;
      parent.appendChild(cmt_marker);

      parent.appendChild(this._button1 = document.createElement("button"));
      this._button1.className = cmtBtn_class;

      const btn = this._button1;
      $(parent).mouseover(() => { $(btn).css("display", 'inline'); })
      $(parent).mouseout(() => { $(btn).css("display", 'none'); })
    },
    canClick: function () {
      return true;
    },
    clearContent: function (parent) {
      parent.innerHTML = "";
    },
    render: function (grid, model, width, height, info) {
      info = info || {};
      let span = this._span;
      span.textContent = model.value;
      this._value = model.value;

      try {
        let colName = model.dataColumn.name;
        colName = colName.replace('VALUE', 'COMMENT')

        const dataProvider = grid.getDataSource();
        let cmt = dataProvider.getValue(model.index.dataRow, colName)
        if (cmt) {
          this._cmt_marker.style.visibility = 'visible'
          this._cmt_marker.style.left = (this._cmt_marker.parentElement.offsetWidth - 6) + 'px'
        }
        else {
          this._cmt_marker.style.visibility = 'hidden'
        }
      }
      catch (e) {
      }
    },
    click: function (event) {
      let grid = this.grid.handler;
      let index = this.index.toProxy();
      let column = this.index.column;

      event.preventDefault;
      if (event.target == this._button1) {
        onCellButtonClicked(grid, index.itemIndex, column)
      }
    }
  });

  for (let i in dateColNames) {
    let dateColumn = dateColNames[i];

    gridView.setColumnProperty(dateColumn, "styleCallback", function (grid, dataCell) {
      let ret = {}
      let val = grid.getValue(dataCell.index.itemIndex, "CATEGORY")
      if (val == measureName) {
        ret.renderer = "imgbtn_render"
      }
      return ret;
    }
    )
  }

}

function checkVersionBucket(gridView) {
  let viewBuck = gridView.gridWrap.BUCKET; //getValues('BUCKET');
  let versionData = gridView.gridWrap.versionData
  if (viewBuck && viewBuck == "PB") {
    let versionInfo = versionData ? versionData[0] : null;
    if (versionInfo != null) {
      return versionInfo['BUKT'];
    } else {
      return 'PW';
    }
  } else {
    return viewBuck;
  }
}

/**
 * 
 * @param {*} gridView 
 * @param {*} versionInfo 
 * @param {*} viewBuck 
 * @param {*} planType 
 * @param {*} resultData 
 * @returns 
 */
const grid_onRGridDataFillReady = (gridView, versionInfo, viewBuck, planType, resultData) => {
  let totalSummaryInfos = [
    {
      columnName: 'TOTAL_SUM',
      summaryType: 'sum'
    }
  ];

  let varDate1 = null;
  let varDate2 = null;
  let varBuck1 = null;
  let varBuck2 = null;
  let buck = null;
  let endDate = null;

  /* get start month, and apply grid calendar
  * 0 : SUN
  * 1 : MON
  * */
  let stdWeek = versionInfo["STD_WEEK"];
  let dayOfWeek = 0;
  switch (stdWeek) {
    case "Mon": dayOfWeek = 1; break;
    case "Sun": dayOfWeek = 0; break;
  }
  wingui3.util.date.calendar.setFirstDayOfWeek(dayOfWeek);

  if (viewBuck && viewBuck == 'PB') {
    varDate1 = versionInfo['VAR_DATE']
    if (varDate1 && typeof (varDate1) == 'string') {
      varDate1 = varDate1.substr(0, 10)
      varDate1 = wingui3.util.date.toDate(varDate1, "-");
    }
    varDate2 = versionInfo['VAR_DATE2']
    if (varDate2 && typeof (varDate2) == 'string') {
      varDate2 = varDate2.substr(0, 10)
      varDate2 = wingui3.util.date.toDate(varDate2, "-");
    }
    varBuck1 = versionInfo['VAR_BUKT']
    varBuck2 = versionInfo['VAR_BUKT2']
  }
  endDate = versionInfo['TO_DATE']
  if (endDate && typeof (endDate) == 'string') {
    endDate = endDate.substr(0, 10)
    endDate = wingui3.util.date.toDate(endDate, "-");
  }

  buck = versionInfo['BUKT']
  const gridWrap = gridView.gridWrap

  if (planType == "Y") {
    let regexp = /\d{4}.\d{2}.\d{2}/;
    if (viewBuck) {
      gridWrap.initEntry(regexp, viewBuck, varBuck1, varDate1, varBuck2, varDate2, buck, endDate);
    } else {
      gridWrap.init(regexp);
    }
  } else {
    let regexp = /\d{4}.\d{2}.\d{2}/;
    if (viewBuck) {
      gridWrap.initEntry(regexp, viewBuck, varBuck1, varDate1, varBuck2, varDate2, buck, endDate);
    } else {
      gridWrap.init(regexp);
    }
  }

  gridWrap.addSummaryColumns(null, totalSummaryInfos);
  return resultData;
};

/*
그리드에 값 설정
*/
const grid_doBeforeSetData = (gridView, dataProvider, resultData) => {

  wingui3.util.grid.filter.saveFilters(gridView, ['CATEGORY']);
};

/**
* prefInfo 정보로 원하는 형태로 그리드 칼럼을 동적구성하고 resultData 를 그리드에 디스플레이 한다.
* 
* @param {RealGrid React 객체} grid1 
* @param {RealGrid gridView} gridView 
* @param {RealGrid dataProvider} dataProvider 
* @param {JSON 형태의 데이타} resultData 
* @returns 
*/
const setGridValue = (grid1, gridView, dataProvider, resultData) => {

  grid_doBeforeSetData(gridView, dataProvider, resultData)

  if (!resultData || resultData.length <= 0) {
    initData(gridView, dataProvider);
    return;
  }

  gridView.bindingStatus = 'INIT';

  let prefInfoDB;
  if (gridView.prefInfo) {
    prefInfoDB = TAFFY(gridView.prefInfo);
  }

  gridView.dataColumns = [];

  dataProvider.clearRows();
  dataProvider.clearSavePoints();
  //gridView.setAllCheck(false);

  let fixedOptions = gridView.getFixedOptions();
  fixedOptions.rowCount = 0;
  gridView.setFixedOptions(fixedOptions);

  let columns = [];
  let arrArrangedColumns = getArrangedColumns(gridView);

  let dataFieldNames = Object.keys(resultData[0]);
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
        //let dataColumnInfo = gridView.gridItems.find(v=> v.name === columnId)
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

  grid1.addGridItems(columns, true)
  console.log('columns', columns)

  setNumberComparer(dataProvider, gridView.dataColumns);

  let versionInfo = getVersionInfo(gridView);
  let viewBuck = gridView.gridWrap.BUCKET;
  let planType = gridView.gridWrap.PLAN_TP;
  let targetResultData = grid_onRGridDataFillReady(gridView, versionInfo, viewBuck, planType, resultData);

  if (!targetResultData) {
    targetResultData = resultData;
  }

  window.requestAnimationFrame(function () {
    dataProvider.fillJsonData(targetResultData);
  });

  if (isFixed) {
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
        break;
      }
    }

    if (columnFixIndex > 0) {
      let fixedOptions = {};
      gridView.fixedColCount = columnFixIndex;
      fixedOptions.colCount = columnFixIndex;
      fixedOptions.resizable = true;

      gridView.setFixedOptions(fixedOptions);
    }
  }

  setGridSortOrder(gridView, dataFieldNames);
  setInitGroupOrder(gridView);

  gridView.styleExceptCells = [];

  //applyCellAttributes(gridView);

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

  gridView.hideToast();

  window.requestAnimationFrame(function () {
    gridView.activatedColumnFilters = {};
    //setGridFilters(gridView,  dataProvider, staticColumnsMap);
  });

  window.requestAnimationFrame(function () {
    fitGridData(gridView);
  });

  grid_doAfterSetData(gridView, dataProvider, resultData)
}


const grid_doAfterSetData = (gridView, dataProvider, resultData) => {
  if (!resultData || resultData.length == 0) {
    return;
  }

  gridView.setPasteOptions({ checkReadOnly: true });

  gridView.addCellStyle(gridView, "validationStyle", { "background": "#ffFFC7CE", "foreground": "#ff9C0006" });
  let editMeasures = []
  if (gridView.prefInfo) {
    editMeasures = gridView.prefInfo.filter(function (columnInfo) {
      return columnInfo.gridCd == "RST_CPT_01" && columnInfo.crosstabItemCd == "GROUP-VERTICAL-VALUES" && columnInfo.editMeasureYn;
    }).map(function (columnInfo) { return columnInfo.fldApplyCd });
  }
  setnullValueToZero(gridView, resultData, editMeasures);

  let measureNames = getRowTotalMeasures(gridView);
  if (measureNames && measureNames.length > 0) {
    let groupMeasureName = measureNames[0];
    gridView.gridWrap.addSummaryFooter('CATEGORY', groupMeasureName, measureNames);
  }
  let authType = gridView.gridWrap.AUTH_TP_ID;//getValues("AUTH_TP_ID");
  let selfEditMeasure = measureNames.filter(function (row) {
    return row == authType + "_QTY";
  });


  window.requestAnimationFrame(function () {
    applyEditMeasureStyle(gridView);
    let dataProvider = gridView.getDataSource();
    let isComment = gridView.prefInfo.filter(function (row) {
      return row.fldCd == "COMMENT"
    }).map(function (row) {
      return row.editTargetYn
    });

    if (isComment !== undefined && isComment[0] == true && selfEditMeasure.length > 0) {
      setCommentStyle(gridView);
    }
    setNullValueCellStyle(gridView);
    setDTFUneditableStyle(gridView);

    gridView.setCellStyleCallback((grid, dataCell) => {
      let ret = {};
      let rowIdx = dataCell.index.dataRow;
      let colName = dataCell.dataColumn.name;

      if (grid.customStyles) {
        const customStyles = grid.customStyles;
        const styleItems = grid.styleItems;

        let thisStyleInfo = customStyles.filter(v => v.rowIdx == rowIdx && v.colName == colName);

        if (thisStyleInfo.length > 0) {
          const accStyle = thisStyleInfo[0].accStyle

          for (let styleName of accStyle) {
            if (!styleName)
              continue;

            let prcd = false;
            if (styleItems) {
              const styleItem = styleItems.filter(v => v.styleName == styleName)
              if (styleItem.length > 0) {
                let style = styleItem[0].style;
                ret = { ...ret, ...style };

                if (grid.specificStyle && grid.specificStyle[styleName] !== undefined) {
                  if (ret.styleName) {
                    ret.styleName += (" " + grid.specificStyle[styleName])
                  }
                  else {
                    ret.styleName = grid.specificStyle[styleName]
                  }
                  prcd = true;
                }
              }
            }

            if (prcd == false) {
              if (ret.styleName) {
                ret.styleName += (" " + styleName)
              }
              else {
                ret.styleName = styleName
              }
            }
          }
          return ret;
        }
      }
    }
    )

    gridView.onCellEdited = function (grid, itemIndex, dataRow, field) {
      gridOnCellEdited(grid, itemIndex, dataRow, field);
    };

    gridView.onEditRowPasted = function (grid, itemIndex, dataRow, fields, oldValues, newValues) {
      for (let i = 0, n = fields.length; i < n; i++) {
        gridView.gridWrap.setChangedValue(itemIndex, fields[i]);
      }
    };
    gridView.onRowsPasted = function (grid, items) {
      let dateFieldIndexes = gridView.dataColumns.filter(function (dataColumn) {
        return dataColumn.columnIdOrg == 'DATE' && dataColumn.visible == true;
      }).map(function (dataColumn) {
        return dataProvider.getFieldIndex(dataColumn.name);
      });
      for (let i = 0, n = items.length; i < n; i++) {
        for (let j = 0, m = dateFieldIndexes.length; j < m; j++) {
          gridView.gridWrap.setChangedValue(items[i], dateFieldIndexes[j]);
        }
      }
    };
    setBaselineStyle(gridView);
    setMergeCell(gridView);

    gridView.gridWrap.setPasteOptions({ noDataEvent: true, noEditEvent: true });

    gridView.gridWrap.setBucketHeaderText((checkVersionBucket(gridView) == "W"));
  });

  wingui3.util.grid.filter.loadFilters(gridView, ['CATEGORY']);
  wingui3.util.grid.sorter.orderBy(gridView, gridView.dataColumns.filter(function (dataColumn) {
    return dataColumn.fieldName.startsWith('DIMENSION');
  }).map(function (dataColumn) {
    return dataColumn.fieldName;
  }));

  let isComment = gridView.prefInfo.filter(function (row) {
    return row.fldCd == "COMMENT"
  }).map(function (row) {
    return row.editTargetYn
  });

  if (isComment !== undefined && isComment[0] == true && selfEditMeasure.length > 0) {
    setCellCommnetButton(gridView, selfEditMeasure);
  }
  preventColumnSort(gridView)
};

const setnullValueToZero = (gridView, data, measures) => {
  if (!data || !measures)
    return;

  let validationData = data.map(function (rw) {
    let keys = Object.keys(rw).filter(function (key) {
      return key.includes(",VALUE") && measures.includes(rw["CATEGORY"])
    }).filter(function (key) {
      return rw[key] < 0 || rw[key] === ''
    });
    return keys;
  });

  for (let rowIdx in validationData) {
    let columns = validationData[rowIdx];
    for (let idx = 0; idx < columns.length; idx++) {
      gridView.setValue(rowIdx, columns[idx], 0);
    }
  }
}

const getServiceCall = async (svcCallId, param) => {
  const response = await axios.post(`engine/T3SeriesDataServer/${svcCallId}`, {
    header: { 'content-type': 'application/json' },
    data: param
  })

  if (response && response.data)
    return response.data.RESULT_DATA
}

function getRowTotalMeasures(gridView) {
  /***********************************************************************
    -- UI_DP_9* : SP_UI_DP_95_MES
    -- UI_DP_2* : SP_UI_DP_00_PERSONALIZATION_Q1
    -- necessary columns : LEVEL_CD, MEASURE_CD or FIELD_NM
  **********************************************************************/
  // 1. get service call ID by View ID
  let svcCallId = "SVC_SP_UI_DP_95_MES";
  let extrctCode = "MEASURE_CD";
  let isDpEngineView = false;
  if (isDpEngineView) {
    svcCallId = "SVC_SP_UI_DP_00_PERSONALIZATION_Q1_INIT";
    extrctCode = "FIELD_NM"
  }
  // 2. get measure value of DATA_01 Component (activated levels)
  let MData = []
  let MES_INFO = gridView.gridWrap.MES_INFO;// measureData.RESULT_DATA
  if (MES_INFO)
    MES_INFO.map(v => MData.push(v))

  let activatedLevelMeasures = MData.filter(function (row) {
    let measureCode = row[extrctCode];
    if (measureCode == null) {
      return false;
    } else if (row.LEVEL_CD == null) {
      return false;
    } else if (row.ACTV_YN == false) {
      return false;
    }
    return measureCode.slice(-3) == "QTY" && (!measureCode.includes("PR"));
  });

  // 3. get qty of authority type
  let authType = gridView.gridWrap.AUTH_TP_ID;//getValues("AUTH_TP_ID");	
  // 4. if qty of same level is none, set footer by activated level measures (refer 2.)	
  let sameValue = activatedLevelMeasures.filter(function (row) {
    return row.LEVEL_CD == authType;
  }).map(function (row) {
    return row[extrctCode];
  });
  let otherValues = activatedLevelMeasures.map(function (row) {
    return row[extrctCode];
  });
  return sameValue.length > 0 ? sameValue : otherValues;
}

function setCommentStyle(gridView) {
  let dataProvider = gridView.getDataSource();

  gridView.addCellStyle(gridView, "cmtEDITStyle", {
    'editable': true,
    'background': '#ffffffd2',
    'figureName': 'leftTop',
    'figureBackground': '#FF0000FF',
    'figureSize': '7'
  });

  gridView.beginUpdate();
  try {

    let cmtColumnNames = gridView.dataColumns.filter(function (dataColumn) {
      return dataColumn.columnIdOrg == 'COMMENT';
    }).map(function (dataColumn) {
      return dataColumn.name;
    });

    if (cmtColumnNames.length < 1) {
      return;
    }

    let gridPsnzInfoDB = TAFFY(gridView.prefInfo);
    let editMeasuresDB = TAFFY(gridPsnzInfoDB().filter({ gridCd: gridView.gridCd, editMeasureYn: true }).get());
    let editMeasures = editMeasuresDB().select('fldApplyCd');
    let targetMeasure;
    for (let i = 0; i < editMeasures.length; i++) {
      targetMeasure = editMeasures[i];
      if (targetMeasure.endsWith("_QTY")) {
        break;
      }
    }

    let dataProvider = gridView.getDataSource();
    let rowCount = dataProvider.getRowCount();
    let rowSearchOptions = { fields: ['CATEGORY'] };
    let measureCount = dataProvider.getDistinctValues("CATEGORY", rowCount).length;

    for (let i = 0; i < rowCount; i = i + measureCount) {

      rowSearchOptions.startIndex = i;
      rowSearchOptions.values = [targetMeasure];
      let targetMeasureIndex = dataProvider.searchDataRow(rowSearchOptions);
      let sourceMeasureData;

      if (targetMeasureIndex >= 0) {
        sourceMeasureData = dataProvider.getJsonRow(targetMeasureIndex);

        for (let j = 0; j < cmtColumnNames.length; j++) {
          let colName = cmtColumnNames[j];
          let cmt = sourceMeasureData[colName]
          if (cmt != null && cmt != "") {
            let targetColName = colName.replace("COMMENT", "VALUE")
            gridView.setCellStyle(gridView, targetMeasureIndex, targetColName, 'cmtEDITStyle');

          }
        }
      }
    }
  } finally {
    gridView.endUpdate();
  }
}



const grid_onRGridColumnHeaderClicked = (gridView, column, rightClicked) => {
  if (column.name.includes("DATE_") || column.name.includes("CATEGORY")) {
    console.log("sort ignore");
    return;
  }
  wingui3.util.grid.sorter.orderBy(gridView, []);
};


function changeByBucketType(gridView, paramMap) {
  let versionInfo = gridView.gridWrap.versionData[0];
  let bucketType = gridView.gridWrap.BUCKET;
  if (bucketType !== "PB" && bucketType !== versionInfo["BUKT"]) {
    paramMap["VAR_DATE"] = versionInfo["DTF_DATE"];
  }
  return paramMap
}

function getOnlyUpdatedRows(gridView) {
  let dataProvider = gridView.getDataSource();

  let changeRowData = [];
  let changes = [];

  changes = changes.concat(
    dataProvider.getAllStateRows().created,
    dataProvider.getAllStateRows().updated,
    dataProvider.getAllStateRows().deleted,
    dataProvider.getAllStateRows().createAndDeleted
  );
  if (changes.length === 0)
    return changes

  changes.forEach(function (row) {
    let rowObj = dataProvider.getJsonRow(row);
    rowObj['ROW_STATUS'] = dataProvider.getRowState(row).toUpperCase();
    rowObj['__rowId'] = row;
    changeRowData.push(rowObj);
  });

  //2. get only updatedCell of grid
  //수정된 dataRow
  let updatedRows = dataProvider.getStateRows("updated");
  //수정된 셀 정보
  const updatedRowCells = dataProvider.getUpdatedCells(updatedRows);

  updatedRowCells.map(function (row) {
    let valueField = row.updatedCells.filter(row => row.fieldName.indexOf('VALUE') >= 0);
    for (let i = 0; i < valueField.length; i++) {
      const cell = valueField[i];
      row.updatedCells.push({ fieldName: cell.fieldName.replace("VALUE", "COMMENT") })
    }
  })

  const isUpdatedCell = (rowId, key) => {
    const row = updatedRowCells.filter(row => row.__rowId == rowId)
    if (row.length > 0) {
      const idx = row[0].updatedCells.findIndex(cellInfo => cellInfo.fieldName == key);
      return idx >= 0
    }
    return false;
  }
  //1. get changes param
  let setMeasureRows = changeRowData;

  //DTF 이전 칼럼 제외한 수정가능한 칼럼만
  let dtfDate = getDTFdateFormat(gridView);
  let dateColNames = gridView.getColumnNames(true, true).filter(function (column) {
    return column.includes("DATE_");
  }).filter(function (fieldName) {
    return getDateFromString(fieldName.replace("DATE_", "").substring(0, 10)) > dtfDate;
  });

  //3. extract updated cells of rows to changes param
  let newParams = new Array();
  for (let i = 0, n = setMeasureRows.length; i < n; i++) {
    let setMeasureRow = new Object();
    let valueExist = false;
    let updatedRow = setMeasureRows[i]
    const rowId = updatedRow.__rowId;

    Object.keys(updatedRow).map(function (key, index) {
      if (!key.includes("DATE") || isUpdatedCell(rowId, key)) {
        if (dateColNames.includes(key)) {
          setMeasureRow[key] = setMeasureRows[i][key];
          valueExist = true
        }
        else {
          if (key !== '__rowId') {
            setMeasureRow[key] = setMeasureRows[i][key];
            valueExist = true
          }
        }
      }
    });

    if (valueExist)
      newParams.push(setMeasureRow);
  }
  return newParams;
}

export {
  setGridValue,
  setDTFUneditableStyle,
  setNullValueCellStyle,
  getDTFdateFormat,
  preventColumnSort,
  getVersionInfo,
  getDateFromString,
  setBaselineStyle,
  setMergeCell,
  setCellCommnetButton,
  propColumnTitle,
  getArrangedColumns,
  hasColumnProp,
  getColumnProp,
  hasColumnProp2,
  getColumnProp2,
  initData,
  arrangeLookups,
  getColumnGroups,
  isIterationColumn,
  isColumnFix,
  isColumnVisible,
  isFixedColumn,
  setGridPreferenceInfo,
  setGridCrosstabInfo,
  setGridContextMenu,
  insertRowActual,
  applyCellAttributes,
  createDataColumn,
  cleanupNoChildGroupColumns,
  columnsSort,
  setGridSortOrder,
  setInitGroupOrder,
  setGridFilters,
  fitGridData,
  extractRows,
  updateParentWidth2,
  updateParentWidth,
  isSatisfiedValue,
  getTargetRowIndex,
  getTargetColumnIndexes,
  getTargetReferValues,
  getSourceRowIndexes,
  getSourceColumnIndexes,
  getSourceValues,
  getCalculatedValues,
  initPaging,
  gridOnKeyUp,
  gridOnDataCellClicked,
  gridOnDataCellDblClicked,
  gridOnCellButtonClicked,
  gridOnCellEdited,
  gridOnKeyDown,
  gridOnCurrentChanged,
  gridOnCurrentChanging,
  gridOnColumnHeaderClicked,
  gridOnFilteringChanged,
  gridOnEditRowPasted,
  gridOnRowsPasted,
  changeLookupDropDown,
  setNumberComparer,
  manualFitGridDataHorizontal,
  getOnlyUpdatedRows,
  setnullValueToZero,
  getRowTotalMeasures,
  applyEditMeasureStyle,
  checkVersionBucket
};
