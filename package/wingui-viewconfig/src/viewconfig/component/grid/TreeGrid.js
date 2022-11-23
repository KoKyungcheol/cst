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
  setGridDataProvider,
  setGridColumn,
  setOptions,
  setGridStyles,
  themeSkin,
  setDisplayOptions,
  setTreeContextMenu,
  applyCellAttributes,
  progressSpinner,
  createField,
  createDataColumn,
  isFixedColumn,
  extractRows,
  cleanupGroupColumns,
  columnsSort,
  setGridSortOrder,
  arrangeLookups,
  setGridFilters,
  fitGridData,
  updateParentWidth2,
  treeExpandedRow,
  doGridResize,
  updateParentWidth,
  isSatisfiedValue,
  gridOnKeyDown,
  gridOnKeyUp,
  gridOnDataCellClicked,
  gridOnDataCellDblClicked,
  gridOnCellButtonClicked,
  gridOnCellEdited,
  gridOnCurrentChanged,
  gridOnCurrentChanging,
  gridOnColumnHeaderClicked,
  gridOnFilteringChanged
} from './gridFunc';

export default class TreeGrid extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.treeView = {};

    this.columns = [];

    this.dataOutputOptions = {};
    this.dataparams = {};
    this.ignoreChange = vom.get(viewId).propIgnoreChange(id);
    this.rollbackId = '';

    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    if (!RealGridJS) {
      console.error('R_TREE license has been expired');
      showDialog('Warning', 'R_TREE license has been expired', DIALOG_TYPE.ALERT);
      return;
    }

    let wrap = new GridWrap(this.id, this.element, this.viewId);
    wrap.mount();

    let me = this;

    this.treeView = new RealGridJS.TreeView(this.id);

    let additionalHeight = 0;

    let useToolBar = vom.get(me.viewId).propToolbarUsable(this.id);
    if (useToolBar) {
      additionalHeight += 38;

      let canvasElement = this.element.querySelector('canvas');
      if (canvasElement) {
        canvasElement.parentNode.style.height = 'calc(100% - ' + additionalHeight + 'px)';
      }
    }

    this.treeView.additionalHeight = additionalHeight;

    this.treeView.resetSize();

    this.treeView.orgId = this.id;
    this.treeView.gridDataFit = vom.get(me.viewId).propDataFit(this.id).toUpperCase();
    this.treeView.dataColumns = [];
    this.treeView.lookupReference = {};
    this.treeView.lookups = {};
    this.treeView.invisibleColumnIds = [];
    this.treeView.colFixed = false;
    this.treeView.styleExceptCells = [];
    this.treeView.customAddedColumns = [];

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

    setGridPreferenceInfo(this.treeView, me.viewId);
    setGridCrosstabInfo(this.treeView, me.viewId);
    setGridDataProvider(this.treeView, this.id, 'R_TREE', me.viewId);
    setGridColumn(this.treeView, this.id, me.viewId);
    setOptions(this.treeView, this.id, me.viewId);
    setGridStyles(this.treeView, this.id, 'R_TREE', me.viewId);

    let gridSortOptions = {};
    gridSortOptions.enabled = vom.get(me.viewId).propHeaderSortable(this.id);
    if (!gridSortOptions.enabled) {
      gridSortOptions.handleVisibility = 'hidden';
    }

    this.treeView.setSortingOptions(gridSortOptions);

    let skin = getGridThemeSkin();
    if (skin && Object.getOwnPropertyNames(skin).length > 0) {
      this.treeView.setStyles(skin);
    }

    let editorOptions = {};
    editorOptions.viewGridInside = true;
    if (themeSkin === 'waveDarkBlueSkin') {
      editorOptions.useCssStyleDropDownList = true;
    }

    this.treeView.setEditorOptions(editorOptions);
    this.treeView.setStyles({
      body: {
        dynamicStyles: [{
          criteria: 'checked',
          styles: 'background=#ffcefbc9'
        }]
      }
    });

    setDisplayOptions(this.treeView, this.id, this.viewId);

    this.treeView.setEditOptions({
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

    let treeOptions = {};
    treeOptions.lineStyle = '#ff000000, 1px';
    this.treeView.setTreeOptions(treeOptions);

    this.treeView.setCopyOptions({
      singleMode: singleMode
    });

    this.treeView.setHeader({
      showTooltip: true,
      resizable: true
    });

    this.treeView.onKeyDown = function (grid, key, ctrl, shift, alt) {
      gridOnKeyDown(grid, key, ctrl, shift, alt);
    };

    this.treeView.onKeyUp = function (grid, key, ctrl, shift, alt) {
      gridOnKeyUp(grid, key, ctrl, shift, alt);
    };

    this.treeView.onDataCellClicked = function (grid, index) {
      if (index.fieldIndex === 0) {
        let rowIndex = index.dataRow;
        if (!treeExpandedRow.includes(rowIndex)) {
          treeExpandedRow.push(rowIndex);
          grid.expand(grid.getItemIndex(rowIndex), false, false);
        } else {
          treeExpandedRow.splice(treeExpandedRow.indexOf(rowIndex), 1);
          grid.collapse(grid.getItemIndex(rowIndex), false);
        }
      }

      gridOnDataCellClicked(grid, index)
    };

    this.treeView.onDataCellDblClicked = function (grid, index) {
      gridOnDataCellDblClicked(grid, index);
    };

    this.treeView.onCellButtonClicked = function (grid, itemIndex, column) {
      gridOnCellButtonClicked(grid, itemIndex, column);
    };

    this.treeView.onCurrentChanged = function (grid, newIndex) {
      gridOnCurrentChanged(grid, newIndex, me.viewId);
    };

    this.treeView.onCurrentChanging = function (grid, oldIndex, newIndex) {
      gridOnCurrentChanging(grid, oldIndex, newIndex, me.viewId);
    };

    this.treeView.onColumnCheckedChanged = function (grid, column, checked) {
      grid.commit();

      let dataProvider = grid.getDataSource();
      for (let i = 0, n = dataProvider.getRowCount(); i < n; i++) {
        dataProvider.setValue(i, column.fieldName, checked);
      }
    };

    this.treeView.onShowTooltip = function (grid, index, value) {
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
        }
      } else {
        tooltip = value;
      }

      return tooltip;
    };

    this.treeView.onItemChecked = function (grid, itemIndex, checked) {
      grid.expand(itemIndex, true, true);
      me.treeView.checkChildren(itemIndex, checked, true, false, true, false);
    };

    this.treeView.onCellEdited = function (grid, itemIndex, dataRow, field) {
      let dataProvider = grid.getDataSource();
      let current = grid.getCurrent();
      let currentFieldName = current.fieldName;
      let currentField = dataProvider.fieldByName(currentFieldName);
      let currentValue = grid.getValue(current.itemIndex, current.fieldIndex);
      let itemModel = grid.getModel(itemIndex, true);

      if (currentField.dataType === 'boolean' && itemModel.count > 0) {
        grid.commit();
        grid.expand(itemIndex, true, true);
        if (!treeExpandedRow.includes(dataRow)) {
          treeExpandedRow.push(dataRow);
        }

        let childrenRows = dataProvider.getDescendants(dataRow);
        for (let i = 0, n = childrenRows.length; i < n; i++) {
          let hasChild = grid.getModel(grid.getItemIndex(childrenRows[i]), true).count > 0;
          if (hasChild) {
            if (!treeExpandedRow.includes(childrenRows[i])) {
              treeExpandedRow.push(childrenRows[i]);
            }
          }
        }

        for (let i = 0, n = childrenRows.length; i < n; i++) {
          let childItemIndex = grid.getItemIndex(childrenRows[i]);

          grid.setValue(childItemIndex, currentFieldName, currentValue);
        }
      }
      grid.commit();

      gridOnCellEdited(grid, itemIndex, dataRow, field, me.viewId);
    };

    this.treeView.onValidateColumn = function (grid, column, inserting, value) {
      let columnId = column.name;

      if (vom.get(me.viewId).hasColumnValidations(me.id, columnId)) {
        let validationIds = vom.get(me.viewId).propColumnValidationIds(me.id, columnId);
        for (let i = 0; i < validationIds.length; i++) {
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

          me.treeView.isColumnValidationFail = !isEmpty(error);

          return error;
        }
      }
    };

    /**
     * on validation fail callback
     */
    this.treeView.onValidationFail = function (grid, itemIndex, column, err) {
      me.treeView.isColumnValidationFail = true;
      showDialog('Validation Fail', err.message, DIALOG_TYPE.ALERT).then(function (answer) {
        if (answer && column) {
          let index = {
            itemIndex: itemIndex,
            fieldName: column.fieldName
          };

          grid.setCurrent(index);
          grid.showEditor();
        }
      });
    };

    this.treeView.onColumnHeaderClicked = function (grid, column, rightClicked) {
      gridOnColumnHeaderClicked(grid, column, rightClicked, me.viewId);
    };

    this.treeView.onFilteringChanged = function (grid, column) {
      gridOnFilteringChanged(grid, column);
    };

    this.treeView.onTreeItemExpanded = function (tree, itemIndex, rowId) {
      if (!treeExpandedRow.includes(rowId)) {
        treeExpandedRow.push(rowId);
      }

      let current = tree.getCurrent();
      let index = {
        itemIndex: itemIndex,
        column: current.column,
        dataRow: rowId,
        fieldName: current.fieldName
      };

      tree.setCurrent(index);
      fitGridData(tree);
    };

    this.treeView.onTreeItemCollapsed = function (tree, itemIndex, rowId) {
      if (treeExpandedRow.includes(rowId)) {
        treeExpandedRow.splice(treeExpandedRow.indexOf(rowId), 1);
      }

      let current = tree.getCurrent();
      let index = {
        itemIndex: itemIndex,
        column: current.column,
        dataRow: rowId,
        fieldName: current.fieldName
      };

      tree.setCurrent(index);
      fitGridData(tree);
    };

    /**
     * set grid context menu
     */
    setTreeContextMenu(this.id, this.treeView, me.viewId);

    /**
     * set options by custom function
     */
    this.setRTreeCustomOptions(me.viewId, this.id);

    /**
     * actions
     */
    let actionEventTypes = vom.get(me.viewId).getActionEventTypes(this.id);
    for (let i = 0, n = actionEventTypes.length; i < n; i++) {
      let actionEventType = actionEventTypes[i];
      if (actionEventType === 'cell-click') {
        this.treeView.onDataCellClicked = function (grid, index) {
          gridOnDataCellClicked(grid, index);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      } else if (actionEventType === 'cell-double-click') {
        this.treeView.onDataCellDblClicked = function (grid, index) {
          gridOnDataCellDblClicked(grid, index);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      } else if (actionEventType === 'button-click') {
        this.treeView.onCellButtonClicked = function (grid, itemIndex, column) {
          gridOnCellButtonClicked(grid, itemIndex, column);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      } else if (actionEventType === 'cell-edited') {
        this.treeView.onCellEdited = function (grid, itemIndex, dataRow, field) {
          gridOnCellEdited(grid, itemIndex, dataRow, field, me.viewId);
          vsm.get(me.viewId, "operationManager").actionOperation(me.id, actionEventType);
        };
      }
    }

    this.isMounted = true;
    this.mounted();
  }

  getActualComponent() {
    return this.treeView;
  }

  getValue(referType, rowExtractor) {
    this.treeView.commit(true);

    if (!referType) {
      console.warn('Get value from R_TREE need reference-type.\n' +
        'Set reference-id \'component-id:reference-type(changes/selections/all/...etc)\'.');
      return;
    }

    referType = referType.toUpperCase();

    if (referType === GRID_REFER_TYPE.CHANGES || referType === GRID_REFER_TYPE.UPDATED || referType === GRID_REFER_TYPE.CREATED) {
      let dataProvider = this.treeView.getDataSource();
      let statRows = dataProvider.getAllStateRows();

      let indexes = [];
      if (referType === GRID_REFER_TYPE.CHANGES) {
        indexes = statRows.updated;
        indexes = indexes.concat(statRows.created);
      } else if (referType === GRID_REFER_TYPE.UPDATED) {
        indexes = statRows.updated;
      } else if (referType === GRID_REFER_TYPE.CREATED) {
        indexes = statRows.created;
      }

      let rows = [];
      for (let i = 0, n = indexes.length; i < n; i++) {
        let rowIndex = parseInt(indexes[i]);
        let row = dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);
        row[ROW_STATUS] = dataProvider.getRowState(rowIndex).toUpperCase();
        rows.push(row);
      }

      if (rows.length <= 0) {
        return;
      }

      rows = extractRows(this.treeView, rows, rowExtractor);
      console.log('R_TREE getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows);
    }

    if (referType === GRID_REFER_TYPE.SELECTIONS) {
      let dataProvider = this.treeView.getDataSource();
      let selections = this.treeView.getSelectedRows();

      let rows = [];
      for (let i = 0, n = selections.length; i < n; i++) {
        let rowIndex = parseInt(selections[i]);
        let row = dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);
        row[ROW_STATUS] = dataProvider.getRowState(rowIndex).toUpperCase();
        rows.push(row);
      }

      if (rows.length <= 0) {
        return;
      }

      rows = extractRows(this.treeView, rows, rowExtractor);
      console.log('R_TREE getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows);
    }

    if (referType === GRID_REFER_TYPE.CHECKED) {
      let dataProvider = this.treeView.getDataSource();
      let checked = this.treeView.getCheckedRows();
      let rows = [];

      if (checked.length > 0) {
        for (let i = 0, n = checked.length; i < n; i++) {
          let rowIndex = parseInt(checked[i]);
          let row = dataProvider.getOutputRow(this.dataOutputOptions, rowIndex);
          row[ROW_STATUS] = dataProvider.getRowState(rowIndex).toUpperCase();
          rows.push(row);
        }
      } else {
        console.log('No row checked');
      }

      if (rows.length <= 0) {
        return;
      }

      rows = extractRows(this.treeView, rows, rowExtractor);
      console.log('R_TREE getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows);
    }

    if (referType === GRID_REFER_TYPE.ALL) {
      let dataProvider = this.treeView.getDataSource();

      let rows = [];
      for (let i = 1, n = dataProvider.getRowCount(); i < n + 1; i++) {
        let row = dataProvider.getOutputRow(this.dataOutputOptions, i);
        row[ROW_STATUS] = dataProvider.getRowState(i).toUpperCase();
        rows.push(row);
      }

      if (!rows || rows.length <= 0) {
        return;
      }

      rows = extractRows(this.treeView, rows, rowExtractor);
      console.log('R_TREE getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows);
    }

    if (referType === 'ALL_FLAT') {
      let dataProvider = this.treeView.getDataSource();

      let rowCount = dataProvider.getRowCount();
      if (rowCount <= 0) {
        return;
      }

      // row index starts from 1 (not 0) on treeview
      let rows = [];
      for (let rowIdx = 1; rowIdx <= rowCount; rowIdx++) {
        rows.push(dataProvider.getOutputRow(this.dataOutputOptions, rowIdx));
      }

      rows = extractRows(this.treeView, rows, rowExtractor);
      console.log('R_TREE getValue [' + referType + '] : \n', rows);
      return JSON.stringify(rows);
    }

    if (referType === GRID_REFER_TYPE.CELLVALUE) {
      let dataRow = this.treeView.getCurrent().itemIndex;
      let dataField = this.treeView.getCurrent().fieldName;
      let value = this.treeView.getValue(dataRow, dataField);

      console.log('R_TREE getValue [cellValue] : \n', value);
      if (!value) {
        return;
      }
      return value;
    }

    if (referType === GRID_REFER_TYPE.ROWCOUNT) {
      let rowCount = this.treeView.getDataSource().getRowCount();
      console.log('R_TREE getValue [rowCount] : \n', rowCount);
      return rowCount;
    }

    if (referType === GRID_REFER_TYPE.CHECKED_ROWCOUNT) {
      let checkedRowCount = this.treeView.getCheckedRows().length;
      console.log('R_TREE getValue [checked rowCount] : \n', checkedRowCount);
      return checkedRowCount;
    }

    if (referType === GRID_REFER_TYPE.SELECTED_ROWCOUNT) {
      let selectedRowCount = this.treeView.getSelectedRows().length;
      console.log('R_TREE getValue [selected rowCount] : \n', selectedRowCount);
      return selectedRowCount;
    }

    if (referType === GRID_REFER_TYPE.CHANGED_ROWCOUNT) {
      let dataProvider = this.treeView.getDataSource();
      let statRows = dataProvider.getAllStateRows();
      let changedRowCount = statRows.updated.length + statRows.created.length;

      console.log('R_TREE getValue [changed rowCount] : \n', changedRowCount);
      return changedRowCount;
    }

    if (referType === GRID_REFER_TYPE.UPDATED_ROWCOUNT) {
      let dataProvider = this.treeView.getDataSource();
      let statRows = dataProvider.getAllStateRows();

      let updatedRowCount = statRows.updated.length;
      console.log('R_TREE getValue [updated rowCount] : \n', updatedRowCount);
      return updatedRowCount;
    }

    if (referType === GRID_REFER_TYPE.CREATED_ROWCOUNT) {
      let dataProvider = this.treeView.getDataSource();
      let statRows = dataProvider.getAllStateRows();
      let createdRowCount = statRows.created.length;

      console.log('R_TREE getValue [created rowCount] : \n', createdRowCount);
      return createdRowCount;
    }

    if (referType === GRID_REFER_TYPE.F_VALUE) {
      let resultValue;
      let current = this.treeView.getCurrent();
      let currentColumnId = current.column;
      let dataColumns = this.treeView.dataColumns;
      let currentDataColumn = {};

      for (let i = 0, n = dataColumns.length; i < n; i++) {
        if (dataColumns[i].name === currentColumnId) {
          currentDataColumn = dataColumns[i];
        }
      }

      if (currentDataColumn.isIterationColumn) {
        let prefix = vom.get(me.viewId).propColumnIterationPrefix(this.treeView.orgId, currentDataColumn.columnIdOrg);
        let postfix = vom.get(me.viewId).propColumnIterationPostfix(this.treeView.orgId, currentDataColumn.columnIdOrg);

        currentColumnId = currentColumnId.replace(prefix, '');
        currentColumnId = currentColumnId.replace(postfix, '');
      }

      resultValue = currentColumnId;

      console.log('R_TREE getValue [F_Value] : \n', resultValue);
      return resultValue;
    }

    return null;
  }

  setValue(resultData) {
    let me = this;

    if (!resultData || resultData.length === 0) {
      this.treeView.hideToast();
      this.initData(this.id);
      return;
    } else {
      this.loadProcessFlagOn();
    }

    this.treeView.bindingStatus = 'INIT';

    let prefInfoDB;
    if (this.treeView.prefInfo) {
        prefInfoDB = TAFFY(this.treeView.prefInfo);
    }

    this.treeView.dataColumns = [];

    let dataProvider = this.treeView.getDataSource();
    dataProvider.clearRows();
    dataProvider.clearSavePoints();

    let fixedOptions = this.treeView.getFixedOptions();
    fixedOptions.rowCount = 0;
    this.treeView.setFixedOptions(fixedOptions);

    let columns = [];
    let gridFields = [];

    let arrArrangedColumns = vom.get(me.viewId).getArrangedColumns(this.id);

    if (!(resultData instanceof Array)) {
      this.treeView.hideToast();
      console.warn('data is not applicable to this component');
      return;
    }

    let treeData = {};

    let dataFieldNames = Object.keys(resultData[0]);
    if (!dataFieldNames.includes(TREE_DATA_IDENTIFIER)) {
      console.warn('Data is not suitable to this component');
    }

    let columnFixIndex = 0;
    let isFixed = false;
    let fixedColumnMap = {};

    let staticColumnsMap = {};
    let staticGridGroupHeaders = [];

    let columnIndexNo = 0;
    this.treeView.headerDepth = 0;

    for (let arrIdx = 0, arrLen = arrArrangedColumns.length; arrIdx < arrLen; arrIdx++) {
      let arrangedColumns = arrArrangedColumns[arrIdx];
      if (!vom.get(me.viewId).isIterationColumn(this.id, arrangedColumns[0])) {
        let groupWidth = 0;
        let dataColumns = [];

        for (let arrangedColumnsIdx = 0, length = arrangedColumns.length; arrangedColumnsIdx < length; arrangedColumnsIdx++) {
          let columnId = arrangedColumns[arrangedColumnsIdx];

          gridFields.push(createField(columnId, this.id, columnId, this.treeView, me.viewId));
          if (vom.get(me.viewId).hasCandidateReferenceColumn(this.id, columnId)) {
            gridFields.push(createField(columnId + LABEL_FIELD, this.id, columnId, me.viewId));
          }

          let dataColumn = createDataColumn(this.treeView, columnId, this.id, columnId, false, me.viewId);
          dataColumn.columnIndexNo = columnIndexNo;
          columnIndexNo++;

          if (!isFixed) {
            let isFixedCol = isFixedColumn(this.id, arrangedColumns, me.viewId);
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
        let groupHeader = vom.get(me.viewId).propColumnGroups(this.id, arrangedColumns[0]);
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
              if (vom.get(me.viewId).isColumnVisible(arrangedColumns[columnIdx])) {
                groupColumnVisible = true;
              }

              let headerBackground = vom.get(me.viewId).propColumnHeaderBackground(this.id, arrangedColumns[columnIdx]);
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

            if (this.treeView.headerDepth < groupHeadersIndex + 1) {
              this.treeView.headerDepth = groupHeadersIndex + 1;
            }

            if (!isFixed || fixedColumnMap.hasOwnProperty(arrangedColumns.toString())) {
              let isFixedCol = isFixedColumn(this.id, arrangedColumns, me.viewId);
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
          let columnPrefix = vom.get(me.viewId).propColumnIterationPrefix(this.id, columnId);
          let columnPostfix = vom.get(me.viewId).propColumnIterationPostfix(this.id, columnId);

          let names = [];
          for (let dataFieldIdx = 0, dataFieldLen = dataFieldNames.length; dataFieldIdx < dataFieldLen; dataFieldIdx++) {
            let fieldName = dataFieldNames[dataFieldIdx];
            if ((fieldName.startsWith(columnPrefix) && fieldName.endsWith(columnPostfix))
                || (fieldName.startsWith(columnPrefix) && fieldName.endsWith(transLangKey(columnPostfix)))) {
              names.push(fieldName);
            }
          }

          dynamicFieldNames = dynamicFieldNames.concat(names);
        }

        dynamicFieldNames.sort();

        for (let dynamicFieldNamesIdx = 0, dynamicFieldNamesLen = dynamicFieldNames.length; dynamicFieldNamesIdx < dynamicFieldNamesLen; dynamicFieldNamesIdx++) {
          let fieldName = dynamicFieldNames[dynamicFieldNamesIdx];
          let groupWidth = 0;

          for (let arrangedColumnsIdx = 0, arrangedColumnsLen = arrangedColumns.length; arrangedColumnsIdx < arrangedColumnsLen; arrangedColumnsIdx++) {
            let iterationColumnId = arrangedColumns[arrangedColumnsIdx];
            let columnIterationPrefix = vom.get(me.viewId).propColumnIterationPrefix(this.id, iterationColumnId);
            let columnIterationPostfix = vom.get(me.viewId).propColumnIterationPostfix(this.id, iterationColumnId);

            if ((fieldName.startsWith(columnIterationPrefix) && fieldName.endsWith(columnIterationPostfix))
                || (fieldName.startsWith(columnIterationPrefix) && fieldName.endsWith(transLangKey(columnIterationPostfix)))) {

              gridFields.push(createField(fieldName, this.id, iterationColumnId, this.treeView, me.viewId));
              let dataColumn = createDataColumn(this.treeView, fieldName, this.id, iterationColumnId, true, me.viewId);
              dataColumn.columnIndexNo = columnIndexNo;
              columnIndexNo++;

              if (!isFixed) {
                let isFixedCol = isFixedColumn(this.id, arrangedColumns, me.viewId);
                dataColumn.isFixed = isFixedCol;
                isFixed = isFixedCol;
                if (isFixedCol) {
                  fixedColumnMap[arrangedColumns.toString()] = true;
                }
              } else {
                dataColumn.isFixed = false;
              }

              groupWidth = groupWidth + dataColumn.width;

              let seqMatchTest = fieldName.match(/SEQ\d{3}|,SEQ_\d{3}/gi);
              if (seqMatchTest && seqMatchTest.length > 0) {
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

              if (vom.get(me.viewId).propColumnIterationPrefixRemove(this.id, iterationColumnId)) {
                groupHeader = groupHeader.replace(columnIterationPrefix, '');
                groupHeader = groupHeader.replace(transLangKey(columnIterationPrefix), '');
              }

              if (vom.get(me.viewId).propColumnIterationPostfixRemove(this.id, iterationColumnId)) {
                groupHeader = groupHeader.replace(columnIterationPostfix, '');
                groupHeader = groupHeader.replace(transLangKey(columnIterationPostfix), '');
              }

              let groupHeaders = [];
              if (groupHeader.length > 0) {
                if (vom.get(me.viewId).hasColumnIterationDelimiter(this.id, iterationColumnId)) {
                  let delimiterOnColumn = vom.get(me.viewId).propColumnIterationDelimiter(this.id, iterationColumnId);

                  if (groupHeader.lastIndexOf(delimiterOnColumn) === groupHeader.length - 1) {
                    groupHeader = groupHeader.substring(0, groupHeader.length - 1);
                  }

                  let groupHeaderSplitResult_1 = groupHeader.split(delimiterOnColumn);
                  let delimiterOnCrosstabInfo = ',';

                  let crossTabInfo = this.treeView.crossTabInfo;
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

              if (vom.get(me.viewId).propColumnIterationHeaderSeq(this.id, iterationColumnId) === 'desc') {
                groupHeaders.reverse();
              }

              if (vom.get(me.viewId).hasColumnTitle(this.id, iterationColumnId)) {
                dataColumn.header.text = transLangKey(vom.get(me.viewId).propColumnTitle(this.id, iterationColumnId));
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
                    if (vom.get(me.viewId).isColumnVisible(arrangedColumns[columnIdx])) {
                      groupColumnVisible = true;
                    }

                    let headerBackground = vom.get(me.viewId).propColumnHeaderBackground(this.id, arrangedColumns[columnIdx]);
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

                  if (this.treeView.headerDepth < groupHeadersIndex + 1) {
                    this.treeView.headerDepth = groupHeadersIndex + 1;
                  }

                  let tempColumnTitle = vom.get(me.viewId).propColumnTitle(this.id, iterationColumnId);
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
                  header.styles = headerStyles;
                  groupColumn.header = header;

                  groupColumn.columnIdOrg = iterationColumnId;
                  if (!isFixed || fixedColumnMap.hasOwnProperty(arrangedColumns.toString())) {
                    let isFixedCol = isFixedColumn(this.id, arrangedColumns, me.viewId);
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
    this.treeView.setColumns(columns);
    dataProvider.setFields(gridFields);

    treeData[TREE_DATA_IDENTIFIER] = resultData;

    let targetResultData = this.onRGridDataFillReady(me.viewId, this.id, this.treeView, resultData);

    if (!targetResultData) {
      console.warn('\'onRGridDataFillReady\' did not return result. Maintain the original result data. Check custom function prototype \'onRGridDataFillReady\' on template.');
      targetResultData = resultData;
    }

    dataProvider.fillJsonData(treeData, {rows: TREE_DATA_IDENTIFIER});

    if (isFixed) {
      for (let i = 0, columnsLen = columns.length; i < columnsLen; i++) {
        let column = columns[i];
        if (this.treeView.invisibleColumnIds.length > 0) {
          if (column.visible && !this.treeView.invisibleColumnIds.includes(column.name)) {
            columnFixIndex++;
          }
        } else {
          if (column.visible) {
            columnFixIndex++;
          }
        }

        if (column.isFixed) {
          this.treeView.colFixed = true;
          this.treeView.fixedColumn = column;
          break;
        }
      }

      if (columnFixIndex > 0) {
        let fixedOptions = new RealGridJS.FixedOptions();
        this.treeView.fixedColCount = columnFixIndex;
        fixedOptions.colCount = columnFixIndex;
        fixedOptions.resizable = true;

        this.treeView.setFixedOptions(fixedOptions);
      }
    }

    setGridSortOrder(this.treeView, this.id, dataFieldNames, this.viewId);

    this.treeView.styleExceptCells = [];

    this.treeView.clearCellStyles();
    applyCellAttributes(this.id, null, null, null, null, this.viewId);

    window.requestAnimationFrame(function () {
      me.treeView.bindingStatus = 'RDY';
    });

    this.rollbackId = dataProvider.savePoint();

    doGridResize(this.viewId);

    if (this.treeView.lookups && Object.getOwnPropertyNames(this.treeView.lookups).length > 0) {
      arrangeLookups(this, dataProvider, this.viewId);
    }

    if (this.treeView.invisibleColumnIds && this.treeView.invisibleColumnIds.length > 0) {
      let invisible = this.treeView.invisibleColumnIds.unique();
      let dataColumnDB = TAFFY(this.treeView.dataColumns);

      setTimeout(function () {
        for (let i = 0, invisibleLength = invisible.length; i < invisibleLength; i++) {
          let actualColumns = dataColumnDB().filter({ columnIdOrg: invisible[i] }).get();
          for (let j = 0, actualColumnsLength = actualColumns.length; j < actualColumnsLength; j++) {
            me.treeView.setColumnProperty(actualColumns[j].name, 'visible', false);
          }
        }
      }, 300);

      this.treeView.invisibleColumnIds = [];
    }

    this.treeView.hideToast();

    console.log('Complete data binding @', this.id);

    window.requestAnimationFrame(function () {
      me.treeView.activatedColumnFilters = {};
      setGridFilters(me.treeView, me.id, dataProvider, staticColumnsMap, me.viewId);
    });

    let initExpandLevel = vom.get(me.viewId).propInitExpandLevel(this.id);
    window.requestAnimationFrame(function () {
      if (initExpandLevel === 'ALL') {
        me.treeView.expandAll();
      } else if (typeof initExpandLevel === 'number') {
        me.treeView.expandAll(initExpandLevel);
      }
    });

    window.requestAnimationFrame(function () {
      fitGridData(me.treeView);
    });
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    this.treeView.setCurrent();

    operationId = operationId.toUpperCase();
    if (operationId !== 'INIT' && !vom.get(me.viewId).hasOperation(this.id, operationId)) {
      console.error(`Operation '${operationId}' is not defined @ '${this.id}'.`);
      return;
    } else {
      console.log('Do operation', operationId, '@', this.id);
    }

    if (operationId === 'INIT') {
      this.initData(this.id, operationId, successFunc, completeFunc);
    } else if (operationId.startsWith('LOAD')) {
      this.loadData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('SAVE')) {
      this.saveData(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('INSERT_SIBLING')) {
      this.insertRow(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, false);
    } else if (operationId.startsWith('INSERT_CHILD')) {
      this.insertRow(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc, true);
    } else if (operationId.startsWith('REMOVE_ROW')) {
      this.removeRow(this.id, operationId, actionParamMap, successFunc, failFunc, completeFunc);
    } else if (operationId.startsWith('EXPORT')) {
      this.exportData(this.id, operationId, successFunc, failFunc, completeFunc);
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    } else {
      callService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    }
  }

  doToolbarSuccessOperation(componentId, toolbarId, result) {
    console.log('Do toolbar success operations with', toolbarId + '@' + this.id);
    let operationCallIds = vom.get(me.viewId).getToolbarSuccessOperationCallIds(this.id, toolbarId);
    vsm.get(me.viewId, "operationManager").doRecursiveOperation(this.id, operationCallIds, result)
  }

  doToolbarFailOperation(componentId, toolbarId, result) {
    console.log('Do toolbar fail operations with', toolbarId + '@' + this.id);
    let operationCallIds = vom.get(me.viewId).getToolbarFailOperationCallIds(this.id, toolbarId);
    vsm.get(me.viewId, "operationManager").doRecursiveOperation(this.id, operationCallIds, result)
  }

  doToolbarCompleteOperation(componentId, toolbarId, result) {
    console.log('Do toolbar complete operations with', toolbarId + '@' + this.id);
    let operationCallIds = vom.get(me.viewId).getToolbarCompleteOperationCallIds(this.id, toolbarId);
    vsm.get(me.viewId, "operationManager").doRecursiveOperation(this.id, operationCallIds, result)
  }

  initData(componentId, operationId, successFunc, completeFunc) {
    this.treeView.colFixed = false;
    this.treeView.rowFixed = false;
    this.treeView.widthFitted = false;
    if (this.treeView.hidedColumnNames != undefined) {
      for (let i = 0; i < this.treeView.hidedColumnNames.length; i++) {
        let column = treeView.columnByName(this.treeView.hidedColumnNames[i]);
        this.treeView.setColumnProperty(column, 'visible', true);
      }
      this.treeView.hidedColumnNames = [];
    }

    let dataProvider = this.treeView.getDataSource();
    dataProvider.clearRows();
    dataProvider.clearSavePoints();

    console.log('Tree / Data Initialized');

    let fixedOptions = this.treeView.getFixedOptions();
    fixedOptions.rowCount = 0;
    this.treeView.setFixedOptions(fixedOptions);

    if (operationId && (successFunc || completeFunc)) {
      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);
    }
  }

  loadData(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;

    this.treeView.cancel();

    setGridPreferenceInfo(this.treeView, me.viewId);
    setGridCrosstabInfo(this.treeView, me.viewId);

    this.treeView.colFixed = false;
    this.treeView.rowFixed = false;
    this.treeView.widthFitted = false;

    if (this.treeView.hidedColumnNames) {
      for (let i = 0, n = this.treeView.hidedColumnNames.length; i < n; i++) {
        let column = this.treeView.columnByName(this.treeView.hidedColumnNames[i]);
        this.treeView.setColumnProperty(column, 'visible', true);
      }

      this.treeView.hidedColumnNames = [];
    }

    this.treeView.showToast(progressSpinner + 'Loading data...', true);
    console.log('Begin operation', operationId, '@', this.id);

    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

    this.dataparams[this.id] = paramMap;

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(paramMap, this.id, operationId, successFunc, combine(this.loadFail, failFunc), completeFunc, me.viewId);
    } else {
      callService(paramMap, this.id, operationId, combine(this.loadProcess, successFunc), combine(this.loadFail, failFunc), completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    console.log('Starts data binding @', componentId, '\n', data);

    let resultData = data[RESULT_DATA];
    if (!resultData || resultData.length <= 0) {
      console.warn('Response No Data\n', operationId, '@', componentId);

    }
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }

  loadFail(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    let treeView = com.get(activeId).getComponent(componentId).treeView;
    treeView.hideToast();

    console.error(operationId, 'failed');
  }

  saveData(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;

    showDialog('Save', 'Are you sure to Save?', DIALOG_TYPE.CONFIRM).then(function (answer) {
      let treeView = com.get(me.viewId).getComponent(me.id).getActualComponent();

      if (answer) {
        treeView.showToast(progressSpinner + 'Saving data...', true);

        console.log('Saving data : Begin');

        let paramMap = getCompleteParamMap(me.id, operationId, actionParamMap, me.viewId);

        callService(paramMap, me.id, operationId, combine(me.saveProcess, successFunc), combine(me.saveFail, failFunc), completeFunc, me.viewId);
      } else {
        treeView.hideToast();
        showToastMessage('Canceled', 'Canceled save data.', 1000);

        if (operationId && (successFunc || completeFunc)) {
          successFunc(me.id, operationId, null);
          completeFunc(me.id, operationId, null);
        }
      }
    });
  }

  saveProcess(componentId, operationId, data) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    let treeView = com.get(activeId).getComponent(componentId).treeView;

    if (data[RESULT_SUCCESS] === false) {
      treeView.hideToast();
      console.error(operationId, 'Saving data : Fail(Internal Server Error)\n');
    } else {
      let dataProvider = treeView.getDataSource();
      dataProvider.clearRowStates(true, false);
      treeView.hideToast();
      console.log('Saving data : Success\n', data);
    }
  }

  saveFail(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).treeView.hideToast();
    console.error(operationId, 'Saving data : Fail(Service Call Fail)\n');
  }

  insertRow(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc, child) {
    let me = this;
    let dataProvider = this.treeView.getDataSource();
    let fieldNames = dataProvider.getFieldNames();
    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);
    let parentFieldName = paramMap['TREE_PARENT_ID'];
    let keyFieldName = paramMap['TREE_KEY_ID'];
    let parentId = -1;
    let parentFieldValue = null;

    let current = this.treeView.getCurrent();
    let parentRowId = dataProvider.getParent(current.dataRow);
    if (child) {
      parentId = current.dataRow;
      parentFieldValue = dataProvider.getValue(current.dataRow, keyFieldName);
    } else {
      parentId = parentRowId;
      parentFieldValue = dataProvider.getValue(current.dataRow, parentFieldName);
    }

    let setDefaultParamIds = Object.keys(paramMap).filter(function (paramId) {
      let test = paramId.match(/SET_DEFAULT.*/gi);
      if (test && test.length > 0) {
        return test[0];
      }
    });

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
              if (DATETIME_DATA_TYPE.includes((vom.get(me.viewId).propColumnType(this.id, field)).toUpperCase())) {
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

          if (field && fieldNames.includes(field)) {
            if (DATETIME_DATA_TYPE.includes((vom.get(me.viewId).propColumnType(this.id, field)).toUpperCase())) {
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

      if (dataRows.length > 0) {
        for (let dataRowIdx = 0, len = dataRows.length; dataRowIdx < len; dataRowIdx++) {
          let setDefaultValues = dataRows[dataRowIdx];
          setDefaultValues[parentFieldName] = parentFieldValue;
          dataProvider.addChildRow(parentId, setDefaultValues, null, false);
        }
      }

      this.treeView.commit(true);
    } else if (setDefaultParamIds.length > 0 && setDefaultParamIds.includes('SET_DEFAULT')) {
      if (isJson(paramMap['SET_DEFAULT'])) {
        let values = JSON.parse(paramMap['SET_DEFAULT']);
        if (values instanceof Array) {
          for (let valueIdx = 0, valuesLen = values.length; valueIdx < valuesLen; valueIdx++) {
            let setDefaultValues = values[valueIdx];

            if (GRID_INSERT_ROW_INIT_ID && fieldNames.includes(GRID_INSERT_ROW_INIT_ID_FIELD)) {
              setDefaultValues[GRID_INSERT_ROW_INIT_ID_FIELD] = generateId();
            }

            setDefaultValues[parentFieldName] = parentFieldValue;
            dataProvider.addChildRow(parentId, setDefaultValues, null, false);
            this.treeView.commit(true);
          }
        }
      }
    } else {
      if (GRID_INSERT_ROW_INIT_ID && fieldNames.includes(GRID_INSERT_ROW_INIT_ID_FIELD)) {
        let setDefaultValues = {};
        setDefaultValues[GRID_INSERT_ROW_INIT_ID_FIELD] = generateId();
        setDefaultValues[parentFieldName] = parentFieldValue;
        dataProvider.addChildRow(parentId, setDefaultValues, null, false);
      }

      this.treeView.commit(true);
    }

    if (child) {
      this.treeView.expand(current.itemIndex);
    }

    this.treeView.clearCellStyles();
    applyCellAttributes(this.id, null, null, null, null, me.viewId);

    if (operationId && (successFunc || completeFunc)) {
      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);
    }
  }

  removeRow(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc, viewId) {
    let me = this;
    let dataProvider = this.treeView.getDataSource();
    let checkedItems = this.treeView.getCheckedRows();
    let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

    if (checkedItems.length <= 0) {
      console.warn('No row(s) checked to Delete.');
      showDialog('Delete', 'No row(s) checked to Delete', DIALOG_TYPE.ALERT);
    } else {
      let me = this;

      showDialog('Delete', 'Are you sure to Delete?', DIALOG_TYPE.CONFIRM).then(function (answer) {
        if (answer) {
          me.treeView.showToast(progressSpinner + 'Deleting data...', true);

          console.log('Deleting data : Begin');

          let paramMapKeys = Object.keys(paramMap);

          if ((!paramMapKeys.includes('service') || paramMap['service'].length === 0)
              && (!paramMapKeys.includes('url') || paramMap['url'].length === 0)) {
            dataProvider.removeRows(checkedItems, false);
            me.treeView.hideToast();
          } else {
            callService(paramMap, me.id, operationId, combine(me.removeSuccess, successFunc), combine(me.removeFail, failFunc), completeFunc, me.viewId);
          }
        }
      });
    }
  }

  removeSuccess(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).treeView.hideToast();
    console.log(operationId, 'Success');
  }

  removeFail(componentId, operationId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).treeView.hideToast();
    console.error(operationId, 'Failed');
  }

  exportData(componentId, operationId, successFunc, failFunc, completeFunc) {
    let callback = {
      success: successFunc,
      fail: failFunc,
      complete: completeFunc
    };

    this.callback = callback;

    if (this.treeView.isFiltered()) {
      let me = this;

      showDialog(transLangKey('MSG_GRID_EXPORT_01'), transLangKey('MSG_GRID_EXPORT_02'), DIALOG_TYPE.FILTERS).then(function (answer) {
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

  setRTreeCustomOptions(viewId, componentId) {
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
