import { createOperationParamMap } from '../../wingui-viewconfig/src/viewconfig/service/parameter';
import { callReferService } from '../../wingui-viewconfig/src/viewconfig/service/ServiceManager';

class DataManager {
  constructor(viewId) {
    this.currentViewId = viewId;
    this.dataState = {};
    this.callState = {};
    this.dataState[viewId] = {};
    this.callState[viewId] = {};
    
  }
  create(viewId) {
    console.log('Init data and call state.' + viewId);
    this.currentViewId = viewId;
    this.init(viewId);
  }
  remove(viewId) {
    if (this.dataState[viewId]) {
      delete this.dataState[viewId];
    }

    if (this.callState[viewId]) {
      delete this.callState[viewId];
    }
  }

  init(viewId) {
    this.dataState[viewId] = {};
    this.callState[viewId] = {};
  }

  getDataState(componentId, serviceCallId) {
    let data;

    if (componentId && serviceCallId) {
      if (this.dataState[this.currentViewId][componentId]) {
        data = this.dataState[this.currentViewId][componentId][serviceCallId];
      }
    } else if (componentId) {
      data = this.dataState[this.currentViewId][componentId];
    } else {
      data = this.dataState;
    }

    return data;
  }

  setDataState(componentId, serviceCallId, data) {
    if (Object.keys(this.dataState).includes(this.currentViewId)) {
      if(!this.dataState[this.currentViewId][componentId]) {
        this.dataState[this.currentViewId][componentId] = {};
      }
      this.dataState[this.currentViewId][componentId][serviceCallId] = data;
    } else {
      this.dataState[this.currentViewId] = {};
      this.dataState[this.currentViewId][componentId] = {};
      this.dataState[this.currentViewId][componentId][serviceCallId] = data;
    }
    
    this.currentViewId = this.currentViewId;
  }

  setCallState(componentId, serviceCallId) {
    this.callState[this.currentViewId][componentId] = this.callState[this.currentViewId][componentId] || {};
    this.callState[this.currentViewId][componentId][serviceCallId] = true;
  }

  setDataValue(componentId, operationId, refComponentId, refServiceCallId) {
    console.log(`Set data.\n\tfrom component id: ${refComponentId}\n\tfrom service-call id: ${refServiceCallId}\n\tto component id: ${componentId}`);
    let resultData = this.dataState[this.currentViewId][refComponentId][refServiceCallId];
    let extractedData = this.extractData(resultData, componentId, operationId, refComponentId, refServiceCallId);
    com.get(this.currentViewId).getComponent(refComponentId).resultDataValidate(extractedData, resultData);

    let component = com.get(this.currentViewId).getComponent(componentId);

    component.doBeforeSetData(refServiceCallId, extractedData, resultData);

    if (vom.get(this.currentViewId).getComponentType(componentId) === 'DATA') {
      component.setValue(refServiceCallId, extractedData, resultData)
    } else {
      component.setValue(extractedData, resultData);
    }

    window.requestAnimationFrame(function () {
      component.doAfterSetData(refServiceCallId, extractedData, resultData);
    });
  }

  setDataOfIMTC1(componentId, serviceCallId, data) {
    if (data[RESULT_TYPE] === 'RESULT_TYPE_IMTC_1') {
      this.setDataState(componentId, serviceCallId, data);
    }
  }

  setData(componentId, operationId, serviceCallId, data) {
    if (data[RESULT_SUCCESS] === true) {
      this.setDataState(componentId, serviceCallId, data);
    }
    this.setDataValue(componentId, operationId, componentId, serviceCallId);
  }

  extractData(data, componentId, operationId, refComponentId, refServiceCallId) {
    let dataType = data[RESULT_TYPE];

    console.log(refComponentId + ' data type : ' + dataType);

    let resultDataKey;

    switch (dataType) {
      case 'RESULT_TYPE_I':
        return data[RESULT_DATA];

      case 'RESULT_TYPE_IM':
        return data[RESULT_DATA];

      case 'RESULT_TYPE_ITC_1':
        if (!Array.isArray(data.RESULT_DATA)) {
          data.RESULT_DATA = [data.RESULT_DATA];
        }
        let extractBy = vom.get(this.currentViewId).getReferenceServiceCallExtract(componentId, operationId);
        if (extractBy) {
          if (extractBy.includes(':')) {
            let filter = {};
            if (extractBy.includes(',')) {
              let arrExtractBy = extractBy.split(',');
              for (let i = 0; i < arrExtractBy.length; i++) {
                let values = arrExtractBy[i].split(':');
                filter[values[0]] = values[1];
              }
            } else {
              let values = extractBy.split(':');
              filter[values[0]] = values[1];
            }

            let dataDB = TAFFY(data[RESULT_DATA]);
            return dataDB().filter(filter).get();
          } else {
            console.warn(componentId + ' extractBy format incorrect!! check view-config file');
            return;
          }
        } else {
          return data[RESULT_DATA];
        }

      case 'RESULT_TYPE_ITC_1S':
        resultDataKey = vom.get(this.currentViewId).getReferenceServiceCallResultDataKey(componentId, operationId) || vom.get(this.currentViewId).getServiceCallResultDataKey(refComponentId, operationId, refServiceCallId);
        if (resultDataKey) {
          console.log(componentId + ' result-data-key : ' + resultDataKey);
          return data[RESULT_DATA][resultDataKey];
        } else if (data && vom.get(this.currentViewId).getComponentType(refComponentId) === 'DATA') {
          console.log(refComponentId + ' is DATA component. return all of ITC_1S data');
          return data[RESULT_DATA];
        } else {
          console.warn(componentId + ' result-data-key was not found!! check view-config file');
          return;
        }

      case 'RESULT_TYPE_ITC_2':
        return data[RESULT_DATA];

      case 'RESULT_TYPE_IMTC_1':
        resultDataKey = vom.get(this.currentViewId).getReferenceServiceCallResultDataKey(componentId, operationId) || vom.get(this.currentViewId).getServiceCallResultDataKey(refComponentId, operationId, refServiceCallId);
        if (resultDataKey) {
          console.log(componentId + ' result-data-key : ' + resultDataKey);
          return data[RESULT_DATA][resultDataKey];
        } else if (data && vom.get(this.currentViewId).getComponentType(refComponentId) === 'DATA') {
          console.log(refComponentId + ' is DATA component. return all of ITC_1S data');
          return data[RESULT_DATA];
        } else {
          return data[RESULT_DATA]['ITC1_DATA'];
        }

      default:
        return data[RESULT_DATA];
    }
  }

  setReferenceData(actionParamMap, componentId, operationId, refComponentId, refServiceCallId, successFunc, failFunc, completeFunc) {
    let me = this;

    if (this.dataState[this.currentViewId][refComponentId] && this.dataState[this.currentViewId][refComponentId][refServiceCallId]) {
      this.setDataValue(componentId, operationId, refComponentId, refServiceCallId);
      successFunc(refComponentId, operationId, this.dataState[this.currentViewId][refComponentId][refServiceCallId], refServiceCallId);
      completeFunc(refComponentId, operationId, this.dataState[this.currentViewId][refComponentId][refServiceCallId], refServiceCallId);
    } else {
      if (this.callState[this.currentViewId][refComponentId] && this.callState[this.currentViewId][refComponentId][refServiceCallId]) {
        console.log(componentId + ' wait for ' + refComponentId + ' ' + refServiceCallId + ' service-call done\n', this.callState[this.currentViewId][refComponentId][refServiceCallId]);

        this.callState[this.currentViewId][refComponentId][refServiceCallId].then((obj) => {
          console.log('Do deferred processing of ' + componentId);
          me.setDataValue(componentId, operationId, refComponentId, refServiceCallId);
          successFunc(refComponentId, operationId, this.dataState[this.currentViewId][refComponentId][refServiceCallId], refServiceCallId);
        }).catch(() => {
          console.warn(refComponentId + ' component ' + refServiceCallId + ' service-call failed')
        });
      } else {
        console.log(componentId + ' request ' + refComponentId + ' ' + refServiceCallId + ' service-call');
        this.setCallState(refComponentId, refServiceCallId);

        this.callState[this.currentViewId][refComponentId][refServiceCallId] = new Promise((resolve, reject) => {
          let paramMap = $.extend({}, createOperationParamMap(refComponentId, operationId, refServiceCallId, me.currentViewId), actionParamMap);
          let service = paramMap['service'];
          let target = paramMap['target'];

          callReferService(refComponentId, operationId, refServiceCallId, paramMap, successFunc, failFunc, completeFunc).done(function (data) {
            if (data[RESULT_SUCCESS] === true) {
              let obj = {
                reqId: componentId,
                reqOperation: operationId,
                referId: refComponentId,
                refService: refServiceCallId
              };

              me.setDataState(refComponentId, refServiceCallId, data);

              console.log(refComponentId + ' ' + refServiceCallId + ' service-call fulfilled!');
              resolve(obj);

              me.setDataValue(componentId, operationId, refComponentId, refServiceCallId);
              successFunc(refComponentId, operationId, data, refServiceCallId);
            }
          }).fail(function (xhr, status, error) {
            reject();
            failFunc(refComponentId, operationId, error, refServiceCallId);
          }).always(function (data) {
            completeFunc(refComponentId, operationId, data, refServiceCallId);
          });
        });
      }
    }
  }

}

export default DataManager;
