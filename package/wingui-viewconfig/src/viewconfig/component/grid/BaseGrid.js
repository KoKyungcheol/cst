import {
  combine,
  isJson,
  generateId,
  clone,
  isEmpty,
  getDateFromDateString
} from '../../util/utils';
import {
  showDialog,
  showToastMessage
} from '../../util/dialog';
import Component from '../Component';
import GridWrap from './GridWrap';
import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../../service/ServiceManager';
import xl from '../../util/ExcelTool';

import {
    setGridPreferenceInfo,
    setGridCrosstabInfo,
    setGridColumn,
    setOptions,
    setGridStyles,
    themeSkin,
    setDisplayOptions,
    setGridContextMenu,
    insertRowActual,
    applyCellAttributes,
    progressSpinner,
    createField,
    createDataColumn,
    isFixedColumn,
    extractRows,
    cleanupGroupColumns,
    columnsSort,
    setGridSortOrder,
    setInitGroupOrder,
    arrangeLookups,
    setGridFilters,
    fitGridData,
    updateParentWidth2,
    doGridResize,
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
    gridOnKeyDown,
    gridOnKeyUp,
    gridOnDataCellClicked,
    gridOnDataCellDblClicked,
    gridOnCellButtonClicked,
    gridOnCellEdited,
    gridOnCurrentChanged,
    gridOnCurrentChanging,
    gridOnColumnHeaderClicked,
    gridOnFilteringChanged,
    gridOnEditRowPasted,
    gridOnRowsPasted,
    processCandidateColumn,
    changeLookupDropDown,
    setNumberComparer
} from './gridFunc';
import { waitOff } from '../../util/waitMe';

function nullReplacer(key, value) {
  if (value === undefined) {
    return null;
  }
  return value;
}

export default class BaseGrid extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.gridView = {};
    this.dataProvider = {};

    this.columns = [];

    this.dataOutputOptions = {};
    this.dataparams = {};
    this.rollbackId = '';

    this.viewId = viewId;
    this.ignoreChange = vom.get(this.viewId).propIgnoreChange(id);
    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    if (!RealGridJS) {
      console.error('R_GRID license has been expired');
      showDialog('Warning', 'R_GRID license has been expired', DIALOG_TYPE.ALERT);
      return;
    }

    let wrap = new GridWrap(this.id, this.element, this.viewId);
    wrap.mount();
 
    let me = this;

    this.gridView = new RealGridJS.GridView(this.id);

    this.gridView.addCellStyle(STYLE_ID_EDIT_MEASURE, STYLE_EDIT_MEASURE, true);
    this.gridView.addCellStyle(STYLE_ID_ROW_INSERTING, STYLE_ROW_INSERTING, true);

    this.gridView.addCellStyle(STYLE_ID_EDITABLE, STYLE_EDITABLE, true);
    this.gridView.addCellStyle(STYLE_ID_UNEDITABLE, STYLE_UNEDITABLE, true);

    let additionalHeight = 0;
    let useToolBar = vom.get(me.viewId).propToolbarUsable(this.id);
    let usePaging = vom.get(me.viewId).propPageable(this.id);
    useToolBar && (additionalHeight += 38);
    usePaging && (additionalHeight += 35);

    if (useToolBar || usePaging) {
      let canvasElement = this.element.querySelector('canvas');
      if (canvasElement) {
        canvasElement.parentNode.style.height = 'calc(100% - ' + additionalHeight + 'px)';
      }
    }

    this.gridView.additionalHeight = additionalHeight;

    this.gridView.resetSize();

    this.gridView.orgId = this.id;
    this.gridView.gridDataFit = vom.get(me.viewId).propDataFit(this.id).toUpperCase();
    this.gridView.dataColumns = [];
    this.gridView.lookupReference = {};
    this.gridView.lookups = {};
    this.gridView.invisibleColumnIds = [];
    this.gridView.colFixed = false;
    this.gridView.styleExceptCells = [];
    this.gridView.customAddedColumns = [];
    this.gridView.chartActivated = false;
    this.gridView.chartCategory = '';
    this.gridView.chartCategories = [];
    this.gridView.chartSeries = [];
    this.gridView.chartSeriesItems = [];
    this.gridView.chartAxes = [];
    this.gridView.axisCrossingValues = [];
    this.dataOutputOptions = {
      datetimeCallback: function (index, field, value) {
        if (value && value instanceof Date) {
          return value.format('yyyy-MM-ddTHH:mm:ss');
        } else {
          return null;
        }
      },
      numberCallback: function (index, field, value) {
        if (value !== undefined && !isNaN(value) && typeof value === 'number') {
          return value;
        } else {
          return null;
        }
      },
      booleanCallback: function (index, field, value) {
        if (!value) {
          return false;
        } else {
          return value;
        }
      },
      nullText: null
    };

    setGridPreferenceInfo(this.gridView, this.viewId);
    setGridCrosstabInfo(this.gridView, this.viewId);

    this.setGridDataProvider(this.id);

    setGridColumn(this.gridView, this.id, this.viewId);
    setOptions(this.gridView, this.id, this.viewId);
    setGridStyles(this.gridView, this.id, 'R_GRID', this.viewId);
    let gridSortOptions = {};
    gridSortOptions.enabled = vom.get(me.viewId).propHeaderSortable(this.id);
    if (!gridSortOptions.enabled) {
      gridSortOptions.handleVisibility = 'hidden';
    }

    gridSortOptions.style = RealGridJS.SortStyle.INCLUSIVE;
    this.gridView.setSortingOptions(gridSortOptions);

    let skin = getGridThemeSkin();
    if (skin && Object.getOwnPropertyNames(skin).length > 0) {
      this.gridView.setStyles(skin);
    }

    let editorOptions = {};
    editorOptions.viewGridInside = true;
    if (themeSkin === 'waveDarkBlueSkin') {
      editorOptions.useCssStyleDropDownList = true;
    }

    editorOptions.yearDisplayFormat = "{Y}";
    editorOptions.months = [
      transLangKey("CALENDAR_JAN"),transLangKey("CALENDAR_FEB"), transLangKey("CALENDAR_MAR"),transLangKey("CALENDAR_APR"),
      transLangKey("CALENDAR_MAY"),transLangKey("CALENDAR_JUN"),transLangKey("CALENDAR_JUL"), transLangKey("CALENDAR_AUG"),
      transLangKey("CALENDAR_SEP"),transLangKey("CALENDAR_OCT"), transLangKey("CALENDAR_NOV"),transLangKey("CALENDAR_DEC")
    ]
    editorOptions.weekDays = [
      transLangKey("CALENDAR_SUN"), transLangKey("CALENDAR_MON"),transLangKey("CALENDAR_TUE"), transLangKey("CALENDAR_WED"),transLangKey("CALENDAR_THU"),
      transLangKey("CALENDAR_FRI"),transLangKey("CALENDAR_SAT")
    ]
    
    this.gridView.setEditorOptions(editorOptions);
    this.gridView.setStyles({
      body: {
        dynamicStyles: [{
          criteria: 'checked',
          styles: 'background=#ffcefbc9'
        }]
      }
    });

    setDisplayOptions(this.gridView, this.id, this.viewId);

    this.gridView.setEditOptions({
      validateOnExit: true,
      commitLevel: 'ignore',
      checkDiff: true,
      checkCellDiff: true
    });

    let selectionMode = vom.get(me.viewId).propSelectionMode(this.id);
    selectionMode = selectionMode.toUpperCase();

    let singleMode = false;
    if (selectionMode === 'NONE') {
      singleMode = true;
    }

    this.gridView.setCopyOptions({
      singleMode: singleMode
    });

    let headerOptions = {};
    headerOptions.showTooltip = true;
    headerOptions.resizable = true;

    let headerHeight = vom.get(me.viewId).propHeaderHeight(this.id);
    if (headerHeight) {
      headerOptions.height = headerHeight;
    }

    this.gridView.setHeader(headerOptions);

    /**
     * event callbacks
     */
    this.gridView.onKeyDown = function (grid, key, ctrl, shift, alt) {
      gridOnKeyDown(grid, key, ctrl, shift, alt);
    };

    this.gridView.onKeyUp = function (grid, key, ctrl, shift, alt) {
      gridOnKeyUp(grid, key, ctrl, shift, alt);
    };

    this.gridView.onDataCellClicked = function (grid, index) {
      gridOnDataCellClicked(grid, index);
    };

    this.gridView.onDataCellDblClicked = function (grid, index) {
      gridOnDataCellDblClicked(grid, index);
    };

    this.gridView.onCellButtonClicked = function (grid, itemIndex, column) {
      gridOnCellButtonClicked(grid, itemIndex, column);
    };

    this.gridView.onImageButtonClicked = function (grid, itemIndex, column, buttonIndex, name) {
      gridOnCellButtonClicked(grid, itemIndex, column);
    };

    this.gridView.onCurrentChanged = function (grid, newIndex) {
      gridOnCurrentChanged(grid, newIndex, me.viewId);
    };

    this.gridView.onCurrentChanging = function (grid, oldIndex, newIndex) {
      gridOnCurrentChanging(grid, oldIndex, newIndex, me.viewId);
    };

    this.gridView.onColumnCheckedChanged = function (grid, column, checked) {
      grid.commit();

      for (let i = 0, n = grid.getDataSource().getRowCount(); i < n; i++) {
        grid.getDataSource().setValue(i, column.fieldName, checked);
      }
    };

    this.gridView.onShowTooltip = function (grid, index, value) {
      let tooltip = '';

      let tooltipTargets = vom.get(me.viewId).propColumnTooltip(me.id, index.column);
      if (tooltipTargets && tooltipTargets.length > 0) {
        for (let i = 0, n = tooltipTargets.length; i < n; i++) {
          let column = grid.columnByName(tooltipTargets[i]);
          if (column) {
            let text = column.name;
            let value = grid.getValue(index.itemIndex, column.fieldName);

            tooltip = tooltip + transLangKey(text) + ' : ' + transLangKey(value) + '\r\n';
          }
          column = null;
        }
      } else {
        tooltip = value;
      }

      return tooltip;
    };

    this.gridView.onCellEdited = function (grid, itemIndex, dataRow, field) {
      gridOnCellEdited(grid, itemIndex, dataRow, field, me.viewId);
    };

    this.gridView.onValidateColumn = function (grid, column, inserting, value) {
      let columnId = column.name;

      if (vom.get(me.viewId).hasColumnValidations(me.id, columnId)) {
        let validationIds = vom.get(me.viewId).propColumnValidationIds(me.id, columnId);
        for (let i = 0, n = validationIds.length; i < n; i++) {
          let validationId = validationIds[i];

          let columnValidationOperator = vom.get(me.viewId).propColumnValidationOperator(me.id, columnId, validationId);
          let columnValidationValues = vom.get(me.viewId).propColumnValidationValues(me.id, columnId, validationId);
          let columnValidationValuesOrg = clone(columnValidationValues);
          let error = {};

          if (columnValidationValues === undefined) {
            columnValidationValues = [];
            columnValidationValues.push('');
          }

          let columnType = vom.get(me.viewId).propColumnType(me.id, columnId).toUpperCase();
          if (DATETIME_DATA_TYPE.includes(columnType)) {
            let dateVals = [];
            for (let valIdx = 0; valIdx < columnValidationValues.length; valIdx++) {
              let dateVal;
              let valDate = columnValidationValues[valIdx].replaceAll(' ', '');
              if (valDate.toUpperCase() === 'EMPTY') {
                dateVal = valDate;
              } else {
                if (valDate && valDate.length > 0) {
                  dateVal = getDateFromDateString(valDate);
                }
              }

              dateVals.push(dateVal);
            }

            columnValidationValues = [];
            columnValidationValues = dateVals.slice(0);
          }

          columnValidationOperator = columnValidationOperator.toUpperCase();

          let isValidValue = isSatisfiedValue(columnValidationOperator, value, columnValidationValues);
          if (!isValidValue) {
            error.level = RealGridJS.ValidationLevel.ERROR;
            let errMsg = vom.get(me.viewId).propColumnValidationMessage(me.id, columnId, validationId);

            if (errMsg && errMsg.length > 0) {
              error.message = errMsg;
            } else {
              if (DATETIME_DATA_TYPE.includes(columnType)) {
                columnValidationValues = columnValidationValuesOrg;
              }

              switch (columnValidationOperator) {
                case 'LESS':
                  errMsg = 'less than ' + columnValidationValues;
                  break;
                case 'LESSEQUAL':
                  errMsg = 'less than or equal ' + columnValidationValues;
                  break;
                case 'GREATER':
                  errMsg = 'greater than ' + columnValidationValues;
                  break;
                case 'GREATEREQUAL':
                  errMsg = 'greater than or equal ' + columnValidationValues;
                  break;
                case 'EQUAL':
                  errMsg = 'equal ' + columnValidationValues;
                  break;
                case 'NOTEQUAL':
                  errMsg = 'not equal ' + columnValidationValues;
                  break;
                case 'BETWEEN':
                  errMsg = 'between ' + columnValidationValues[0] + ' and ' + columnValidationValues[1];
                  break;
                case 'STARTSWITH':
                  errMsg = 'starts with ' + columnValidationValues;
                  break;
                case 'ENDSWITH':
                  errMsg = 'ends ' + columnValidationValues;
                  break;
                case 'INCLUDES':
                  errMsg = 'includes ' + columnValidationValues;
                  break;
              }

              error.message = columnId + ' must ' + errMsg;
            }
          }

          me.gridView.isColumnValidationFail = !isEmpty(error);

          return error;
        }
      }
    };

    /**
     * on validation fail callback
     */
    this.gridView.onValidationFail = function (grid, itemIndex, column, err) {
      me.gridView.isColumnValidationFail = true;
      showDialog('Validation Fail', err.message, DIALOG_TYPE.ALERT).then(function (answer) {
        if (answer) {
          if (column) {
            let index = {
              itemIndex: itemIndex,
              fieldName: column.fieldName
            };
            grid.setCurrent(index);
            grid.showEditor();
          }
        }
      });
    };

    this.gridView.onColumnHeaderClicked = function (grid, column, rightClicked) {
      gridOnColumnHeaderClicked(grid, column, rightClicked, me.viewId);
    };

    this.gridView.onFilteringChanged = function (grid, column) {
      gridOnFilteringChanged(grid, column);
    };

    this.gridView.onEditRowPasted = function (grid, itemIndex, dataRow, fields, oldValues, newValues) {
      gridOnEditRowPasted(grid, itemIndex, dataRow, fields, oldValues, newValues, me.viewId);
    };

    this.gridView.onRowsPasted = function (grid, items) {
      gridOnRowsPasted(grid, items, me.viewId);
    };

    /**
     * set grid context menu
     */
    setGridContextMenu(this.id, this.gridView, this.viewId);

    /**
     * set options by custom function
     */
    this.setRGridCustomOptions(this.viewId, this.id);

    /**
     * actions
     */
    let actionEventTypes = vom.get(this.viewId).getActionEventTypes(this.id);
    for (let i = 0, n = actionEventTypes.length; i < n; i++) {
      let actionEventType = actionEventTypes[i];
      if (actionEventType === 'cell-click') {
        this.gridView.onDataCellClicked = function (grid, index) {
          gridOnDataCellClicked(grid, index);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      } else if (actionEventType === 'cell-double-click') {
        this.gridView.onDataCellDblClicked = function (grid, index) {
          gridOnDataCellDblClicked(grid, index);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      } else if (actionEventType === 'button-click') {
        this.gridView.onCellButtonClicked = function (grid, itemIndex, column) {
          gridOnCellButtonClicked(grid, itemIndex, column);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };

        this.gridView.onImageButtonClicked = function (grid, itemIndex, column, buttonIndex, name) {
          gridOnCellButtonClicked(grid, itemIndex, column);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      } else if (actionEventType === 'cell-edited') {
        this.gridView.onCellEdited = function (grid, itemIndex, dataRow, field) {
          gridOnCellEdited(grid, itemIndex, dataRow, field, me.viewId);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      }
    }

    this.isMounted = true;
    this.mounted();

    actionEventTypes = null;

    wrap = null;
  }

  setGridDataProvider(componentId) {
    let me = this;
    this.dataProvider = new RealGridJS.LocalDataProvider();

    let fields = function () {
      let columnIds = vom.get(me.viewId).propColumnIds(componentId);
      let tempFields = [];

      for (let i = 0, len = columnIds.length; i < len; i++) {
        let columnId = columnIds[i];

        if (!vom.get(me.viewId).isIterationColumn(componentId, columnId)) {
          tempFields.push(createField(columnId, componentId, columnId, me.gridView, me.viewId));

          if (vom.get(me.viewId).hasCandidateReferenceColumn(componentId, columnId)) {
            tempFields.push(createField(columnId + LABEL_FIELD, componentId, columnId, me.gridView, me.viewId));
          }
        }
      }

      return tempFields;
    }(componentId);

    this.dataProvider.setFields(fields);

    let dataProviderOptions = {
      datetimeFormat: 'iso',
      restoreMode: 'auto'
    };

    this.dataProvider.setOptions(dataProviderOptions);

    this.gridView.setDataSource(this.dataProvider);
  }

  getActualComponent() {
    return this.gridView;
  }

  getValue(referType, rowExtractor) {
    this.gridView.commit(true);

    if (!referType) {
      console.warn('Get value from R_GRID need reference-type.\n' +
        'Set reference-id \'component-id:reference-type(changes/selections/all/...etc)\'.');
      return;
    }

    referType = referType.toUpperCase();

    if (referType === GRID_REFER_TYPE.UPDATED_CELL || referType === GRID_REFER_TYPE.CHANGES_DETAIL || referType === GRID_REFER_TYPE.CHANGES || referType === GRID_REFER_TYPE.UPDATED || referType === GRID_REFER_TYPE.CREATED) {
      let statRows = this.dataProvider.getAllStateRows();

      let indexes = [];
      try {
        if (referType === GRID_REFER_TYPE.CHANGES) {
          indexes = statRows.updated;
          indexes = indexes.concat(statRows.created);
        } else if (referType === GRID_REFER_TYPE.UPDATED) {
          indexes = statRows.updated;
        } else if (referType === GRID_REFER_TYPE.CREATED || referType === GRID_REFER_TYPE.CHANGES_DETAIL) {
          indexes = statRows.created;
        }

        let rows = [];
        for (let i = 0, n = indexes.length; i < n; i++) {
          let rowIndex = indexes[i];
          let row = this.dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);
          row[ROW_STATUS] = this.dataProvider.getRowState(rowIndex).toUpperCase();
          rows.push(row);
        }

        if (referType === GRID_REFER_TYPE.UPDATED_CELL) {
          let fieldNames = [];

          let columns = this.gridView.getColumns();
          for (let i = 0, n = columns.length; i < n; i++) {
            let column = columns[i];

            let renderer = this.gridView.getColumnProperty(column.name, 'renderer');
            if (!renderer.editable) {
              fieldNames.push(column.fieldName);
            }
            column = null;
          }

          let updates = this.dataProvider.getUpdatedCells();
          for (let i = 0, n = updates.length; i < n; i++) {
            let update = updates[i];

            let jsonRow = this.dataProvider.getJsonRow(update.__rowId);

            let row = {};
            for (let j = 0, len = fieldNames.length; j < len; j++) {
              let fieldName = fieldNames[j];
              row[fieldName] = jsonRow[fieldName];
            }

            for (let j = 0, len = update.updatedCells.length; j < len; j++) {
              let updatedCell = update.updatedCells[j]
              row[updatedCell.fieldName] = updatedCell.newValue;
            }

            rows.push(row);
            jsonRow = null;
          }
          updates = null;
          columns = null;
          fieldNames = null;

        } else if (referType === GRID_REFER_TYPE.CHANGES_DETAIL) {
          let fieldNames = this.gridView.getColumns().map(c => c.fieldName);

          let updates = this.dataProvider.getUpdatedCells();
          for (let i = 0, n = updates.length; i < n; i++) {
            let update = updates[i];

            let jsonRow = this.dataProvider.getJsonRow(update.__rowId);

            let row = {};
            for (let j = 0, len = fieldNames.length; j < len; j++) {
              let fieldName = fieldNames[j];
              row[fieldName] = jsonRow[fieldName];
            }

            let oldValues = {};

            for (let j = 0, len = update.updatedCells.length; j < len; j++) {
              let updatedCell = update.updatedCells[j]
              row[updatedCell.fieldName] = updatedCell.newValue;
              oldValues[updatedCell.fieldName] = updatedCell.oldValue;
            }

            if (Object.keys(oldValues).length) {
              row['oldValues'] = oldValues;
            }
            rows.push(row);
          }
          updates = null;
          fieldNames = null;
        }

        if (rows.length === 0) {
          return;
        }

        rows = extractRows(this.gridView, rows, rowExtractor);
        console.log('R_GRID getValue [' + referType + '] : \n', rows);
        return JSON.stringify(rows, nullReplacer);
      } finally {
        indexes = null;
        statRows = null;
      }
    }

    if (referType === GRID_REFER_TYPE.SELECTIONS || referType == GRID_REFER_TYPE.SELECTION) {
      if (this.dataProvider.getRows().length <= 0) {
        return;
      }

      let selections = this.gridView.getSelectedRows();
      if (!selections) {
        return;
      }

      let rows = [];
      for (let i = 0, n = selections.length; i < n; i++) {
        let rowIndex = parseInt(selections[i]);
        let row = this.dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);

        if (referType !== GRID_REFER_TYPE.SELECTION) {
          row[ROW_STATUS] = this.dataProvider.getRowState(rowIndex).toUpperCase();
        }

        rows.push(row);
      }

      if (rows.length === 0) {
        return;
      }

      rows = extractRows(this.gridView, rows, rowExtractor);
      console.log('R_GRID getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows, nullReplacer);
    }

    if (referType === GRID_REFER_TYPE.SINGLE_SELECTION) {
      if (this.dataProvider.getRows().length <= 0) {
        return;
      }

      let selections = this.gridView.getSelectedRows();
      if (!selections || selections.length == 0) {
        return;
      }

      let rowIndex = parseInt(selections[0]);
      let row = this.dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);
      row[ROW_STATUS] = this.dataProvider.getRowState(rowIndex).toUpperCase();

      console.log('R_GRID getValue [' + referType + '] : \n', row);
      return JSON.stringify(row, nullReplacer);
    }

    if (referType === GRID_REFER_TYPE.CHECKED) {
      let checked = this.gridView.getCheckedRows();

      let rows = [];
      if (checked.length > 0) {
        for (let i = 0, n = checked.length; i < n; i++) {
          let rowIndex = parseInt(checked[i]);
          let row = this.dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);
          row[ROW_STATUS] = this.dataProvider.getRowState(rowIndex).toUpperCase();
          rows.push(row);
        }
      } else {
        console.log('No row checked');
      }

      if (rows.length === 0) {
        return;
      }

      rows = extractRows(this.gridView, rows, rowExtractor);
      console.log('R_GRID getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows, nullReplacer);
    }

    if (referType === GRID_REFER_TYPE.ALL) {
      let rows = [];
      for (let i = 0, n = this.dataProvider.getRowCount(); i < n; i++) {
        let row = this.dataProvider.getOutputRow(this.dataOutputOptions, i);
        row[ROW_STATUS] = this.dataProvider.getRowState(i).toUpperCase();
        rows.push(row);
      }

      if (rows.length === 0) {
        return;
      }

      rows = extractRows(this.gridView, rows, rowExtractor);
      console.log('R_GRID getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows, nullReplacer);
    }

    if (referType === GRID_REFER_TYPE.CELLVALUE) {
      if (this.dataProvider.getRowCount() === 0) {
        return;
      }

      let current = this.gridView.getCurrent();
      let row = this.dataProvider.getOutputRow(this.dataOutputOptions, current.dataRow);
      let value = row[current.fieldName];

      console.log('R_GRID getValue [cellValue] : \n', value);
      return value;
    }

    if (referType === GRID_REFER_TYPE.ROWCOUNT) {
      let rowCount = this.gridView.getDataSource().getRowCount();
      console.log('R_GRID getValue [rowCount] : \n', rowCount);
      return rowCount;
    }

    if (referType === GRID_REFER_TYPE.CHECKED_ROWCOUNT) {
      let checkedRowCount = this.gridView.getCheckedRows().length;
      console.log('R_GRID getValue [checked rowCount] : \n', checkedRowCount);
      return checkedRowCount;
    }

    if (referType === GRID_REFER_TYPE.SELECTED_ROWCOUNT) {
      let selectedRowCount = this.gridView.getSelectedRows().length;
      console.log('R_GRID getValue [selected rowCount] : \n', selectedRowCount);
      return selectedRowCount;
    }

    if (referType === GRID_REFER_TYPE.CHANGED_ROWCOUNT) {
      let statRows = this.dataProvider.getAllStateRows();
      let changedRowCount = statRows.updated.length + statRows.created.length;

      console.log('R_GRID getValue [changed rowCount] : \n', changedRowCount);
      return changedRowCount;
    }

    if (referType === GRID_REFER_TYPE.UPDATED_ROWCOUNT) {
      let statRows = this.dataProvider.getAllStateRows();

      let updatedRowCount = statRows.updated.length;
      console.log('R_GRID getValue [updated rowCount] : \n', updatedRowCount);
      return updatedRowCount;
    }

    if (referType === GRID_REFER_TYPE.CREATED_ROWCOUNT) {
      let statRows = this.dataProvider.getAllStateRows();
      let createdRowCount = statRows.created.length;

      console.log('R_GRID getValue [created rowCount] : \n', createdRowCount);
      return createdRowCount;
    }

    if (referType === GRID_REFER_TYPE.F_VALUE) {
      let resultValue;
      let current = this.gridView.getCurrent();
      let currentColumnId = current.column;
      let currentDataColumn = {};

      let dataColumns = this.gridView.dataColumns;
      for (let i = 0, n = dataColumns.length; i < n; i++) {
        if (dataColumns[i].name === currentColumnId) {
          currentDataColumn = dataColumns[i];
        }
      }

      if (currentDataColumn.isIterationColumn) {
        let prefix = vom.get(this.viewId).propColumnIterationPrefix(this.gridView.orgId, currentDataColumn.columnIdOrg);
        let postfix = vom.get(this.viewId).propColumnIterationPostfix(this.gridView.orgId, currentDataColumn.columnIdOrg);

        currentColumnId = currentColumnId.replace(prefix, '');
        currentColumnId = currentColumnId.replace(postfix, '');
      }

      resultValue = currentColumnId;

      console.log('R_GRID getValue [F_Value] : \n', resultValue);
      return resultValue;
    }

    return null;
  }

  setValue(resultData) {
    let me = this;
    if (!resultData || resultData.length <= 0) {
      this.gridView.hideToast();
      this.initData(this.id);
      return;
    } else {
      this.loadProcessFlagOn();
    }

    this.gridView.bindingStatus = 'INIT';

    let prefInfoDB;
    if (this.gridView.prefInfo) {
      prefInfoDB = TAFFY(this.gridView.prefInfo);
    }

    this.gridView.dataColumns = [];
    this.dataProvider.clearRows();
    this.dataProvider.clearSavePoints();
    this.gridView.setAllCheck(false);

    let fixedOptions = this.gridView.getFixedOptions();
    fixedOptions.rowCount = 0;
    this.gridView.setFixedOptions(fixedOptions);

    let columns = [];
    let gridFields = [];

    let arrArrangedColumns = vom.get(this.viewId).getArrangedColumns(this.id);

    if (!(resultData instanceof Array)) {
      this.gridView.hideToast();
      console.warn('grid data type is not matched');
      return;
    }

    let dataFieldNames = Object.keys(resultData[0]);
    let columnFixIndex = 0;
    let isFixed = false;
    let fixedColumnMap = {};

    let staticColumnsMap = {};
    let staticGridGroupHeaders = [];

    let columnIndexNo = 0;
    this.gridView.headerDepth = 0;

    for (let arrIdx = 0, arrLen = arrArrangedColumns.length; arrIdx < arrLen; arrIdx++) {
      let arrangedColumns = arrArrangedColumns[arrIdx];
      if (!vom.get(this.viewId).isIterationColumn(this.id, arrangedColumns[0])) {
        let groupWidth = 0;
        let dataColumns = [];

        for (let arrangedColumnsIdx = 0, length = arrangedColumns.length; arrangedColumnsIdx < length; arrangedColumnsIdx++) {
          let columnId = arrangedColumns[arrangedColumnsIdx];
          gridFields.push(createField(columnId, this.id, columnId, this.gridView, this.viewId));

          if (vom.get(this.viewId).hasCandidateReferenceColumn(this.id, columnId)) {
            gridFields.push(createField(columnId + LABEL_FIELD, this.id, columnId, this.gridView, this.viewId));
          }

          let dataColumn = createDataColumn(this.gridView, columnId, this.id, columnId, false, this.viewId);
          dataColumn.columnIndexNo = columnIndexNo;
          columnIndexNo++;

          if (!isFixed) {
            let isFixedCol = isFixedColumn(this.id, arrangedColumns, this.viewId);
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
        let groupHeader = vom.get(this.viewId).propColumnGroups(this.id, arrangedColumns[0]);
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
              if (vom.get(this.viewId).isColumnVisible(arrangedColumns[columnIdx])) {
                groupColumnVisible = true;
              }

              let headerBackground = vom.get(this.viewId).propColumnHeaderBackground(this.id, arrangedColumns[columnIdx]);
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
            header.styles = headerStyles;

            let groupColumn = {};
            groupColumn.type = 'group';
            groupColumn.name = arrangedColumns.toString() + '_' + groupHeader;
            groupColumn.width = 0;
            groupColumn.header = header;
            groupColumn.visible = groupColumnVisible;
            groupColumn.orientaion = 'horizontal';
            groupColumn.columns = [];
            groupColumn.level = groupHeadersIndex;

            if (this.gridView.headerDepth < groupHeadersIndex + 1) {
              this.gridView.headerDepth = groupHeadersIndex + 1;
            }

            if (!isFixed || fixedColumnMap.hasOwnProperty(arrangedColumns.toString())) {
              let isFixedCol = isFixedColumn(this.id, arrangedColumns, this.viewId);
              groupColumn.isFixed = isFixedCol;
              isFixed = isFixedCol;
              if (isFixedCol) {
                fixedColumnMap[arrangedColumns.toString()] = true;
              }
            } else {
              groupColumn.isFixed = false;
            }

            if (groupHeaders.length === groupHeadersIndex + 1) {
              groupColumn.columns = groupColumn.columns.concat(dataColumns);
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
              staticColumnsMap[groupHeader].columns = staticColumnsMap[groupHeader].columns.concat(groupColumn.columns);
              staticColumnsMap[groupHeader].width = staticColumnsMap[groupHeader].width + groupColumn.width;
              columnsConcatFlag = false;
            }

            let parent = groupHeaders[groupHeadersIndex - 1];
            if (parent && columnsConcatFlag) {
              staticColumnsMap[parent].columns.push(groupColumn);
            }
          }
        } else {
          staticColumnsMap[dataColumns[0].name] = dataColumns[0];
        }
      } else {
        let columnsMap = {};
        let dynamicFieldNames = [];

        for (let arrangedColumnsIdx = 0, arrangedColumnsLen = arrangedColumns.length; arrangedColumnsIdx < arrangedColumnsLen; arrangedColumnsIdx++) {
          let columnId = arrangedColumns[arrangedColumnsIdx];
          let columnPrefix = vom.get(this.viewId).propColumnIterationPrefix(this.id, columnId);
          let columnPostfix = vom.get(this.viewId).propColumnIterationPostfix(this.id, columnId);

          let names = [];
          for (let dataFieldIdx = 0, dataFieldLen = dataFieldNames.length; dataFieldIdx < dataFieldLen; dataFieldIdx++) {
            let fieldName = dataFieldNames[dataFieldIdx];
            if ((fieldName.startsWith(columnPrefix) && fieldName.endsWith(columnPostfix))
                || (fieldName.startsWith(columnPrefix) && fieldName.endsWith(transLangKey(columnPostfix)))) {
              names.push(fieldName);
            }
          }

          let ordinalPosition = vom.get(this.viewId).propColumnIterationOrdinalPosition(this.id, columnId);

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
            let columnIterationPrefix = vom.get(this.viewId).propColumnIterationPrefix(this.id, iterationColumnId);
            let columnIterationPostfix = vom.get(this.viewId).propColumnIterationPostfix(this.id, iterationColumnId);

            if ((fieldName.startsWith(columnIterationPrefix) && fieldName.endsWith(columnIterationPostfix))
                || (fieldName.startsWith(columnIterationPrefix) && fieldName.endsWith(transLangKey(columnIterationPostfix)))) {

              gridFields.push(createField(fieldName, this.id, iterationColumnId, this.gridView, this.viewId));
              let dataColumn = createDataColumn(this.gridView, fieldName, this.id, iterationColumnId, true, this.viewId);
              dataColumn.columnIndexNo = columnIndexNo;
              columnIndexNo++;

              if (!isFixed) {
                let isFixedCol = isFixedColumn(this.id, arrangedColumns, this.viewId);
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

              if (vom.get(this.viewId).propColumnIterationPrefixRemove(this.id, iterationColumnId)) {
                groupHeader = groupHeader.replace(columnIterationPrefix, '');
                groupHeader = groupHeader.replace(transLangKey(columnIterationPrefix), '');
              }

              if (vom.get(this.viewId).propColumnIterationPostfixRemove(this.id, iterationColumnId)) {
                groupHeader = groupHeader.replace(columnIterationPostfix, '');
                groupHeader = groupHeader.replace(transLangKey(columnIterationPostfix), '');
              }

              let groupHeaders = [];
              if (groupHeader.length > 0) {
                if (vom.get(this.viewId).hasColumnIterationDelimiter(this.id, iterationColumnId)) {
                  let delimiterOnColumn = vom.get(this.viewId).propColumnIterationDelimiter(this.id, iterationColumnId);

                  if (groupHeader.lastIndexOf(delimiterOnColumn) == groupHeader.length - 1) {
                    groupHeader = groupHeader.substring(0, groupHeader.length - 1);
                  }

                  let groupHeaderSplitResult_1 = groupHeader.split(delimiterOnColumn);

                  let delimiterOnCrosstabInfo = ',';
                  let crossTabInfo = this.gridView.crossTabInfo;
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

              if (vom.get(this.viewId).propColumnIterationHeaderSeq(this.id, iterationColumnId) === 'desc') {
                groupHeaders.reverse();
              }

              if (vom.get(this.viewId).hasColumnTitle(this.id, iterationColumnId)) {
                dataColumn.header.text = transLangKey(vom.get(this.viewId).propColumnTitle(this.id, iterationColumnId));
              } else {
                let dataColumnHeaderText = groupHeaders[groupHeaders.length - 1];
                let prefFieldApplyCd, prefFieldApplyCdLang;
                if (prefInfoDB) {
                  let prefField = prefInfoDB().filter({fldCd: dataColumnHeaderText}).get()[0];
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
                    if (vom.get(this.viewId).isColumnVisible(arrangedColumns[columnIdx])) {
                      groupColumnVisible = true;
                    }

                    let headerBackground = vom.get(this.viewId).propColumnHeaderBackground(this.id, arrangedColumns[columnIdx]);
                    if (headerBackground) {
                      headerBackgroundColors.push(headerBackground);
                    }
                  }

                  let headerStyles = {};

                  if (headerBackgroundColors.length > 0) {
                    headerStyles.background = headerBackgroundColors[0];
                  }

                  let groupColumn = {};
                  groupColumn.type = 'group';
                  groupColumn.name = arrangedColumns.toString() + '_' + groupHeaderText;
                  groupColumn.width = 0;
                  groupColumn.visible = groupColumnVisible;
                  groupColumn.orientaion = 'horizontal';
                  groupColumn.columns = [];
                  groupColumn.level = groupHeadersIndex;

                  if (this.gridView.headerDepth < groupHeadersIndex + 1) {
                    this.gridView.headerDepth = groupHeadersIndex + 1;
                  }

                  let tempColumnTitle = vom.get(this.viewId).propColumnTitle(this.id, iterationColumnId);
                  if (groupColumn.level === 0 && tempColumnTitle) {
                    if (tempColumnTitle.toUpperCase() === PREF_FIELD_NM) {
                      if (prefInfoDB) {
                        let columnPrefInfo = prefInfoDB().filter({fldCd: iterationColumnId}).get()[0];

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
                  header.styles = headerStyles;
                  groupColumn.header = header;

                  groupColumn.columnIdOrg = iterationColumnId;
                  if (!isFixed || fixedColumnMap.hasOwnProperty(arrangedColumns.toString())) {
                    let isFixedCol = isFixedColumn(this.id, arrangedColumns, this.viewId);
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
                      columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier].columns.push(dataColumn);
                      columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier].width = columnsMap[groupHeadersIndex + '_' + groupHeaderText + groupIdentifier].width + groupWidth;
                    } else {
                      groupColumn.columns.push(dataColumn);
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
                    columnsMap[(groupHeadersIndex - 1) + '_' + parent + groupIdentifier].columns.push(groupColumn);
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
            if (column.type === 'group') {
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

    this.gridView.staticColumnsMap = staticColumnsMap;

    cleanupGroupColumns(columns);

    let columnKeys = Object.keys(staticColumnsMap);
    let staticColumns = [];
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
      if (typeof column !== 'undefined' && column.type === 'group') {
        if (column.columns.length < 1) {
          delete staticColumnsMap[key];
        } else {
          cleanupGroupColumns(column.columns);
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

    console.log('Complete create fields @', this.id, '\n', gridFields);
    console.log('Complete create columns @', this.id, '\n', columns);

    this.columns = columns;
    this.gridView.setColumns(columns);
    this.dataProvider.setFields(gridFields);
    setNumberComparer(this.id, this.dataProvider, this.gridView.dataColumns, this.viewId);
    let targetResultData = this.onRGridDataFillReady(this.viewId, this.id, this.gridView, resultData);
    if (!targetResultData) {
      console.warn('\'onRGridDataFillReady\' did not return result. Maintain the original result data. Check custom function prototype \'onRGridDataFillReady\' on template.');
      targetResultData = resultData;
    }

    let pageable = vom.get(this.viewId).propPageable(this.id);
    if (pageable) {
      initPaging(this.id, this.gridView, this.dataProvider, targetResultData, this.viewId);
    } else {
      this.dataProvider.fillJsonData(targetResultData, {});
    }
    if (isFixed) {
      for (let i = 0, columnsLen = columns.length; i < columnsLen; i++) {
        let column = columns[i];
        if (this.gridView.invisibleColumnIds.length > 0) {
          let isHorizontalValue = false;
          if (this.gridView.crossTabInfo !== undefined) {
            if (Object.keys(this.gridView.crossTabInfo).includes('itc1to2')) {
              if(Object.keys(this.gridView.crossTabInfo['itc1to2']).includes('group-horizontal-values')) {
                this.gridView.crossTabInfo['itc1to2']['group-horizontal-values'].map(function(el){
                  if (column.name.includes(el)){
                    isHorizontalValue = true
                  }
                })
              }
            }
          }
          if (column.visible && !this.gridView.invisibleColumnIds.includes(column.name) && !isHorizontalValue) {
            columnFixIndex++;
          }
        } else {
          if (column.visible) {
            columnFixIndex++;
          }
        }

        if (column.isFixed) {
          this.gridView.colFixed = true;
          this.gridView.fixedColumn = column;
          break;
        }
      }

      if (columnFixIndex > 0) {
        let fixedOptions = new RealGridJS.FixedOptions();
        this.gridView.fixedColCount = columnFixIndex;
        fixedOptions.colCount = columnFixIndex;
        fixedOptions.resizable = true;

        this.gridView.setFixedOptions(fixedOptions);
      }
    }
    setGridSortOrder(this.gridView, this.id, dataFieldNames, this.viewId);
    setInitGroupOrder(this.gridView, this.id, this.viewId);

    this.gridView.styleExceptCells = [];

    this.gridView.clearCellStyles();
    applyCellAttributes(this.id, null, null, null, null, this.viewId);


    window.requestAnimationFrame(function () {
      me.gridView.bindingStatus = 'RDY';
    });

    com.get(this.viewId).getComponent(this.id).rollbackId = this.dataProvider.savePoint();
    doGridResize(this.viewId);

    if (this.gridView.lookups && Object.getOwnPropertyNames(this.gridView.lookups).length > 0) {
      arrangeLookups(this, this.dataProvider, this.viewId);
    }

    if (this.gridView.invisibleColumnIds && this.gridView.invisibleColumnIds.length > 0) {
      let invisible = this.gridView.invisibleColumnIds.unique();
      let dataColumnDB = TAFFY(this.gridView.dataColumns);

      setTimeout(function () {
        for (let i = 0, invisibleLength = invisible.length; i < invisibleLength; i++) {
          let actualColumns = dataColumnDB().filter({ columnIdOrg: invisible[i] }).get();
          for (let j = 0, actualColumnsLength = actualColumns.length; j < actualColumnsLength; j++) {
            me.gridView.setColumnProperty(actualColumns[j].name, 'visible', false);
            if (me.gridView.prefInfo && me.gridView.prefInfo.length > 0 && prefInfoDB.length > 0) {
              me.gridView.setColumnProperty(actualColumns[j].name, 'width', prefInfoDB().filter({ fldCd: actualColumns[j].columnIdOrg }).get()[0].fldWidth);
            }
          }
        }
      }, 300);

      this.gridView.invisibleColumnIds = [];
    }

    this.gridView.hideToast();
    
    console.log('Complete data binding @', this.id);

    window.requestAnimationFrame(function () {
      me.gridView.activatedColumnFilters = {};
      setGridFilters(me.gridView, me.id, me.dataProvider, staticColumnsMap, me.viewId);
    });

    window.requestAnimationFrame(function () {
      fitGridData(me.gridView);
    });
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    this.gridView.setCurrent();

    operationId = operationId.toUpperCase();
    if (!operationId.startsWith('SET')) {
      if (this.gridView.isColumnValidationFail) {
        this.gridView.cancel();
      } else {
        this.gridView.commit();
      }
    }

    if (operationId !== 'INIT' && !vom.get(me.viewId).hasOperation(this.id, operationId)) {
      console.error(`Operation '${operationId}' is not defined @ '${this.id}`);
      return;
    } else {
      console.log('Do operation', operationId, '@', this.id);
    }

    if (operationId === 'INIT') {
      this.initData(this.id, operationId, successFunc, completeFunc);
    } else if (operationId.startsWith('LOAD')) {
      this.loadData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, this.viewId);
    } else if (operationId.startsWith('SAVE')) {
      this.saveData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('REFRESH')) {
      this.refreshData(this.id, operationId, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('INSERT_ROW')) {
      this.insertRow(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('REMOVE_ROW')) {
      this.removeRow(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('COPY')) {
      this.copyData(this.id, operationId, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('SET')) {
      this.setRowValue(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId === 'ROLLBACK') {
      this.rollbackData(this.id);
    } else if (operationId.startsWith('IMPORT')) {
      this.importData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('EXPORT')) {
      this.exportData(this.id, operationId, successFunc, failFunc, completeFunc);
    } else if (operationId === 'GRID_VALIDATE') {
      this.gridValidate(this.id);
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    } else {
      callService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, this.viewId);
    }
  }

  doToolbarSuccessOperation(componentId, toolbarId, result) {
    console.log('Do toolbar success operations with', toolbarId + '@' + this.id);
    let operationCallIds = vom.get(this.viewId).getToolbarSuccessOperationCallIds(this.id, toolbarId);
    vsm.get(this.viewId, "operationManager").doRecursiveOperation(this.id, operationCallIds, result)
  }

  doToolbarFailOperation(componentId, toolbarId, result) {
    console.log('Do toolbar fail operations with', toolbarId + '@' + this.id);
    let operationCallIds = vom.get(this.viewId).getToolbarFailOperationCallIds(this.id, toolbarId);
    vsm.get(this.viewId, "operationManager").doRecursiveOperation(this.id, operationCallIds, result)
  }

  doToolbarCompleteOperation(componentId, toolbarId, result) {
    console.log('Do toolbar complete operations with', toolbarId + '@' + this.id);
    let operationCallIds = vom.get(this.viewId).getToolbarCompleteOperationCallIds(this.id, toolbarId);
    vsm.get(this.viewId, "operationManager").doRecursiveOperation(this.id, operationCallIds, result)
  }

  initData(componentId, operationId, successFunc, completeFunc) {
    let me = this;
    this.gridView.setAllCheck(false);
    this.gridView.colFixed = false;
    this.gridView.rowFixed = false;
    this.gridView.widthFitted = false;

    if (this.gridView.hidedColumnNames) {
      for (let i = 0, n = this.gridView.hidedColumnNames.length; i < n; i++) {
        let column = this.gridView.columnByName(this.gridView.hidedColumnNames[i]);
        if (column) {
          this.gridView.setColumnProperty(column, 'visible', true);
        }
      }

      this.gridView.hidedColumnNames = [];
    }

    this.dataProvider.clearRows();
    this.dataProvider.clearSavePoints();

    // for candidate column
    let dataColumnsDb = TAFFY(this.gridView.dataColumns);
    let candidateColumns = dataColumnsDb().filter({ isCandidateColumn: true }).get();
    for (let i = 0, n = candidateColumns.length; i < n; i++) {
      let dataColumn = candidateColumns[i];
      let columnName = candidateColumns[i].name;
      let columnIdOrg = candidateColumns[i].columnIdOrg;

      dataColumn = processCandidateColumn(this.id, columnIdOrg, this.gridView, dataColumn, me.viewId);

      let candidateColumn = this.gridView.columnByName(columnName);
      candidateColumn.labels = dataColumn.labels;
      candidateColumn.values = dataColumn.values;

      this.gridView.setColumn(candidateColumn);
    }

    console.log('Grid / Data Initialized');

    let fixedOptions = this.gridView.getFixedOptions();
    fixedOptions.rowCount = 0;
    this.gridView.setFixedOptions(fixedOptions);

    let gridPaging = this.element.querySelector('.ui_gridPaging');
    if (gridPaging) {
      let parent = gridPaging.parentNode;
      parent.removeChild(gridPaging);
    }

    this.element.style.marginBottom = '0px';

    if (operationId && (successFunc || completeFunc)) {
      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);
    }
  }

  loadData(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc, viewId) {
    let me = this;
    this.gridView.cancel();

    setGridPreferenceInfo(this.gridView, viewId);
    setGridCrosstabInfo(this.gridView, viewId);

    this.gridView.colFixed = false;
    this.gridView.rowFixed = false;
    this.gridView.widthFitted = false;

    if (this.gridView.hidedColumnNames) {
      for (let i = 0; i < this.gridView.hidedColumnNames.length; i++) {
        let column = this.gridView.columnByName(gridView.hidedColumnNames[i]);
        this.gridView.setColumnProperty(column, 'visible', true);
      }
      this.gridView.hidedColumnNames = [];
    }

    this.gridView.showToast(progressSpinner + 'Loading data...', true);
    console.log('Begin operation', operationId, '@', this.id);

    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

    this.dataparams[this.id] = paramMap;
    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(paramMap, this.id, operationId, successFunc, combine(this.loadFail, failFunc), completeFunc, this.viewId);
    } else {
      callService(paramMap, this.id, operationId, combine(this.loadProcess, successFunc), combine(this.loadFail, failFunc), completeFunc, this.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    console.log('Starts data binding @', componentId, '\n', data);

    let resultData = data[RESULT_DATA];
    if (!resultData || resultData.length === 0) {
      console.warn('Response No Data\n', operationId, '@', componentId);
    }

    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }

  loadFail(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).gridView.hideToast();

    console.error(operationId, 'failed');
  }

  saveData(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;

    if (operationId === 'SAVE') {
      showDialog('Save', 'Are you sure to Save?', DIALOG_TYPE.CONFIRM).then(function (answer) {
        if (answer) {
          me.gridView.showToast(progressSpinner + 'Saving data...', true);
          console.log('Saving data : Begin');

          let paramMap = getCompleteParamMap(me.id, operationId, actionParamMap, me.viewId);

          callService(paramMap, me.id, operationId, combine(me.saveProcess, successFunc), combine(me.saveFail, failFunc), completeFunc, me.viewId);
        } else {
          me.gridView.hideToast();
          waitOff('body');
          showToastMessage('Canceled', 'Canceled save data.', 1000);
        }
      });
    } else {
      this.gridView.showToast(progressSpinner + 'Saving data...', true);
      console.log('Saving data : Begin');

      let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      callService(paramMap, this.id, operationId, combine(this.saveProcess, successFunc), combine(this.saveFail, failFunc), completeFunc, me.viewId);
    }
  }

  saveProcess(componentId, operationId, data) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    let gridView = com.get(activeId).getComponent(componentId).gridView;
    if (data[RESULT_SUCCESS] === false) {
      gridView.hideToast();
      console.error(operationId, 'Saving data : Fail(Internal Server Error)\n');
    } else {
      gridView.getDataSource().clearRowStates(true, false);

      gridView.hideToast();
      console.log('Saving data : Success\n', data);
    }
  }

  saveFail(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).gridView.hideToast();
    console.error(operationId, 'Saving data : Fail(Service Call Fail)\n');
  }

  refreshData(componentId, operationId, successFunc, failFunc, completeFunc) {
    let dataParams = this.dataparams[this.id];

    let serviceCallId = vom.get(this.viewId).getServiceCallIds(this.id, operationId)[0];
    let service = vom.get(this.viewId).getServiceCallServiceId(this.id, operationId, serviceCallId);
    let target = vom.get(this.viewId).getServiceCallServiceTarget(this.id, operationId, serviceCallId);
    let timeout = vom.get(this.viewId).getServiceCallTimeoutSec(this.id, operationId, serviceCallId);

    if (service && target) {
      dataParams.service = service;
      dataParams.target = target;
      if (timeout) {
        dataParams.timeout = timeout;
      }
    }

    if (dataParams) {
      this.gridView.showToast(progressSpinner + 'Refreshing data...', true);
      console.log('Refreshing data : Begin');

      callService(dataParams, this.id, operationId, combine(this.refreshProcess, successFunc), combine(this.loadFail, failFunc), completeFunc, this.viewId);
    }
  }

  refreshProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    console.log('Refreshing data starts \n', data);

    let component = com.get(activeId).getComponent(componentId);
    let gridView = component.gridView;

    let resultData = data[RESULT_DATA];
    let dataFieldNames = [];
    if (!resultData || resultData.length === 0) {
      gridView.hideToast();
      console.warn('Refreshing data for ' + componentId + ' / ' + operationId + ' : Response No Data\n');
      
    } else {
      dataFieldNames = Object.keys(resultData[0]);
    }

    gridView.bindingStatus = 'INIT';

    let dataProvider = gridView.getDataSource();

    let pageable = vom.get(activeId).propPageable(componentId);
    if (pageable) {
      initPaging(componentId, gridView, dataProvider, resultData, activeId);
    } else {
      dataProvider.fillJsonData(resultData, {});
    }

    setGridSortOrder(gridView, componentId, dataFieldNames, activeId);
    setInitGroupOrder(gridView, componentId, activeId);

    gridView.styleExceptCells = [];

    gridView.clearCellStyles();
    applyCellAttributes(componentId, null, null, null, null, activeId);
    window.requestAnimationFrame(function () {
      gridView.bindingStatus = 'RDY';
    });

    component.rollbackId = dataProvider.savePoint();

    doGridResize(activeId);

    if (gridView.lookups && Object.getOwnPropertyNames(gridView.lookups).length > 0) {
      arrangeLookups(component, dataProvider, activeId);
    }

    if (gridView.invisibleColumnIds && gridView.invisibleColumnIds.length > 0) {
      let invisible = gridView.invisibleColumnIds.unique();
      let dataColumnDB = TAFFY(gridView.dataColumns);

      setTimeout(function () {
        for (let i = 0, n = invisible.length; i < n; i++) {
          let actualColumns = dataColumnDB().filter({columnIdOrg: invisible[i]}).get();
          for (let j = 0, m = actualColumns.length; j < m; j++) {
            gridView.setColumnProperty(actualColumns[j].name, 'visible', false);
          }
        }
      }, 300);

      gridView.invisibleColumnIds = [];
    }

    gridView.hideToast();

    console.log('Complete data binding @', componentId);

    window.requestAnimationFrame(function () {
      gridView.activatedColumnFilters = {};
      if(gridView.staticColumnsMap !== undefined) {
        setGridFilters(gridView, component.id, dataProvider, gridView.staticColumnsMap, activeId);
      }
    });

    window.requestAnimationFrame(function () {
      fitGridData(gridView);
    });

    component.doAfterSetData(serviceCallId, resultData, data);

    gridView.hideToast();
  }

  insertRow(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let fieldNames = this.dataProvider.getFieldNames();
    let insertRowPosition = vom.get(this.viewId).propOperationPosition(this.id, operationId);
    let editOnCell = vom.get(this.viewId).propOperationEditOnCell(this.id, operationId);

    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

    let setDefaultParamIdPattern = /SET_DEFAULT.*/gi;
    let setDefaultParamIds = Object.keys(paramMap).filter(function (paramId) {
      let test = paramId.match(setDefaultParamIdPattern);
      if (test && test.length > 0) {
        return test[0];
      }
    });

    let doBeforeServiceCallResult = this.doBeforeServiceCall(paramMap, this.id, operationId);
    paramMap = doBeforeServiceCallResult.paramMap;

    let targetColumnIds = {};
    if (setDefaultParamIds.length > 0 && !setDefaultParamIds.includes('SET_DEFAULT')) {
      let setDefaultDatas = {};

      let maxLength = 0;
      let maxParam = '';
      for (let i = 0, len = setDefaultParamIds.length; i < len; i++) {
        let temp = paramMap[setDefaultParamIds[i]];
        if (isJson(temp)) {
          temp = JSON.parse(temp);
          setDefaultDatas[setDefaultParamIds[i]] = temp;
          if (maxLength < temp.length) {
            maxLength = temp.length;
            maxParam = setDefaultParamIds[i];
          }
        } else {
          setDefaultDatas[setDefaultParamIds[i]] = temp;
          if (maxLength < 1) {
            maxLength = 1;
            maxParam = setDefaultParamIds[i];
          }
        }

        let arrTemp = setDefaultParamIds[i].split('-to-');
        if (arrTemp.length === 2) {
          targetColumnIds[setDefaultParamIds[i]] = arrTemp[1];
        }
      }

      let dataRows = [];
      if (maxLength > 1 && maxParam.length > 0) {
        for (let i = 0, len = setDefaultDatas[maxParam].length; i < len; i++) {
          let dataRow = {};
          let targetColumnIdsKeys = Object.keys(targetColumnIds);
          for (let j = 0, keysLen = targetColumnIdsKeys.length; j < keysLen; j++) {
            let targetColumnIdKey = targetColumnIdsKeys[j];
            let field = targetColumnIds[targetColumnIdKey];
            let value = setDefaultDatas[targetColumnIdKey];

            if (field && fieldNames.includes(field)) {
              if (DATETIME_DATA_TYPE.includes((vom.get(this.viewId).propColumnType(this.id, field)).toUpperCase())) {
                value = getDateFromDateString(value);
              }

              if (value instanceof Array) {
                dataRow[field] = Object.values(value[i])[0];
              } else {
                dataRow[field] = value;
              }
            } else {
              console.warn('Field(Column) \'' + field + '\' is not exist @ ' + this.id + '!');
            }
          }

          if (GRID_INSERT_ROW_INIT_ID && fieldNames.includes(GRID_INSERT_ROW_INIT_ID_FIELD)) {
            dataRow[GRID_INSERT_ROW_INIT_ID_FIELD] = generateId();
          }
          dataRows.push(dataRow);
        }
      } else {
        let dataRow = {};

        let targetColumnIdsKeys = Object.keys(targetColumnIds);
        for (let j = 0, keysLen = targetColumnIdsKeys.length; j < keysLen; j++) {
          let targetColumnIdKey = targetColumnIdsKeys[j];
          let field = targetColumnIds[targetColumnIdKey];
          let value = setDefaultDatas[targetColumnIdKey];

          if (field && fieldNames.includes(field.toUpperCase())) {
            if (DATETIME_DATA_TYPE.includes((vom.get(this.viewId).propColumnType(this.id, field)).toUpperCase())) {
              value = getDateFromDateString(value);
            }

            if (value instanceof Array) {
              dataRow[field] = Object.values(value[0])[0];
            } else {
              dataRow[field] = value;
            }
          } else {
            console.warn('Field(Column) \'' + field + '\' is not exist @ ' + this.id + '!');
          }
        }

        if (GRID_INSERT_ROW_INIT_ID && fieldNames.includes(GRID_INSERT_ROW_INIT_ID_FIELD)) {
          dataRow[GRID_INSERT_ROW_INIT_ID_FIELD] = generateId();
        }
        dataRows.push(dataRow);
      }

      if (this.gridView.isGrouped()) {
        let current = clone(this.gridView.getCurrent());
        this.dataProvider.addRows(dataRows, 0, -1);
        setInitGroupOrder(this.gridView, this.id, this.viewId);
        this.gridView.setSelection({startItem: current.itemIndex, endItem: current.itemIndex, style: 'rows'});
      } else {
        if (dataRows.length === 1) {
          insertRowActual(this.gridView, this.dataProvider, insertRowPosition, editOnCell, dataRows[0]);
        } else if (dataRows.length > 1) {
          this.dataProvider.addRows(dataRows, 0, -1);
        }
      }

      this.gridView.commit(true);
    } else if (setDefaultParamIds.length > 0 && setDefaultParamIds.includes('SET_DEFAULT')) {
      if (isJson(paramMap['SET_DEFAULT'])) {
        let values = JSON.parse(paramMap['SET_DEFAULT']);
        if (values instanceof Array) {
          for (let valueIdx = 0, valuesLen = values.length; valueIdx < valuesLen; valueIdx++) {
            let setDefaultValues = values[valueIdx];

            if (GRID_INSERT_ROW_INIT_ID && fieldNames.includes(GRID_INSERT_ROW_INIT_ID_FIELD)) {
              setDefaultValues[GRID_INSERT_ROW_INIT_ID_FIELD] = generateId();
            }

            if (this.gridView.isGrouped()) {
              let current = clone(this.gridView.getCurrent());
              this.dataProvider.addRows([setDefaultValues], 0, -1);
              setInitGroupOrder(this.gridView, this.id, this.viewId);
              this.gridView.setSelection({
                startItem: current.itemIndex,
                endItem: current.itemIndex,
                style: 'rows'
              });
            } else {
              this.dataProvider.addRows([setDefaultValues], 0, -1);
            }

            this.gridView.commit(true);
          }
        }
      }
    } else {
      if (GRID_INSERT_ROW_INIT_ID && fieldNames.includes(GRID_INSERT_ROW_INIT_ID_FIELD)) {
        let setDefaultValues = {};
        setDefaultValues[GRID_INSERT_ROW_INIT_ID_FIELD] = generateId();

        if (this.gridView.isGrouped()) {
          let current = clone(this.gridView.getCurrent());
          this.dataProvider.addRows([setDefaultValues], 0, -1);
          setInitGroupOrder(this.gridView, this.id, this.viewId);
          this.gridView.setSelection({
            startItem: current.itemIndex,
            endItem: current.itemIndex,
            style: 'rows'
          });
        } else {
          insertRowActual(this.gridView, this.dataProvider, insertRowPosition, editOnCell, setDefaultValues);
        }
      } else {
        insertRowActual(this.gridView, this.dataProvider, insertRowPosition, editOnCell);
      }

      this.gridView.commit(true);
    }

    this.gridView.clearCellStyles();
    applyCellAttributes(this.id, null, null, null, null, this.viewId);

    setTimeout(function () {
      window.requestAnimationFrame(function () {
        let current = me.gridView.getCurrent();
        let lookupReference = me.gridView.lookupReference;
        let lookupColumnIds = Object.getOwnPropertyNames(lookupReference);

        for (let i = 0; i < lookupColumnIds.length; i++) {
          let lookupColumnId = lookupColumnIds[i];
          let keyColumnId = lookupReference[lookupColumnId];
          changeLookupDropDown(me.gridView, me.gridView.getValue(current.itemIndex, keyColumnId), lookupColumnId, me.viewId);

          if (fieldNames.includes(lookupColumnId + LABEL_FIELD)) {
            let values = me.gridView.columnByName(lookupColumnId).values;
            let labels = me.gridView.columnByName(lookupColumnId).labels;
            let lookupColumnValue = me.gridView.getValue(current.itemIndex, lookupColumnId);
            let label = labels[values.indexOf(lookupColumnValue)];

            if (label) {
              me.gridView.setValue(current.itemIndex, lookupColumnId + LABEL_FIELD, label);
            }
          }
        }
        current = null;
      });
    }, 10);

    if (operationId && (successFunc || completeFunc)) {
      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);
    }
  }

  removeRow(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let checkedRows = this.gridView.getCheckedRows();
    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

    if (checkedRows.length <= 0) {
      console.warn('No row(s) checked to Delete.');
      showDialog('Delete', 'No row(s) checked to Delete', DIALOG_TYPE.ALERT);
    } else {
      showDialog('Delete', 'Are you sure to Delete?', DIALOG_TYPE.CONFIRM).then(function (answer) {
        if (answer) {
          me.gridView.showToast(progressSpinner + 'Deleting data...', true);

          console.log('Deleting data : Begin');

          let paramMapKeys = Object.keys(paramMap);
          if ((!paramMapKeys.includes('service') || paramMap['service'].length == 0)
              && (!paramMapKeys.includes('url') || paramMap['url'].length == 0)) {
                me.dataProvider.removeRows(checkedRows, false);
                me.gridView.hideToast();
          } else {
            callService(paramMap, me.id, operationId, combine(me.removeSuccess, successFunc), combine(me.removeFail, failFunc), completeFunc, me.viewId);
          }
        }
      });
    }
  }

  removeSuccess(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).gridView.hideToast();
    console.log(operationId, 'Success');
  }

  removeFail(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).gridView.hideToast();
    console.error(operationId, 'Failed');
  }

  copyData(componentId, operationId, successFunc, failFunc, completeFunc) {
    let me = this;
    if (this.dataProvider.getRowCount() <= 0) {
      console.warn('No Data to Copy');
      showDialog('Copy', 'No Data to Copy', DIALOG_TYPE.ALERT);

      return;
    }

    let pageable = vom.get(this.viewId).propPageable(this.id);
    if (pageable) {
      this.gridView.setPaging(false);
    }

    let targetRowIndexes = getTargetRowIndex(this.id, operationId, me.viewId);
    let targetFieldIndexes = getTargetColumnIndexes(this.id, operationId, me.viewId);

    if (targetFieldIndexes.length > 0) {
      let formula = vom.get(this.viewId).getCopyFormulaValue(this.id, operationId);
      let formulaReferId = vom.get(this.viewId).getCopyFormulaReferId(this.id, operationId);
      if (formulaReferId) {
        let referenceComponent = com.get(this.viewId).getComponent(formulaReferId);
        if (referenceComponent) {
          let referVal = referenceComponent.getValue(formulaReferId, formulaReferId);
          if (referVal) {
            formula = referVal;
          }
        }
      }

      for (let i = 0; i < targetRowIndexes.length; i++) {
        let targetReferValues = getTargetReferValues(this.id, operationId, targetRowIndexes[i], this.viewId);
        let sourceRowIndexes = getSourceRowIndexes(this.id, operationId, targetReferValues, this.viewId);
        let sourceColumnIndexes = getSourceColumnIndexes(this.id, operationId, this.viewId);
        let sourceValues = getSourceValues(this.gridView, sourceRowIndexes, sourceColumnIndexes);

        if (Object.getOwnPropertyNames(sourceValues).length > 1 && formula === 'undefined') {
          console.warn('Source values more than 1 row. Formula is not defined.');
          return;
        }

        let calculatedValues = getCalculatedValues(sourceValues, formula);
        let calculatedValuesKeys = Object.getOwnPropertyNames(calculatedValues);

        for (let x = 0; x < calculatedValuesKeys.length; x++) {
          this.dataProvider.setValue(targetRowIndexes[i], targetFieldIndexes[x], calculatedValues[calculatedValuesKeys[x]]);
        }
      }
    }

    if (pageable) {
      let pageSize = vom.get(this.viewId).propPageRowCount(this.id);
      let rowCount = this.dataProvider.getRowCount();

      let remainder = rowCount % pageSize;

      let pageCount = Math.round((rowCount + pageSize / 2) / pageSize);
      if (remainder === 0) {
        pageCount = rowCount / pageSize;
      }
      this.gridView.setPaging(true, pageSize, pageCount);
    }
  }

  setRowValue (componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
    let current = this.gridView.getCurrent();
    let itemIndex = current.itemIndex;
    let pattern = /SET_VALUE.*/gi;

    let setValueParamIds = [];

    let paramIds = Object.getOwnPropertyNames(paramMap);
    for (let i = 0; i < paramIds.length; i++) {
      let test = paramIds[i].match(pattern);
      if (test && test.length > 0) {
        setValueParamIds.push(test[0]);
      }
    }

    let targetColumnIds = {};
    for (let i = 0; i < setValueParamIds.length; i++) {
      let temp = setValueParamIds[i].split('-to-');
      if (temp.length === 2) {
        targetColumnIds[setValueParamIds[i]] = temp[1];
      }
    }

    if (setValueParamIds.length === 1
        && isJson(paramMap[setValueParamIds[0]])
        && targetColumnIds[setValueParamIds[0]] === undefined) {

      let value = JSON.parse(paramMap[setValueParamIds[0]]);
      if (value instanceof Array) {
        let setValues = value[0];
        this.gridView.setValues(itemIndex, setValues);
      }
    } else {
      if (setValueParamIds.length > 0) {
        let setValues = {};
        for (let i = 0; i < setValueParamIds.length; i++) {
          let targetColumnId = targetColumnIds[setValueParamIds[i]];
          if (targetColumnId != undefined && targetColumnId.length > 0) {
            setValues[targetColumnId] = paramMap[setValueParamIds[i]];
          }
        }

        this.gridView.setValues(itemIndex, setValues);
      }
    }

    if (operationId && (successFunc || completeFunc)) {
      successFunc(this.id, operationId, actionParamMap);
      completeFunc(this.id, operationId, actionParamMap);
    }

    setValueParamIds = null;
    current = null;
    paramMap = null;
  }

  rollbackData(componentId) {
    let me = this;
    this.gridView.colFixed = false;
    this.gridView.rowFixed = false;
    this.gridView.widthFitted = false;

    if (this.gridView.hidedColumnNames != undefined) {
      for (let i = 0; i < this.gridView.hidedColumnNames.length; i++) {
        let column = this.gridView.columnByName(this.gridView.hidedColumnNames[i]);
        this.gridView.setColumnProperty(column, 'visible', true);
      }
      this.gridView.hidedColumnNames = [];
    }

    this.dataProvider.rollback(this.rollbackId);
    this.gridView.clearCellStyles();
    applyCellAttributes(this.id, null, null, null, null, this.viewId);

    let fixedOptions = this.gridView.getFixedOptions();
    fixedOptions.rowCount = 0;
    this.gridView.setFixedOptions(fixedOptions);

    doGridResize(me.viewId);
  }

  importData(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let callback = {
      success: successFunc,
      fail: failFunc,
      complete: completeFunc
    };

    this.callback = callback;
    xl.dispatchEvent('click', componentId);
  }

  exportData(componentId, operationId, successFunc, failFunc, completeFunc) {
    let callback = {
      success: successFunc,
      fail: failFunc,
      complete: completeFunc
    };

    this.callback = callback;

    if (this.gridView.isFiltered()) {
      let me  = this;

      showDialog('Filtered Data Exists', 'Filtered data exists.<br>Export All rows?', DIALOG_TYPE.FILTERS).then(function (answer) {
        if (answer === true) {
          xl.exportExcel(me.id, operationId, true);
        } else if (answer === false) {
          xl.exportExcel(me.id, operationId, false);
        }
      });
    } else {
      xl.exportExcel(this.id, operationId, false);
    }
  }

  gridValidate(componentId) {
    this.gridView.checkValidateCells();
  }

  setRGridCustomOptions(viewId, componentId) {
  }

  setRGridFieldCalculateCallback(viewId, componentId, dataRow, fieldName, fieldNames, values) {
  }

  onRGridCellClicked(viewId, componentId, grid, index) {
  }

  onRGridCellDoubleClicked(viewId, componentId, grid, index) {
  }

  onRGridCellButtonClicked(viewId, componentId, grid, itemIndex, column) {
  }

  onRGridCurrentChanged(viewId, componentId, grid, newIndex) {
  }

  onRGridCurrentChanging(viewId, componentId, grid, oldIndex, newIndex) {
  }

  onRGridCellEdited(viewId, componentId, grid, itemIndex, dataRow, field) {
  }

  onRGridDataFillReady(viewId, componentId, grid, resultData) {
    return resultData;
  }

  onRGridColumnHeaderClicked(viewId, componentId, grid, column, rightClicked) {
  }

  onRGridEditRowPasted(viewId, componentId, grid, itemIndex, dataRow, fields, oldValues, newValues) {
  }

  onRGridRowsPasted(viewId, componentId, grid, items) {
  }

  onRGridOnKeyDown(viewId, componentId, grid, key, ctrl, shift, alt) {
  }

  onRGridOnKeyUp(viewId, componentId, grid, key, ctrl, shift, alt) {
  }
}
