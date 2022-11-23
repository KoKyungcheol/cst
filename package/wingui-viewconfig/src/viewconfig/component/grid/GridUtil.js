import { showDialog } from '../../util/dialog';
import {
  progressSpinner,
  setGridCrosstabInfo,
  setGridPreferenceInfo
} from './gridFunc';

export default class GridUtil {
  static showToast(componentId, message) {
    const grid = com.get(com.active).getComponent(componentId);
    if (grid) {
        grid.getActualComponent().showToast(progressSpinner + message, true);
    }
  }

  static hideToast(componentId) {
    const grid = com.get(com.active).getComponent(componentId);
    if (grid) {
        grid.getActualComponent().hideToast();
    }
  }

  static exportData(componentId, operationId, exportAll) {
    const grid = com.get(com.active).getComponent(componentId);
    const gridView =  grid.getActualComponent();
    const dataProvider = gridView.getDataSource();

    let defaultExportedFileName = vom.get(vom.active).propOperationFileName(componentId, operationId);
    if (!defaultExportedFileName) {
      let dateString = new Date().toCurrentDateString();
      dateString = dateString.replace(/\:/g, '-').replace('.', '-').replace(' ', '-');

      defaultExportedFileName = transLangKey(vom.active) + '_' + componentId + '_' + dateString;
    }

    let pageable = vom.get(vom.active).propPageable(componentId);
    if (pageable && !vom.get(vom.active).propOperationCurrentPage(componentId, operationId)) {
      gridView.setPaging(false);
    }

    let bindingFields = {};
    let importExceptFields = {};
    let fieldTypes = {};
    let activatedColumnFilters = {};
    let exportAllColumns = vom.get(vom.active).propOperationAllColumns(componentId, operationId);

    let fieldNames = dataProvider.getOrgFieldNames().filter(fieldName => !fieldName.endsWith(LABEL_FIELD))

    for (let i = 0, n = fieldNames.length; i < n; i++) {
      let fieldName = fieldNames[i];

      let column = gridView.columnByField(fieldName);
      bindingFields[i] = fieldName;
      fieldTypes[i] = dataProvider.fieldByName(fieldName).dataType;

      if (gridView.customAddedColumns.includes(fieldName)) {
        importExceptFields[i] = fieldName;
      }

      if (!exportAllColumns && column && !column.visible) {
        importExceptFields[i] = fieldName;
      }

      if (exportAll) {
        let column = gridView.columnByField(fieldName);
        let columnFilters = gridView.getColumnFilters(column);
        if (columnFilters && columnFilters.length > 0) {
          activatedColumnFilters[column.name] = gridView.getActiveColumnFilters(column, true);
          gridView.activateAllColumnFilters(column, false);
        }
      }
    }

    let categoryLang = {};
    if (fieldNames.includes('CATEGORY') && vom.get(vom.active).isApplyI18nGridColumn(componentId, 'CATEGORY')) {
      let categoryValues = dataProvider.getFieldValues('CATEGORY', 0, -1).unique();

      for (let i = 0, categoryValuesLen = categoryValues.length; i < categoryValuesLen; i++) {
        categoryLang[categoryValues[i]] = transLangKey(categoryValues[i]);
      }
    }

    let dataBeginIdx = gridView.headerDepth + 1 + 1;
    let bindingInfo = {
      BINDING_FIELDS: bindingFields,
      FIELD_TYPES: fieldTypes,
      DATA_BEGIN_IDX: dataBeginIdx,
      IMPORT_EXCEPT_FIELDS: importExceptFields,
      CATEGORY_LANG: categoryLang
    };

    let successFunc = grid.callback.success;
    let failFunc = grid.callback.fail;
    let completeFunc = grid.callback.complete;

    grid.callback = {};

    let doGridExport = function () {
      gridView.exportGrid({
        type: 'excel',
        target: 'local',
        fileName: defaultExportedFileName + '.xlsx',
        indicator: 'hidden',
        header: 'default',
        footer: vom.get(vom.active).propOperationExportFooter(componentId, operationId),
        linear: false,
        showProgress: true,
        progressMessage: 'Export to Excel.',
        compatibility: true,
        allItems: true,
        allColumns: exportAllColumns,
        lookupDisplay: vom.get(vom.active).propOperationExportLookup(componentId, operationId),
        applyDynamicStyles: true,
        separateRows: vom.get(vom.active).propOperationRelieveMerge(componentId, operationId),
        documentTitle: {
          message: JSON.stringify(bindingInfo),
          visible: true,
          styles: {
            fontSize: 12,
            fontBold: true,
            textAlignment: 'center',
            lineAlignment: 'center',
            background: '#ffffffff',
            foreground: '#ffffffff'
          },
          spaceTop: 0,
          spaceBottom: 0,
          height: 1
        },
        done: function () {
          if (pageable) {
            let pageSize = vom.get(vom.active).propPageRowCount(componentId);
            let rowCount = dataProvider.getRowCount();
            let remainder = rowCount % pageSize;
            let pageCount = Math.round((rowCount + pageSize / 2) / pageSize);

            if (remainder == 0) {
              pageCount = rowCount / pageSize;
            }
            gridView.setPaging(true, pageSize, pageCount);
          }

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

          if (operationId && (successFunc || completeFunc)) {
            successFunc && successFunc(componentId, operationId, null);
            completeFunc && completeFunc(componentId, operationId, null);
          }
        }
      });
    };

    if (dataProvider.getRowCount() > 0) {
      doGridExport();
    } else {
      if (vom.get(vom.active).propIterationColumnIds(componentId).length <= 0) {
        showDialog('EXPORT', transLangKey('MSG_GRID_EXPORT_03'), DIALOG_TYPE.CONFIRM)
          .then(answer => {
            if (answer) {
              doGridExport();
            } else {
              if (operationId && (failFunc || completeFunc)) {
                failFunc && failFunc(componentId, operationId, null);
                completeFunc && completeFunc(componentId, operationId, null);
              }
            }
          });
      } else {
        showDialog('EXPORT', transLangKey('MSG_GRID_EXPORT_04'), DIALOG_TYPE.CONFIRM)
          .then(function (answer) {
            if (answer) {
              doGridExport();
            } else {
              if (operationId && (failFunc || completeFunc)) {
                failFunc && failFunc(componentId, operationId, null);
                completeFunc && completeFunc(componentId, operationId, null);
              }
            }
          });
      }
    }
  }

  static importData(componentId, data) {
    const grid = com.get(com.active).getComponent(componentId);
    const gridView =  grid.getActualComponent();
    const dataProvider = gridView.getDataSource();

    gridView.cancel();

    setGridPreferenceInfo(gridView);
    setGridCrosstabInfo(gridView);

    gridView.colFixed = false;
    gridView.rowFixed = false;
    gridView.widthFitted = false;

    if (gridView.hidedColumnNames) {
      for (let i = 0, n = gridView.hidedColumnNames.length; i < n; i++) {
        let column = gridView.columnByName(gridView.hidedColumnNames[i]);
        gridView.setColumnProperty(column, 'visible', true);
      }
      gridView.hidedColumnNames = [];
    }

    const resultData = data.RESULT_DATA;
    if (!resultData || resultData.length === 0) {
      console.warn(`Import data does not exist. (component id: ${componentId})`);
    }

    let activeId = componentId.substring(0, componentId.indexOf("-"));
    grid.setData(componentId, 'IMPORT', 'EXCEL_IMPORT', data, activeId);

    let rows = [];
    for (let i = 0, n = dataProvider.getRowCount(); i < n; i++) {
      rows.push(i);
    }

    dataProvider.setRowStates(rows, 'created', true, false);

    let successFunc = grid.callback.success;
    let completeFunc = grid.callback.complete;

    grid.callback = {};

    if (successFunc || completeFunc) {
      successFunc && successFunc(componentId, 'IMPORT', null);
      completeFunc && completeFunc(componentId, 'IMPORT', null);
    }
  }
}
