/**
 * Object prototype functions
 */
if (!Object.keys) {
  Object.keys = (function () {
    let hasOwnProperty = Object.prototype.hasOwnProperty;
    let hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
    let dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];

    let dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
        throw new TypeError('Object.keys called on non-object');
      }

      let result = [];
      for (let prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (let i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  })();
}

/**
 * String prototype functions
 */
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    let subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }

    position -= searchString.length;
    let lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (searchStr, replaceStr) {
    return this.split(searchStr).join(replaceStr);
  };
}

if (!String.prototype.replaceAt) {
  String.prototype.replaceAt = function (index, replaceStr) {
    return this.substring(0, index) + replaceStr + this.substring(index + 1);
  };
}

/**
 * Date prototype functions
 */
Object.defineProperty(Date.prototype, 'toCurrentDateString', {
  value: function () {
    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }

    function pad3(n) {
      if (n < 10) {
        return '00' + n;
      } else if (n < 100) {
        return '0' + n;
      } else {
        return '' + n;
      }
    }

    return this.getFullYear() + '-' +
      pad2(this.getMonth() + 1) + '-' +
      pad2(this.getDate()) + ' ' +
      pad2(this.getHours()) + ':' +
      pad2(this.getMinutes()) + ':' +
      pad2(this.getSeconds()) + '.' +
      pad3(this.getMilliseconds());
  }
});

if (!Date.prototype.format) {
  Date.prototype.format = function (f) {
    if (!this.valueOf()) {
      return ' ';
    }

    let weekName = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    let d = this;
    let h;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|ms|a\/p)/gi, function ($1) {
      switch ($1) {
        case 'yyyy':
          return d.getFullYear();
        case 'yy':
          return (d.getFullYear() % 1000).zf(2);
        case 'MM':
          return (d.getMonth() + 1).zf(2);
        case 'dd':
          return d.getDate().zf(2);
        case 'E':
          return weekName[d.getDay()];
        case 'HH':
          return d.getHours().zf(2);
        case 'hh':
          return ((h = d.getHours() % 12) ? h : 12).zf(2);
        case 'mm':
          return d.getMinutes().zf(2);
        case 'ss':
          return d.getSeconds().zf(2);
        case 'ms':
          return d.getMilliseconds().zf(3);
        case 'a/p':
          return d.getHours() < 12 ? '오전' : '오후';
        default:
          return $1;
      }
    });
  };
}

/**
 * Array prototype functions
 */
if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
  ArrayBuffer.prototype.slice = function (begin, end) {
    begin = (begin | 0) || 0;
    let num = this.byteLength;
    end = end === (void 0) ? num : (end | 0);

    // Handle negative values.
    if (begin < 0) begin += num;
    if (end < 0) end += num;

    if (num === 0 || begin >= num || begin >= end) {
      return new ArrayBuffer(0);
    }

    let length = Math.min(num - begin, end - begin);
    let target = new ArrayBuffer(length);
    let targetArray = new Uint8Array(target);
    targetArray.set(new Uint8Array(this, begin, length));
    return target;
  };
}

if (!Array.isArray) {
  Array.isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }();
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement, fromIndex) {
    if (this === undefined || this === null) {
      throw new TypeError('this is null or not defined');
    }

    let length = this.length >>> 0; // Hack to convert object.length to a UInt32

    fromIndex = +fromIndex || 0;

    if (Math.abs(fromIndex) === Infinity) {
      fromIndex = 0;
    }

    if (fromIndex < 0) {
      fromIndex += length;
      if (fromIndex < 0) {
        fromIndex = 0;
      }
    }

    for (; fromIndex < length; fromIndex++) {
      if (this[fromIndex] === searchElement) {
        return fromIndex;
      }
    }
    return -1;
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function (callback, thisArg) {
    if (this === null) {
      throw new TypeError('this is null or not defined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    let t;
    if (thisArg) {
      t = thisArg;
    }

    let obj = Object(this);
    let len = obj.length >>> 0;
    let arr = new Array(len);

    let k = 0;
    while (k < len) {
      let kValue, mappedValue;

      if (k in obj) {
        kValue = obj[k];
        mappedValue = callback.call(t, kValue, k, obj);

        arr[k] = mappedValue;
      }
      k++;
    }
    return arr;
  };
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function (fun) {
    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    let t = Object(this);
    let len = t.length >>> 0;
    if (typeof fun != 'function') {
      throw new TypeError();
    }

    let thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (let i = 0; i < len; i++) {
      if (i in t) {
        fun.call(thisArg, t[i], i, t);
      }
    }
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function (fun) {
    if (this === null) {
      throw new TypeError();
    }

    let t = Object(this);
    let len = t.length >>> 0;
    if (typeof fun != 'function') {
      throw new TypeError();
    }

    let res = [];
    let thisp = arguments[1];
    for (let i = 0; i < len; i++) {
      if (i in t) {
        let val = t[i];
        if (fun.call(thisp, val, i, t)) {
          res.push(val);
        }
      }
    }
    return res;
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function (searchElement) {
    let O = Object(this);
    let len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }

    let n = parseInt(arguments[1]) || 0;
    let k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }

    let currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!Array.prototype.unique) {
  Array.prototype.unique = function () {
    let o = {}, i, l = this.length, r = [];
    for (i = 0; i < l; i += 1) o[this[i]] = this[i];
    for (i in o) r.push(o[i]);
    return r;
  };
}

/**
 * String, Number prototype functions
 */
String.prototype.string = function (len) {
  let s = '', i = 0;
  while (i++ < len) {
    s += this;
  }
  return s;
};

String.prototype.zf = function (len) {
  return '0'.string(len - this.length) + this;
};

Number.prototype.zf = function (len) {
  return this.toString().zf(len);
};

/**
 * Node prototype functions
 */
if ('baseURI' in Node.prototype === false) {
  Object.defineProperty(Node.prototype, 'baseURI', {
    get: function() {
      var base = (this.ownerDocument || this).querySelector('base');
      return (base || window.location).href;
    },
    configurable: true,
    enumerable: true
  });
}

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = function (callback, thisArg) {
    thisArg = thisArg || window;
    for (let i = 0; i < this.length; i++) {
      callback.call(thisArg, this[i], i, this);
    }
  };
}

/**
 * DOMParser HTML extension
 */
(function (DOMParser) {
  let proto = DOMParser.prototype;
  let nativeParse = proto.parseFromString;

  // Firefox/Opera/IE throw errors on unsupported types
  try {
    // WebKit returns null on unsupported types
    if ((new DOMParser()).parseFromString('', 'text/html')) {
      // text/html parsing is natively supported
      return;
    }
  } catch (ex) {
  }

  proto.parseFromString = function (markup, type) {
    if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
      let doc = document.implementation.createHTMLDocument('');
      if (markup.toLowerCase().indexOf('<!doctype') > -1) {
        doc.documentElement.innerHTML = markup;
      } else {
        doc.body.innerHTML = markup;
      }
      return doc;
    } else {
      return nativeParse.apply(this, arguments);
    }
  };
}(DOMParser));
