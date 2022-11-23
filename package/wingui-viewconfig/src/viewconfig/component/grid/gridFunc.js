import {
  isEmpty,
  isEquivalent,
  clone,
  getDateFromDateString
} from '../../util/utils';
import { showDialog } from '../../util/dialog';

import { callGridColumnService, callGridCandidateService } from '../../service/ServiceManager';

let themeSkin = '';
let checkCtrl = false;
let treeExpandedRow = [];

let pagingButtonColors = {
  pagingButtonColor: 'black',
  pagingButtonActiveColor: 'gray',
  pagingButtonDeactiveColor: 'white'
};

let progressSpinner = '<i class="fa fa-spinner fa-spin fa-fw"></i>&nbsp;';

function refineTaffyResult(data) {
  data = clone(data);
  data = data.filter(function (props) {
    delete props.___id;
    delete props.___s;
    return true;
  });

  return data;
}

function doGridResize(viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  window.requestAnimationFrame(function () {
    for (let componentId in com.get(activeId).getComponents()) {
      let component = com.get(activeId).getComponent(componentId);
      if (component.type === 'R_GRID' || component.type === 'R_TREE') {
        let actualComponent = component.getActualComponent();
        if (actualComponent && !isEmpty(actualComponent)) {
          actualComponent.resetSize();
        }
        actualComponent = null;
      }
      component = null;
    }
  });
}

function setNumberComparer(componentId, dataProvider, dataColumns, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  for (let i = 0, len = dataColumns.length; i < len; i++) {
    let dataColumn = dataColumns[i];
    let columnIdOrg = dataColumn.columnIdOrg;
    if (vom.get(activeId).propColumnUseNumberComparer(componentId, columnIdOrg)) {
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

function createField(fieldName, componentId, columnId, gridView, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let field = {};
  let columnDataType = vom.get(activeId).propColumnType(componentId, columnId).toUpperCase();

  if (TEXT_DATA_TYPE.includes(columnDataType)) {
    columnDataType = RealGridJS.DataType.TEXT;
  }

  if (NUMBER_DATA_TYPE.includes(columnDataType)) {
    columnDataType = RealGridJS.DataType.NUMBER;
  }

  if (DATETIME_DATA_TYPE.includes(columnDataType)) {
    field.datetimeFormat = 'iso';
    columnDataType = RealGridJS.DataType.DATETIME;
  }

  if (BOOL_DATA_TYPE.includes(columnDataType)) {
    field.booleanFormat = 'false,N,0,f,off:true,Y,1,t,on:0';
    columnDataType = RealGridJS.DataType.BOOLEAN;
  }

  field.fieldName = fieldName;
  field.dataType = columnDataType;

  let calcExp = vom.get(activeId).propColumnCalc(componentId, columnId);
  if (calcExp && calcExp.toUpperCase() !== 'CALLBACK') {
    field.calculateExpression = calcExp;
  }

  /**
   calculate field custom function apply to calculateCallback
   */
  if (calcExp && calcExp.toUpperCase() === 'CALLBACK') {
    field.calculateCallback = function (dataRow, fieldName, fieldNames, values) {
      return com.get(activeId).getComponent(componentId).setRGridFieldCalculateCallback(activeId, componentId, columnId, dataRow, fieldName, fieldNames, values);
    };
  }

  return field;
}

function isFixedColumn(targetComponentId, arrangedColumns, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let isFixedCol = false;
  for (let i = 0; i < arrangedColumns.length; i++) {
    let arrangedColumn = arrangedColumns[i];
    isFixedCol = vom.get(activeId).isColumnFix(targetComponentId, arrangedColumn)
      && vom.get(activeId).isColumnVisible(targetComponentId, arrangedColumn)
      && !isFixedCol;
  }
  return isFixedCol;
}

function setGridPreferenceInfo(gridView, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let viewMetaComponent = com.get(activeId).getComponent(activeId+'-VIEW_META');
  if (viewMetaComponent !== undefined) {
    let prefInfo = viewMetaComponent.getValue('PREF_INFO');

    if (prefInfo !== undefined) {
      let tempDB = TAFFY(prefInfo);
      gridView.prefInfo = tempDB().filter({gridCd: gridView.orgId}).get();
      tempDB = null;
    }
    prefInfo = null;
  }
  viewMetaComponent = null;
}

function setGridCrosstabInfo(gridView, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let viewMetaComponent = com.get(activeId).getComponent(activeId+'-VIEW_META');
  if (viewMetaComponent !== undefined) {
    let crossTab = viewMetaComponent.getValue('CROSSTAB_INFO');
    if (crossTab) {
      if (crossTab instanceof Array && crossTab.length > 0) {
        gridView.crossTabInfo = crossTab[0][gridView.orgId];
      } else {
        gridView.crossTabInfo = crossTab[gridView.orgId];
      }
    }

    crossTab = null;
  }

  viewMetaComponent = null;
}

function createDataColumn(gridView, fieldName, componentId, columnId, isIterationColumn, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let columnVisible = vom.get(activeId).isColumnVisible(componentId, columnId);
  let columnWidth = parseInt(vom.get(activeId).propColumnWidth(componentId, columnId));
  let columnTitle = columnId;

  let tempColumnTitle = vom.get(activeId).propColumnTitle(componentId, columnId);
  if (tempColumnTitle && tempColumnTitle.toUpperCase() !== PREF_FIELD_NM) {
    columnTitle = tempColumnTitle;
  }

  let columnEditable = vom.get(activeId).propColumnEditable(componentId, columnId);
  let columnNewRowEditable = vom.get(activeId).propColumnEditableIfNew(componentId, columnId);
  let columnIterationApplyColor = vom.get(activeId).propColumnIterationApplyColor(componentId, columnId);

  let dataColumn = {};
  let header = {};

  let prefInfoDB;
  let viewMetaComponent = com.get(activeId).getComponent(activeId+'-VIEW_META');
  if (viewMetaComponent !== undefined) {
    let prefInfo = viewMetaComponent.getValue('PREF_INFO');
    if (prefInfo !== undefined) {
      let tempDB = TAFFY(prefInfo);
      let gridPrefInfo = tempDB().filter({ gridCd: componentId }).get();
      gridView.prefInfo = gridPrefInfo;
      prefInfoDB = TAFFY(gridPrefInfo);
    }
  }

  if (prefInfoDB !== undefined) {
    let columnPrefInfo = prefInfoDB().filter({fldCd: columnId}).get()[0];
    dataColumn.columnPrefInfo = columnPrefInfo;

    if (columnPrefInfo !== undefined) {
      if (columnPrefInfo['fldActiveYn'] !== undefined) {
        columnVisible = columnPrefInfo['fldActiveYn'];
      }

      if (columnPrefInfo['fldWidth'] !== undefined) {
        columnWidth = columnPrefInfo['fldWidth'];
      }

      if (!isIterationColumn) {
        if (columnPrefInfo['fldApplyCd'] !== undefined) {
          columnTitle = columnPrefInfo['fldApplyCd'];
        }
      } else {
        if (columnPrefInfo['fldApplyCdLang'] !== undefined) {
          columnTitle = columnPrefInfo['fldApplyCdLang'];
        } else if (columnPrefInfo['fldApplyCd'] !== undefined) {
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

  dataColumn.type = 'data';
  dataColumn.name = fieldName ? fieldName : columnId;
  dataColumn.fieldName = fieldName ? fieldName : columnId;
  dataColumn.visible = true;
  dataColumn.width = columnWidth;
  dataColumn.editable = columnEditable;
  dataColumn.newRowEditable = columnNewRowEditable;
  dataColumn.columnIdOrg = columnId;
  dataColumn.isIterationColumn = isIterationColumn;

  let headerStyles = {};

  let headerBackground = vom.get(activeId).propColumnHeaderBackground(componentId, columnId);
  if (headerBackground) {
    headerStyles.background = headerBackground;
  }

  let headerForeground = vom.get(activeId).propColumnHeaderForeground(componentId, columnId);
  if (headerForeground) {
    headerStyles.foreground = headerForeground;
  }

  if (fieldColor !== undefined && columnIterationApplyColor !== undefined && (columnIterationApplyColor === 'both' || columnIterationApplyColor === 'header')) {
    headerStyles.background = fieldColor;
  }

  header.styles = headerStyles;

  let styles = {};
  let gridSummaryStyles = {};
  let groupSummaryStyles = {};
  let editor = {};
  let renderer = {};

  let tooltipTargets = vom.get(activeId).propColumnTooltip(componentId, columnId);
  if (tooltipTargets !== undefined && tooltipTargets.length > 0) {
    renderer.showTooltip = true;
  }

  let columnDataType = vom.get(activeId).propColumnType(componentId, columnId).toUpperCase();

  styles.fontBold = vom.get(activeId).propColumnFontBold(componentId, columnId);

  let background = vom.get(activeId).propColumnBackground(componentId, columnId);

  if (background.length === 9) {
    styles.background = background;
  } else {
    if (!columnEditable) {
      styles.background = '#fff9f9f9';
    } else {
      styles.background = '#ffffffd2';
    }
  }

  if (fieldColor !== undefined && columnIterationApplyColor !== undefined && (columnIterationApplyColor === 'both' || columnIterationApplyColor === 'cell')) {
    styles.background = fieldColor;
  }

  let foreground = vom.get(activeId).propColumnForeground(componentId, columnId);
  if (foreground.length === 9) {
    styles.foreground = foreground;
  }

  if (TEXT_DATA_TYPE.includes(columnDataType)) {
    styles.textAlignment = 'center';

    editor.type = 'text';
    editor.textAlignment = 'center';

    dataColumn.editor = editor;
  } else if (NUMBER_DATA_TYPE.includes(columnDataType)) {
    let columnFormat = vom.get(activeId).propColumnFormat(componentId, columnId, columnDataType);
    styles.textAlignment = 'far';
    gridSummaryStyles.textAlignment = 'far';
    groupSummaryStyles.textAlignment = 'far';
    editor.type = 'number';
    editor.textAlignment = 'far';

    let positiveOnly = vom.get(activeId).isColumnPositiveOnly(componentId, columnId);
    editor.positiveOnly = positiveOnly;
    dataColumn.editor = editor;

    if (columnFormat !== 'DS') {
      let formatPattern = /(#|,|\d|\.)/g;
      let columnFormats = [columnFormat.match(formatPattern).join(""),columnFormat.replace(formatPattern,'')];

      styles.numberFormat = columnFormats[0];
      gridSummaryStyles.numberFormat = styles.numberFormat;
      groupSummaryStyles.numberFormat = styles.numberFormat;

      if (columnFormats[1] !== undefined && columnFormats[1].length > 0) {
        styles.suffix = columnFormats[1];
        gridSummaryStyles.suffix = styles.suffix;
        groupSummaryStyles.suffix = styles.suffix;
      }

      let excelFormat = vom.get(activeId).propColumnExcelFormat(componentId, columnId);
      if (excelFormat) {
        dataColumn.excelFormat = excelFormat;
      } else {
        if (columnDataType === 'INT' || columnDataType === 'INTEGER') {
          dataColumn.excelFormat = '#,###';
          styles.numberFormat = '#,###';
          editor.integerOnly = true;
        } else if (columnDataType === 'DOUBLE' || columnDataType === 'FLOAT') {
          let strFormats = styles.numberFormat.split('.');
          strFormats[0] = strFormats[0].replaceAt(strFormats[0].length - 1, '0');
          if (strFormats[1]) {
            strFormats[1] = strFormats[1].replaceAt(0, '0');
          } else {
            strFormats[1] = '0##';
          }

          dataColumn.excelFormat = strFormats[0] + '.' + strFormats[1];
        } else {
          dataColumn.excelFormat = styles.numberFormat;
        }
      }
    }
  } else if (DATETIME_DATA_TYPE.includes(columnDataType)) {
    let columnFormat = vom.get(activeId).propColumnFormat(componentId, columnId, columnDataType);

    styles.textAlignment = 'center';
    styles.datetimeFormat = columnFormat;

    if (vom.get(activeId).propColumnDatepicker(componentId, columnId)) {
      editor.type = 'date';
      editor.datetimeFormat = columnFormat;
      editor.yearNavigation = true;
      editor.commitOnSelect = true;

      if (vom.get(activeId).hasDateLimit(componentId, columnId)) {
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
    renderer.type = 'check';
    renderer.editable = vom.get(activeId).propColumnEditable(componentId, columnId);
    renderer.startEditOnClick = true;
    renderer.labelPosition = 'hidden';
    renderer.shape = 'box';
    renderer.trueValues = 'true,TRUE,True,Y,y,1,T,t,on,ON,On';
    renderer.falseValues = 'false,FALSE,False,N,n,0,F,f,off,OFF,Off';

    dataColumn.editable = false;

    if (vom.get(activeId).propColumnEditable(componentId, columnId)) {
      if (vom.get(activeId).isColumnHeaderCheckable(componentId, columnId)) {
        dataColumn.checked = false;
        header.checkLocation = vom.get(activeId).propColumnHeaderCheckerPosition(componentId, columnId);
        header.itemGap = 5;
      }
    }

    styles.paddingLeft = 8;
    styles.textAlignment = 'center';
    styles.figureBackground = '#ff2F9D27';
    styles.figureInactiveBackground = '#00FF0000';

    editor.booleanFormat = 'false,N,0,f,off:true,Y,1,t,on:0';
    editor.emptyValue = false;
  } else if (IMAGE_DATA_TYPE.includes(columnDataType)) {
    renderer.type = 'image';
    renderer.smoothing = true;

    styles.contentFit = 'auto';

    dataColumn.editable = false;
  } else {
    styles.textAlignment = 'center';
  }

  dataColumn.renderer = renderer;

  let columnTextAlignment = vom.get(activeId).propColumnTextAlignment(componentId, columnId);
  if (columnTextAlignment !== undefined && columnTextAlignment.length > 0) {
    styles.textAlignment = columnTextAlignment;
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

  dataColumn.styles = styles;

  if (vom.get(activeId).isApplyI18nGridColumn(componentId, columnId)) {
    let langpackData = JSON.parse(localStorage.getItem('langpack'))[lo.getLanguageCode()];

    dataColumn.lookupDisplay = true;
    dataColumn.values = Object.keys(langpackData);
    dataColumn.labels = Object.values(langpackData);
  }

  if (vom.get(activeId).propColumnMerge(componentId, columnId)) {
    let mergeRule = {};
    mergeRule.criteria = 'value';
    dataColumn.mergeRule = mergeRule;
  }

  let footer = {};

  if (NUMBER_DATA_TYPE.includes(columnDataType)) {
    footer.styles = gridSummaryStyles;
    footer.groupStyles = groupSummaryStyles;

    let gridSummaryExp = vom.get(activeId).propGridSummaryExp(componentId, columnId);
    if (gridSummaryExp !== undefined && gridSummaryExp.length > 0) { // grid summary
      if (vom.get(activeId).propGridSummaryOnHeader(componentId)) {
        header.summary = {
          styles: gridSummaryStyles,
          expression: vom.get(activeId).propGridSummaryExp(componentId, columnId)
        };
      } else {
        footer.expression = vom.get(activeId).propGridSummaryExp(componentId, columnId);
      }
    }

    let groupSummaryExp = vom.get(activeId).propColumnGroupSummaryExp(componentId, columnId);

    if (groupSummaryExp !== undefined && groupSummaryExp.length > 0) {
      footer.groupExpression = vom.get(activeId).propColumnGroupSummaryExp(componentId, columnId);
    }

  }

  dataColumn.header = header;

  if (Object.getOwnPropertyNames(footer).length > 0) {
    dataColumn.footer = footer;
  }

  /**
   * candidate data column using dropDown editor
   */
  dataColumn.isCandidateColumn = false;

  if (vom.get(activeId).hasColumnCandidate(componentId, columnId)) {
    dataColumn.isCandidateColumn = true;
    dataColumn = processCandidateColumn(componentId, columnId, gridView, dataColumn, activeId);
  }

  /**
   * column lookup
   */
  if (vom.get(activeId).hasColumnLookup(componentId, columnId)) {
    dataColumn.lookupDisplay = true;
    dataColumn.labelField = vom.get(activeId).propColumnLookup(componentId, columnId);
    dataColumn.sortable = false;
  }

  /**
   * masking
   */
  if (vom.get(activeId).isColumnMasking(componentId, columnId)) {
    dataColumn.displayRegExp = /([\w\W])/ig;
    dataColumn.displayReplace = '*';
  }

  if (vom.get(activeId).propColumnButton(componentId, columnId)) {
    dataColumn.buttonVisibility = RealGridJS.ButtonVisibility.ALWAYS;
    dataColumn.button = RealGridJS.CellButton.ACTION;
  }

  // let buttonIcons = cp.getGridColumnImageButtonIcons(componentId, columnId);
  // if (buttonIcons && buttonIcons.length > 0) {
  //   dataColumn.buttonVisibility = RealGridJS.ButtonVisibility.ALWAYS;
  //   dataColumn.button = RealGridJS.CellButton.IMAGE;
  //   let buttonImages = [];
  //   for (let i = 0, len = buttonIcons.length; i < len; i++) {
  //     let buttonIcon = buttonIcons[i];
  //     let buttonImage = {};
  //     buttonImage.name = "button_" + buttonIcon;
  //     buttonImage.width = cp.getGridColumnImageButtonWidth(componentId, columnId);
  //     buttonImage.up = "/images/buttons/" + buttonIcon + "_up_01.png";
  //     buttonImage.hover = "/images/buttons/" + buttonIcon + "_hover_01.png";
  //     buttonImage.down = "/images/buttons/" + buttonIcon + "_down_01.png";
  //     buttonImages.push(buttonImage);
  //   }
  //
  //   dataColumn.imageButtons = {
  //     "images": buttonImages,
  //     "alignment": cp.getGridColumnImageButtonAlignment(componentId, columnId)
  //   };
  // }

  dataColumn.isFixed = vom.get(activeId).isColumnFix(componentId, columnId);

  gridView.dataColumns.push(dataColumn);

  return dataColumn;
}

function processCandidateColumn(componentId, columnId, gridView, dataColumn, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  if (vom.get(activeId).hasCandidateReferenceColumn(componentId, columnId)) {
    setColumnLookupTree(gridView, dataColumn, componentId, columnId, activeId);
  } else {
    setColumnCandidate(dataColumn, componentId, columnId, activeId);
  }

  return dataColumn;
}

/**
 * get Date limit (min/max date) for DATE(DATETIME) column
 */
function getDateLimit(componentId, columnId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let dateLimit = {};

  let minDate;
  let maxDate;
  if (vom.get(activeId).hasColumnDateLimitInit(componentId, columnId)) {
    /**
     * process min-date init
     */
    if (vom.get(activeId).hasColumnDateLimitInitValue(componentId, columnId, vom.elements.minDate)) {
      minDate = vom.get(activeId).propColumnDateLimitInitValue(componentId, columnId, vom.elements.minDate);
    }

    if (minDate !== undefined) {
      dateLimit.minDate = getDateFromDateString(minDate);
    }

    /**
     * process max-date init
     */
    if (vom.get(activeId).hasColumnDateLimitInitValue(componentId, columnId, vom.elements.maxDate)) {
      maxDate = vom.get(activeId).propColumnDateLimitInitValue(componentId, columnId, vom.elements.maxDate);
    }

    if (maxDate !== undefined) {
      dateLimit.maxDate = getDateFromDateString(maxDate);
    }
  }

  if (vom.get(activeId).hasColumnDateLimitValues(componentId, columnId)) {
    let resultData = callColumnService(componentId, columnId, vom.elements.dataLimit, activeId)[0];

    let minDateValueId = vom.get(activeId).propColumnDateLimitValues(componentId, columnId, vom.elements.minDate);
    let maxDateValueId = vom.get(activeId).propColumnDateLimitValues(componentId, columnId, vom.elements.maxDate);

    if (resultData !== undefined && !isEmpty(resultData)) {
      if (minDateValueId !== undefined) {
        minDate = resultData[minDateValueId];

        if (minDate !== undefined) {
          dateLimit.minDate = getDateFromDateString(minDate);
        }
      }

      if (maxDateValueId !== undefined) {
        maxDate = resultData[maxDateValueId];

        if (maxDate !== undefined) {
          dateLimit.maxDate = getDateFromDateString(maxDate);
        }
      }
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

  if (vom.get(activeId).isApplyI18nGridColumn(componentId, columnId)) {
    for (let labelIdx = 0; labelIdx < labels.length; labelIdx++) {
      labels[labelIdx] = transLangKey(labels[labelIdx]);
    }
  }

  dataColumn.dropDownDataSource = resultData;
  dataColumn.labels = labels;
  dataColumn.values = values;
}

/**
 * column service call(candidate, date-limit)
 */
function callColumnService(componentId, columnId, elemName, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;

  let columnServiceCallId;
  let columnReferenceServiceCallId;

  if (elemName === vom.elements.candidate) {
    columnServiceCallId = vom.get(activeId).getColumnCandidateServiceCallId(componentId, columnId);
    columnReferenceServiceCallId = vom.get(activeId).getColumnCandidateReferenceServiceCallId(componentId, columnId);
  } else if (elemName === vom.elements.dataLimit) {
    columnServiceCallId = vom.get(activeId).getColumnDateLimitServiceCallId(componentId, columnId);
    columnReferenceServiceCallId = vom.get(activeId).getColumnDateLimitReferenceServiceCallId(componentId, columnId);
  }

  let referenceComponentId = componentId;
  let referenceServiceCallId = columnReferenceServiceCallId;

  let pattern = /:/g;

  if (pattern.test(columnReferenceServiceCallId)) {
    referenceComponentId = columnReferenceServiceCallId.split(':')[0];
    referenceServiceCallId = columnReferenceServiceCallId.split(':')[1];
  }

  let resultData = {};
  if (columnReferenceServiceCallId !== undefined && columnReferenceServiceCallId.length > 0) {
    resultData = vsm.get(activeId, "dataManager").getDataState(referenceComponentId, referenceServiceCallId)[RESULT_DATA];

    let extractBy;
    if (elemName === vom.elements.candidate) {
      extractBy = vom.get(activeId).getColumnCandidateReferenceServiceCallExtract(componentId, columnId);
    } else if (elemName === vom.elements.dataLimit) {
      extractBy = vom.get(activeId).getColumnDateLimitReferenceServiceCallExtract(componentId, columnId);
    }

    if (extractBy !== undefined) {
      if (extractBy.includes(':')) {
        let filter = {};
        if (extractBy.includes(',')) {
          let arrExtractBy = extractBy.split(',');
          for (let i = 0; i < arrExtractBy.length; i++) {
            filter[arrExtractBy[i].split(':')[0]] = arrExtractBy[i].split(':')[1];
          }
        } else {
          filter[extractBy.split(':')[0]] = extractBy.split(':')[1];
        }

        let dataDB = TAFFY(resultData);
        resultData = dataDB().filter(filter).get();
      }
    }
  } else {
    let params = createColumnServiceParamMap(componentId, columnId, elemName, activeId);
    resultData = callGridColumnService(componentId, columnServiceCallId, params, activeId);
  }

  return resultData;
}

/**
 * create paramMap for column service call(candidate, date-limit)
 */
function createColumnServiceParamMap(componentId, columnId, propertyName, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let paramMap = {};
  let parameterIds = vom.get(activeId).getColumnServiceCallParameterIds(componentId, columnId, propertyName);
  paramMap.service = vom.get(activeId).getColumnServiceCallServiceId(componentId, columnId, propertyName);
  paramMap.target = vom.get(activeId).getColumnServiceCallServiceTarget(componentId, columnId, propertyName);

  let newTarget = vom.get(activeId).getServiceTargetAliases()[paramMap.target];
  if (newTarget) {
    paramMap.target = newTarget;
  }

  let url = vom.get(activeId).getColumnServiceCallUrl(componentId, columnId, propertyName);
  if (url) {
    paramMap.url = url;
  }

  let method = vom.get(activeId).getColumnServiceCallMethod(componentId, columnId, propertyName);
  if (method) {
    paramMap.method = method;
  }

  for (let i = 0, n = parameterIds.length; i < n; i++) {
    let parameterId = parameterIds[i];

    let referId = vom.get(activeId).getColumnServiceCallParameterReferenceId(componentId, columnId, propertyName, parameterId);
    let paramVal = vom.get(activeId).getColumnServiceCallParameterValue(componentId, columnId, propertyName, parameterId);
    let defaultVal = vom.get(activeId).getColumnServiceCallParameterDefaultValue(componentId, columnId, propertyName, parameterId);

    // getValue from component that named referId
    if (referId) {
      let data = [];

      let referItems = referId.split(':');
      let rId = referItems[0];
      let rType = rId;
      if (referItems.length > 1) {
        rType = referItems[1];
      }

      if (rId !== 'COMMON') {
        let referenceComponent = com.get(activeId).getComponent(rId);
        if (referenceComponent) {
          let referVal = referenceComponent.getValue(rType);
          if (referVal) {
            data.push(referVal);
          } else {
            if (defaultVal !== null) {
              console.warn('Component ' + rId + ' has no value.' + '\nParameter ' + parameterId + ' will take default-value : ' + defaultVal);
              data.push(defaultVal); // push into data default-value
            } else {
              console.warn('Component ' + rId + ' has no value & no default-value.' + '\nParameter ' + parameterId + ' will not send.');
            }
          }
        }
      } else {
        data.push(com.get(activeId).getComponent('COMMON').getValue(rType));
      }

      if (data.length === 1) {
        paramMap[parameterId] = data[0];
      } else if (data.length > 1) {
        paramMap[parameterId] = data;
      }
    }

    if (paramVal !== null) {
      paramMap[parameterId] = paramVal;
    }
  }

  return paramMap;
}

function setColumnLookupTree(gridView, dataColumn, componentId, columnId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let referenceColumnId = vom.get(activeId).propCandidateReferenceColumn(componentId, columnId);
  let valueId = vom.get(activeId).propColumnCandidateValueId(componentId, columnId);
  let labelId = vom.get(activeId).propColumnCandidateTextId(componentId, columnId);
  let actualReferenceField = vom.get(activeId).propColumnCandidateValueId(componentId, referenceColumnId);

  dataColumn.editor = {
    type: RealGridJS.CellEditor.DROPDOWN,
    dropDownCount: vom.get(activeId).propColumnCandidateDropDownCount(componentId, columnId),
    domainOnly: true,
    dropDownWhenClick: true
  };
  dataColumn.lookupDisplay = true;
  dataColumn.labelField = columnId + LABEL_FIELD;
  dataColumn.referenceColumnId = referenceColumnId;
  dataColumn.actualReferenceField = actualReferenceField;

  let columnCandidateReferenceServiceCallId = vom.get(activeId).getColumnCandidateReferenceServiceCallId(componentId, columnId);
  let referenceComponentId = componentId;
  let referenceServiceCallId = columnCandidateReferenceServiceCallId;
  let ptn = /:/g;

  if (ptn.test(columnCandidateReferenceServiceCallId)) {
    referenceComponentId = columnCandidateReferenceServiceCallId.split(':')[0];
    referenceServiceCallId = columnCandidateReferenceServiceCallId.split(':')[1];
  }

  let resultData = {};
  if (columnCandidateReferenceServiceCallId) {
    resultData = vsm.get(activeId, "dataManager").getDataState(referenceComponentId, referenceServiceCallId)[RESULT_DATA];
  } else {
    let serviceCallId = vom.get(activeId).getColumnCandidateServiceCallId(componentId, columnId);
    let params = createColumnServiceParamMap(componentId, columnId, undefined, activeId);

    resultData = callGridCandidateService(componentId, serviceCallId, params, activeId);
  }
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

    if (vom.get(activeId).isApplyI18nGridColumn(componentId, columnId)) {
      for (let labelIdx = 0; labelIdx < labels.length; labelIdx++) {
        labels[labelIdx] = transLangKey(labels[labelIdx]);
      }
    }

    currentLookup[referenceLevelKeys[i]] = {values: values, labels: labels};
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
          changeLookupDropDown(grid, newValue, lookupColumnId, viewId);

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
          changeLookupDropDown(grid, grid.getValue(itemIndex, keyColumnId), lookupColumnId, viewId);
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

function changeLookupDropDown(gridView, key, lookupColumnId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let lookupColumn = gridView.columnByName(lookupColumnId);

  if (key) {
    let lookup = gridView.lookups[lookupColumnId][key];
    if (lookup !== undefined) {
      let values = lookup.values;
      let labels = lookup.labels;
      if (vom.get(activeId).isApplyI18nGridColumn(gridView.orgId, lookupColumnId)) {
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

function arrangeLookups(rGridView, dataProvider, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = rGridView.getActualComponent();
  let rowCount = dataProvider.getRowCount();
  let componentId = rGridView.id;

  let columnNames = gridView.getColumnNames(true);
  for (let i = 0; i < columnNames.length; i++) {
    let columnId = columnNames[i];

    if (vom.get(activeId).hasCandidateReferenceColumn(componentId, columnId)) {
      let referenceColumnId = vom.get(activeId).propCandidateReferenceColumn(componentId, columnId);
      let lookupColumnId = columnId;

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

              if (vom.get(activeId).isApplyI18nGridColumn(componentId, lookupColumnId)) {
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

function setGridSortOrder(gridView, targetComponentId, fieldNames, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;

  let gridColumnIds = vom.get(activeId).propColumnIds(targetComponentId);

  let sortFields = [];
  let sortDirs = [];

  for (let i = 0; i < gridColumnIds.length; i++) {
    let columnId = gridColumnIds[i];
    let gridSort = vom.get(activeId).propColumnSort(targetComponentId, columnId);

    if (gridSort !== undefined && (gridSort === 'asc' || gridSort === 'desc')) {
      let sortDir;
      if (gridSort === 'asc') {
        sortDir = RealGridJS.SortDirection.ASCENDING;
      } else if (gridSort === 'desc') {
        sortDir = RealGridJS.SortDirection.DESCENDING;
      }

      if (vom.get(activeId).isIterationColumn(targetComponentId, columnId)) {
        let prefix = vom.get(activeId).propColumnIterationPrefix(targetComponentId, columnId);
        let postfix = vom.get(activeId).propColumnIterationPostfix(targetComponentId, columnId);

        for (let j = 0; j < fieldNames.length; j++) {
          let fieldName = fieldNames[j];
          if (fieldName.startsWith(prefix) && fieldName.endsWith(postfix)) {
            sortFields.push(fieldName);
            sortDirs.push(sortDir)
          }
        }
      } else {
        sortFields.push(columnId);
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
function setInitGroupOrder(gridView, targetComponentId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let columnIds = vom.get(activeId).propColumnIds(targetComponentId);

  let groupByFieldNames = [];
  let initGroupByTF = [];
  let initGroupOrderP = {};
  let initGroupOrderV = {};

  for (let i = 0; i < columnIds.length; i++) {
    let groupOrder = vom.get(activeId).propColumnInitGroupOrder(targetComponentId, columnIds[i]);
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
    let groupingColumn = prefInfoDB().filter({fldCd: initGroupByTF[i]}).get(0)[0];
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

function setColumnFilter(gridView, dataProvider, columnId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
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

    let componentType = com.get(activeId).getComponent(gridView.orgId).type;
    if (componentType === 'R_GRID') {
      // filterValues = dataProvider.getFieldValues(columnId, 0, -1).unique();
      let itemCount = gridView.getItemCount();
      for (let i = 0; i < itemCount; i++) {
        if (gridView.getDataRow(i) !== -1) {
          let value = gridView.getValue(i, columnId);
          if (!filterValues.includes(value)) {
            filterValues.push(value);
          }
        }
      }
    } else if (componentType === 'R_TREE') {
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

      if (vom.get(activeId).isApplyI18nGridColumn(gridView.orgId, columnIdOrg)) {
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

function setGridFilters(gridView, targetComponentId, dataProvider, staticColumnsMap, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let staticColumnIds = Object.keys(staticColumnsMap);

  for (let columnIdx = 0; columnIdx < staticColumnIds.length; columnIdx++) {
    let staticColumnId = staticColumnIds[columnIdx];

    if (vom.get(activeId).isColumnFilterable(targetComponentId, staticColumnId)) {
      gridView.activatedColumnFilters[staticColumnId] = [];
      setColumnFilter(gridView, dataProvider, staticColumnId, activeId);
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

function setGridDataProvider(gridView, componentId, componentType, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let dataProvider;
  if (componentType === 'R_GRID') {
    dataProvider = new RealGridJS.LocalDataProvider();
  } else if (componentType === 'R_TREE') {
    dataProvider = new RealGridJS.LocalTreeDataProvider();
  }

  let fields = function () {
    let columnIds = vom.get(activeId).propColumnIds(componentId);
    let tempFields = [];

    for (let i = 0, len = columnIds.length; i < len; i++) {
      let columnId = columnIds[i];

      if (!vom.get(activeId).isIterationColumn(componentId, columnId)) {
        tempFields.push(createField(columnId, componentId, columnId, activeId));

        if (vom.get(activeId).hasCandidateReferenceColumn(componentId, columnId)) {
          tempFields.push(createField(columnId + LABEL_FIELD, componentId, columnId, activeId));
        }
      }
    }

    return tempFields;
  }(componentId);

  dataProvider.setFields(fields);

  let dataProviderOptions = {
    datetimeFormat: 'iso',
    restoreMode: 'auto'
  };

  dataProvider.setOptions(dataProviderOptions);

  gridView.setDataSource(dataProvider);

  dataProvider = null;
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

function cleanupGroupColumns(columns) {
  for (let i = 0, len = columns.length; i < len; i++) {
    if (typeof columns[i] !== 'undefined' && columns[i].type === 'group') {
      if (columns[i].columns.length < 1) {
        columns.splice(i, 1);
        cleanupGroupColumns(columns);
      } else {
        cleanupGroupColumns(columns[i].columns);
      }
    }
  }
}

function setGridColumn(gridView, componentId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;

  let columnsMap = {};
  let arrArrangedColumns = vom.get(activeId).getArrangedColumns(componentId);
  gridView.headerDepth = 0;

  let gridGroupHeaders = [];
  for (let i = 0, arrArrangedColumnsLen = arrArrangedColumns.length; i < arrArrangedColumnsLen; i++) {
    let arrangedColumns = arrArrangedColumns[i];
    let groupWidth = 0;
    let dataColumns = [];

    for (let j = 0, arrangedColumnsLen = arrangedColumns.length; j < arrangedColumnsLen; j++) {
      let columnId = arrangedColumns[j];
      let dataColumn = createDataColumn(gridView, null, componentId, columnId, false, activeId);
      groupWidth = groupWidth + dataColumn.width;
      dataColumns.push(dataColumn);
    }

    let groupHeader = '';
    let columnGroups = vom.get(activeId).propColumnGroups(componentId, arrangedColumns[0]);
    let columnIterationGroup = vom.get(activeId).propColumnIterationGroup(componentId, arrangedColumns[0]);

    if (columnGroups) {
      groupHeader = columnGroups;
    } else if (columnIterationGroup) {
      groupHeader = columnIterationGroup;
    }

    let groupHeaders = [];
    if (groupHeader.length > 0) {
      if (vom.get(activeId).hasColumnIterationDelimiter(componentId, arrangedColumns[0])) {
        groupHeaders = groupHeader.split(vom.get(activeId).propColumnIterationDelimiter(componentId, arrangedColumns[0]));
      } else {
        groupHeaders = groupHeader.split(',');
      }
      gridGroupHeaders.push(groupHeaders);
    }

    if (groupHeaders.length > 0) {
      let groupHeadersIndex = 0;
      for (let k = 0, groupHeadersLen = groupHeaders.length; k < groupHeadersLen; k++) {
        let groupHeader = groupHeaders[k];
        let groupColumn = {};
        groupColumn.type = 'group';
        groupColumn.name = groupHeader;
        groupColumn.width = 0;

        let groupColumnVisible = false;
        for (let columnIdx = 0, arrangedColumnsLen = arrangedColumns.length; columnIdx < arrangedColumnsLen; columnIdx++) {
          if (vom.get(activeId).isColumnVisible(arrangedColumns[columnIdx])) {
            groupColumnVisible = true;
          }
        }
        groupColumn.visible = groupColumnVisible;
        groupColumn.orientaion = 'horizontal';
        groupColumn.columns = [];
        groupColumn.level = groupHeadersIndex;
        if (gridView.headerDepth < groupHeadersIndex + 1) {
          gridView.headerDepth = groupHeadersIndex + 1;
        }

        if (groupHeaders.length === groupHeadersIndex + 1) {
          groupColumn.columns = groupColumn.columns.concat(dataColumns);
          groupColumn.width = groupWidth;
          updateParentWidth(columnsMap, groupHeaders, groupWidth, groupHeadersIndex);
        }

        let header = {};
        let headerStyles = {};
        let headerBackgroundColors = [];
        for (let arrangedColIdx = 0, arrangedColumnsLen = arrangedColumns.length; arrangedColIdx < arrangedColumnsLen; arrangedColIdx++) {
          let headerBackground = vom.get(activeId).propColumnHeaderBackground(componentId, arrangedColumns[arrangedColIdx]);
          if (headerBackground) {
            headerBackgroundColors.push(headerBackground);
          }

        }
        if (headerBackgroundColors.length > 0) {
          headerStyles.background = headerBackgroundColors[0];
        }

        header.text = transLangKey(groupHeader);
        header.styles = headerStyles;
        groupColumn.header = header;

        let columnsConcatFlag = true;
        if (!columnsMap.hasOwnProperty(groupHeader)) {
          columnsMap[groupHeader] = groupColumn;
        } else {
          columnsMap[groupHeader].columns = columnsMap[groupHeader].columns.concat(groupColumn.columns);
          columnsMap[groupHeader].width = columnsMap[groupHeader].width + groupColumn.width;
          columnsConcatFlag = false;
        }

        let parent = groupHeaders[groupHeadersIndex - 1];
        if (parent && columnsConcatFlag) {
          columnsMap[parent].columns.push(groupColumn);
        }

        groupHeadersIndex++;
      }
    } else {
      columnsMap[dataColumns[0].name] = dataColumns[0];
    }
  }

  let columnKeys = Object.keys(columnsMap);

  for (let i = 0, columnKeysLen = columnKeys.length; i < columnKeysLen; i++) {
    let key = columnKeys[i];
    for (let j = 0; j < gridGroupHeaders.length; j++) {
      if (gridGroupHeaders[j].includes(key) && gridGroupHeaders[j].indexOf(key) > 0) {
        delete columnsMap[key];
      }
    }
  }

  for (let i = 0, columnKeysLen = columnKeys.length; i < columnKeysLen; i++) {
    let key = columnKeys[i];
    let column = columnsMap[key];
    if (typeof column !== 'undefined' && column.type === 'group') {
      if (column.columns.length < 1) {
        delete columnsMap[key];
      } else {
        cleanupGroupColumns(column.columns);
      }
    }
  }

  let columns = [];
  for (let i = 0, columnKeysLen = columnKeys.length; i < columnKeysLen; i++) {
    let key = columnKeys[i];
    if (typeof columnsMap[key] !== 'undefined') {
      columns.push(columnsMap[key]);
    }
  }

  gridView.setColumns(columns);

  if (gridView.invisibleColumnIds !== undefined && gridView.invisibleColumnIds.length > 0) {
    let invisible = gridView.invisibleColumnIds.unique();

    setTimeout(function () {
      for (let i = 0; i < invisible.length; i++) {
        gridView.setColumnProperty(invisible[i], 'visible', false);
      }
    }, 300);

    gridView.invisibleColumnIds = [];
  }
  columnsMap = null;
}

function setGridStyles(gridView, componentId, componentType, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  gridView.setCheckBar({
    visible: vom.get(activeId).propCheckBar(componentId),
    exclusive: vom.get(activeId).propCheckExclusive(componentId)
  });

  gridView.setIndicator({
    visible: vom.get(activeId).propIndicator(componentId),
    footText: ' '
  });

  gridView.setStateBar({
    visible: vom.get(activeId).propStateBar(componentId),
    stateStyles: {
      'updated': {
        'background': '#77ffbb00',
        'foreground': '#ff000000',
        'fontBold': 'true'
      },
      'created': {
        'background': '#4447c83e',
        'foreground': '#ff000000',
        'fontBold': 'true'
      },
      'deleted': {
        'background': '#44ff0000',
        'foreground': '#ff000000',
        'fontBold': 'true'
      },
      'createAndDeleted': {
        'background': '#ff000000',
        'foreground': '#ffffffff',
        'figureBackground': '#88888888',
        'fontBold': 'true'
      }
    }
  });

  let gridSummaryVisible = vom.get(activeId).propGridSummary(componentId);

  gridView.setFooter({
    visible: gridSummaryVisible
  });

  let gridSummaryOnHeader = vom.get(activeId).propGridSummaryOnHeader(componentId);

  if (gridSummaryVisible) {
    if (gridSummaryOnHeader) {
      gridView.setHeader({
        summary: {
          visible: gridSummaryVisible,
          styles: {
            background: '#11ff0000'
          }
        }
      });

      gridView.setFooter({
        visible: !gridSummaryVisible
      });
    } else {
      gridView.setFooter({
        visible: gridSummaryVisible
      });
    }
  }

  if (componentType === 'R_GRID') {
    gridView.setPanel({
      visible: vom.get(activeId).propGroupable(componentId)
    });

    let groupHeader = vom.get(activeId).propGroupHeader(componentId);
    let groupSummary = vom.get(activeId).propGroupSummary(componentId);

    let rowGroupAdornments = 'both';
    if (groupHeader && !groupSummary) {
      rowGroupAdornments = 'header';
    } else if (!groupHeader && groupSummary) {
      rowGroupAdornments = 'footer';
    } else if (!groupHeader && !groupSummary) {
      rowGroupAdornments = 'none';
    }

    if (groupSummary && vom.get(activeId).propGroupSummaryOnHeader(componentId)) {
      rowGroupAdornments = 'summary';
    }

    let expandedAdornments = rowGroupAdornments;
    let collapsedAdornments = rowGroupAdornments;
    if (collapsedAdornments === 'none' || collapsedAdornments === 'summary') {
      collapsedAdornments = 'header';
    }

    let groupSummaryMode = vom.get(activeId).propGroupSummaryMode(componentId);
    let mergeMode = vom.get(activeId).propGroupMergeMode(componentId);
    let groupHeaderText = vom.get(activeId).propGroupHeaderText(componentId);
    let groupFooterText = vom.get(activeId).propGroupFooterText(componentId);
    let groupSort = vom.get(activeId).propGroupSort(componentId);
    let groupExpander = vom.get(activeId).propGroupExpander(componentId);
    let useGroupLevelStyle = vom.get(activeId).propGroupLevelStyle(componentId);

    let rowGroupOptions = {};
    rowGroupOptions.expandedAdornments = expandedAdornments;
    rowGroupOptions.collapsedAdornments = collapsedAdornments;
    rowGroupOptions.summaryMode = groupSummaryMode;
    rowGroupOptions.mergeMode = mergeMode;
    rowGroupOptions.sorting = groupSort;
    rowGroupOptions.footerCellMerge = true;
    rowGroupOptions.mergeExpander = groupExpander;

    if (groupHeaderText !== undefined && groupHeaderText.length > 0) {
      rowGroupOptions.headerStatement = groupHeaderText;
    }

    if (groupFooterText !== undefined && groupFooterText.length > 0) {
      rowGroupOptions.footerStatement = groupFooterText;
    }

    if (useGroupLevelStyle) {
      rowGroupOptions.levels = GRID_ROW_GROUP_LEVELS;
    }

    gridView.setRowGroup(rowGroupOptions);

    gridView.setGroupingOptions({
      prompt: 'Drag column header here then Grouping by column.',
      removeButton: {
        visible: true,
        color: '#ffffa7a7',
        hoveredColor: '#ff980000',
        size: 12
      }
    });
  }
}

function setDisplayOptions(gridView, componentId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let eachRowResizable = false;
  if (gridView.gridDataFit === 'VERTICAL' || gridView.gridDataFit === 'HORIZONTAL') {
    eachRowResizable = true;
  }

  gridView.setDisplayOptions({
    eachRowResizable: eachRowResizable,
    fitStyle: GRID_FIT_STYLE[vom.get(activeId).propFitStyle(componentId).toUpperCase()],
    focusColor: '#ffbb00',
    focusActiveColor: '#cef279',
    rowFocusOption: {
      visible: false,
      rowFocusMask: 'row',
      styles: {
        background: '#11d4f4fa',
        border: '#331212fb,2'
      }
    },
    rowHoverMask: {
      visible: true,
      styles: {
        background: '#2065686b'
      },
      hoverMask: 'row'
    }
  });
}

function setOptions(gridView, componentId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let selectionMode = vom.get(activeId).propSelectionMode(componentId);
  let selectionStyle;

  selectionMode = selectionMode.toUpperCase();

  if (selectionMode === 'BLOCK') {
    selectionStyle = RealGridJS.SelectionStyle.BLOCK;
  } else if (selectionMode === 'ROWS') {
    selectionStyle = RealGridJS.SelectionStyle.ROWS;
  } else if (selectionMode === 'COLUMNS') {
    selectionStyle = RealGridJS.SelectionStyle.COLUMNS;
  } else if (selectionMode === 'SINGLE_ROW') {
    selectionStyle = RealGridJS.SelectionStyle.SINGLE_ROW;
  } else if (selectionMode === 'SINGLE_COLUMN ') {
    selectionStyle = RealGridJS.SelectionStyle.SINGLE_COLUMN;
  } else if (selectionMode === 'NONE') {
    selectionStyle = RealGridJS.SelectionStyle.NONE;
  } else {
    selectionStyle = RealGridJS.SelectionStyle.SINGLE_ROW;
  }

  let isInsertable = vom.get(activeId).hasOperation(componentId, 'INSERT_ROW');
  let isDeletable = vom.get(activeId).hasOperation(componentId, 'REMOVE_ROW');

  gridView.setPasteOptions({
    enabled: true,
    numberChars: ',',
    enableAppend: isInsertable,
    checkDomainOnly: true,
    selectBlockPaste: true,
    applyNumberFormat: true,
    noEditEvent: true,
    noDataEvent: true
  });

  let gridSummaryMode = vom.get(activeId).propGridSummaryMode(componentId);

  let gridOptions = {
    edit: {
      deletable: isDeletable,
      deleteRowsConfirm: true,
      deleteRowsMessage: 'Are you sure?',
      insertable: isInsertable,
      appendable: isInsertable,
      updatable: true,
      enterToNextRow: true
    },
    stateBar: {
      visible: true
    },
    select: {
      style: selectionStyle
    },
    filtering: {
      selector: {
        minWidth: 200,
        maxWidth: 200,
        maxHeight: 250,
        closeWhenClick: false
      }
    },
    display: {
      rowHeight: 20,
      vscrollBar: true
    },
    summaryMode: gridSummaryMode
  };

  if (vom.get(activeId).getComponentType(componentId) === 'R_GRID') {
    gridOptions.sortMode = 'explicit';
  }

  gridView.setOptions(gridOptions);
}

function applyEditMeasureStyle(targetComponentId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(targetComponentId).getActualComponent();
  let dataProvider = gridView.getDataSource();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);
  let columnIdOrgs = dataColumnsDB().select('columnIdOrg');
  let gridPrefInfoDB = TAFFY(gridView.prefInfo);
  let editMeasuresDB = TAFFY(gridPrefInfoDB().filter({gridCd: targetComponentId, editMeasureYn: true}).get());
  let editTargetsDB = TAFFY(gridPrefInfoDB().filter({gridCd: targetComponentId, editTargetYn: true}).get());
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
      let editTargetDataColumns = TAFFY(dataColumns)().filter({columnIdOrg: editTargets[i]}).get();

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
                  gridView.setCellStyle(targetRowIndexes[r_idx], targetFieldNames[f_idx], STYLE_ID_EDIT_MEASURE);
                } else {
                  let styleID = (styleExceptCellsDB().filter({
                    rowIndex: targetRowIndexes[r_idx],
                    fieldName: targetFieldNames[f_idx]
                  }).get()[0]).styleID;
                  gridView.setCellStyle(targetRowIndexes[r_idx], targetFieldNames[f_idx], styleID);
                }
              }
            }
          } finally {
            gridView.endUpdate();
          }
        } else {
          gridView.setCellStyles(targetRowIndexes, targetFieldNames, STYLE_ID_EDIT_MEASURE);
        }
      }

      targetFieldNames = [];
    }
  }
}

function applyCellAttributes(targetComponentId, clearAppliedStyles, itemIndex, dataRow, editedField, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(targetComponentId).getActualComponent();
  let dataProvider = gridView.getDataSource();

  window.requestAnimationFrame(function () {
    let cellAttrsProps = {};

    let dataColumns = gridView.dataColumns;
    let dataColumnsDb = TAFFY(dataColumns);
    let columnIdOrgs = dataColumnsDb().select('columnIdOrg');
    let gridFields = dataProvider.getFields();
    let allFieldNames = dataProvider.getFieldNames();
    let relatedColumns = vom.get(activeId).propCellAttributesApplyColumns(targetComponentId);

    relatedColumns = relatedColumns.unique();

    if (editedField !== undefined && editedField !== null) {
      let editedColumnIdOrg = dataColumnsDb().filter({fieldName: dataProvider.getOrgFieldName(editedField)}).get()[0].columnIdOrg;

      if (!relatedColumns.includes(editedColumnIdOrg)) {
        return;
      }
    }

    if (gridView.isColumnValidationFail) {
      return;
    } else {
      gridView.commit();
    }

    applyEditMeasureStyle(targetComponentId, activeId);

    let cellAttrsIds = vom.get(activeId).propCellAttributeIds(targetComponentId);

    for (let i = 0, cellAttrsIdsLength = cellAttrsIds.length; i < cellAttrsIdsLength; i++) {
      let cellAttrsId = cellAttrsIds[i];
      let arrArngdCondIds = vom.get(activeId).getCellAttributeArrangedConditions(targetComponentId, cellAttrsId); // [[cond1, cond2], [cond3]] : 2dim array

      let tgtRowIndexes = [];
      let tgtFieldNames = [];
      let candTgt = {};
      let candTgtCells = [];

      for (let j = 0, arrArngdCondIdsLength = arrArngdCondIds.length; j < arrArngdCondIdsLength; j++) {
        let arngdCondIds = arrArngdCondIds[j]; // [cond1 ,cond2]

        let iterator = 0;
        for (let k = 0, arngdCondIdsLength = arngdCondIds.length; k < arngdCondIdsLength; k++) {
          let conditionId = arngdCondIds[k];

          let cellAttrCondColumn = vom.get(activeId).getCellAttributeConditionColumn(targetComponentId, cellAttrsId, conditionId);
          let cellAttrCondOperator = vom.get(activeId).getCellAttributeConditionOperator(targetComponentId, cellAttrsId, conditionId);
          let cellAttrCondValues = vom.get(activeId).getCellAttributeConditionValues(targetComponentId, cellAttrsId, conditionId);

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
            if (!vom.get(activeId).isIterationColumn(targetComponentId, cellAttrCondColumn)) { // cellAttrCondColumn is static column
              if (vom.get(activeId).getComponentType(targetComponentId) === 'R_GRID') {
                let condFieldValues = dataProvider.getFieldValues(cellAttrCondColumn, 0, -1);
                for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                  if (isSatisfiedValue(cellAttrCondOperator, condFieldValues[rowIdx], cellAttrCondValues)) {
                    tgtRowIndexes.push(rowIdx);
                  }
                }
              } else if (vom.get(activeId).getComponentType(targetComponentId) === 'R_TREE') {
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
              if (!vom.get(activeId).isIterationColumn(targetComponentId, cellAttrCondColumn)) { // cellAttrCondColumn is static column
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

        let cellAttrApplyIds = vom.get(activeId).propCellAttributeApplyIds(targetComponentId, cellAttrsId);
        for (let k = 0, cellAttrApplyIDsLength = cellAttrApplyIds.length; k < cellAttrApplyIDsLength; k++) {
          let cellAttrApplyId = cellAttrApplyIds[k];
          let cellAttrApplyTgtColumns = vom.get(activeId).propCellAttributeApplyColumns(targetComponentId, cellAttrsId, cellAttrApplyId);
          let cellAttrApplyTgtAttrs = vom.get(activeId).propCellAttributeApplyAttrs(targetComponentId, cellAttrsId, cellAttrApplyId);

          // default background by editable
          if (cellAttrApplyTgtAttrs.editable && cellAttrApplyTgtAttrs.editable === true && !cellAttrApplyTgtAttrs.background) {
            cellAttrApplyTgtAttrs.background = '#ffffffd2';
          } else if (cellAttrApplyTgtAttrs.editable && cellAttrApplyTgtAttrs.editable === false && !cellAttrApplyTgtAttrs.background) {
            cellAttrApplyTgtAttrs.background = '#fff9f9f9';
          }

          gridView.addCellStyle(cellAttrApplyId, cellAttrApplyTgtAttrs, true);

          if (cellAttrApplyTgtColumns.length > 0) {
            for (let l = 0, cellAttrApplyTgtColumnsLength = cellAttrApplyTgtColumns.length; l < cellAttrApplyTgtColumnsLength; l++) {
              let cellAttrApplyTgtColumn = cellAttrApplyTgtColumns[l];

              if (!candTgt.hasOwnProperty(cellAttrApplyTgtColumn) || candTgt[cellAttrApplyTgtColumn].length <= 0) {
                if (vom.get(activeId).isIterationColumn(targetComponentId, cellAttrApplyTgtColumn) && tgtFieldNames.length <= 0) {
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
  });

  window.requestAnimationFrame(function () {
    let statRows = gridView.getDataSource().getAllStateRows();
    let created = statRows.created;

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

    gridView.setCellStyles(created, editableColumns, STYLE_ID_EDITABLE);
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
                gridView.setCellStyle(targetCells[t][0], targetCells[t][1], cellAttrApplyId, true);
              } else {
                let styleID = (styleExceptCellsDb().filter({
                  rowIndex: targetCells[t][0],
                  fieldIndex: targetCells[t][1]
                }).get()[0]).styleID;
                gridView.setCellStyle(targetCells[t][0], targetCells[t][1], styleID, true);
              }
            } else {
              if ((styleExceptCellsDb().filter({
                rowIndex: targetCells[t][0],
                fieldIndex: targetCells[t][1]
              }).get()).length <= 0) {
                gridView.setCellStyle(targetCells[t][0], targetCells[t][1], cellAttrApplyId, true);
              } else {
                let styleID = (styleExceptCellsDb().filter({
                  rowIndex: targetCells[t][0],
                  fieldIndex: targetCells[t][1]
                }).get()[0]).styleID;
                gridView.setCellStyle(targetCells[t][0], targetCells[t][1], styleID, true);
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
                gridView.setCellStyle(tgtRowIndexes[r_idx], tgtFieldNames[f_idx], cellAttrApplyId);
              } else {
                let styleID = (styleExceptCellsDb().filter({
                  rowIndex: targetCells[t][0],
                  fieldIndex: targetCells[t][1]
                }).get()[0]).styleID;
                gridView.setCellStyle(tgtRowIndexes[r_idx], tgtFieldNames[f_idx], styleID);
              }
            }
          }
        } finally {
          gridView.endUpdate();
        }
      } else {
        gridView.setCellStyles(tgtRowIndexes, tgtFieldNames, cellAttrApplyId);
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
      gridView.addCellStyle(cellAttrApplyId + '_B', attributes, true);
      gridView.setCellStyles(tgtRowIndexes, [columnName], cellAttrApplyId + '_B');
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

function getTargetColumnIndexes(componentId, operationId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(componentId).getActualComponent();
  let dataProvider = gridView.getDataSource();
  let fieldNames = dataProvider.getFieldNames();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);

  let targetColumn = vom.get(activeId).getTargetColumn(componentId, operationId);
  let targetColumnIndexes = [];

  if (vom.get(activeId).isIterationColumn(componentId, targetColumn)) {
    let tgtDataColumns = dataColumnsDB().filter({columnIdOrg: targetColumn}).get();
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
    let tgtDataColumns = dataColumnsDB().filter({columnIdOrg: targetColumn}).get();
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

function getSourceColumnIndexes(componentId, operationId, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let gridView = com.get(activeId).getComponent(componentId).getActualComponent();
  let dataProvider = gridView.getDataSource();
  let fieldNames = dataProvider.getFieldNames();
  let dataColumns = gridView.dataColumns;
  let dataColumnsDB = TAFFY(dataColumns);

  let sourceColumn = vom.get(activeId).getSourceColumn(componentId, operationId);

  let sourceColumnIndexes = [];

  if (vom.get(activeId).isIterationColumn(componentId, sourceColumn)) {
    let srcDataColumns = dataColumnsDB().filter({columnIdOrg: sourceColumn}).get();
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

function pagingData(targetComponentId, dataProvider, data, start, viewId) {
  let size = vom.get(viewId).propPageRowCount(targetComponentId);
  let dataSet = [];

  for (let i = start; i < start + size; i++) {
    if (data[i] !== undefined) {
      dataSet.push(data[i]);
    }
  }

  let pagingMode = vom.get(viewId).propPagingMode(targetComponentId);

  if (pagingMode === GRID_PAGING_MODE.PARTIAL) {
    dataProvider.fillJsonData(dataSet, {});
  } else if (pagingMode === GRID_PAGING_MODE.FULL) {
    dataProvider.fillJsonData(data, {});
  }

  let grid = com.get(viewId).getComponent(targetComponentId).getActualComponent();

  if (grid.bindingStatus === 'INIT') {
    grid.bindingStatus = 'RDY';

  } else {
    grid.clearCellStyles();
    applyCellAttributes(targetComponentId, null, null, null, null , viewId);
  }
}

function setPage(targetComponentId, gridView, dataProvider, data, page, viewId) {
  let count = gridView.getPageCount();
  page = Math.max(0, Math.min(page, count - 1));
  let pageSize = vom.get(viewId).propPageRowCount(targetComponentId);
  let pagingMode = vom.get(viewId).propPagingMode(targetComponentId);

  if (pagingMode === GRID_PAGING_MODE.PARTIAL) {
    gridView.setPage(page, 0);
  } else if (pagingMode === GRID_PAGING_MODE.FULL) {
    gridView.setPage(page);
  }

  gridView.setIndicator({rowOffset: page * pageSize});
  dataProvider.clearRows();
  pagingData(targetComponentId, dataProvider, data, page * pageSize, viewId);
  fitGridData(gridView);

  // page number show
  let displayPage = parseInt(page) + 1;
  let pageNumbers = 10;
  let startPage = Math.floor(page / pageNumbers) * pageNumbers + 1;
  let endPage = startPage + pageNumbers - 1;
  endPage = Math.min(endPage, gridView.getPageCount());
  let pagingButtonIds = [];

  let $pageNumbersDiv = $('#pageNumbers' + '_' + targetComponentId);
  $pageNumbersDiv.empty();
  for (let i = startPage; i <= endPage; i++) {
    let buttonId = targetComponentId + '_pageButton_' + i;
    if (i === displayPage) { // current page
      let currentPageButton = `<input id="${buttonId}" type="button" value="${i}" class="button ${pagingButtonColors.pagingButtonActiveColor} small2" style="cursor: pointer;" />`;
      $pageNumbersDiv.append(currentPageButton);
    } else {
      let pageButton = `<input id="${buttonId}" type="button" value="${i}" class="button ${pagingButtonColors.pagingButtonDeactiveColor} small2" />`;
      $pageNumbersDiv.append(pageButton);
      pagingButtonIds.push(buttonId);
    }
  }

  let eventType = 'click';
  let temp = {
    eventType: eventType,
    targetComponentId: targetComponentId,
    gridView: gridView,
    dataProvider: dataProvider,
    data: data
  };

  $(pagingButtonIds).each(function () {
    let pagingButtonId = this;

    $('#' + pagingButtonId).on(eventType, temp, function (event) {
      let eventData = event.data;
      let targetComponentId = eventData.targetComponentId;
      let gridView = eventData.gridView;
      let dataProvider = eventData.dataProvider;
      let data = eventData.data;
      let page = parseInt($(this).val()) - 1;

      btnPageNumClickHandler(targetComponentId, gridView, dataProvider, data, page, viewId);
    });
  });
}

function btnPageNumClickHandler(targetComponentId, gridView, dataProvider, data, page, viewId) {
  setPage(targetComponentId, gridView, dataProvider, data, page, viewId);
}

function btnPageClickHandler(targetComponentId, gridView, dataProvider, data, viewId) {
  let page = parseInt($('#txtPage' + '_' + targetComponentId).val()) - 1;

  setPage(targetComponentId, gridView, dataProvider, data, page, viewId);
}

function btnFirstClickHandler(targetComponentId, gridView, dataProvider, data, viewId) {
  setPage(targetComponentId, gridView, dataProvider, data, 0, viewId);
}

function btnPrevClickHandler(targetComponentId, gridView, dataProvider, data, viewId) {
  let page = gridView.getPage();

  setPage(targetComponentId, gridView, dataProvider, data, page - 1, viewId);
}

function btnNextClickHandler(targetComponentId, gridView, dataProvider, data, viewId) {
  let page = gridView.getPage();

  setPage(targetComponentId, gridView, dataProvider, data, page + 1, viewId);
}

function btnLastClickHandler(targetComponentId, gridView, dataProvider, data, viewId) {
  let count = gridView.getPageCount();

  setPage(targetComponentId, gridView, dataProvider, data, count - 1, viewId);
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

    // try {
    //   let fields = dataProvider.getFields();
    //   for (let i = 0, fieldsLen = fields.length; i < fieldsLen; i++) {
    //     let field = fields[i];
    //     let fieldName = field.orgFieldName;
    //
    //     if (fieldName === undefined) {
    //       fieldName = field.fieldName;
    //     }
    //
    //     let column = gridView.columnByField(fieldName);
    //
    //     if (!column) {
    //       continue;
    //     }
    //
    //     let dataColumn = dataColumnDB().filter({name: column.name}).get()[0];
    //     if (dataColumn && dataColumn.width > 0) {
    //       gridView.fitColumnWidth(column, 0, dataColumn.width, false);
    //     }
    //     window.requestAnimationFrame(function () {
    //       if (column.button === 'action') {
    //         buttonColumns.push(column.name);
    //       }
    //     })
    //   }
    // } catch (err) {
    //   console.warn(err);
    // } finally {
    //   window.requestAnimationFrame(function () {
    //     for (let i = 0, len = buttonColumns.length; i < len; i++) {
    //       let column = gridView.columnByName(buttonColumns[i]);
    //       gridView.setColumnProperty(column, 'width', column.width + 25);
    //     }
    //   });
    // }
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

        let dataColumn = dataColumnDB().filter({name: column.name}).get()[0];
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
    // chart for crosstab grid
    let columnName = index.column;

    if (columnName) {
      let dataColumnsDb = TAFFY(gridView.dataColumns);
      let dataColumn = dataColumnsDb().filter({name: columnName}).get()[0];
      let columnIdOrg = dataColumn.columnIdOrg;
      let candidDataColumns = dataColumnsDb().filter({columnIdOrg: columnIdOrg}).get();
      let candidDataColumnsDb = TAFFY(candidDataColumns);
      let candidDataColumnNames = candidDataColumnsDb().select('name');

      let prefix = vom.get(activeId).propColumnIterationPrefix(componentId, columnIdOrg);
      let postfix = vom.get(activeId).propColumnIterationPostfix(componentId, columnIdOrg);

      // category
      gridView.chartCategory = columnIdOrg;
      let chartCategories = [];

      //series
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
        title: {text: columnIdOrg}
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
        title: {text: columnTitle}
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
    // must execute context menu on contextMenuAcceptedArea
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
          let dataColumn = dataColumnsDb().filter({name: columnName}).get()[0];

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
        setColumnFilter(grid, grid.getDataSource(), index.column, activeId);
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
            setColumnFilter(grid, grid.getDataSource(), columnName, activeId);

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

function setTreeContextMenu(componentId, treeView, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let menu = {};
  menu.SEPARATOR = { label: '-', type: 'separator' };
  menu.EXPAND_ALL = { label: transLangKey('EXPAND_ALL'), tag: 'EXPAND_ALL', enabled: true };
  menu.COLLAPSE_ALL = { label: transLangKey('COLLAPSE_ALL'), tag: 'COLLAPSE_ALL', enabled: true };

  let menuItems = [];
  menuItems.push(menu.EXPAND_ALL);
  menuItems.push(menu.COLLAPSE_ALL);

  treeView.setContextMenu(menuItems);

  treeView.onContextMenuPopup = function (grid, x, y, elementName) {
    // must execute context menu on contextMenuAcceptedArea
    let contextMenuAcceptedArea = [
      'DataCell',
      'MergedDataCell',
      'FooterCell',
      'RowGroupHeaderCell',
      'RowGroupFootCell',
      'GroupFooterCell',
      'TreeExpander'
    ];
    return contextMenuAcceptedArea.includes(elementName);
  };

  treeView.onContextMenuItemClicked = function (grid, menuItem, index) {
    let operation = menuItem.tag;

    if (operation === 'EXPAND_ALL') {
      grid.expandAll();

      let dataProvider = grid.getDataSource();
      let rowCount = dataProvider.getRowCount();

      for (let i = 1; i <= rowCount; i++) {
        let hasChild = !!dataProvider.getDescendants(i);
        if (hasChild) {
          if (!treeExpandedRow.includes(i)) {
            treeExpandedRow.push(i);
          }
        }
      }
    } else if (operation === 'COLLAPSE_ALL') {
      grid.collapseAll();
      treeExpandedRow = [];
    } else {
      let component = com.get(activeId).getComponent(componentId);

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
      grid.setSelection({style: 'rows', startItem: 0, endItem: grid.getItemCount()});
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

function gridOnCellEdited(grid, itemIndex, dataRow, field, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  grid.commit();

  let componentId = grid.orgId;
  let dataProvider = grid.getDataSource();

  /**
   * process for new row editable
   */
  let createdRows = dataProvider.getAllStateRows().created;
  let currentRow = grid.getCurrent().dataRow;
  if (createdRows.includes(currentRow) || currentRow === -1) {
    let dataColumns = grid.dataColumns;
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

    grid.setCellStyles(currentRow, editableColumns, STYLE_ID_EDITABLE);
  }

  /**
   * process for BOOLEAN column check exclusive
   */
  let fieldName = dataProvider.getOrgFieldName(field);
  let dataColumnDB = TAFFY(grid.dataColumns);
  let dataColumn = dataColumnDB().filter({fieldName: fieldName}).get()[0];
  if (dataColumn) {
    let columnId = dataColumn.columnIdOrg;

    if (BOOL_DATA_TYPE.includes(vom.get(activeId).propColumnType(componentId, columnId).toUpperCase())) {
      if (vom.get(activeId).isColumnCheckExclusive(componentId, columnId)) {
        grid.commit();
        dataProvider.beginUpdate();
        let editedValue = dataProvider.getValue(dataRow, fieldName);
        if (editedValue === true) {
          try {
            for (let i = 0, rowCount = dataProvider.getRowCount(); i < rowCount; i++) {
              let value = dataProvider.getValue(i, fieldName);
              if (value === true) {
                dataProvider.setValue(i, fieldName, false);
              }
            }
          } finally {
            dataProvider.setValue(dataRow, fieldName, true);
            dataProvider.endUpdate();
          }
        }
      }

      if (vom.get(activeId).isColumnFilterable(componentId, columnId)) {
        grid.commit();
        setColumnFilter(grid, dataProvider, columnId, activeId);
      }
    }
  }

  /**
   * process for cell attrs. immediately
   */
  applyCellAttributes(componentId, null, null, null, null , activeId);

  /**
   * execute extend function prototype
   */
  window.requestAnimationFrame(function () {
    com.get(activeId).getComponent(componentId).onRGridCellEdited(activeId, componentId, grid, itemIndex, dataRow, field);
  });
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
      let columnIdOrg = dataColumnsDB().filter({name: newIndex.column}).get()[0].columnIdOrg;
      newIndexRenderer.editable = vom.get(activeId).propColumnEditable(componentId, columnIdOrg);
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
              grid.addCellStyle(cellAttributesProp.cellAttrApplyID + '_B', attributes, true);
              grid.setCellStyles(cellAttributesProp.tgtRowIndexes, [columnName], cellAttributesProp.cellAttrApplyID + '_B');
            }

            if (attr.hasOwnProperty('editor') && newIndex.fieldName === currntFieldName) {
              let dataColumnDB = TAFFY(grid.dataColumns);
              let dataColumn = dataColumnDB().filter({fieldName: newIndex.fieldName}).get()[0];

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

          gridView.setCellStyles(created, editableColumns, STYLE_ID_EDITABLE);
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

          gridView.setCellStyles([newRow], editableColumns, STYLE_ID_EDITABLE);

          /*
          let columnName = grid.columnByField(cellAttributesProp.tgtFieldNames[i]).name;
          let renderer = grid.getColumnProperty(columnName, 'renderer');

          if (renderer !== undefined && renderer.type === 'check') {
            if (cellAttributesProp.tgtRowIndexes.includes(newIndex.dataRow) || statRows.created.includes(newIndex.dataRow)) {
              renderer.editable = attr.editable;
            } else {
              renderer.editable = !attr.editable;
            }
            grid.setColumnProperty(grid.columnByName(columnName), 'renderer', renderer);
            grid.setColumnProperty(grid.columnByName(columnName), 'editable', false);

            let attributes = clone(attr);

            attributes.editable = false;
            grid.addCellStyle(cellAttributesProp.cellAttrApplyID + '_B', attributes, true);
            grid.setCellStyles(cellAttributesProp.tgtRowIndexes, [columnName], cellAttributesProp.cellAttrApplyID + '_B');
          }
          */
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

      let measureFieldsNm = TAFFY(prefInfoDB().filter({editMeasureYn: criteriaValue}).get())().select('fldApplyCd');

      for (let nmValIdx = 0; nmValIdx < measureFieldsNm.length; nmValIdx++) {
        let filter = {};
        filter['CATEGORY'] = measureFieldsNm[nmValIdx];
        filters.push(filter);
      }
    } else {
      let filter = {};

      if (criteria === 'CATEGORY') {
        let measureField = prefInfoDB().filter({fldCd: criteriaValue}).get(0)[0];
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

export {
  setGridPreferenceInfo,
  setGridCrosstabInfo,
  setGridDataProvider,
  setGridColumn,
  setOptions,
  setGridStyles,
  themeSkin,
  setDisplayOptions,
  setGridContextMenu,
  setTreeContextMenu,
  doGridResize,
  insertRowActual,
  applyCellAttributes,
  progressSpinner,
  createField,
  createDataColumn,
  isFixedColumn,
  cleanupGroupColumns,
  columnsSort,
  setGridSortOrder,
  setInitGroupOrder,
  arrangeLookups,
  setGridFilters,
  fitGridData,
  extractRows,
  updateParentWidth2,
  treeExpandedRow,
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
  processCandidateColumn,
  changeLookupDropDown,
  setNumberComparer,
  manualFitGridDataHorizontal
};
