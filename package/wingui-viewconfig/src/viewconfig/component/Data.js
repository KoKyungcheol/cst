import { createOperationParamMap } from '../service/parameter';
import {
  callGeneralService,
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';
import Component from './Component';

import { combine } from '../util/utils';



export default class Data extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.created();
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.element.style.display = 'none';

    if (vom.get(this.viewId).hasAction(this.id, 'change-data') && permission.check(this.id, 'change-data')) {
      let me = this;

      this.element.addEventListener('change-data', (event) => {
        vsm.get(me.viewId, "operationManager").actionOperation(me.id, 'change-data');

        event.stopPropagation();
        event.cancelBubble = true;
      });
    }

    this.isMounted = true;
    this.mounted();
  }

  getActualComponent() {
    return $(this.element);
  }

  initValue(key) {
    this.getActualComponent().removeData(key);

    let event = document.createEvent('Event');
    event.initEvent('change-data', true, true);
    this.element.dispatchEvent(event);
  }

  getValue(key) {
    return this.getActualComponent().data(key);
  }

  setValue(key, val) {
    this.getActualComponent().data(key, val);

    let event = document.createEvent('Event');
    event.initEvent('change-data', true, true);
    this.element.dispatchEvent(event);
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;

    if (operationId.startsWith('LOAD')) {
      const serviceCallPromises = [];
      const resultList = [];

      let serviceCallIds = vom.get(me.viewId).getServiceCallIds(this.id, operationId);
      for (let i = 0, n = serviceCallIds.length; i < n; i++) {
        let serviceCallId = serviceCallIds[i];
        const paramMap = Object.assign({}, createOperationParamMap(this.id, operationId, serviceCallId, me.viewId), actionParamMap);

        const promise = new Promise((resolve, reject) => {
          let newSuccessFunc = combine(me.loadProcess, resolve);

          if (paramMap.service) {
            if (paramMap.target) {
              let generalPromise = callGeneralService(me.id, operationId, serviceCallId, paramMap, newSuccessFunc, reject).then((data) => {
                resultList.push(data);
              });

              serviceCallPromises.push(generalPromise);
            } else {
              console.error(`Service target is not exists! (service: ${paramMap.service})`);
            }
          } else if (paramMap.url) {
            let generalPromise = callGeneralService(me.id, operationId, serviceCallId, paramMap, newSuccessFunc, reject).then((data) => {
              resultList.push(data);
            });

            serviceCallPromises.push(generalPromise);
          }
        });

        serviceCallPromises.push(promise);
      }

      Promise.all(serviceCallPromises).then((val) => {
        let result = (resultList.length > 0) ? resultList[0] : null;

        if (result['RESULT_SUCCESS']) {
          let preparedPromise = co.preparedPromise(me.id);
          if (preparedPromise) {
            let hasSuccessOperation = false;

            if (actionParamMap && actionParamMap.hasOwnProperty('CURRENT_OPERATION_CALL_ID')) {
              let previousOperationCallId = actionParamMap.CURRENT_OPERATION_CALL_ID;

              const operationCallIds = vom.get(me.viewId).getSuccessOperationCallIds(me.id, previousOperationCallId);
              hasSuccessOperation = operationCallIds.length > 0;
            }

            if (hasSuccessOperation) {
              console.log(`Meta data load was delayed. (component id: ${me.id}, operation id: ${operationId})`);
            } else {
              console.log(`Meta data load is complete. (component id: ${me.id}, operation id: ${operationId})`);
              preparedPromise.resolve();
            }
          }

          let event = document.createEvent('Event');
          event.initEvent('change-data', true, true);
          me.element.dispatchEvent(event);

          successFunc(me.id, operationId, result);
        } else {
          let preparedPromise = co.preparedPromise(me.id);
          if (preparedPromise) {
            console.error(`Meta data load failed.. (component id: ${me.id}, operation id: ${operationId})`);
            preparedPromise.reject();
          }

          failFunc(me.id, operationId, result);
        }

        completeFunc(me.id, operationId);
      }).catch((err) => {
        setLoadingBar(false);
        let result = (resultList.length > 0) ? resultList[0] : null;

        let preparedPromise = co.preparedPromise(me.id);
        if (preparedPromise) {
          console.error(`Meta data load failed.. (component id: ${me.id}, operation id: ${operationId})`);
          preparedPromise.reject();
        }

        failFunc(me.id, operationId, result);
        completeFunc(me.id, operationId);
      })

      return;
    } else if (operationId === 'INIT') {
      this.initValue();
    } else if (operationId.startsWith('SET')) {
      let paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      let changedCount = 0;
      let actualComponent = this.getActualComponent();
      for (let key in paramMap) {
        if (key === 'service' || key === 'target' || key === 'timeout') {
          continue;
        }

        actualComponent.data(key, paramMap[key]);
        changedCount++;
      }

      if (changedCount > 0) {
        let event = document.createEvent('Event');
        event.initEvent('change-data', true, true);
        this.element.dispatchEvent(event);
      }

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      let preparedPromise = co.preparedPromise(this.id);
      if (preparedPromise) {
        preparedPromise.resolve();
      }

      return;
    } else if (operationId === 'GETCONSOLE') {
      console.log(`The data component value is '${this.getValue()}'. (component id: ${this.id})`);
    } else if (operationId === 'VALIDATE') {
      return !!this.getValue();
    }

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else {
      callService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }
}
