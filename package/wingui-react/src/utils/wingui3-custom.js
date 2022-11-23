'use strict';

var wingui3 = {};

wingui3.namespace = function (namespace) {
  var parts = namespace.split('.');
  if (parts[0] === 'wingui3') {
    parts = parts.slice(1);
  }

  var parent = wingui3;
  for (var i = 0, n = parts.length; i < n; i++) {
    var part = parts[i];
    if (!parent[part]) {
      parent[part] = {};
    }
    parent = parent[part];
  }
  return parent;
};

wingui3.namespace('wingui3.util.view');

wingui3.util.view.getCurrentViewId = function () {
  return vom.active;
};

wingui3.namespace('wingui3.util.date');

wingui3.util.date.calendar = (function () {
  var firstDayOfWeek = 1;

  return {
    getFirstDayOfWeek: function () {
      return firstDayOfWeek;
    },
    setFirstDayOfWeek: function (dayOfWeek) {
      firstDayOfWeek = dayOfWeek;
    },
    changeFirstDate: function (date) {
      var newDate = this.newDate(date);
      var diff = (newDate.getDay() + 7 - firstDayOfWeek) % 7;
      newDate.setDate(newDate.getDate() - diff);
      return newDate;
    },
    changeFirstDateISO: function (date) {
      var newDate = this.newDate(date);
      var diff = (newDate.getDay() + 6) % 7;
      newDate.setDate(newDate.getDate() - diff);
      return newDate;
    },
    getNextMonday: function (date) {
      var newDate = this.newDate(date);
      if (newDate.getDay() === 1) {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + (1 + 7 - newDate.getDay()) % 7);
      }
      return newDate;
    },
    getStartDateOfYear: function (date) {
      var newDate = this.toDate(date);

      var startDate = new Date(newDate.getFullYear(), 0, 1);
      if (startDate.getDay() === 0 || startDate.getDay() > 4) { // Friday: 5, Saturday: 6, Sunday: 0
        return this.getNextMonday(startDate);
      } else {
        return this.changeFirstDateISO(startDate);
      }
    },
    getMonthLastDay: function (date) {
      var newDate = this.toDate(date);
      var year    = newDate.getFullYear();
      var month = newDate.getMonth() + 1;
      var last   = new Date( year, month );
      last   = new Date( last - 1 );
      //console.log("result==>",last)
      return last;
    },
    getWeekOfYear: function (date) {
      var newDate = this.newDate(date);

      var nextDate = this.getNextMonday(newDate);
      if (nextDate.getFullYear() !== newDate.getFullYear()) {
        var nextYearStart = new Date(nextDate.getFullYear(), 0, 1);

        var nextYearStartDay = nextYearStart.getDay();
        if (1 < nextYearStartDay && nextYearStartDay <= 4) {
          return 1;
        }
      }

      var fromDate = this.getStartDateOfYear(newDate);
      var toDate = this.changeFirstDateISO(newDate);

      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      var diffDays = (toDate.getTime() - fromDate.getTime()) / 86400000;

      var weekOfYear = Math.round(diffDays / 7) + 1;
      if (weekOfYear === 0) {
        weekOfYear = this.getWeekOfYear(this.changeFirstDateISO(newDate));
      }
      return weekOfYear;
    },
    toDate: function (date) {
      if (typeof date === 'string') {
        date = new Date(date.replace(/\./g, '-'));
      }
      return date;
    },
    newDate: function (date) {
      if (typeof date === 'string') {
        date = new Date(date.replace(/\./g, '-'));
      } else {
        date = new Date(date.getTime());
      }
      return date;
    },
    addDate: function (date, days) {
      var date = this.newDate(date);
      date.setDate(date.getDate() + days);
      return date;
    }
  };
})();

wingui3.util.date.getFirstDateOfPartialWeek = function (date) {
  var calendar = wingui3.util.date.calendar;

  date = calendar.newDate(date);
  if (date.getDay() === calendar.getFirstDayOfWeek()) {
    return date;
  }

  var year = date.getFullYear();
  var month = date.getMonth();

  date = calendar.changeFirstDate(date);
  if (month !== date.getMonth()) {
    date.setDate(1);
    date.setMonth(month);
    date.setFullYear(year);
  }
  return date;
};

wingui3.util.date.getFirstDayOfPartialWeek = function (date) {
  return wingui3.util.date.getFirstDateOfPartialWeek(date).getDay();
};

wingui3.util.date.toDateString = function (date) {
  date = wingui3.util.date.calendar.toDate(date);

  var dateArray = [
    date.getFullYear(),
    ('0' + (date.getMonth() + 1)).slice(-2),
    ('0' + (date.getDate())).slice(-2)
  ];

  return dateArray.join('-');
};

wingui3.util.date.toPartialWeekString = function (date, isWeek) {
  var calendar = wingui3.util.date.calendar;

  date = calendar.toDate(date);

  var weekOfYear = calendar.getWeekOfYear(date);
  if (weekOfYear < 10) {
    weekOfYear = '0' + weekOfYear
  } else {
    weekOfYear = '' + weekOfYear;
  }

  var firstDate = wingui3.util.date.getFirstDateOfPartialWeek(date);
  if (isWeek == true) {
    return 'W' + weekOfYear;
  } else if (firstDate.getDay() === calendar.getFirstDayOfWeek()) {
    var nextDate = new Date(firstDate);
    nextDate.setDate(nextDate.getDate() + 6);
    if (date.getMonth() === nextDate.getMonth()) {
      return 'W' + weekOfYear;
    } else {
      return 'W' + weekOfYear + 'A';
    }
  } else {
    return 'W' + weekOfYear + 'B';
  }
};

wingui3.util.date.parseString = function (target, regexp, index) {
  if (!regexp) {
    regexp = /\d{4}-\d{2}-\d{2}/;
  }

  if (!index) {
    index = 0;
  }

  var pattern = target.match(regexp);
  if (!pattern) {
    return '';
  }

  var results = pattern.concat();
  if (index < results.length) {
    return results[index];
  }

  return '';
}

wingui3.util.date.toLastDateString = function (dateColumnName, regexp) {
  var dateString = wingui3.util.date.parseString(dateColumnName, regexp);

  var newDate = wingui3.util.date.calendar.toDate(dateString);
  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(newDate.getDate() - 1);

  return wingui3.util.date.toDateString(newDate);
}

wingui3.util.date.toMonthlyString = function (date) {
  date = wingui3.util.date.calendar.toDate(date);
  return 'M' + ('0' + (date.getMonth() + 1)).slice(-2);
};

wingui3.util.date.toQuaterString = function (date) {
  date = wingui3.util.date.calendar.toDate(date);
  var month = date.getMonth() + 1;
  var quaterInfo =  (Math.ceil(month / 3));
  return 'Q' + quaterInfo;
};

wingui3.util.date.toYearString = function (date) {
  date = wingui3.util.date.calendar.toDate(date);
  return 'Y' + date.getFullYear();
};

wingui3.util.date.toDayString = function (date) {
  date = wingui3.util.date.calendar.toDate(date);
  var days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
  return days[date.getDay()];
};

wingui3.util.date.toDate = function(dateStr, splitStr) {
  var dateSplit = dateStr.split(splitStr);
  var year = dateSplit[0];
  var month = dateSplit[1];
  var day = dateSplit[2];
  //console.log("split===>", [year, month, day]);
  var date = new Date(year, month - 1, day);
  return date;
}

wingui3.namespace('wingui3.util.grid');

wingui3.util.grid.GridWrap = function (grid1,gridView, xmlGridOption) {
  this.grid1 = grid1;

  this.gridView = gridView;
  this.dataProvider = gridView.getDataSource();
  this.gridView.xmlGridOption = xmlGridOption

  this.init = function (regexp) {
    if (!regexp) {
      regexp = /\d{4}.\d{2}.\d{2}/;
    }

    this.version = this.gridView.getVersion()[0];
    this.regexp = regexp;
    if(!this.gridView.dataColumns)
      this.gridView.dataColumns=[];
    if(!this.gridView.prefInfo)
      this.gridView.prefInfo=[]

    this.dateColumnNames = this.gridView.dataColumns.filter(function (dataColumn) {
      return dataColumn.columnIdOrg === 'DATE' || dataColumn.columnIdOrg === 'DAT';
    }).map(function (dataColumn) {
      return dataColumn.name;
    });

    this.measureCodes = this.gridView.prefInfo.filter(function (prefRow) {
      return prefRow.fldActiveYn && prefRow.crosstabItemCd === 'GROUP-VERTICAL-VALUES';
    }).map(function (prefRow) {
      return prefRow.fldApplyCd;
    });

    this.setWheelScrollLines(this.measureCodes.length);

    this.dateObj = {};
    this.monthlyDateColumnNames = [];
    this.quaterDateColumnNames = [];
    this.yearDateColumnNames = [];
    this.dayDateColumnNames = [];

    var isMonthly = false;

    for (var i = 0, n = this.dateColumnNames.length; i < n; i++) {
      var dateColumnName = this.dateColumnNames[i];

      var pattern = dateColumnName.match(regexp);
      if (!pattern) {
        console.warn('The matching date format does not exist. (date string: ' + dateColumnName + ', date pattern: ' + regexp + ')');
        continue;
      }

      var date = pattern.concat()[0];
      if (!isMonthly && i < n - 1) {
        var nexPattern = this.dateColumnNames[i + 1].match(regexp);
        if (nexPattern) {
          var nextDate = nexPattern.concat()[0];
          if (date.slice(-2) === '01' && nextDate.slice(-2) === '01') {
            isMonthly = true;
          }
        }
      }

      this.dateObj[dateColumnName] = date;
      if (isMonthly) {
        this.monthlyDateColumnNames.push(dateColumnName);
      }
    }
    
    this.gridView.addCellStyle(this.gridView,'uneditable', {
        'background': '#f9f9f9',
        'readOnly': true,
        'editable': false
      }, true);
    

    this.gridView.setDisplayOptions({
      showInnerFocus: false
    });
  };


  this.initEntry = function (regexp, viewBuck, varBuck1, varDate1, varBuck2, varDate2, buck, endDate) {
    if (!regexp) {
      regexp = /\d{4}.\d{2}.\d{2}/;
    }

    this.version = this.gridView.getVersion()[0];
    this.regexp = regexp;

    this.dateColumnNames = this.gridView.dataColumns.filter(function (dataColumn) {
      return dataColumn.columnIdOrg === 'DATE' || dataColumn.columnIdOrg === 'DAT';
    }).map(function (dataColumn) {
      return dataColumn.name;
    });

    this.measureCodes = this.gridView.prefInfo.filter(function (prefRow) {
      return prefRow.fldActiveYn && prefRow.crosstabItemCd === 'GROUP-VERTICAL-VALUES';
    }).map(function (prefRow) {
      return prefRow.fldApplyCd;
    });

    this.setWheelScrollLines(this.measureCodes.length);

    this.dateObj = {};
    this.monthlyDateColumnNames = [];
    this.quaterDateColumnNames = [];
    this.yearDateColumnNames = [];
    this.dayDateColumnNames = [];

    var isMonthly = false;
    var isQuater = false;
    var isYear = false;
    var isDay = false;

    for (var i = 0, n = this.dateColumnNames.length; i < n; i++) {
      var dateColumnName = this.dateColumnNames[i];
      var pattern = dateColumnName.match(regexp);
      if (!pattern) {
        console.warn('The matching date format does not exist. (date string: ' + dateColumnName + ', date pattern: ' + regexp + ')');
        continue;
      }

      var dateStr = pattern.concat()[0];

      var buckType = null;
      if (viewBuck == "PB") {
        //Date type으로 변경
        var date = wingui3.util.date.toDate(dateStr, ".")

        if (varDate1 != null) {
          if (date >= varDate1) {
            buckType =  varBuck1 ;
          } else {
            buckType = buck
          }
          if (varDate2 != null && date >= varDate2){
            buckType =  varBuck2 ;
          }
        } else {
          buckType = buck
        }
        //console.log("hanguls  date", date, " bucketType:",buckType);
      } else {
        buckType = viewBuck;
      }
      this.dateObj[dateColumnName] = dateStr;
      if (buckType == null) {
      } else if (buckType == "M") {
        this.monthlyDateColumnNames.push(dateColumnName);
      } else if (buckType == "Q") {
        this.quaterDateColumnNames.push(dateColumnName);
      } else if (buckType == "Y") {
        this.yearDateColumnNames.push(dateColumnName);
      } else if (buckType == "D") {
        this.dayDateColumnNames.push(dateColumnName);
      }

    }
    
    this.gridView.addCellStyle(this.gridView,'uneditable', {
        'background': '#f9f9f9',
        'readOnly': true,
        'editable': false
      }, true);    

    this.gridView.setDisplayOptions({
      showInnerFocus: false
    });
  };

  this.getMeasureNames = function (measureCodes) {
    var measureNames = [];

    if (measureCodes) {
      for (var i = 0, n = measureCodes.length; i < n; i++) {
        if (this.measureCodes.indexOf(measureCodes[i]) === -1) {
          continue;
        }
        measureNames.push(transLangKey(measureCodes[i]));
      }
      return measureNames;
    }

    for (var i = 0, n = this.measureCodes.length; i < n; i++) {
      measureNames.push(transLangKey(this.measureCodes[i]));
    }
    return measureNames;
  };

  this.setWheelScrollLines = function (wheelScrollLines) {
    var options = this.gridView.getDisplayOptions();
    options.wheelScrollLines = wheelScrollLines;
    this.gridView.setDisplayOptions(options);
  };

  this.toDateString = function (dateColumnName) {
    return this.dateObj[dateColumnName];
  };

  this.setPasteOptions = function (options) {
    var pasteOptions = this.gridView.getPasteOptions()
    for (var optionName in options) {
      pasteOptions[optionName] = options[optionName];
    }
    this.gridView.setPasteOptions(pasteOptions);
  };

  this.setBucketHeaderText = function (isWeek) {

    console.log('dateColumnNames', this.dateColumnNames)
    for (var i = 0, n = this.dateColumnNames.length; i < n; i++) {
      var dateColumnName = this.dateColumnNames[i];
      var date = this.toDateString(dateColumnName);

      var headerText;
      if (this.yearDateColumnNames !== undefined && this.yearDateColumnNames.includes(dateColumnName)) {
        headerText = wingui3.util.date.toYearString(date);
      }else if (this.quaterDateColumnNames !== undefined && this.quaterDateColumnNames.includes(dateColumnName)) {
        headerText = wingui3.util.date.toQuaterString(date);
      }else if (this.monthlyDateColumnNames !== undefined && this.monthlyDateColumnNames.includes(dateColumnName)) {
        headerText = wingui3.util.date.toMonthlyString(date);
      }else if (this.dayDateColumnNames !== undefined && this.dayDateColumnNames.includes(dateColumnName)) {
        headerText = wingui3.util.date.toDayString(date);
      }else {
        headerText = wingui3.util.date.toPartialWeekString(date, isWeek);
      }
      var columnProperty = this.gridView.getColumnProperty(dateColumnName, 'header');
      if(columnProperty) {
        columnProperty.text = headerText;
        this.gridView.setColumnProperty(dateColumnName, 'header', columnProperty);
      }
    }
  };

  this.setCellStyleUneditable = function (fromDate, toDate, measureCodes, type) {
    fromDate = fromDate && fromDate.replace(/[^\d]/g, '');
    toDate = toDate && toDate.replace(/[^\d]/g, '');

    for (var i = 0, n = this.dateColumnNames.length; i < n; i++) {
      var dateColumnName = this.dateColumnNames[i];

      var date;
      if (this.monthlyDateColumnNames.includes(dateColumnName)) {
        date = wingui3.util.date.toLastDateString(dateColumnName, this.regexp).replace(/[^\d]/g, '');
      } else {
        date = this.toDateString(dateColumnName).replace(/[^\d]/g, '');
      }

      if (fromDate && date < fromDate) {
        continue;
      }

      if (toDate && date >= toDate) {
        break;
      }

      for (var j = 0, len = this.dataProvider.getRowCount(); j < len; j++) {
        if (measureCodes) {
          var row = this.dataProvider.getJsonRow(j);
          if (!measureCodes.includes(row.CATEGORY)) {
            continue;
          }
        }
        
        this.gridView.setCellStyle(this.gridView,j, dateColumnName, 'uneditable');
        

        if (type === 'DTF') {
          var styleExceptCell = {
            originalStyleID : null,
            styleID : 'uneditable',
            rowIndex : j,
            fieldIndex :  this.dataProvider.getFieldIndex(dateColumnName) ,
            fieldName :  dateColumnName
          };
          this.gridView.styleExceptCells.push(styleExceptCell);
        }
      }
    }
  };

  this.getRow = function () {
    if (!this.dataRows) {
      return {};
    }

    var args;
    if (arguments.length === 1 && arguments[0] instanceof Array) {
      args = arguments[0];
    } else {
      args = Array.prototype.slice.call(arguments);
    }

    var parent = this.dataRows;
    for (var i = 0, n = args.length; i < n; i++) {
      var parent = parent[args[i]];
      if (!parent) {
        console.warn('There is no data that matches the key value. (key value: ' + args.slice(0, i + 1).join(' > ') + ')');
        return {};
      }
    }
    return parent;
  };

  this.getRows = function () {
    if (this.dataRows) {
      return this.dataRows;
    }

    return {};
  };

  this.setRows = function () {
    this.dataKeys = Array.prototype.slice.call(arguments);
    this.dataRows = {};

    if (this.dataKeys.length === 0) {
      return;
    }

    for (var i = 0, n = this.dataProvider.getRowCount(); i < n; i++) {
      var row = this.dataProvider.getJsonRow(i);

      var parent = this.dataRows;
      for (var j = 0, len = this.dataKeys.length; j < len; j++) {
        var keyValue = row[this.dataKeys[j]];

        if (!keyValue) {
          console.warn('There is no data that matches the key. (key: ' + this.dataKeys.slice(0, j + 1).join(' > ') + ')');
          break;
        }

        if (j === len - 1) {
          row.index = i;
          parent[keyValue] = row;
        } else {
          if (!parent[keyValue]) {
            parent[keyValue] = {};
          }
          parent = parent[keyValue];
        }
      }
    }
  };

  this.setValueChanger = function (key, valueChanger) {
    if (typeof valueChanger !== 'function') {
      console.warn('Value changer is not a function.');
      return;
    }

    if (!this.valueChangers) {
      this.valueChangers = {};
    }

    this.valueChangers[key] = valueChanger;
  };

  this.setChangedValue = function (dataRow, field) {
    var row = this.dataProvider.getJsonRow(dataRow);
    var fieldName = this.dataProvider.getFieldName(field);

    if (!this.dateColumnNames.includes(fieldName)) {
      return;
    }

    if (this.summaryFooter) {
      this.summaryFooter.setChangedMeasure(row, fieldName, dataRow);
    }

    if (!this.valueChangers) {
      return;
    }

    if (this.dataKeys && this.dataKeys.length > 0) {
      var lastKey = this.dataKeys[this.dataKeys.length - 1];

      var key = row[lastKey];
      if (this.valueChangers[key]) {
        var args = this.dataKeys.map(function (dataKey) {
          return row[dataKey];
        }).slice(0, -1);

        var dataRow = this.getRow(args);
        this.valueChangers[key](this.dataProvider, dataRow, field);

        this.gridView.commit();
      }
    }
  };

  this.setDefaultValue = function (dataRow, field) {
    var row = this.dataProvider.getJsonRow(dataRow);
    var fieldName = this.dataProvider.getFieldName(field);

    if (!row[fieldName]) {
      this.dataProvider.setValue(dataRow, fieldName, 0);
      this.gridView.commit();
    }
  };

  this.setDefaultValueForSelection = function () {
    var data = this.gridView.getSelectionData();

    var selectedItems = gridView.getSelectedItems();
    for (var i = 0, n = selectedItems.length; i < n; i++) {
      for (var columnName in data[i]) {
        data[i][columnName] = 0;
        this.gridView.setValues(selectedItems[i], data[i], false);
        this.setChangedValue(this.gridView.getDataRow(selectedItems[i]), this.dataProvider.getFieldIndex(columnName));
      }
    }
    this.gridView.setEditValue(0, true);
  };

  this.onSelectionEnded = function (onlyFirst, event) {
    if (!onlyFirst) {
      onlyFirst = false;
    }

    if (!event) {
      var regexp = this.regexp;

      event = function (gridView) {
        var sum = 0;
        var data = gridView.getSelectionData();

        var cellCount = 0;

        var n = onlyFirst && data.length > 0 ? 1 : data.length;
        for (var i = 0; i < n; i++) {
          var row = data[i];
          for (var columnName in row) {
            var value = row[columnName];
            if (regexp.test(columnName)) {
              sum += value;
              cellCount++;
            }
          }
        }

        if (cellCount > 1) {
          footer.log.write(' ' + transLangKey('SUM') + ' : ' + sum);
        }
      };
    }

    this.gridView.onSelectionEnded = event;
  };

  this.addSummaryColumns = function (summaryInfo, totalSummaryInfos) {
    this.summaryColumn = new wingui3.util.grid.SummaryColumn(this, this.gridView, this.dateColumnNames);
    this.summaryColumn.create(summaryInfo, totalSummaryInfos);
  };

  this.addSummaryFooter = function (measureColumnName, groupMeasureName, totalMeasureNames) {
    this.summaryFooter = new wingui3.util.grid.SummaryFooter(this, this.gridView, this.dateColumnNames, this.summaryColumn);
    this.summaryFooter.create(measureColumnName, groupMeasureName, totalMeasureNames);
  };
};

wingui3.util.grid.SummaryColumn = function (gridWrap, gridView, dateColumnNames) {
  this.gridWrap = gridWrap;
  this.grid1 = gridWrap.grid1;
  this.gridView = gridView;
  this.dataProvider = gridView.getDataSource();
  this.dateColumnNames = dateColumnNames;

  this.create = function (summaryInfo, totalSummaryInfos) {
    this.summaryColumnNames = {};
    this.totalSummaryInfos = totalSummaryInfos;

    for (var i = 0, n = this.dateColumnNames.length; i < n; i++) {
      var dateColumnName = this.dateColumnNames[i];

      var key = this.getSummaryColumnName(dateColumnName);
      if (key in this.summaryColumnNames) {
        this.summaryColumnNames[key].push(dateColumnName);
      } else {
        this.summaryColumnNames[key] = [dateColumnName];
      }
    }

    var keys = Object.keys(this.summaryColumnNames);
    for (var i = 0, n = keys.length; i < n; i++) {
      var key = keys[i];
      if (this.summaryColumnNames[key].length === 1) {
        delete this.summaryColumnNames[key];
      }
    }

    this.summaryColumnKeys = Object.keys(this.summaryColumnNames);
    this.summaryColumnKeys.sort();
    
    var firstColumn = this.grid1.findGridItem(this.grid1.getGridItems(),this.dateColumnNames[0]);
    var firstColumnWidth = firstColumn ? firstColumn.width : 100;
    
    var summaryFields = {};
    var summaryColumns = {};

    for (var i = 0, n = this.summaryColumnKeys.length; i < n; i++) {
      var summaryColumnKey = this.summaryColumnKeys[i];

      var expressions = this.summaryColumnNames[summaryColumnKey].map(function (columnName) {
        return '((values["' + columnName + '"] is not nan) and values["' + columnName + '"])';
      });

      var summaryField = {
        fieldName: summaryColumnKey,
        dataType: 'number',
        calculateExpression: expressions.join(' + ')
      };

      var summaryStyles = this.getSummaryStyles();
      var summaryHeader = this.getSummaryHeader(summaryColumnKey);
      var summaryFooter = this.getSummaryFooter();

      if (summaryInfo) {
        summaryInfo.styles && Object.assign(summaryStyles, summaryInfo.styles);
        summaryInfo.header && Object.assign(summaryHeader, summaryInfo.header);
        summaryInfo.footer && Object.assign(summaryFooter, summaryInfo.footer);
      }

      summaryFields[summaryColumnKey] = summaryField;

      summaryColumns[summaryColumnKey] = {
        type: summaryField.dataType,
        dataType: summaryField.dataType,
        headerText: summaryHeader.text,
        name: summaryField.fieldName,
        fieldName: summaryField.fieldName,
        width: firstColumnWidth,
        editable: false,
        visible: true,
        styles: summaryStyles,
        header: summaryHeader,
        footer: summaryFooter,
        valueExpression: summaryField.calculateExpression
      };
    }

    var newFields = this.dataProvider.getFields();
    var columns = this.gridView.dataColumns;

    for (var i = 0, len = this.summaryColumnKeys.length; i < len; i++) {
      var summaryColumnKey = this.summaryColumnKeys[i];

      var targetColumnNames = this.summaryColumnNames[summaryColumnKey];
      var targetColumnName = targetColumnNames[targetColumnNames.length - 1];

      var summaryField = summaryFields[summaryColumnKey];
      var summaryColumn = summaryColumns[summaryColumnKey];

      for (var j = 0, n = columns.length; j < n; j++) {
        if (columns[j].name === targetColumnName) {
          newFields.splice(i + j + 1, 0, summaryField);
          
          this.grid1.addGridItem(summaryColumn, null, i + j + 1);
          //console.log('summaryColumn',summaryColumn)
          break;
        }
      }
    }

    if (this.totalSummaryInfos) {
      for (var i = 0, n = this.totalSummaryInfos.length; i < n; i++) {
        var totalSummaryInfo = this.totalSummaryInfos[i];

        var summaryStyles = this.getSummaryStyles();
        var summaryHeader = this.getSummaryHeader(totalSummaryInfo.columnName);
        var summaryFooter = this.getSummaryFooter();

        totalSummaryInfo.styles && Object.assign(summaryStyles, totalSummaryInfo.styles);
        totalSummaryInfo.header && Object.assign(summaryHeader, totalSummaryInfo.header);
        totalSummaryInfo.footer && Object.assign(summaryFooter, totalSummaryInfo.footer);

        var expression = this.dateColumnNames.map(function (columnName) {
          return '((values["' + columnName + '"] is not nan) and values["' + columnName + '"])';
        });

        expression = expression.join(' + ');
        if (totalSummaryInfo.summaryType === 'average') {
          expression = '(' + expression + ') / ' + this.dateColumnNames.length;
        }

        var summaryField = {
          fieldName: totalSummaryInfo.columnName,
          dataType: 'number',
          calculateExpression: expression
        };

        var summaryColumn = {
          type: 'data',
          dataType: summaryField.dataType,
          headerText: summaryHeader.text,
          name: totalSummaryInfo.columnName,
          fieldName: summaryField.fieldName,
          width: firstColumnWidth,
          editable: false,
          visible: true,
          styles: summaryStyles,
          header: summaryHeader,
          footer: summaryFooter,
          valueExpression: summaryField.calculateExpression
        };

        var index = newFields.length;

        newFields.splice(index, 0, summaryField);
        this.grid1.addGridItem(summaryColumn, null, index);
        console.log('summaryColumn',summaryColumn)
      }
    }
    //this.dataProvider.setFields(newFields);
  };

  this.transHeaderText = function (columnName) {
    if (columnName.indexOf('_SUM') !== -1) {
      return transLangKey(columnName.replace('_SUM', '')) + ' ' + transLangKey('SUM');
    }

    if (columnName.indexOf('_AVG') !== -1) {
      return transLangKey(columnName.replace('_AVG', '')) + ' ' + transLangKey('AVG');
    }
    return transLangKey(columnName);
  };

  this.getSummaryStyles = function () {
    return {
      background: '#88bce55c',
      textAlignment: 'far',
      numberFormat: '#,##0.##'
    };
  };

  this.getSummaryHeader = function (columnName) {
    return {
      styles: {
        background: '#88cef279'
      },
      text: this.transHeaderText(columnName)
    };
  };

  this.getSummaryFooter = function () {
    return {
      styles: {
        textAlignment: 'far',
        numberFormat: '#,##0.##'
      },
      groupStyles: {
        textAlignment: 'far',
        numberFormat: '#,##0.##'
      }
    };
  };

  this.getTotalSummaryInfos = function () {
    return this.totalSummaryInfos;
  };

  this.hasSummaryColumnName = function (dateColumnName) {
    return this.getSummaryColumnName(dateColumnName) in this.summaryColumnNames;
  };

  this.getSummaryColumnName = function (dateColumnName) {
    return gridWrap.toDateString(dateColumnName).slice(0, -3) + '_SUM';
  };

  this.getSummaryColumnNames = function () {
    if (this.totalSummaryInfos) {
      var summaryColumnNames = this.totalSummaryInfos.map(function (totalSummary) {
        return totalSummary.columnName;
      });

      return summaryColumnNames.concat(this.summaryColumnKeys);
    }
    return this.summaryColumnKeys;
  };
};

wingui3.util.grid.SummaryFooter = function (gridWrap,gridView, dateColumnNames, summaryColumn) {
  this.grid1 = gridWrap.grid1
  this.gridView = gridView;
  this.dataProvider = gridView.getDataSource();
  this.dateColumnNames = dateColumnNames;
  this.summaryColumn = summaryColumn;

  this.data = {};
  this.changedInfo = {};

  this.groupData = {};
  this.groupEditedInfo = {};

  this.create = function (measureColumnName, groupMeasureName, totalMeasureNames) {
    //console.log('SummaryFooter create',measureColumnName,groupMeasureName,totalMeasureNames)
    
    this.measureColumnName = measureColumnName;
    this.groupMeasureName = groupMeasureName;
    this.measureNames = totalMeasureNames;

    this.gridView.setOptions({ summaryMode: "aggregate" });
    this.gridView.groupPanel.visible = true;
    this.gridView.setFooters({ visible: true,height : 25 * this.measureNames.length });
    this.gridView.setOptions({ summaryMode: "aggregate" });
    this.gridView.stateBar.width = 16;
    
    this.gridView.rowGroup.mergeExpanderVisibility = 'always';
    this.gridView.groupBy([]);
    this.gridView.setRowGroup({
      mergeMode: true,
      expandedAdornments: "footer",
      visible: true,
      expression: "sum",
      summaryMode: 'aggregate',
      sorting: true,      
      footerStatement: 'Sum:',
      footerCellMerge: true,
      levels: [
        {
          footerStyles: {
            background: '#ffffbb00',
            foreground: '#ff4b0700',
          },
          footerBarStyles: {
            background: '#ffffbb00'
          },
          barStyles: {
            background: '#ffffbb00'
          }
        }
      ]
    });


    let text = this.measureNames.map(function (measureName) {
      return transLangKey(measureName);
    }).toString()

    this.gridView.setColumnProperty(this.measureColumnName, 'footer', {
      text: text, //이넘은 표시되지 않고 prefix/suffix가 표시됨..
      numberFormat: "#,000",
      expression: "",
      prefix: text + '(',
      suffix: ')'
    });

    this.gridView.setColumnProperty(this.measureColumnName, 'groupFooter', {
      text: text, //이넘은 표시되지 않고 prefix/suffix가 표시됨..
      numberFormat: "#,000",
      expression: "",
      prefix: text + '(',
      suffix: ')'

    });
    
    var columnNames = this.dateColumnNames.concat(this.summaryColumn.getSummaryColumnNames());
    var summaryFooter = this;

    for (var i = 0, n = columnNames.length; i < n; i++) {
      this.gridView.setColumnProperty(columnNames[i], 'footer', {
        "numberFormat": "#,000",
        valueCallback: function (gridView,column, footerIndex, columnFooter, value) {
          return summaryFooter.getSummary(footerIndex, column, gridView);
        },
      });
      
      this.gridView.setColumnProperty(columnNames[i], 'groupFooter', {
        "numberFormat": "#,000",
        //expression: "sum",   이넘이 설정되면 valueCallback이 호출되지 않음.
        valueCallback: function (gridView, column, groupFooterIndex, group, value) {
          return summaryFooter.getGroupSummary(groupFooterIndex, column, gridView);
        },
      });
      
    }
  };

  this.setChangedMeasure = function (row, fieldName, dataRow) {
    var measureName = row[this.measureColumnName];
    if (measureName in this.changedInfo) {
      this.changedInfo[measureName].push(fieldName);
    } else {
      this.changedInfo[measureName] = [fieldName];
    }

    if (summaryColumn.hasSummaryColumnName(fieldName)) {
      this.changedInfo[measureName].push(summaryColumn.getSummaryColumnName(fieldName));
    }

    var totalSummaryInfos = summaryColumn.getTotalSummaryInfos();
    if (totalSummaryInfos) {
      for (var i = 0, n = totalSummaryInfos.length; i < n; i++) {
        this.changedInfo[measureName].push(totalSummaryInfos[i].columnName);
      }
    }

    if (measureName === this.groupMeasureName) {
      var index = this.gridView.getItemIndex(dataRow);
      while (index !== -1) {
        var editedKey = index + '@' + measureName;
        if (editedKey in this.groupEditedInfo) {
          this.groupEditedInfo[editedKey].push(fieldName);
        } else {
          this.groupEditedInfo[editedKey] = [fieldName];
        }

        if (summaryColumn.hasSummaryColumnName(fieldName)) {
          this.groupEditedInfo[editedKey].push(summaryColumn.getSummaryColumnName(fieldName));
        }

        if (totalSummaryInfos) {
          for (var i = 0, n = totalSummaryInfos.length; i < n; i++) {
            this.groupEditedInfo[editedKey].push(totalSummaryInfos[i].columnName);
          }
        }

        index = this.gridView.getGroupIndex(index);
      }
    }
  };

  this.getSummary = function (footerIndex, column, gridView) {
    
    var measureName = this.measureNames[footerIndex];

    /*
    if (!(footerIndex in this.data)) {
      this.data[footerIndex] = {};
    }

    var edited = false;

    
    if (measureName in this.changedInfo) {
      var fieldNames = this.changedInfo[measureName];

      var fieldIndex = fieldNames.indexOf(column.fieldName);
      if (fieldIndex !== -1) {
        fieldNames.splice(fieldIndex, 1);
        if (fieldNames.length === 0) {
          delete this.changedInfo[measureName];
        }
        edited = true;
      }
    }

    //값을 수정하지 않을 경우, 필터링 되지 않았을 경우 
    var summaryValues = this.data[footerIndex];
    if (!gridView.isFiltered() && !edited && (column.fieldName in summaryValues)) {
      return summaryValues[column.fieldName];
    }
    */
    
    //값을 수정하거나 필터링 수행 시 Summary 값 다시 계산
    var summaryValue = 0;
    for (var i = 0, n = gridView.getItemCount(); i < n; i++) {
      if (gridView.getDataRow(i) > -1 && gridView.getValue(i, this.measureColumnName) == measureName) {
        var value = gridView.getValue(i, column.fieldName);

        if (!isNaN(value)) {
          summaryValue += value;
        }
      }
    }

    //summaryValues[column.fieldName] = summaryValue;

    return summaryValue;
  };

  this.getGroupSummary = function (groupFooterItemIndex, column, gridView) {

    if (!(groupFooterItemIndex in this.groupData)) {
      this.groupData[groupFooterItemIndex] = {};
    }

    var editedKey = this.gridView.getGroupIndex(groupFooterItemIndex) + '@' + this.groupMeasureName;

    var edited = false;
    if (editedKey in this.groupEditedInfo) {
      var fieldNames = this.groupEditedInfo[editedKey];

      var fieldIndex = fieldNames.indexOf(column.fieldName);
      if (fieldIndex !== -1) {
        fieldNames.splice(fieldIndex, 1);
        if (fieldNames.length === 0) {
          delete this.groupEditedInfo[editedKey];
        }
        edited = true;
      }
    }

    var summaryValues = this.groupData[groupFooterItemIndex];
    if (!edited && column.fieldName in summaryValues) {
      return summaryValues[column.fieldName];
    }

    var model = gridView.getModel(groupFooterItemIndex, true);

    var parentModel = gridView.getParentModel(model, true);
    if (!parentModel.dataRows) {
      return 0;
    }

    var summaryValue = 0;
    for (var i = 0, n = parentModel.dataRows.length; i < n; i++) {
      var row = this.dataProvider.getJsonRow(parentModel.dataRows[i]);
      if (row[this.measureColumnName] === this.groupMeasureName) {
        var value = row[column.fieldName];

        if (!isNaN(value)) {
          summaryValue += value;
        }
      }
    }

    summaryValues[column.fieldName] = summaryValue;

    return summaryValue;
  };
};

wingui3.util.grid.searchItem = function (gridView, fields, values) {
  var startIndex = (gridView.getCurrent().itemIndex + 1) % gridView.getItemCount();
  if (gridView.getCurrent().itemIndex == gridView.getItemCount() - 1) {
    startIndex = 0;
  }

  var options = {
    fields: fields,
    values: values,
    startIndex: startIndex,
    caseSensitive: false,
    partialMatch: true,
    wrap: true,
    allFields: false,
    select: false
  };

  var index = gridView.searchItem(options);
  gridView.setCurrent({
    itemIndex: index,
    column: fields[0]
  });

  gridView.setFocus();
}

wingui3.util.grid.filter = (function () {
  var allFilters = {};

  return {
    getFilters: function (viewId) {
      if (!viewId) {
        viewId = wingui3.util.view.getCurrentViewId();
      }

      if (!(viewId in allFilters)) {
        allFilters[viewId] = {};
      }
      return allFilters[viewId];
    },
    onFilteringChanged: function (gridView, column) {
      //console.log('onFilteringChanged')
      var columnFilters = gridView.getColumnFilters(column);
      if (columnFilters) {
        var filterNames = columnFilters.filter(function (columnFilter) {
          return columnFilter.active;
        }).map(function (columnFilter) {
          return columnFilter.name;
        });

        var wheelScrollLines = filterNames.length;
        if (wheelScrollLines > 0) {
          var options = gridView.getDisplayOptions();
          options.wheelScrollLines = filterNames.length;

          gridView.setDisplayOptions(options);
        }
        gridView.filter.getFilters()[column.name] = filterNames;
      }
    },
    activateColumnFilters: function (gridView, columnName, filterNames) {
      if (filterNames && filterNames.length > 0) {
        var savedFilterNames = this.getFilters()[columnName];
        if (savedFilterNames && savedFilterNames.length > 0) {
          var tempFilterNames = [];
          for (var i = 0, n = savedFilterNames.length; i < n; i++) {
            if (filterNames.indexOf(savedFilterNames[i]) !== -1) {
              tempFilterNames.push(savedFilterNames[i]);
            }
          }
          gridView.activateColumnFilters(columnName, tempFilterNames, true);
        } else {
          gridView.activateColumnFilters(columnName, filterNames, true);
        }
      }
    },
    loadFilters: function (gridView, columnNames, excludeNames) {
      gridView.filter = this;
      gridView.onFilteringChanged = null;

      var filter = this.getFilters();
      var columnFilterObj = {};

      for (var i = 0, n = columnNames.length; i < n; i++) {
        var columnName = columnNames[i];

        var filterNames =[];
        if(gridView.prefInfo) {
          filterNames=gridView.prefInfo.filter(function (prefRow) {
            return prefRow.fldActiveYn && prefRow.crosstabItemCd === 'GROUP-VERTICAL-VALUES';
          }).map(function (prefRow) {
            return prefRow.fldApplyCd;
          });
        }

        var savedFilterNames = filter[columnName];
        var wheelScrollLines = 0;

        var columnFilters = filterNames.map(function (filterName) {
          var columnFilter = {
            name: filterName,
            criteria: 'value="' + filterName + '"',
            text: transLangKey(filterName)
          };

          if (excludeNames && excludeNames.indexOf(filterName) !== -1) {
            columnFilter.active = false;
            columnFilter.visible = false;
          } else if (excludeNames && savedFilterNames.length === 0) {
            columnFilter.active = true;
            wheelScrollLines++;
          } else if (savedFilterNames.indexOf(filterName) !== -1){
            columnFilter.active = true;
            wheelScrollLines++;
          } else {
            columnFilter.active = false;
          }
          return columnFilter;
        });

        if (wheelScrollLines > 0) {
          var options = gridView.getDisplayOptions();
          options.wheelScrollLines = wheelScrollLines;

          gridView.setDisplayOptions(options);
        }

        gridView.setColumnFilters(gridView.columnByField(columnName), columnFilters);

        columnFilterObj[columnName] = columnFilters;
      }

      gridView.onFilteringChanged = this.onFilteringChanged;

      for (var columnName in columnFilterObj) {
        this.activateColumnFilters(gridView, columnName, columnFilterObj[columnName]);
      }
    },
    
    saveFilters: function (gridView, columnNames) {
      
      var filters = this.getFilters();

      for (var i = 0, n = columnNames.length; i < n; i++) {
        var columnName = columnNames[i];

        var filterNames = gridView.getActiveColumnFilters(columnName, true).filter(function (columnFilter) {
          return columnFilter.active;
        }).map(function (columnFilter) {
          return columnFilter.name;
        });

        var savedFilterNames = filters[columnName];
        if (savedFilterNames && savedFilterNames.length > 0) {
          if (filterNames && filterNames.length > 0) {
            var tempFilterNames = [];
            for (var i = 0, n = savedFilterNames.length; i < n; i++) {
              if (filterNames.indexOf(savedFilterNames[i]) !== -1) {
                tempFilterNames.push(savedFilterNames[i]);
              }
            }
            filters[columnName] = tempFilterNames;
          } else {
            filters[columnName] = savedFilterNames;
          }
        } else {
          filters[columnName] = filterNames;
        }
      }
    }
  };
})();

wingui3.util.grid.sorter = (function () {
  var sorted = false;

  return {
    orderBy: function (gridView, fieldNames, sortDirs) {
      if (!sorted && fieldNames.length === 0) {
        return;
      }

      if (!sortDirs) {
        sortDirs = [];
        while (sortDirs.length < fieldNames.length) {
          sortDirs.push('ascending');
        }
      }

      gridView.orderBy(fieldNames, sortDirs);
      sorted = fieldNames.length !== 0;
    }
  };
})();

export default wingui3;