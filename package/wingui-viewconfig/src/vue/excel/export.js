import { showDialog } from '../../viewconfig/util/dialog';
import { gI18n } from '../i18n';
import { checkUserPermission } from '../utils';

const EXCEL_EXPORT_COMPONENT = 'excel-export';

/* export grid component*/
function gExcelExportComponent (grid, settings) {
  let gridView = grid.gridView;
  if(settings !== undefined) {
    if (gridView.isFiltered()) {
      showDialog(transLangKey('MSG_GRID_EXPORT_01'), transLangKey('MSG_GRID_EXPORT_02'), DIALOG_TYPE.FILTERS).then(function (answer) {
        if (answer) {
          exportExcel(gridView, settings, true);
        } else {
          exportExcel(gridView, settings, false);
        }
      });
    } else {
      exportExcel(gridView, settings, false);
    }
  }
}

function exportExcel (gridView, settings, exportAll) {
    const dataProvider = gridView.getDataSource();

    let bindingFields = {};
    let importExceptFields = {};
    let fieldTypes = {};
    let activatedColumnFilters = {};

    if (settings.headerDepth === undefined) {
      settings['headerDepth'] = 1
    }

    if (settings.allColumns === undefined) {
      settings['allColumns'] = false
    }

    if (settings.footer === undefined) {
      settings['footer'] = 'default';
    }

    if (settings.lookupDisplay === undefined) {
      settings['lookupDisplay'] = false
    }

    if (settings.separateRows === undefined) {
      settings['separateRows'] = false
    }

    if (settings.allRows === undefined) {
      settings['allRows'] = false;
    }

    let dateString = new Date().toCurrentDateString();
    dateString = dateString.replace(/\:/g, '-').replace('.', '-').replace(' ', '-');
    let fileName = gI18n.tc(vom.active) + '_' + gridView.id + '_' + dateString;
    if (settings.fileName !== undefined) {
      fileName = settings.fileName;
    }

    let fieldNames = dataProvider.getFields().map(a=>{return a.orgFieldName});

    for (let i = 0, n = fieldNames.length; i < n; i++) {
      let fieldName = fieldNames[i];

      bindingFields[i] = fieldName;
      fieldTypes[i] = dataProvider.fieldByName(fieldName).dataType;

      if (exportAll) {
        let column = gridView.columnByField(fieldName);
        let columnFilters = gridView.getColumnFilters(column);
        if (columnFilters && columnFilters.length > 0) {
          activatedColumnFilters[column.name] = gridView.getActiveColumnFilters(column, true);
          gridView.activateAllColumnFilters(column, false);
        }
      }
    }

    let dataBeginIdx = settings.headerDepth + 1;
    let bindingInfo = {
      BINDING_FIELDS: bindingFields,
      FIELD_TYPES: fieldTypes,
      DATA_BEGIN_IDX: dataBeginIdx,
      IMPORT_EXCEPT_FIELDS: importExceptFields,
      CATEGORY_LANG: {}
    };

    let doGridExport = function () {
      gridView.exportGrid({
        type: 'excel',
        target: 'local',
        fileName: fileName + '.xlsx',
        indicator: 'hidden',
        header: 'default',
        footer: settings.footer,
        linear: false,
        showProgress: true,
        progressMessage: 'Export to Excel.',
        compatibility: true,
        allItems: true,
        allColumns: settings.allColumns,
        lookupDisplay: settings.lookupDisplay,
        applyDynamicStyles: true,
        separateRows: settings.separateRows,
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
        }
      });
    };

    if (dataProvider.getRowCount() > 0) {
      doGridExport();
    } else {
      showDialog('EXPORT', transLangKey('MSG_GRID_EXPORT_03'), DIALOG_TYPE.CONFIRM)
        .then(answer => {
          if (answer) {
            doGridExport();
          }
        });
    }
}

function exportMultiGridsToExcel (settings) {
    if (settings.allColumns === undefined) {
      settings['allColumns'] = false
    }

    if (settings.footer === undefined) {
      settings['footer'] = 'default';
    }

    if (settings.lookupDisplay === undefined) {
      settings['lookupDisplay'] = false
    }

    if (settings.separateRows === undefined) {
      settings['separateRows'] = false
    }

    if (settings.allRows === undefined) {
      settings['allRows'] = false;
    }

    let dateString = new Date().toCurrentDateString();
    dateString = dateString.replace(/\:/g, '-').replace('.', '-').replace(' ', '-');
    let fileName = gI18n.tc(vom.active) + '_' + dateString;
    if (settings.fileName !== undefined) {
      fileName = settings.fileName;
    }

    let doGridExport = function () {
      RealGridJS.exportGrid({
        type: 'excel',
        target: 'local',
        fileName: fileName + '.xlsx',
        indicator: 'hidden',
        header: 'default',
        footer: settings.footer,
        linear: false,
        showProgress: true,
        progressMessage: 'Export to Excel.',
        compatibility: true,
        allItems: true,
        allColumns: settings.allColumns,
        lookupDisplay: settings.lookupDisplay,
        applyDynamicStyles: true,
        separateRows: settings.separateRows,
        exportGrids: settings.exportGrids
      });
    };

    doGridExport();
}

Vue.component(EXCEL_EXPORT_COMPONENT, {
  props: ['settings'],
  data() {
    return {};
  },
  methods: {
    onClick() {
      let upload = this.$refs.upload.kendoWidget();
      upload.element.trigger('click');
    },
    doExport: function(e) {
      let checkPermission = checkUserPermission(gOperationType.EXPORT);

      if (checkPermission) {
        if (Object.keys(this.$attrs).length > 0) {
          let gridInstance = eval(this.$attrs.grid);
          gExcelExportComponent(gridInstance, this.$attrs);
        } else {
          this.$emit('export');
        }
      }
    }
  },
  template: `
    <span class="excel-export">
      <kendo-button @click="doExport"><i class="fa fa-lg fa-download"></i></kendo-button>
    </span>
  `
});

export { gExcelExportComponent, exportMultiGridsToExcel };
