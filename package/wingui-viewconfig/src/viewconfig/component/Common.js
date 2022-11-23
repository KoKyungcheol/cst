import { toBoolean } from '../util/utils';
import { waitOn, waitOff } from '../util/waitMe';
import {
  showDialog,
  showToastMessage
} from '../util/dialog';
import Component from './Component';



export default class Common extends Component {
  constructor(id, element, viewId) {
    super(id, element);
    this.created();
    this.viewId = viewId;
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.isMounted = true;
    this.mounted();
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    operationId = operationId.toUpperCase();

    console.log('Common Operation Id : ', operationId);

    let title = '';
    let msg = '';

    let resultSuccess;
    let resultMessage;

    let me = this;
    switch (operationId) {
      case 'MENU-INIT':
        console.error('This feature is currently not supported. (MENU-INIT)');
        break;
      case 'MENU-REFRESH':
        console.error('This feature is currently not supported. (MENU-REFRESH)');
        break;
      case 'LANG-REFRESH':
        let languageCode = localStorage.getItem('languageCode');
        console.error('This feature is currently not supported. (LANG-REFRESH)');
        window.location.reload();
        break;
      case 'VIEW-OPEN':
        let viewId = actionParamMap.view;
        let target = actionParamMap.target || 'self';

        console.log('VIEW-OPEN operation request open ' + viewId + ' page in ' + target + ' window');
        
        if (target === 'self') {
          history.go(0)
        } else {
          menu.openWindow(viewId, target)
        }
        break;
      case 'MESSAGE':
        // let message = '';

        // let prefix = actionParamMap['prefix'] ? transLangKey(actionParamMap['prefix']) : '';
        // if (prefix.toString().length > 0) {
        //   message += prefix + ' ';
        // }

        // msg = actionParamMap['msg'] ? transLangKey(actionParamMap['msg']) : '';
        // if (msg.toString().length > 0) {
        //   message += msg;
        // }

        // let postfix = actionParamMap['postfix'] ? transLangKey(actionParamMap['postfix']) : '';
        // if (postfix.toString().length > 0) {
        //   message += ' ' + postfix;
        // }

        // if (message.length > 0) {
        //   footer.log.write(message);
        // }

        break;
      case 'MESSAGE-CLEAR':
        //footer.log.del();
        break;
      case 'LOGIN':
        authentication.evaluate();
        break;
      case 'LOGOUT':
        authentication.evaluate();
        break;
      case 'ALERT':
        msg = actionParamMap['msg'];
        showDialog('Warning', transLangKey(msg), DIALOG_TYPE.ALERT);
        break;
      case 'WAIT-ON':
        waitOn(me.viewId);
        com.addWaitStatus(me.viewId);
        break;
      case 'WAIT-OFF':
        waitOff(me.viewId);
        com.removeWaitStatus(me.viewId);
        break;
      case 'DIALOG':
        resultSuccess = actionParamMap[RESULT_SUCCESS];
        resultMessage = actionParamMap[RESULT_MESSAGE];

        title = actionParamMap['title'];
        msg = actionParamMap['msg'];

        let dialogType = actionParamMap['type'];
        let modalType = actionParamMap['modal'] ? toBoolean(actionParamMap['modal']) : true;
        let closeOnEscape = actionParamMap['esc'] ? toBoolean(actionParamMap['esc']) : true;
        let closeButton = actionParamMap['xbtn'] ? toBoolean(actionParamMap['xbtn']) : true;

        if (title === 'RESULT_SUCCESS') {
          if (resultSuccess !== undefined) {
            if (resultSuccess === true) {
              title = 'SUCCESS';
            } else {
              title = 'FAIL';
            }
          }
        }

        if (msg === 'RESULT_MESSAGE') {
          if (resultMessage !== undefined) {
            let test = resultMessage.match(/--.*--/gi);
            if (test && test.length > 0) {
              let dbMsg = test[0];
              dbMsg = dbMsg.replace(/--/g, '');
              msg = dbMsg;
            } else {
              msg = resultMessage;
            }
          }
        }

        showDialog(title, msg, dialogType, modalType, closeOnEscape, closeButton).then(function (answer) {
          if (dialogType === DIALOG_TYPE.CONFIRM) {
            if (answer) {
              if (successFunc) {
                successFunc(me.id, operationId, actionParamMap);
              }
            } else {
              if (failFunc) {
                failFunc(me.id, operationId, actionParamMap);
              }
            }
          } else if (dialogType === DIALOG_TYPE.FILTERS) {
            if (answer) {
              if (successFunc) {
                successFunc(me.id, operationId, actionParamMap);
              }
            } else {
              if (failFunc) {
                failFunc(me.id, operationId, actionParamMap);
              }
            }
          } else if (dialogType === DIALOG_TYPE.CONFIRM3) {
            if (answer) {
              if (successFunc) {
                successFunc(me.id, operationId, actionParamMap);
              }
            } else if (!answer) {
              if (failFunc) {
                failFunc(me.id, operationId, actionParamMap);
              }
            } else {
              if (completeFunc) {
                completeFunc(me.id, operationId, actionParamMap);
              }
            }
          } else {
            if (completeFunc) {
              completeFunc(me.id, operationId, actionParamMap);
            }
          }
        });
        break;
      case 'TOAST':
        resultSuccess = actionParamMap[RESULT_SUCCESS];
        resultMessage = actionParamMap[RESULT_MESSAGE];

        title = actionParamMap['title'];
        msg = actionParamMap['msg'];
        let timer = actionParamMap['timer'];

        if (title === 'RESULT_SUCCESS') {
          if (resultSuccess !== undefined) {
            if (resultSuccess === true) {
              title = 'SUCCESS';
            } else {
              title = 'FAIL';
            }
          }
        }

        if (msg === 'RESULT_MESSAGE') {
          if (resultMessage !== undefined) {
            let test = resultMessage.match(/--.*--/gi);
            if (test && test.length > 0) {
              let dbMsg = test[0];
              dbMsg = dbMsg.replace(/--/g, '');
              msg = dbMsg;
            } else {
              msg = resultMessage;
            }
          }
        }

        showToastMessage(title, msg, timer).then(function (answer) {
          if (answer) {
            if (successFunc) {
              successFunc(me.id, operationId, actionParamMap);
            }

            if (completeFunc) {
              completeFunc(me.id, operationId, actionParamMap);
            }
          }
        });
        break;
      case 'EXEC-FUNC' :
        let functionName = actionParamMap['func-name'];
        let result = window[functionName](actionParamMap);

        if (result === true) {
          if (successFunc) {
            successFunc(this.id, operationId, actionParamMap);
          }
        } else if (result === false) {
          if (failFunc) {
            failFunc(this.id, operationId, actionParamMap);
          }
        }

        break;
      default:
        console.warn(`Operation is invalid. (operation id: ${operationId})`);
        break;
    }

    if (!['DIALOG', 'TOAST'].includes(operationId) && completeFunc) {
      completeFunc(this.id, operationId, actionParamMap);
    }
  }

  getValue(referType) {
    referType = referType.toUpperCase();

    if (referType === 'LOGINID') {
      return authentication.getUsername();
    } else if (referType === 'LOGINNAME') {
      return authentication.getDisplayName();
    } else if (referType === 'COUNTRY_CODE') {
      return localStorage.getItem('countryCode');
    } else if (referType === 'LANGUAGE_CODE') {
      let currLanguageCode = localStorage.getItem('languageCode');
      if (!currLanguageCode) {
        currLanguageCode = $.i18n().locale;
      }
      return currLanguageCode
    } else if (referType === 'VIEW_ID') {
      return this.viewId;
    } else if (referType.includes(':')) {
      let referTypes = referType.split(':');
      if (referTypes[0].toUpperCase() === 'PERMISSION') {
        return permission.valueOf(PERMISSION_TYPE_PREFIX + referTypes[1]);
      }
    } else {
      return null;
    }
  }
}
