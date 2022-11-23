function clone(obj) {
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

function combine() {
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

function randomRange(n1, n2) {
  return Math.floor((Math.random() * (n2 - n1 + 1)) + n1);
}

function generateId() {
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

function getTodayBaseDate(dateString) {
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

function getDateFromDateString(date) {
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

function isEmpty(obj) {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
}

function isEquivalent(a, b) {
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

function isJson(str) {
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

function convertBoolean(target, defaultValue) {
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

function toBoolean(target) {
  return convertBoolean(target, false);
}

function removeClassByPrefix(node, prefix) {
	var regx = new RegExp('\\b' + prefix + '[^ ]*[ ]?\\b', 'g');
	node.className = node.className.replace(regx, '');
	return node;
}

function resetLastViewId() {
  let defaultUrl = settings.authentication.defaultUrl.trim();

  let index = defaultUrl.lastIndexOf('#');
  if (index >= 0) {
    localStorage.setItem('lastViewId', defaultUrl.substr(index + 1));
  } else {
    localStorage.setItem('lastViewId', 'home');
  }
}

export {
  clone,
  combine,
  generateId,
  getDateFromDateString,
  isEmpty,
  isEquivalent,
  isJson,
  removeClassByPrefix,
  resetLastViewId,
  toBoolean
};
