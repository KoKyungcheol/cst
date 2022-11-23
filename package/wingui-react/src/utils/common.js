import authentication from '../Authentication';
import { transLangKey } from '../lang/i18n-func';
import languegeObject from '../lang/LanguageObject';
import { Toast } from "bootstrap";
import { storeApi } from '../store/contentStore';
import settings from '../settings';

export function initLanguage() {
  languegeObject.init();
  languegeObject.mount();
}

/**
 * title, contents, (opt), func
 */
export function showMessage(title, contents, opt, func) {
  if (arguments.length === 3 && typeof arguments[2] === 'function') {
    func = opt;
    opt = undefined;
  }

  let options = {
    close: opt === undefined || opt.close === undefined || opt.close ? true : false
  }

  let modal = $('#' + vom.active + '-dialog')
  modal.find('.modal-title').text(title)
  modal.find('.modal-body').html(contents);

  if (options.close) {
    modal.find('.modal-footer').find('button#cancel').show()
  } else {
    modal.find('.modal-footer').find('button#cancel').hide()
  }

  modal.off('click');
  modal.on('click', function (e) {
    if (e.target.id === 'confirm') {
      modal.modal('hide')
      if (func !== undefined) {
        func(true);
      }
    } else if (e.target.id === 'cancel') {
      func(false);
    }
  })
  modal.modal('show')
};

export function showToast(contents, type, timer) {
  if (arguments.length === 2) {
    timer = type;
    type = undefined;
  }

  let toastEl = [].slice.call(document.querySelectorAll('.toast'))[0]
  toastEl.firstElementChild.firstElementChild.textContent = contents

  if (type === 'error') {
    toastEl.classList.remove('bg-primary')
    toastEl.classList.add('bg-danger')
  } else {
    toastEl.classList.remove('bg-danger')
    toastEl.classList.add('bg-primary')
  }

  let options = {
    delay: timer
  }
  let toast = new Toast(toastEl, options)
  toast.show()
}

let closeMessage = () => {
  modal.modal('hide')
}

export function saveUserViewExcution(viewId, actionId, actionTime) {
  let sessionInfo = authentication.getSessionInfo();

  let username = sessionInfo.username;
  let displayName = sessionInfo.displayName;

  if (['home', 'UI_AD_19'].includes(viewId)) {
    return;
  }

  if (!displayName) {
    displayName = username + ' (ID)';
  }

  let params = {
    data: {
      'viewId': viewId,
      'actionId': actionId,
      'username': username,
      'displayName': displayName,
      'viewName': transLangKey(viewId)
    }
  };
  axios({
    method: 'post',
    headers: { "content-type": "application/json" },
    url: baseURI() + "system/logs/view-execution",
    data: params
  }).then(function (response) {

  }).catch(function (err) {
    console.warn(err);
  });
}

export function createUniqueKey() {
  let jbRandom = Math.floor(Math.random() * 1000000) + 100000;
  return jbRandom;
}

export function setAppSettings(name, value) {
  settings[name] = value;
  renderForce();
}

export function getAppSettings(name, defVal) {
  if (settings[name] != undefined)
    return settings[name]
  else
    return defVal;
}

function renderForce() {
  const state = storeApi.getState();
  const forceRender = state.forceRender;
  forceRender();
}

export function isDeepEqual(obj1, obj2) {
  if (!obj1 || !obj2 || typeof obj1 !== "object" | typeof obj2 !== "object") {
    return false
  }

  if (JSON.stringify(obj1) === JSON.stringify(obj2))
    return true;
  else
    return false;
}

export function isDeepOrderlessEqual(obj1, obj2) {
  if (!obj1 || !obj2 || typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false
  }
  const sortdObj1 = Object.keys(obj1).sort().reduce((obj, key) => ((obj[key] = obj1[key]), obj), {});
  const sortdObj2 = Object.keys(obj2).sort().reduce((obj, key) => ((obj[key] = obj2[key]), obj), {});

  if (JSON.stringify(sortdObj1) === JSON.stringify(sortdObj2))
    return true;
  else
    return false;
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj
  }
  //result = JSON.parse(JSON.stringify(obj));
  const result = Array.isArray(obj) ? [] : {}
  for (let key of Object.keys(obj)) {
    result[key] = deepClone(obj[key])
  }
  return result
}

export function isPromise(value) {
  return Boolean(value && typeof value.then === 'function');
}

export function gridResetSize() {
  let targetViewObject = vom.get(vom.active);
  if (targetViewObject) {
    if (com.get(com.active)) {
      for (let componentId in com.get(com.active).getComponents()) {
        let component = com.get(com.active).getComponent(componentId);
        if (component.type === 'R_GRID' || component.type === 'R_TREE') {
          let actualComponent = component.getActualComponent();
          if (actualComponent && !isEmpty(actualComponent)) {
            actualComponent.resetSize();
          }
          actualComponent = null;
        }
        component = null;
      }
    }
  } else {
    if (com.get(com.active)) {
      let gridObject = com.get(com.active).views;
      if (Object.keys(gridObject).length !== 0) {
        gridObject[com.active].map(function (data) {
          let gridView = data.gridView;
          if (gridView) {
            gridView.resetSize();
          }
        });
      }
    }
  }
}

export const formatComma = (str) => {
  str = String(str);
  return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
};

export function formatString(formatted) {
  for (let arg in arguments) {
    if (arg == 0)
      continue;
    let idx = arg - 1
    formatted = formatted.replace("{" + idx + "}", arguments[arg]);
  }
  return formatted;
}

export function checkGridState(viewId) {
  let returnValue = false;
  let targetViewObject = vom.get(viewId);
  if (targetViewObject) { // Case1 :: ViewConfig 
    if (targetViewObject.includeVue()) { // 2.0
      Object.keys(Vue.grids).forEach(gridId => {
        let gridView = Vue.grids[gridId].gridView;
        if (gridView && Object.keys(gridView).length > 0) {
          gridView.commit(true);
          let dataProvider = gridView.getDataProvider();
          let statRows = dataProvider.getAllStateRows();

          let stats = Object.getOwnPropertyNames(statRows);
          for (let i = 0, n = stats.length; i < n; i++) {
            let stat = statRows[stats[i]];
            if (stat.length > 0) {
              returnValue = true;
            }
          }
        }
      });
    } else { // 1.0 
      return com.checkChanges(viewId);
    }
  } else { // Case2 :: React
    if (com.get(viewId)) {
      let gridObject = com.get(viewId).views;
      if (Object.keys(gridObject).length !== 0) {
        gridObject[viewId].map(function (data) {
          let gridView = data.gridView;
          let dataProvider = data.dataProvider;

          if (gridView && Object.keys(gridView).length > 0) {
            gridView.commit(true);
            let statRows = dataProvider.getAllStateRows();
            let stats = Object.getOwnPropertyNames(statRows);
            for (let i = 0, n = stats.length; i < n; i++) {
              let stat = statRows[stats[i]];
              if (stat.length > 0) {
                returnValue = true;
              }
            }
          }
        });
      }
    }
  }

  return returnValue;
}

export function isPopupWnd() {
  const popupYn = sessionStorage.getItem('popupWnd');
  if (popupYn === 'Y')
    return true;
  else
    return false;
}

export function getPopupOption() {
  let ret = { showSideBar: true, showNavBar: true }

  const showSideBar = sessionStorage.getItem('ShowSideBar');
  const showNavBar = sessionStorage.getItem('ShowNavBar');

  if (showSideBar && showSideBar === 'N')
    ret.showSideBar = false;

  if (showNavBar && showNavBar === 'N')
    ret.showNavBar = false;


  return ret;
}

export function cameCaseToHyphen(value) {
  return value.replace(/(?:^|\.?)([A-Z+0-9])/g, function (x, y) { return "-" + y.toLowerCase() }).replace(/^-/, "")
}

Date.prototype.getWeek = function (dowOffset) {
  dowOffset = typeof (dowOffset) == 'number' ? dowOffset : 0;
  let newYear = new Date(this.getFullYear(), 0, 1);
  let day = newYear.getDay() - dowOffset;
  day = (day >= 0 ? day : day + 7);
  let daynum = Math.floor((this.getTime() - newYear.getTime() -
    (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
  let weeknum;

  if (day < 4) {
    weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      nYear = new Date(this.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      weeknum = nday < 4 ? 1 : 53;
    }
  }
  else {
    weeknum = Math.floor((daynum + day - 1) / 7);
  }
  return weeknum;
};

export function containsObject(obj, list) {
  for (let i = 0; i < list.length; i++) {
    if (isEquivalent(list[i], obj)) {
      return true;
    }
  }
  return false;
};

export function loadComboList(params) {
  let array = [];
  let resultDataList = [];

  let procedureParam = {};
  let engineParam = new URLSearchParams();

  if (params.URL.substr(0, 6) === "engine") {
    for (let key in params.PARAM) {
      engineParam.append(key, params.PARAM[key]);
    }
  } else {
    procedureParam['PROCEDURE_NAME'] = params.PROCEDURE_NAME;
    procedureParam = Object.assign(procedureParam, params.PARAM);
  }

  return axios({
    method: "post",
    headers: getHeaders({}, true),
    url: baseURI() + params.URL,
    data: params.URL.substr(0, 6) === "engine" ? engineParam : procedureParam,
  }).then(function (response) {
    if (params.URL.substr(0, 6) === "engine") {
      if (response.data.RESULT_SUCCESS && response.data.RESULT_DATA.length > 0) {
        resultDataList = response.data.RESULT_DATA;
      }
    } else {
      if (response.status === gHttpStatus.SUCCESS && response.data.length > 0) {
        resultDataList = response.data;
      }
    }
  }).catch(function (err) {
    console.warn(err);
  }).then(function () {
    if (params.ALLFLAG) {
      array.push({ value: "", label: transLangKey("ALL") });
    }

    for (let i = 0, len = resultDataList.length; i < len; i++) {
      let row = resultDataList[i];

      if (row !== null) {
        let listItemObj = { value: row[params.CODE_KEY], label: row[params.CODE_VALUE] };
        if (!containsObject(listItemObj, array)) {
          if (params.TRANSLANG_LABEL) {
            array.push({ value: row[params.CODE_KEY], label: transLangKey(row[params.CODE_VALUE]) });
          } else {
            array.push({ value: row[params.CODE_KEY], label: row[params.CODE_VALUE] });
          }

        }
      }
    }
    return array;
  });
};

export function gridComboLoad(grid, params) {
  let rComboListData = [];
  let array = [];
  let engineParam = new URLSearchParams();
  let procedureParam = {};
  if (params.URL.substr(0, 6) === "engine") {
    for (let i = 0; i < params.PARAM_KEY.length; i++) {
      engineParam.append(params.PARAM_KEY[i], params.PARAM_VALUE[i]);
    }
  } else {
    procedureParam['PROCEDURE_NAME'] = params.PROCEDURE_NAME;
    for (let i = 0; i < params.PARAM_KEY.length; i++) {
      procedureParam[params.PARAM_KEY[i]] = params.PARAM_VALUE[i];
    }
  }
  axios({
    method: 'post',
    header: { 'content-type': 'application/json' },
    url: baseURI() + params.URL,
    data: params.URL.substr(0, 6) === "engine" ? engineParam : procedureParam,
  })
    .then(function (res) {
      if (res.status === gHttpStatus.SUCCESS) {
        rComboListData = [];
        if (params.URL.substr(0, 6) === "engine") {
          if (res.data.RESULT_SUCCESS && res.data.RESULT_DATA.length > 0) {
            rComboListData = res.data.RESULT_DATA;
          }
        } else {
          if (res.status === gHttpStatus.SUCCESS && res.data.length > 0) {
            rComboListData = res.data;
          }
        }
        for (let i = 0, len = rComboListData.length; i < len; i++) {
          let row = rComboListData[i];
          if (row !== null) {
            let listItemObj = { [params.CODE_VALUE]: row[params.CODE_VALUE], [params.CODE_LABEL]: row[params.CODE_LABEL] };
            if (!containsObject(listItemObj, array)) {
              if (params.TRANSLANG_LABEL) {
                array.push({ [params.CODE_VALUE]: row[params.CODE_VALUE], [params.CODE_LABEL]: transLangKey(row[params.CODE_LABEL]) });
              } else {
                array.push({ [params.CODE_VALUE]: row[params.CODE_VALUE], [params.CODE_LABEL]: row[params.CODE_LABEL] });
              }

            }
          }
        }
        if (params.COLUMN_NAME) {
          grid.gridView.setColumnProperty(params.COLUMN, "lookupDisplay", false)
          grid.gridView.setColumnProperty(params.COLUMN_NAME, "labelField", params.COLUMN)
        }
        grid.gridView.setColumnProperty(
          params.COLUMN,
          params.PROP,
          {
            value: params.CODE_VALUE,
            label: params.CODE_LABEL,
            list: array
          }
        );
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}

//cross tab 
export function makeCrossTabFieldsAndColumns(grid, fields, columns, initLayout, direction, columnPrefix, columnPostfix, resultData) {
  let layout = Object.assign([], initLayout);
  //init
  grid.dataProvider.setFields(fields);
  grid.gridView.setColumns(columns);
  grid.gridView.setColumnLayout([]); //초기화

  let dataFieldNames = [];
  dataFieldNames = Object.keys(resultData[0]);

  let dynamicNames = [];
  let names = [];
  for (let dataFieldIdx = 0, dataFieldLen = dataFieldNames.length; dataFieldIdx < dataFieldLen; dataFieldIdx++) {
    let fieldName = dataFieldNames[dataFieldIdx];
    if ((fieldName.startsWith(columnPrefix) && fieldName.indexOf(columnPostfix) > -1)) {
      dynamicNames.push(fieldName);
      fieldName = fieldName.split(columnPostfix)[0].replace(columnPrefix, '')
      names.push(fieldName);
    }
  }

  dynamicNames.sort(function (a, b) {
    let ac = a.replace(columnPrefix, '').replace(columnPostfix, '');
    let bc = b.replace(columnPrefix, '').replace(columnPostfix, '');
    if (ac > bc) {
      return 1;
    } else if (ac < bc) {
      return -1;
    } else {
      return 0;
    }
  });

  let groupNameArray = [];
  let groupCols = [];
  dynamicNames.map(function (header) {
    grid.dataProvider.addField({
      fieldName: header,
      dataType: "number"
    });

    let groupName;
    groupName = header.split(columnPostfix)[0].replace(columnPrefix, '');
    if (groupNameArray.indexOf(groupName) === -1) {
      groupNameArray.push(groupName);
    }

    groupCols.push({
      name: header,
      fieldName: header,
      header: {
        text: transLangKey(header.split(columnPostfix)[1]),
      },
      width: 70,
      editable: false,
      styleName: "right-column"
    });
  });

  groupNameArray.map(function (groupName) {
    let columnList = [];

    groupCols.map(function (col) {
      if ((col.name).split(columnPostfix)[0].replace(columnPrefix, '') === groupName) {
        columnList.push(col.name);
      }
    });

    layout.push({
      direction: direction,
      name: groupName,
      items: columnList,
      header: {
        text: transLangKey(groupName),
      }
    });
  });

  //grid.dataProvider.setFields(fields);
  grid.gridView.setColumns(columns.concat(groupCols));
  grid.gridView.setColumnLayout(layout);
};

String.prototype.string = function (len) { let s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };

export function clickAway() {
  let clickDiv = document.getElementById('dummyClickTarget');

  let event = new MouseEvent('mousedown', {
    bubbles: true,
    cancelable: true,
    view: window
  });

  clickDiv.dispatchEvent(event);
}

export function convertCamelToSnake(str) {
  return str.replace(/([A-Z])/g, function (x, y) {
    return "_" + y.toLowerCase()
  }).replace(/^_/, "");
}

function convertCamelToCss(str) {
  return str.replace(/([A-Z])/g, function (x, y) {
    return "-" + y.toLowerCase()
  }).replace(/^_/, "");
}
/* Javascript object to style string */
export function JSonToStyleString(styleObj) {
  const styleString = (
    Object.entries(styleObj).map(([k, v]) => {
      if (CSS.supports(k, v))
        return `${convertCamelToCss(k)}:${v}`
      else
        return ''
    }).join(';')
  );
  return styleString
}

/* 동적으로 스타일 Selector 생성 */
export function createCSSSelector(selector, style) {
  if (!document.styleSheets) return;
  if (document.getElementsByTagName('head').length == 0) return;

  if (!selector.startsWith("."))
    selector = "." + selector;

  let styleSheet, mediaType;

  if (document.styleSheets.length > 0) {
    for (let i = 0, l = document.styleSheets.length; i < l; i++) {
      if (document.styleSheets[i].disabled)
        continue;
      let media = document.styleSheets[i].media;
      mediaType = typeof media;

      if (mediaType === 'string') {
        if (media === '' || (media.indexOf('screen') !== -1)) {
          styleSheet = document.styleSheets[i];
        }
      }
      else if (mediaType == 'object') {
        if (media.mediaText === '' || (media.mediaText.indexOf('screen') !== -1)) {
          styleSheet = document.styleSheets[i];
        }
      }

      if (typeof styleSheet !== 'undefined')
        break;
    }
  }

  if (typeof styleSheet === 'undefined') {
    let styleSheetElement = document.createElement('style');
    styleSheetElement.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(styleSheetElement);

    for (i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].disabled) {
        continue;
      }
      styleSheet = document.styleSheets[i];
    }

    mediaType = typeof styleSheet.media;
  }

  if (mediaType === 'string') {
    for (let i = 0, l = styleSheet.rules.length; i < l; i++) {
      if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
        styleSheet.rules[i].style.cssText = style;
        return;
      }
    }
    styleSheet.addRule(selector, style);
  }
  else if (mediaType === 'object') {
    let styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
    for (let i = 0; i < styleSheetLength; i++) {
      if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
        styleSheet.cssRules[i].style.cssText = style;
        return;
      }
    }
    //console.log('style',style)
    styleSheet.insertRule(selector + '{' + style + '}', 0);
  }
}

export function deleteCSSSelector(selector) {
  if (!document.styleSheets) return;
  if (document.getElementsByTagName('head').length == 0) return;

  if (!selector.startsWith("."))
    selector = "." + selector;

  let styleSheet, mediaType;

  if (document.styleSheets.length > 0) {
    for (let i = 0, l = document.styleSheets.length; i < l; i++) {
      if (document.styleSheets[i].disabled)
        continue;
      styleSheet = document.styleSheets[i];

      mediaType = typeof styleSheet.media;

      if (mediaType === 'string') {
        for (let i = 0, l = styleSheet.rules.length; i < l; i++) {
          if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            styleSheet.deleteRule(i);
            return;
          }
        }
      }
      else if (mediaType === 'object') {
        let styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
        for (let i = 0; i < styleSheetLength; i++) {
          if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            styleSheet.deleteRule(i);
            return;
          }
        }
      }
    }
  }
}

export function isCSSSelector(selector) {
  if (!document.styleSheets) return false;
  if (document.getElementsByTagName('head').length == 0) return false;

  if (!selector.startsWith("."))
    selector = "." + selector;

  let styleSheet, mediaType;

  if (document.styleSheets.length > 0) {
    for (let i = 0, l = document.styleSheets.length; i < l; i++) {
      if (document.styleSheets[i].disabled)
        continue;
      styleSheet = document.styleSheets[i];

      mediaType = typeof styleSheet.media;

      if (mediaType === 'string') {
        for (let i = 0, l = styleSheet.rules.length; i < l; i++) {
          if (styleSheet.rules[i].selectorText && styleSheet.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            return styleSheet.rules[i];
          }
        }
      }
      else if (mediaType === 'object') {
        let styleSheetLength = (styleSheet.cssRules) ? styleSheet.cssRules.length : 0;
        for (let i = 0; i < styleSheetLength; i++) {
          if (styleSheet.cssRules[i].selectorText && styleSheet.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
            return styleSheet.cssRules[i];
          }
        }
      }
    }
  }
  return false;
}

export function createClass(name, rules) {
  let style = document.createElement('style');
  style.type = 'text/css';
  document.getElementsByTagName('head')[0].appendChild(style);
  if (!(style.sheet || {}).insertRule)
    (style.styleSheet || style.sheet).addRule(name, rules);
  else
    style.sheet.insertRule(name + "{" + rules + "}", 0);
}

export function clone(obj) {
  if (obj === null || typeof (obj) !== 'object') {
    return obj;
  }

  let copy;
  if (obj instanceof Date) {
    copy = new Date(obj.getTime());
  } else {
    copy = obj.constructor();
  }

  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) {
      copy[attr] = clone(obj[attr]);
    }
  }
  return copy;
}

export function combine() {
  let args = Array.prototype.slice.apply(arguments);
  return function (componentId, operationId, data, serviceCallId) {
    args.forEach(function (func, idx, arr) {
      if (typeof func === 'function') {
        func(componentId, operationId, data, serviceCallId);
      } else {
        console.log(func + ' is not a function')
      }
    });
  };
}

export function randomRange(n1, n2) {
  return Math.floor((Math.random() * (n2 - n1 + 1)) + n1);
}

export function generateId() {
  let newDate = new Date();
  let date = newDate.format('yyyyMMddHHmmssms');
  let weekDay = newDate.format('E');

  let min = date;
  let max = 99999999999999999;
  let rand = (Math.floor(Math.random() * (max - min + 1))).toString().slice(0, 12);

  return weekDay.substr(randomRange(0, 2), 1)
    + date
    + weekDay.substr(randomRange(0, 2), 1)
    + rand
    + weekDay.substr(randomRange(0, 2), 1);
}

export function getTodayBaseDate(dateString) {
  dateString = dateString.replaceAll(' ', '');
  let patterns = {
    markSplitPattern: /[-,+]/,
    ymdSplitPattern: /[y,M,d]/g,
    yearPattern: /y$/g,
    monthPattern: /M$/g,
    dayPattern: /d$/g
  };

  let addProps = {
    addYears: 0,
    addMonths: 0,
    addDays: 0
  };

  let dateSplit = dateString.split(patterns.markSplitPattern);

  for (let i = 0; i < dateSplit.length; i++) {
    if (dateSplit[i].toUpperCase() !== 'TODAY') {
      let digitsWIthPostfix = dateString.substr(dateString.indexOf(dateSplit[i]) - 1, 1) + dateSplit[i];
      let digits = parseInt(digitsWIthPostfix.split(patterns.ymdSplitPattern)[0]);

      if (patterns.yearPattern.test(digitsWIthPostfix)) {
        addProps.addYears = digits;
      } else if (patterns.monthPattern.test(digitsWIthPostfix)) {
        addProps.addMonths = digits;
      } else if (patterns.dayPattern.test(digitsWIthPostfix)) {
        addProps.addDays = digits;
      }
    }
  }

  let today = new Date();
  return new Date(today.getFullYear() + addProps.addYears, today.getMonth() + addProps.addMonths, today.getDate() + addProps.addDays);
}

export function getDateFromDateString(date) {
  let datePattern = /\d{4}-\d{2}-\d{2}/g;
  let todayBasePattern = /^today.*/gi;
  let newDate;

  let dateTest = date.match(datePattern);
  let dateTestTBP = date.match(todayBasePattern);
  if (dateTest !== undefined && dateTest !== '' && dateTest.length > 0) {
    let tempDate = new Date(date);
    newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
  } else if (dateTestTBP !== undefined && dateTestTBP !== '' && dateTestTBP.length > 0) {
    newDate = getTodayBaseDate(date);
  }

  return newDate;
}

export function isEmpty(obj) {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}

export function isDateDayEqual(v, v2) {

  const cd1 = typeof v == 'string' ? getDateFromDateString(v) : v;
  const cd2 = typeof v2 == 'string' ? getDateFromDateString(v2) : v2;
  if (cd1 && cd2) {
    if (cd1.getFullYear() == cd2.getFullYear() && cd1.getMonth() == cd2.getMonth() &&
      cd1.getDate() == cd2.getDate())
      return true;
    else
      return false;
  }
  return false;
}

export function isEquivalent(a, b) {
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0, len = aProps.length; i < len; i++) {
    let propName = aProps[i];

    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  return true;
}

export function isJson(str) {
  try {
    let temp = JSON.parse(str);
    if (temp instanceof Object || temp instanceof Array) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

export function convertBoolean(target, defaultValue) {
  if (target === null) {
    return defaultValue;
  }

  if (typeof target === 'boolean') {
    return target;
  }

  if (typeof target === 'string') {
    let targetString = target.trim().toUpperCase();
    if (targetString.length === 0) {
      return false;
    }

    return !('N' === targetString || 'NO' === targetString || 'F' === targetString
      || 'FALSE' === targetString || 'OFF' === targetString || '0' === targetString);
  }

  if (typeof target === 'number') {
    let targetNumber = parseInt(target);

    return 0 !== targetNumber;
  }

  return defaultValue;
}

export function toBoolean(target) {
  return convertBoolean(target, false);
}

export function removeClassByPrefix(node, prefix) {
  let regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
  node.className = node.className.replace(regx, '');
  return node;
}

export function resetLastViewId() {
  let defaultUrl = settings.authentication.defaultUrl.trim();

  let index = defaultUrl.lastIndexOf('#');
  if (index >= 0) {
    localStorage.setItem('lastViewId', defaultUrl.substr(index + 1));
  } else {
    localStorage.setItem('lastViewId', 'home');
  }
}

export function getBrowserSize() {
  let size = {}

  size.left = window.screenLeft;
  size.top = window.screenTop;
  size.outerWidth = window.outerWidth;
  size.outerHeight = window.outerHeight;
  size.innerWidth = window.innerWidth || document.body.clientWidth
  size.innerHeight = window.innerHeight || document.body.clientHeight

  return size;
}