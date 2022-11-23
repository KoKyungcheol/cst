import { showDialog } from '../util/dialog';
import { createOperationParamMap } from './parameter';
import { waitOff } from '../util/waitMe';
class ServiceManager {
  constructor(viewId) {
    this.viewId = viewId;
  }
  async callService(url, method, params) {
    if (url.startsWith('/')) {
      url = url.substr(1);
    }

    url = baseURI() + url;

    Object.entries(params).forEach(([k, v]) => {
      if (url.includes(`:${k}`)) {
        url = url.replace(`:${k}`, encodeURIComponent(v));
      } else if (method === 'get') {
        params[k] = encodeURIComponent(v);
      }
    });

    let data;

    if (method === 'get') {
      data = await axios.get(url, { params: params, headers: getHeaders() });
    } else {
      let paramsData = params.data;
      if (!paramsData) {
        paramsData = {};
        Object.entries(params).forEach(([k, v]) => {
          paramsData[k] = v;
        });
      }

      data = await axios({
        method: method,
        url: url,
        headers: getHeaders({
          'content-type': 'application/json'
        }, true),
        data: paramsData
      });
    }

    return data;
  }

  procService(url, method, params, callback) {
    return this.callService(url, method, params)
      .then(res => {
        let data = {
          RESULT_MESSAGE: 'The service was successful.',
          RESULT_SUCCESS: true,
          RESULT_TYPE: 'RESULT_TYPE_ITC_1'
        };
        
        data.RESULT_DATA = res.data;

        console.log(`${transLangKey('Success')} => url: ${url}, method: ${method}`);
        if (callback && callback.success) {
          vsm.get(com.active, "dataManager").setDataState(callback.componentId, callback.serviceCallId, data);
          callback.success(callback.componentId, callback.operationId, callback.serviceCallId, data);
        }
        return data;
      })
      .catch(err => {
        let msg = `${transLangKey('Error')} => url: ${url}, method: ${method}`;

        let data = err.response.data;
        if (data && data.status && data.message) {
          msg += `, status: ${data.status}, message: ${data.message}`;
        } else {
          msg += `, message: ${err.message}`;
        }
        console.error(msg, err);

        if (callback && callback.fail) {
          callback.fail(callback.componentId, callback.operationId, callback.serviceCallId, err.response);
        }
        return;
      })
      .then(data => {
        console.log(`${transLangKey('Complete')} => url: ${url}, method: ${method}`);
        if (callback && callback.complete) {
          callback.complete(callback.componentId, callback.operationId, callback.serviceCallId, data);
        }
        return data;
      });
  }
}

export default ServiceManager;

export function doReferenceService(actionParamMap, targetComponentId, targetOperationId, successFunc, failFunc, completeFunc, viewId) {
  let activeId = viewId !== undefined ? viewId : com.active;

  let doBeforeServiceCallResult = com.get(activeId).getComponent(targetComponentId).doBeforeServiceCall(actionParamMap, targetComponentId, targetOperationId);

  if (doBeforeServiceCallResult.result === false) {
    console.warn('Service call stopped. ', doBeforeServiceCallResult.msg);
    return;
  }

  actionParamMap = doBeforeServiceCallResult.paramMap;

  console.log(`Call reference service.\n\tcomponent id: ${targetComponentId}\n\toperation id: ${targetOperationId}`);

  let referenceServiceCallInfo = vom.get(activeId).getReferenceServiceCallInfo(targetComponentId, targetOperationId);

  let referenceComponentId = referenceServiceCallInfo[0];

  let referenceServiceCallId;
  if (referenceServiceCallInfo.length > 1) {
    referenceServiceCallId = referenceServiceCallInfo[1];
  } else {
    referenceServiceCallId = vom.get(activeId).getServiceCallIds(referenceComponentId, targetOperationId)[0];
  }

  vsm.get(activeId, "dataManager").setReferenceData(actionParamMap, targetComponentId, targetOperationId, referenceComponentId, referenceServiceCallId, successFunc, failFunc, completeFunc);

  doBeforeServiceCallResult = null;
}

export function getCompleteParamMap(targetComponentId, targetOperationId, actionParamMap, viewId) {
  let activeId = viewId !== undefined ? viewId : com.active;
  let serviceCallIds = vom.get(activeId).getServiceCallIds(targetComponentId, targetOperationId);
  let paramMap = {};

  for (let i = 0; i < serviceCallIds.length; i++) {
    let serviceCallId = serviceCallIds[i];
    paramMap = $.extend({}, createOperationParamMap(targetComponentId, targetOperationId, serviceCallId, activeId), actionParamMap);
  }

  if (Object.getOwnPropertyNames(paramMap) <= 0) {
    paramMap = actionParamMap;
  }

  return paramMap;
}

function checkEmptyParam(paramMap, emptyCheckParams) {
  const paramIds = Object.getOwnPropertyNames(paramMap);
  for (let i = 0, n = emptyCheckParams.length; i < n; i++) {
    if (!paramIds.includes(emptyCheckParams[i])) {
      let msg = `Parameter '${emptyCheckParams[i]}' is empty.`;
      console.warn(msg);
      showDialog('Empty Parameter', msg, DIALOG_TYPE.ALERT, true).then(function (answer) {
        if (answer) {
          return false;
        }
      });
      return false;
    }
  }
  return true;
}

export function callService(actionParamMap, targetComponentId, targetOperationId, successFunc, failFunc, completeFunc, viewId) {
  let activeId = viewId !== undefined ? viewId : com.active;
  let serviceCallIds = vom.get(activeId).getServiceCallIds(targetComponentId, targetOperationId);
  let serviceCallLength = serviceCallIds.length;
  let failCount = 0;
  let completeCount = 0;

  let successFunc2 = successFunc;
  let failFunc2 = failFunc;
  let completeFunc2 = completeFunc;
  if (serviceCallLength > 1) {
    successFunc2 = function (a, b, d) {
    };
    failFunc2 = function (a, b, d) {
      failCount++;
    };
    completeFunc2 = function (a, b, d) {
      completeCount++;
      console.log('completeCnt', b, completeCount, serviceCallLength);
      if (completeCount >= serviceCallLength) {
        if (failCount === 0) {
          successFunc(a, b, d);
        }

        if (failCount > 0) {
          failFunc(a, b, d);
        }
        completeFunc(a, b, d);
      }
    }
  }

  for (let i = 0, n = serviceCallIds.length; i < n; i++) {
    let serviceCallId = serviceCallIds[i];
    let paramMap = $.extend({}, createOperationParamMap(targetComponentId, targetOperationId, serviceCallId, viewId), actionParamMap);

    let emptyCheckParams = vom.get(activeId).getServiceCallParamEmptyCheck(targetComponentId, targetOperationId, serviceCallId);
    if (emptyCheckParams.length > 0 && !checkEmptyParam(paramMap, emptyCheckParams)) {
      let componentsType = vom.get(activeId).getComponentType(targetComponentId);
      if (componentsType === 'R_GRID' || componentsType === 'R_TREE') {
        waitOff('body');
        com.get(activeId).getComponent(targetComponentId).getActualComponent().hideToast();
      }
      return;
    }

    if (paramMap.service) {
      if (paramMap.target) {
        callGeneralService(targetComponentId, targetOperationId, serviceCallId, paramMap, successFunc2, failFunc2, completeFunc2, activeId);
      } else {
        console.error(`Service target is not exists! (service: ${paramMap.service})`);
      }
    } else if (paramMap.url) {
      callGeneralService(targetComponentId, targetOperationId, serviceCallId, paramMap, successFunc2, failFunc2, completeFunc2, activeId);
    } else {
      console.error('Service ID is not exists!');
    }
  }

  if ((!serviceCallIds || serviceCallLength <= 0) && targetOperationId === 'REFRESH') {
    let paramMap = actionParamMap;
    if (paramMap.service) {
      let serviceCallId = paramMap.service + '_' + targetOperationId;
      if (paramMap.target) {
        callGeneralService(targetComponentId, targetOperationId, serviceCallId, paramMap, successFunc2, failFunc2, completeFunc2, activeId);
      } else {
        console.error(`Service target is not exists! (service: ${paramMap.service})`);
      }
    } else if (paramMap.url) {
      let serviceCallId = paramMap.url + '_' + targetOperationId;
      callGeneralService(targetComponentId, targetOperationId, serviceCallId, paramMap, successFunc2, failFunc2, completeFunc2, activeId);
    } else {
      console.error('Service ID is not exists!');
    }
  }
}

export function callGeneralService(componentId, operationId, serviceCallId, params, successFunc, failFunc, completeFunc, viewId) {
  let activeId = viewId !== undefined ? viewId : com.active;
  let component = com.get(activeId).getComponent(componentId); 

  let beforeServiceResult = component.doBeforeServiceCall(params, componentId, operationId, serviceCallId);
  if (beforeServiceResult.result === false) {
    console.warn(`The service request has been aborted. (message: ${beforeServiceResult.msg})`);
    return;
  }

  params = beforeServiceResult.paramMap;

  let targetId = params.target;
  let serviceId = params.service;

  console.log(`Call the service.\n\tcomponent id: ${componentId}\n\toperation id: ${operationId}\n\tservice call id: ${serviceCallId}`);
  if (serviceId.toUpperCase() !== 'LOGIN' && targetId.toUpperCase() !== 'AUTHSERVER') {
    console.log('\n\tparameters:', params);
  }

  if (params.url) {
    const callback = {
      componentId: componentId,
      operationId: operationId,
      serviceCallId: serviceCallId
    };

    if (successFunc) {
      callback.success = (componentId, operationId, serviceCallId, data) => {
        vsm.get(activeId, "dataManager").setDataOfIMTC1(componentId, serviceCallId, data);
        successFunc(componentId, operationId, data, serviceCallId);
      };
    }

    if (failFunc) {
      callback.fail = (componentId, operationId, serviceCallId, data) => {
        failFunc(componentId, operationId, data, serviceCallId);
      };
    }

    if (completeFunc) {
      callback.complete = (componentId, operationId, serviceCallId, data) => {
        completeFunc(componentId, operationId, data, serviceCallId);
      };
    }

    let url = params.url;
    let method = params.method || 'get';

    delete params.service;
    delete params.target;
    delete params.timeout;
    delete params.url;
    delete params.method;
    delete params.CURRENT_OPERATION_CALL_ID;
    delete params.PREV_OPERATION_CALL_ID;
    return vsm.get(activeId, "serviceManager").procService(url, method, params, callback);
  }

  let url = baseURI() + 'engine/' + params.target + '/' + params.service;

  delete params.target;
  delete params.service;

  let form = new URLSearchParams();

  Object.entries(params).forEach(el => {
    form.append(el[0], el[1]);
  });

  let resultData;

  try {
    return axios({
      method: 'post',
      url: url,
      headers: getHeaders({}, true),
      data: form
    }).then((res) => {
      resultData = res.data;

      if (resultData[RESULT_SUCCESS] === true) {
        if (successFunc) {
          vsm.get(activeId, "dataManager").setDataOfIMTC1(componentId, serviceCallId, resultData);
          successFunc(componentId, operationId, resultData, serviceCallId);
        }
      } else {
        if (failFunc) {
          failFunc(componentId, operationId, resultData, serviceCallId);
        }
      }
    }).catch((err) => {
      if (failFunc) {
        failFunc(componentId, operationId, err.response, serviceCallId);
      }
    }).then(() => {
      if (completeFunc) {
        completeFunc(componentId, operationId, resultData, serviceCallId);
      }

      return resultData;
    });
  } finally {
    resultData = null;
  }
}

export function callReferService(componentId, operationId, serviceCallId, params, successFunc, failFunc, completeFunc) {
  let targetId = params.target;
  let serviceId = params.service;

  delete params.target;
  delete params.service;

  let parameters = $.param(params, true);

  console.log(`Call the reference service.\n\tcomponent id: ${componentId}\n\toperation id: ${operationId}\n\tservice call id: ${serviceCallId}`);
  if (serviceId.toUpperCase() !== 'LOGIN' && serviceId.toUpperCase() !== 'AUTHSERVER') {
    console.log('\n\tparameters:', parameters);
  }

  let url = baseURI() + 'engine/' + targetId + '/' + serviceId;

  return $.ajax({
    type: 'POST',
    url: url,
    headers: getHeaders({}, true),
    data: parameters
  });
}

export function callGridColumnService(componentId, serviceCallId, params, viewId) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let targetId = params.target;
  let serviceId = params.service;

  if (!serviceId && !params.url) {
    console.error('Service id does not exist.');
    return;
  }

  let method = 'post';
  let url;
  if (targetId && targetId.length > 0) {
    url = baseURI() + 'engine/' + params.target + '/' + params.service;

    delete params.target;
    delete params.service;

  } else {
    url = baseURI() + 'UIManagementServlet';
  }

  if(params.url) {
    method = 'get';
    url = params.url;
  }
  let resultData = {};

  $.ajax({
    type: method,
    url: url,
    headers: getHeaders({}, true),
    data: params,
    async: false,
    success: function (data) {
      if (data[RESULT_SUCCESS]) {
        if (data[RESULT_SUCCESS] === true) {
          vsm.get(activeId, "dataManager").setDataState(componentId, serviceCallId, data);
          resultData = data[RESULT_DATA];
        }
      } else {
        resultData = data;
      }
    },
    error: function (xhr, status, err) {
    },
    complete: function (data) {
    }
  });

  return resultData;
}

export function callGridCandidateService(componentId, serviceCallId, params) {
  let activeId = viewId === undefined ? vom.active : viewId;
  let url = baseURI() + 'engine/' + params.target + '/' + params.service;

  delete params.target;
  delete params.service;

  let resultData = {};

  $.ajax({
    type: 'POST',
    url: url,
    headers: getHeaders({}, true),
    data: params,
    async: false,
    success: function (data) {
      if (data[RESULT_SUCCESS] === true) {
        vsm.get(activeId, "dataManager").setDataState(componentId, serviceCallId, data);
        resultData = data[RESULT_DATA];
      }
    },
    error: function (xhr, status, error) {
    },
    complete: function (data) {
    }
  });

  return resultData;
}
