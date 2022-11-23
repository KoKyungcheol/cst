/**
 * 기본으로 그리드 옵션을 설정한다
 * @param {Object} vmGrid vue instance id
 */
function gSetOptions(vmGrid) {
  let options = {
    pasteOptions: {
      enabled: true,
      numberChars: ',',
      enableAppend: true,
      checkDomainOnly: true,
      selectBlockPaste: true,
      applyNumberFormat: true,
      noEditEvent: true,
      noDataEvent: true
    },
    copyOptions: {
      singleMode: true
    },
    options: {
      edit: {
        deletable: true,
        deleteRowsConfirm: true,
        deleteRowsMessage: 'Are you sure?',
        insertable: true,
        appendable: true,
        updatable: true,
        enterToNextRow: true
      },
      select: {
        style: 'rows'
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
      summaryMode: 'aggregate',
      sortMode: 'explicit'
    },
    sortingOptions: {
      enabled: true, // hidden
      style: 'inclusive'
    },
    editorOptions: {
      viewGridInside: true,
      useCssStyleDropDownList: false,
      yearDisplayFormat : "{Y}",
      months : [
        transLangKey("CALENDAR_JAN"),transLangKey("CALENDAR_FEB"), transLangKey("CALENDAR_MAR"),transLangKey("CALENDAR_APR"),
        transLangKey("CALENDAR_MAY"),transLangKey("CALENDAR_JUN"),transLangKey("CALENDAR_JUL"), transLangKey("CALENDAR_AUG"),
        transLangKey("CALENDAR_SEP"),transLangKey("CALENDAR_OCT"), transLangKey("CALENDAR_NOV"),transLangKey("CALENDAR_DEC")
      ],
      weekDays : [
        transLangKey("CALENDAR_SUN"),transLangKey("CALENDAR_MON"),transLangKey("CALENDAR_TUE"), transLangKey("CALENDAR_WED"),transLangKey("CALENDAR_THU"),
        transLangKey("CALENDAR_FRI"),transLangKey("CALENDAR_SAT")
      ]
    },
    editOptions: {
      insertable: true,
      appendable: true,
      validateOnExit: true,
      commitLevel: 'ignore',
      checkDiff: true,
      checkCellDiff: true
    },
    header: {
      height: 23,
      heightFill: 'default'
    }
  };
  if (vmGrid.gOptions !== undefined) {
    Object.keys(vmGrid.gOptions).map(function (name) {
      Object.keys(vmGrid.gOptions[name]).map(function (detail) {
        if (options[name] !== undefined) {
          options[name][detail] = vmGrid.gOptions[name][detail];
        }
      });
    });
  }
  vmGrid.gridView.setPasteOptions(options.pasteOptions);
  vmGrid.gridView.setCopyOptions(options.copyOptions);
  vmGrid.gridView.setOptions(options.options);
  vmGrid.gridView.setSortingOptions(options.sortingOptions);
  vmGrid.gridView.setEditorOptions(options.editorOptions);
  vmGrid.gridView.setEditOptions(options.editOptions);
  vmGrid.gridView.setHeader(options.header);
}

/**
 * 기본으로 그리드 스타일을 설정한다
 * @param {Object} vmGrid vue instance id
 */
function gInitStyle(vmGrid) {
  let options = {
    checkBar: {
      visible: false,
      exclusive: false
    },
    indicator: {
      visible: false,
      footText: ' '
    },
    stateBar: {
      visible: true,
      stateStyles: {
        updated: {
          background: '#77FFBB00',
          foreground: '#FF000000',
          fontBold: 'true'
        },
        created: {
          background: '#4447C83E',
          foreground: '#FF000000',
          fontBold: 'true'
        },
        deleted: {
          background: '#44FF0000',
          foreground: '#FF000000',
          fontBold: 'true'
        },
        createAndDeleted: {
          background: '#FF000000',
          foreground: '#FFFFFFFF',
          figureBackground: '#88888888',
          fontBold: 'true'
        }
      }
    },
    footer: {
      visible: false
    },
    panel: {
      visible: false
    },
    rowGroup: {
      expandedAdornments: 'none',
      collapsedAdornments: 'header',
      summaryMode: 'aggregate',
      mergeMode: true,
      sorting: true,
      footerCellMerge: true,
      mergeExpander: false
    },
    groupingOptions: {
      prompt: 'Drag column header here then Grouping by column.',
      removeButton: {
        visible: true,
        color: '#FFFFA7A7',
        hoveredColor: '#FF980000',
        size: 12
      }
    },
    styles: {
      body: {
        dynamicStyles: [
          {
            criteria: 'checked',
            styles: 'background=#ffCEFBC9'
          }
        ]
      }
    },
    displayOptions: {
      focusColor: '#FFBB00',
      fitStyle: 'evenFill',
      focusActiveColor: '#CEF279',
      rowFocusOption: {
        visible: false,
        rowFocusMask: 'row',
        styles: {
          background: '#11D4F4FA',
          border: '#331212Fb,2'
        }
      },
      rowHoverMask: {
        visible: true,
        styles: {
          background: '#2065686b'
        },
        hoverMask: 'row'
      },
      eachRowResizable: true
      //, wheelScrollLines: 10 //group header option
    }
  };

  setColumnStyles(vmGrid.gridView);

  if (vmGrid.gStyle !== undefined) {
    Object.keys(vmGrid.gStyle).map(function (name) {
      Object.keys(vmGrid.gStyle[name]).map(function (detail) {
        options[name][detail] = vmGrid.gStyle[name][detail];
      });
    });
  }
  vmGrid.gridView.setCheckBar(options.checkBar);
  vmGrid.gridView.setIndicator(options.indicator);
  vmGrid.gridView.setStateBar(options.stateBar);
  vmGrid.gridView.setFooter(options.footer);
  vmGrid.gridView.setPanel(options.panel); //TODO: double click, script error
  vmGrid.gridView.setRowGroup(options.rowGroup);
  vmGrid.gridView.setGroupingOptions(options.groupingOptions);
  vmGrid.gridView.setStyles(options.styles);
  // 포커스 된 셀 이나 행 전체의 border 색상 및 포커스 된 행 backgroundColor 설정 등등..
  vmGrid.gridView.setDisplayOptions(options.displayOptions);

  let skin = getGridThemeSkin();
  if (skin !== undefined) {
    vmGrid.gridView.setStyles(skin);
  }
}

/**
 * 그리드 컬럼 속성 기본값 설정
 * @param {Object} vmGrid vue instance id
 */
function setColumnStyles(grid) {
  let options = {
    editStyleOptions: [
      {
        background: '#FFFFFFD2'
      },
      {
        background: '#FFF9F9F9',
        focusColor: '#FFBB00'
      }
    ]
  }

  grid.getColumns().map((x) => {
    let column = grid.columnByName(x.name);
    let renderer = grid.getColumnProperty(x.name, 'renderer');
    //필드가 number 타입 일 경우 오른쪽 정렬
    if(grid.getVersion()[0].match(1)) {
      grid.getDataProvider().getFields().map(y => {
        if (x.name === y.fieldName) {
          if (y.dataType === 'number') {
            options.editStyleOptions[0].textAlignment = 'far';
          } else {
            options.editStyleOptions[0].textAlignment = 'center';
          }
        }
      });
    } else {
      grid._dataProvider.getFields().map(y => {
        if (x.name === y.fieldName) {
          if (y.dataType === 'number') {
            options.editStyleOptions[0].textAlignment = 'far';
          } else {
            options.editStyleOptions[0].textAlignment = 'center';
          }
        }
      });
    }
    
    // 컬럼 editable 설정에 따라 row backgroundcolor 변경
    if (x.editable) {
      grid.setColumnProperty(column, 'styles', options.editStyleOptions[0]);
    } else {
      if (column.type === "group") {
        x.columns.map(c => {
          if (c.editable) {
            grid.setColumnProperty(c, 'styles', options.editStyleOptions[0]);
          } else {
            grid.setColumnProperty(c, 'styles', options.editStyleOptions[1]);
          }
        });
      } else if (renderer !== undefined && renderer !== null && renderer['type'] === 'check') {
        if (renderer['editable']) {
          grid.setColumnProperty(x.name, 'styles', options.editStyleOptions[0]);
        } else {
          grid.setColumnProperty(x.name, 'styles', options.editStyleOptions[1]);
        }
      } else {
        grid.setColumnProperty(column, 'styles', options.editStyleOptions[1]);
      }
    }
  });
}

/**
 * 체크된 행에서 특정 컬럼의 데이터셀의 값을 가져온다
 * @param {Object} vmGrid grid vue instance Id
 * @param {String | Array} columnName 컬럼명, 미설정시에 체크된 행의 데이터셀의 값을 전부 가져 온다.
 */
function gCheckedRowsInfo(vmGrid, columnName) {
  let arVal = [];
  if (columnName !== undefined) {
    if (Array.isArray(columnName)) {
      vmGrid.gridView.getCheckedItems().map(rowIndex => {
        let obj = {};
        columnName.map(col => {
          obj[col] = vmGrid.gridView.getValues(rowIndex)[col];
        });
        arVal.push(obj);
      });
    } else {
      vmGrid.gridView.getCheckedItems().map(index => {
        arVal.push(vmGrid.gridView.getValue(index, columnName));
      });
    }
  } else {
    vmGrid.gridView.getCheckedItems().map(index => {
      let objRow = vmGrid.gridView.getValues(index);
      delete objRow['__rowId'];
      arVal.push(objRow);
    });
  }
  return arVal;
}

/**
 * 상태값이 변경된 행의 정보를 가져온다
 * @param {Object} vmGrid grid vue instance Id
 * @param {String} state row 상태 값
 */
function gChangedRows(vmGrid, state = 'all') {
  let arVal = [];
  let arChanges = [];
  if (state === 'all') {
    arChanges = arChanges.concat(
      vmGrid.dataProvider.getAllStateRows().created,
      vmGrid.dataProvider.getAllStateRows().updated,
      vmGrid.dataProvider.getAllStateRows().deleted,
      vmGrid.dataProvider.getAllStateRows().createAndDeleted
    );
  } else if (state === 'created') {
    arChanges = vmGrid.dataProvider.getAllStateRows().created;
  } else if (state === 'updated') {
    arChanges = vmGrid.dataProvider.getAllStateRows().updated;
  } else if (state === 'deleted') {
    arChanges = vmGrid.dataProvider.getAllStateRows().deleted;
  } else if (state === 'createAndDeleted') {
    arChanges = vmGrid.dataProvider.getAllStateRows().createAndDeleted;
  }
  arChanges.map(function (row) {
    arVal.push(vmGrid.dataProvider.getJsonRow(row));
  });
  return arVal;
}

/**
 * 특정 컬럼들의 editable 상태를 변경한다.
 * @param {Object} vmGrid grid vue instance Id
 * @param {Array | Number} rowIndex editable 상태 변경할 행 (default 는 현재 행)
 * @param {Array | Number} columns editable 상태 변경할 컬럼
 * @param {Boolean} editable editable 여부. default : true
 */
function gSetEditableColumns(vmGrid, rowIndex, columns, editable = true) {
  if (arguments.length === 2) {
    rowIndex = vmGrid.gridView.getCurrent().dataRow;
    columns = arguments[1];
  }
  if (arguments.length === 3) {
    if(typeof arguments[2] === 'boolean') {
      vmGrid = arguments[0];
      rowIndex = vmGrid.gridView.getCurrent().dataRow;
      columns = arguments[1];
      editable = arguments[2];
    } else {
      vmGrid = arguments[0];
      rowIndex = arguments[1];
      columns = arguments[2];
    }
  }

  let index = [];
  columns.map(columnName => {
    index.push(vmGrid.gridView.columnByName(columnName).dataIndex);
  });
  if (editable) {
    vmGrid.gridView.addCellStyle(STYLE_ID_EDITABLE, STYLE_EDITABLE, true);
    vmGrid.gridView.setCellStyles(rowIndex, index, STYLE_ID_EDITABLE);
  } else if (!editable) {
    vmGrid.gridView.addCellStyle(STYLE_ID_UNEDITABLE, STYLE_UNEDITABLE, true);
    vmGrid.gridView.setCellStyles(rowIndex, index, STYLE_ID_UNEDITABLE);
  }
}

/**
 * 그리드를 초기화 한다.
 * @param {Object} vmGrid grid vue instance Id
 */
function gResetGrid(vmGrid) {
  vmGrid.dataProvider.clearRows(); //데이터 초기화

  //grid, provider 초기화
  vmGrid.gridView.destroy();
  vmGrid.dataProvider.destroy();

  //LocalDataProvider와 GridView 객체 초기화
  vmGrid.gridView = null;
  vmGrid.dataProvider = null;
}

/**
 * 그리드를 생성한다.
 * @param {Object} vmGrid grid vue instance Id
 */
function gCreateGrid(vmGrid) {
  console.error('This feature is currently not supported. (gCreateGrid)');

  vmGrid.dataProvider = new RealGridJS.LocalDataProvider();
  let id = ((b) => {
    if(b) {return vmGrid.$el.id;}
    return vmGrid.id;
  })(vmGrid.$el)

  vmGrid.gridView = new RealGridJS.GridView(id);
  vmGrid.gridView.setDataSource(vmGrid.dataProvider);
  vmGrid.gridView.getVersion = function () {
     return RealGridJS.getVersion() 
  }

  gInitStyle(vmGrid);
  gSetOptions(vmGrid);

  vmGrid.dataProvider.setFields(vmGrid.fields);
  vmGrid.gridView.setColumns(vmGrid.columns);

  setColumnStyles(vmGrid.gridView);

  if (vmGrid.gPersonal) {
    gSetPersonalize(vmGrid);
  }
}

/**
 * 그리드를 생성한다 ASYNC 방식.
 * @param {Object} vmGrid grid vue instance Id
 */
async function gCreateGridAsync(vmGrid) {
  console.error('This feature is currently not supported. (gCreateGridAsync)');

  vmGrid.dataProvider = new RealGridJS.LocalDataProvider();
  
  let id = ((b) => {
    if(b) {return vmGrid.$el.id;}
    return vmGrid.id;
  })(vmGrid.$el)
  vmGrid.gridView = new RealGridJS.GridView(id);
  vmGrid.gridView.setDataSource(vmGrid.dataProvider);
  vmGrid.gridView.getVersion = function () { return RealGridJS.getVersion() }

  if (vmGrid.gPersonal) {
    await gSetPersonalize(vmGrid);
  } else {
    await gInitStyle(vmGrid);
    await gSetOptions(vmGrid);
  }

  vmGrid.dataProvider.setFields(vmGrid.fields);
  vmGrid.gridView.setColumns(vmGrid.columns);

  setColumnStyles(vmGrid.gridView);

  // Apply Custom Font Style
  window.onload = function() {
    vmGrid.gridView.refresh();
  }
}

/**
 * 개인화 데이터를 적용한다.
 * @param {Object} vmGrid grid vue instance Id
 */
function gSetPersonalize(vmGrid) {
  return axios
    .get(baseURI() + 'personal', {
      params: {
        UI_ID: vom.active,
        GRID_ID: vmGrid.$el.id,
        USER_ID: authentication.getUsername(),
        AUTH_TP: 'COMMON'
      }
    })
    .then(function (response) {
      if (response.data.length > 0) {
        response.data.map(function (rowData) {
          //personal.psnzAppyYn - 전체 개인화 설정 값
          //psnzAppyYn - 컬럼 개별 개인화 설정 값
          if (rowData['psnzAppyYn'] === 'Y') {
            vmGrid.gridView.setColumnProperty(rowData['fieldId'], 'width', rowData['fieldWdth']);
            if (rowData.actvYn === "Y") {
              vmGrid.gridView.setColumnProperty(rowData['fieldId'], 'visible', true);
            } else {
              vmGrid.gridView.setColumnProperty(rowData['fieldId'], 'visible', false);
            }
            let seq = rowData.seq - 1;
            vmGrid.gridView.setColumnProperty(rowData['fieldId'], 'displayIndex', seq);
          }
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    })
    .then(function () {
      gInitStyle(vmGrid);
      gSetOptions(vmGrid);
    });
}

/**
 * 행을 추가한다.
 * @param {Object} vmGrid grid vue instance Id
 */
function gAddRow(vmGrid) {
  if (vmGrid.dataProvider.getRowCount() > 0 && vmGrid.gridView.getCurrent().itemIndex + 1 !== vmGrid.dataProvider.getRowCount()) {
    if(vmGrid.gridView.getSortedFields() !== null) {  //sort
      vmGrid.gridView.beginInsertRow(vmGrid.gridView.getCurrent().itemIndex + 1);
    } else {
      vmGrid.gridView.beginInsertRow(vmGrid.gridView.getCurrent().dataRow + 1);
    }
  } else {
    vmGrid.gridView.beginAppendRow();
  }
  vmGrid.gridView.commit(true);
}

/**
 * 서비스를 호출한다.
 * @params {Object} params call service 에 필요한 parameter
 */
function requestService(params) {
  let paramMap = params;

  if (params.params !== undefined) {
    paramMap = Object.assign(params.params, params);
    delete paramMap.params;
  }

  let formData = new URLSearchParams();
  let arrayParam = Object.entries(paramMap);
  arrayParam.forEach(el => {
    formData.append(el[0], el[1]);
  });

  let url = '';
  if (paramMap.target !== undefined) {
    url = 'engine/' + paramMap.target + '/' + paramMap.service;
  } else {
    url = 'UIManagementServlet';
  }

  return axios.post(baseURI() + url, formData, {
    headers: getHeaders({}, true)
  });
}

Vue.prototype.$createGrid = function (gridId, fields, columns) {
  let dataProvider = null;
  let gridView = null;
  let gridRealId = vom.active+"-"+gridId;
  let version = document.getElementById(gridRealId).getAttribute('version');
  if (version === "1") {
    dataProvider = new RealGridJS.LocalDataProvider();
    gridView = new RealGridJS.GridView(gridRealId);
    gridView.setDataSource(dataProvider);
    gridView.getVersion = function () { return RealGridJS.getVersion() }
  } else if (version === null || version === "2") {
    dataProvider = new LocalDataProvider(false);
    gridView = new GridView(gridRealId);
    gridView.setDataSource(dataProvider);
    gridView.getVersion = function () {return gridVersion};
  }
 
  dataProvider.setFields(fields);
  gridView.setColumns(columns);

  let rg = {};
  rg.dataProvider = dataProvider;
  rg.gridView = gridView;

  let obj = {};
  obj[gridRealId] = rg;
  Object.assign(Vue.grids, obj);

  return Vue.grids[gridRealId];
}

export {
  gInitStyle,
  gCheckedRowsInfo,
  gSetEditableColumns,
  gChangedRows,
  gResetGrid,
  gCreateGrid,
  gCreateGridAsync,
  gSetOptions,
  gSetPersonalize,
  gAddRow,
  requestService
};
