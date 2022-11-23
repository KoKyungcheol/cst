import { createOperationParamMap } from '../service/parameter';
import { callGeneralService } from '../service/ServiceManager';



export default class Component {
  constructor(id, element, viewId) {
    this.id = id;
    this.viewId = viewId !== undefined ? viewId: com.active;
    this.element = element;

    this.validationProcess = [];
    this.loadProcessFlag = false;

    this.isMounted = false;
  }

  static combineParameter(componentId, operationId, oldParamMap) {
    const serviceCallIds = vom.get(this.viewId).getServiceCallIds(componentId, operationId);
    const serviceCallId = serviceCallIds[0];
    const serviceCallParamMap = createOperationParamMap(componentId, operationId, serviceCallId, this.viewId);
    return Object.assign({}, serviceCallParamMap, oldParamMap);
  }

  addDefaultEvent() {
    let me = this;
    let actionEventTypes = vom.get(this.viewId).getActionEventTypes(this.id);
    for (let i = 0, n = actionEventTypes.length; i < n; i++) {
      let actionEventType = actionEventTypes[i];
      let parsedEvent = this.parseEvent(actionEventType);

      let eventType = parsedEvent.type;
      let eventKey = parsedEvent.key;
      let eventTarget = parsedEvent.target;

      if (eventTarget === 'series') {
        continue;
      }

      if (permission.check(this.id, eventType) && eventType) {
        console.log(`Add the action event.\n\tcomponent id: ${this.id}\n\tevent-type: ${actionEventType}\n\tevent-key: ${eventKey}`);

        if (vom.get(this.viewId).includeVue()) {
          setTimeout(() => {
            let helpCmpt = document.getElementById(this.element.id);
            helpCmpt.addEventListener(eventType, (event) => {
              if (event.type === 'keyup' || event.type === 'keypress' || event.type === 'keydown') {
                if (event.key !== undefined && event.key.toLowerCase() === eventKey.toLowerCase()) {
                  vsm.get(me.viewId, "operationManager").actionOperation(this.id, actionEventType);
                }
              } else {
                if (event.type === 'click') {
                  let btnDisable = com.get(me.viewId).getComponent(this.id).getDom().getAttribute('disabled');
                  if (btnDisable === 'disabled' || btnDisable === 'true') {
                    event.stopPropagation();
                    event.cancelBubble = true;
                    return;
                  }
                  com.get(me.viewId).getComponent(this.id).onComponentClicked();
                } else if (event.type === 'change') {
                  com.get(me.viewId).getComponent(this.id).onComponentChanged();
                }

                vsm.get(me.viewId, "operationManager").actionOperation(this.id, actionEventType);
              }
              event.stopPropagation();
              event.cancelBubble = true;
            });
          }, 0);
        } else {
          this.element.addEventListener(eventType, (event) => {
            if (event.type === 'keyup' || event.type === 'keypress' || event.type === 'keydown') {
              if (event.key !== undefined && event.key.toLowerCase() === eventKey.toLowerCase()) {
                vsm.get(me.viewId, "operationManager").actionOperation(this.id, actionEventType);
              }
            } else {
              if (event.type === 'click') {
                let btnDisable = com.get(me.viewId).getComponent(this.id).getDom().getAttribute('disabled');
                if (btnDisable === 'disabled' || btnDisable === 'true') {
                  event.stopPropagation();
                  event.cancelBubble = true;
                  return;
                }
                com.get(me.viewId).getComponent(this.id).onComponentClicked();
              } else if (event.type === 'change') {
                com.get(me.viewId).getComponent(this.id).onComponentChanged();
              }

              vsm.get(me.viewId, "operationManager").actionOperation(this.id, actionEventType);
            }
            event.stopPropagation();
            event.cancelBubble = true;
          });
        }
      }
    }
  }

  parseEvent(event) {
    let ptnKey = /key/;
    let ptnClick = /click/;
    let ptnColon = /:/;
    let ptnDash = /-/;

    let eventSplit = [];
    let eventKey = '';
    let eventType = event;
    let eventTarget = '';

    if (ptnDash.test(event)) {
      eventSplit = event.split('-');

      if (ptnKey.test(event)) {
        if (ptnColon.test(event)) {
          eventSplit = event.split(':');
        }

        if (eventSplit.length > 1) {
          eventKey = eventSplit[1];
          eventType = eventSplit[0];
        }
      }

      if (ptnClick.test(event)) {
        if (eventSplit.length > 1) {
          eventType = eventSplit[1];
          eventTarget = eventSplit[0];
        }
      }
    }

    if (eventType === 'key') {
      eventType = 'keyup';
    }

    return {
      key: eventKey,
      type: eventType,
      target: eventTarget
    };
  }

  destroy() {
    this.destroyed();
  }

  setData(componentId, operationId, serviceCallId, data, viewId) {
    let activeId = viewId === undefined ? com.active : viewId;
    vsm.get(activeId, "dataManager").setData(componentId, operationId, serviceCallId, data);
  }

  doBeforeSetData(serviceCallId, data, resultData) {
  }

  doAfterSetData(serviceCallId, data, resultData) {
  }

  doBeforeOperation(sourceComponentId, targetComponentId, targetOperationId, actionParamMap) {
    return true;
  }

  doBeforeOperationCall(actionComponentId, targetComponentId, targetOperationId, actionParamMap) {
    return true;
  }

  doBeforeServiceCall(paramMap, componentId, operationId, serviceCallId) {
    return {result: true, msg: '', paramMap: paramMap};
  }

  initValue() {
  }

  initAction() {
    let eventType = 'init';
    if (vom.get(vom.active).hasAction(this.id, eventType) && permission.check(this.id, eventType)) {
      console.log(`Do init action of '${this.id}' component.`);
      vsm.get(com.active, "operationManager").actionOperation(this.id, eventType);
    }
  }

  getActualComponent() {
    return $(co.getTargetDocument().querySelector('#' + this.id));
  }

  getDom() {
    return this.element;
  }

  querySelector(selector) {
    return co.getTargetDocument().querySelector(selector);
  }

  resultDataValidate(resultData) {
    if (!resultData || resultData.length === 0 || Object.getOwnPropertyNames(resultData).length === 0) {
      console.warn(`There is no data loaded. (component id: ${this.id})`);
      this.loadProcessFlagOff();
    } else {
      if (typeof resultData === 'object' && resultData instanceof Array) {
        console.log(`The data has been loaded. (component id: ${this.id}, data size: ${resultData.length})`);
      } else if (typeof resultData === 'object') {
        console.log(`The data has been loaded. (component id: ${this.id}, data key size: ${Object.keys(resultData).length})`);
      }
      this.loadProcessFlagOn();
    }
  }

  loadProcessFlagOn() {
    this.loadProcessFlag = true;
    console.log(`Turns off the load process flag. (component id: ${this.id})`);
  }

  loadProcessFlagOff() {
    this.loadProcessFlag = false;
    console.log(`Turns on the load process flag. (component id: ${this.id})`);
  }

  getLoadProcessFlag() {
    return this.loadProcessFlag;
  }

  validate(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc, activeSwitch) {
    activeSwitch(false);

    let process = [];

    let processServiceCall = function (serviceCallId, componentId, operationId) {
      let promise = new Promise((resolve, reject) => {
        let param = createOperationParamMap(componentId, operationId, serviceCallId, vom.active);

        let successOperation = function (componentId, operationId, data) {
          let validationResult = data[RESULT_DATA]['IS_EXIST'] === true;
          if (validationResult) {
            resolve(componentId);
          } else if (!validationResult) {
            reject(componentId);
          }
        };

        callGeneralService(componentId, operationId, serviceCallId, param, successOperation);
      });

      process.push(promise);
    };

    let serviceCallIds = vom.get(vom.active).getServiceCallIds(this.id, operationId);
    for (let i = 0; i < serviceCallIds.length; i++) {
      processServiceCall(serviceCallIds[i], this.id, operationId);
    }

    let me = this;

    Promise.all(process).then(function () {
      activeSwitch(true);
    }).catch(function () {
      activeSwitch(false);
      failFunc(me.id, operationId, null);
    });

    successFunc(this.id, operationId, null);
    completeFunc(this.id, operationId, null);
  }

  doCommonOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    switch (operationId.toUpperCase()) {
      case 'CLEAR_ACTION_REPEAT':
        const paramMap = Component.combineParameter(this.id, operationId, actionParamMap);
        const eventType = paramMap['event-type'];

        const hasEventAction = vom.get(vom.active).hasAction(this.id, eventType);
        if (!hasEventAction) {
          console.warn(`There is no action. (component id: ${this.id}, event type: ${eventType})`);
          failFunc(this.id, operationId, null);
          break;
        }

        const currentIntervals = co.getIntervals();

        let currentInterval = currentIntervals[this.id];
        if (currentInterval) {
          let currentHandle = currentInterval[eventType];
          if (currentHandle && hasEventAction) {
            window.clearInterval(currentHandle);
            delete currentInterval[eventType];
          } else {
            console.warn(`There is no repeat action. (component id: ${this.id}, event type: ${eventType})`);
            failFunc(this.id, operationId, null);
            break;
          }
        }

        successFunc(this.id, operationId, null);
        break;
      default:
        break;
    }

    completeFunc(this.id, operationId, null);
  }

  // Wing UI calls the lifecycle hook methods in the following sequence at specific moments.
  created() {
  }

  mounted() {
  }

  destroyed() {
  }
}
