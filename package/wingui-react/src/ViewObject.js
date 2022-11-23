import baseURI from './baseURI';
import { STATIC_COMPONENTS } from './const';
import getHeaders from './getHeaders';

class ViewObject {
  constructor(id) {
    this.id = id;
    this.view = {};
  }

  getId() {
    return this.id;
  }

  clear() {
    for (let key in this.view) {
      delete this.view[key];
    }

    this.view.components = {};
    this.view.containers = {};
  }

  async load(viewId) {
    try {
      let res = await axios.get(baseURI() + 'view-config/' + viewId, {
        headers: getHeaders()
      });
      if(res.data === "") {
        this.view = {}
      } else {
        this.view = res.data;
      }
      
      if (!this.view.components) {
        this.view.components = {};
        co.contentLoading = false;
      }

      vom.add(this);
      return this.view;
    } catch (err) {
      console.error('Failed to load view config file. (error: %s)', err);
    }
  }
  
  includeVue() {
    return this.view.includeVue === true;
  }

  getServiceTargetAliases() {
    if (!this.view.serviceTargetAliases) {
      return {};
    }
    return this.view.serviceTargetAliases;
  }

  includeContainerComponent(componentId) {
    if (this.view.containers) {
      let containerIds = Object.keys(this.view.containers);
      for (let i = 0, n = containerIds.length; i < n; i++) {
        let containerId = containerIds[i];
        if (containerId === 'DOCUMENT') {
          continue;
        }

        let componentIds = this.view.containers[containerId];
        if (componentIds.includes(componentId)) {
          return true;
        }
      }
    }
    return false;
  }

  getContainerComponentIds(componentId) {
    if (this.view.containers) {
      let childrenIds = this.view.containers[componentId];
      if (childrenIds) {
        return childrenIds;
      }
    }
    return [];
  }

  hasComponent(componentId) {
    return componentId in this.view.components;
  }

  getComponent(componentId) {
    let component = this.view.components[componentId];
    if (component) {
      return component;
    }
    return {};
  }

  getComponentType(componentId) {
    if (STATIC_COMPONENTS.includes(componentId)) {
      return componentId.toUpperCase();
    } else {
      let component = this.view.components[componentId];
      if (component) {
        return component.type;
      }
      return '';
    }
  }

  getInitWindowComponentIds() {
    if (this.view.initWindowComponentIds) {
      return this.view.initWindowComponentIds;
    }
    return [];
  }

  hasOperation(componentId, operationId) {
    let component = this.getComponent(componentId);
    if (component.operations) {
      if (component.operations[operationId]) {
        return true;
      }
    }
  }

  getOperation(componentId, operationId) {
    let component = this.getComponent(componentId);
    if (component.operations) {
      let operation = component.operations[operationId];
      if (operation) {
        return operation;
      }
    }
    return {};
  }

  getPermissionType(componentId, operationId) {
    let operation = this.getOperation(componentId, operationId);
    if (operation.permissionType) {
      return operation.permissionType;
    }
    return '';
  }

  get(object, ...keys) {
    function nextGet(obj, keys) {
      if (!obj || typeof obj !== 'object') {
        return null;
      }

      if (!keys || keys.length === 0) {
        return null;
      }

      let key = keys[0];
      if (key in obj) {
        if (keys.length === 1) {
          return obj[key];
        }
        return nextGet(obj[key], keys.slice(1));
      }
      return null;
    }

    let value = nextGet(object, keys);
    return value === null ? '' : value;
  }

  find(object, ...keys) {
    function nextFind(obj, keys) {
      if (!obj || typeof obj !== 'object') {
        return false;
      }

      if (!keys || keys.length === 0) {
        return false;
      }

      let key = keys[0];
      if (key in obj) {
        if (keys.length === 1) {
          value = obj[key];
          return true;
        }
        keys = keys.slice(1);
      }

      Object.keys(obj).some(function (k) {
        return nextFind(obj[k], keys);
      });
    }

    let value;
    nextFind(object, keys);
    return value === null ? '' : value;
  }

  /**
   * Component actions.
   */
  hasAction(componentId, eventType) {
    let component = this.view.components[componentId];
    if (component && component.actions) {
      return eventType in component.actions;
    }
    return false;
  }

  getActionPermissionType(componentId, eventType) {
    let component = this.view.components[componentId];
    if (component && component.actions) {
      let action = component.actions[eventType];
      if (action && action.actionType) {
        return action.actionType;
      }
    }
    return '';
  }

  getActionRepeatSec(componentId, eventType) {
    let component = this.view.components[componentId];
    if (component && component.actions) {
      let action = component.actions[eventType];
      if (action && action.repeatSec) {
        return action.repeatSec;
      }
    }
    return 0;
  }

  getActionEventTypes(componentId) {
    let component = this.view.components[componentId];
    if (component && component.actions) {
      return Object.keys(component.actions);
    }
    return [];
  }

  /**
   * Component operation calls.
   */
  getOperationCallIds(componentId, eventType) {
    let component = this.getComponent(componentId);
    if (component && component.actions) {
      let action = component.actions[eventType];
      if (action && action.operationCalls) {
        return Object.keys(action.operationCalls);
      }
    }
    return [];
  }

  findChainingOperationCall(object, operationCallId) {
    if (operationCallId in object) {
      return object[operationCallId];
    }

    let operationCalls = Object.values(object);
    for (let i = 0, n = operationCalls.length; i < n; i++) {
      let operationCall = operationCalls[i];
      if (operationCall.success) {
        let successOperationCall = this.findChainingOperationCall(operationCall.success, operationCallId);
        if (successOperationCall) {
          return successOperationCall;
        }
      }

      if (operationCall.fail) {
        let failOperationCall = this.findChainingOperationCall(operationCall.fail, operationCallId);
        if (failOperationCall) {
          return failOperationCall;
        }
      }

      if (operationCall.complete) {
        let completeOperationCall = this.findChainingOperationCall(operationCall.complete, operationCallId);
        if (completeOperationCall) {
          return completeOperationCall;
        }
      }
    }

    return null;
  }

  getOperationCall(componentId, operationCallId) {
    let component = this.getComponent(componentId);
    if (component) {
      if (component.actions) {
        let actions = Object.values(component.actions);
        for (let i = 0, n = actions.length; i < n; i++) {
          let action = actions[i];
          if (action.operationCalls) {
            let operationCall = this.findChainingOperationCall(action.operationCalls, operationCallId);
            if (operationCall) {
              return operationCall;
            }
          }
        }
      }

      if (component.props) {
        let toolbarButtons = component.props.toolbarButtons;
        if (toolbarButtons) {
          let buttons = Object.values(toolbarButtons);
          for (let i = 0, n = buttons.length; i < n; i++) {
            let button = buttons[i];

            if (button.success) {
              let successOperationCall = this.findChainingOperationCall(button.success, operationCallId);
              if (successOperationCall) {
                return successOperationCall;
              }
            }

            if (button.fail) {
              let failOperationCall = this.findChainingOperationCall(button.fail, operationCallId);
              if (failOperationCall) {
                return failOperationCall;
              }
            }

            if (button.complete) {
              let completeOperationCall = this.findChainingOperationCall(button.complete, operationCallId);
              if (completeOperationCall) {
                return completeOperationCall;
              }
            }
          }
        }
      }
    }
    return null;
  }

  getOperationCallComponentId(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.componentId) {
        return operationCall.componentId;
      }
    }
    return '';
  }

  getOperationCallOperationId(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.operationId) {
        return operationCall.operationId;
      }
    }
    return '';
  }

  getOperationCallParameterIds(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameterIds = Object.keys(operationCall.parameters);
        parameterIds.filter((item, index) => parameterIds.indexOf(item) === index);
        return parameterIds;
      }
    }
    return [];
  }

  getOperationCallParameterValue(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.value !== undefined) {
          return parameter.value;
        }
      }
    }
    return null;
  }

  getOperationCallParameterDefaultValue(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.defaultValue !== undefined) {
          return parameter.defaultValue;
        }
      }
    }
    return null;
  }

  getOperationCallParameterExtractBy(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.extractBy) {
          let extractBy = parameter.extractBy.split(',').map(function (item) {
            if (item.includes(':')) {
              let splited = item.split(':');
              let extractItem = {};
              extractItem[splited[0].trim()] = splited[1].trim();
              return extractItem;
            } else {
              return item.trim();
            }
          });

          return extractBy;
        }
      }
    }

    return [];
  }

  getOperationCallParameterDelimiter(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.delimiter) {
          return parameter.delimiter;
        }
      }
    }
    return '';
  }

  getOperationCallParameterRowExtract(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.rowExtract) {
          return parameter.rowExtract;
        }
      }
    }
    return '';
  }

  getOperationCallParameterReferenceId(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.referenceId) {
          return parameter.referenceId;
        }
      }
    }
    return '';
  }

  getOperationCallParameterReferenceData(componentId, operationCallId, parameterId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall) {
      if (operationCall.parameters) {
        let parameter = operationCall.parameters[parameterId];
        if (parameter && parameter.referenceData) {
          return parameter.referenceData;
        }
      }
    }
    return '';
  }

  getSuccessOperationCallIds(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.success) {
      return Object.keys(operationCall.success);
    }
    return [];
  }

  getFailOperationCallIds(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.fail) {
      return Object.keys(operationCall.fail);
    }
    return [];
  }

  getCompleteOperationCallIds(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.complete) {
      return Object.keys(operationCall.complete);
    }
    return [];
  }

  getToolbarSuccessOperationCallIds(componentId, toolbarId) {
    let toolbarButton = this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarId);
    if (toolbarButton && toolbarButton.success) {
      return Object.keys(toolbarButton.success);
    }
    return [];
  }

  getToolbarFailOperationCallIds(componentId, toolbarId) {
    let toolbarButton = this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarId);
    if (toolbarButton && toolbarButton.fail) {
      return Object.keys(toolbarButton.fail);
    }
    return [];
  }

  getToolbarCompleteOperationCallIds(componentId, toolbarId) {
    let toolbarButton = this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarId);
    if (toolbarButton && toolbarButton.complete) {
      return Object.keys(toolbarButton.complete);
    }
    return [];
  }

  /**
   * Component operation call conditions.
   */
  hasOperationCallCondition(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      return true;
    }
    return false;
  }

  getArrangedConditions(conditions) {
    let arrangedConditionObj = {};

    let conditionIds = Object.keys(conditions);
    for (let i = 0, n = conditionIds.length; i < n; i++) {
      let conditionId = conditionIds[i];

      let condition = conditions[conditionId];
      if (condition.group) {
        if (arrangedConditionObj.hasOwnProperty(condition.group)) {
          arrangedConditionObj[condition.group].push(conditionId);
        } else {
          arrangedConditionObj[condition.group] = [conditionId];
        }
      } else {
        arrangedConditionObj['NoneGroup' + i] = [conditionId];
      }
    }

    return Object.values(arrangedConditionObj);
  }

  getOperationCallArrangedConditions(componentId, operationCallId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      return this.getArrangedConditions(operationCall.conditions);
    }
    return [];
  }

  propConditionComponent(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.component) {
        return condition.component;
      }
    }
    return '';
  }

  propConditionOperator(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.operator) {
        return condition.operator;
      }
    }
    return '';
  }

  propConditionValues(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.value) {
        return condition.value.split(',').map(item => item.trim());
      }
    }
    return [];
  }

  propConditionMsg(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.msg) {
        return condition.msg;
      }
    }
    return '';
  }

  propConditionReferenceData(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.referenceData) {
        return condition.referenceData;
      }
    }
    return '';
  }

  propConditionKey(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.key) {
        return condition.key;
      }
    }
    return '';
  }

  propConditionExtractBy(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.extractBy) {
        return condition.extractBy;
      }
    }
    return '';
  }

  propConditionOnColumns(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.onColumn) {
        return condition.onColumn.split(',').map(item => item.trim());
      }
    }
    return [];
  }

  propConditionColumn(componentId, operationCallId, conditionId) {
    let operationCall = this.getOperationCall(componentId, operationCallId);
    if (operationCall && operationCall.conditions) {
      let condition = operationCall.conditions[conditionId];
      if (condition && condition.column) {
        return condition.column;
      }
    }
    return '';
  }

  getCellAttributeArrangedConditions(componentId, cellAttributeId) {
    let cellAttribute = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId);
    if (cellAttribute && cellAttribute.conditions) {
      return this.getArrangedConditions(cellAttribute.conditions);
    }
    return [];
  }

  getCellAttributeConditionColumn(componentId, cellAttributeId, conditionId) {
    let cellAttribute = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId);
    if (cellAttribute && cellAttribute.conditions) {
      let condition = cellAttribute.conditions[conditionId];
      if (condition && condition.column) {
        return condition.column;
      }
    }
    return '';
  }

  getCellAttributeConditionOperator(componentId, cellAttributeId, conditionId) {
    let cellAttribute = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId);
    if (cellAttribute && cellAttribute.conditions) {
      let condition = cellAttribute.conditions[conditionId];
      if (condition && condition.operator) {
        return condition.operator;
      }
    }
    return '';
  }

  getCellAttributeConditionValues(componentId, cellAttributeId, conditionId) {
    let cellAttribute = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId);
    if (cellAttribute && cellAttribute.conditions) {
      let condition = cellAttribute.conditions[conditionId];
      if (condition && condition.value) {
        return condition.value.split(',').map(item => item.trim());
      }
    }
    return [];
  }

  /**
   * Component service calls.
   */
  getServiceCall(componentId, operationId, serviceCallId) {
    let serviceCall = this.get(this.getComponent(componentId), 'operations', operationId, 'serviceCalls', serviceCallId);
    if (serviceCall) {
      return serviceCall;
    }
    return null;
  }

  getServiceCallIds(componentId, operationId) {
    let serviceCalls = this.get(this.getComponent(componentId), 'operations', operationId, 'serviceCalls');
    if (serviceCalls) {
      return Object.keys(serviceCalls);
    }
    return [];
  }

  getServiceCallServiceId(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.serviceId) {
      return serviceCall.serviceId;
    }
    return '';
  }

  getServiceCallServiceTarget(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.serviceTarget) {
      return serviceCall.serviceTarget;
    }
    return '';
  }

  getServiceCallUrl(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.url) {
      return serviceCall.url;
    }
    return '';
  }

  getServiceCallMethod(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.method) {
      return serviceCall.method;
    }
    return '';
  }

  getServiceCallTimeoutSec(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.timeoutSec) {
      return serviceCall.timeoutSec;
    }
    return 0;
  }

  getServiceCallParamEmptyCheck(componentId, operationId, serviceCallId) {
    let operation = this.get(this.getComponent(componentId), 'operations', operationId);
    if (operation) {
      if (serviceCallId) {
        let serviceCall = this.get(operation, 'serviceCalls', serviceCallId);
        if (serviceCall && serviceCall.paramEmptyCheck) {
          return serviceCall.paramEmptyCheck.split(',').map(item => item.trim());
        }
      } else {
        let paramEmptyCheck = this.find(operation, 'paramEmptyCheck');
        if (paramEmptyCheck) {
          return paramEmptyCheck.split(',').map(item => item.trim());
        }
      }
    }
    return [];
  }

  getServiceCallAllParameterIds(componentId, operationId) {
    let parameterIds = [];

    let serviceCallObj = this.get(this.getComponent(componentId), 'operations', operationId, 'serviceCalls');

    let serviceCalls = Object.values(serviceCallObj);
    for (let i = 0, n = serviceCalls.length; i < n; i++) {
      let serviceCall = serviceCalls[i];
      if (serviceCall.parameters) {
        parameterIds = parameterIds.concat(Object.keys(serviceCall.parameters));
      }
    }

    parameterIds.filter((item, index) => parameterIds.indexOf(item) === index);
    return parameterIds;
  }

  getServiceCallParameterIds(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameterIds = Object.keys(serviceCall.parameters);
      parameterIds.filter((item, index) => parameterIds.indexOf(item) === index);
      return parameterIds;
    }

    return [];
  }

  getServiceCallParameterValue(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.value !== undefined) {
        return parameter.value;
      }
    }
    return null;
  }

  getServiceCallParameterDefaultValue(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.defaultValue !== undefined) {
        return parameter.defaultValue;
      }
    }
    return null;
  }

  getServiceCallParameterExtractBy(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.extractBy) {
        let extractBy = parameter.extractBy.split(',').map(function (item) {
          if (item.includes(':')) {
            let splited = item.split(':');
            let extractItem = {};
            extractItem[splited[0].trim()] = splited[1].trim();
            return extractItem;
          } else {
            return item.trim();
          }
        });

        return extractBy;
      }
    }

    return [];
  }

  getServiceCallParameterDelimiter(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.delimiter) {
        return parameter.delimiter;
      }
    }
    return '';
  }

  getServiceCallParameterRowExtract(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.rowExtract) {
        return parameter.rowExtract;
      }
    }
    return '';
  }

  getServiceCallParameterReferenceId(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.referenceId) {
        return parameter.referenceId;
      }
    }
    return '';
  }

  getServiceCallParameterReferenceData(componentId, operationId, serviceCallId, parameterId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.parameters) {
      let parameter = serviceCall.parameters[parameterId];
      if (parameter && parameter.referenceData) {
        return parameter.referenceData;
      }
    }
    return '';
  }

  getServiceCallResultDataKey(componentId, operationId, serviceCallId) {
    let serviceCall = this.getServiceCall(componentId, operationId, serviceCallId);
    if (serviceCall && serviceCall.resultDataKey) {
      return serviceCall.resultDataKey;
    }
    return '';
  }

  isReferenceService(componentId, operationId) {
    return this.getReferenceServiceCallInfo(componentId, operationId).length > 0;
  }

  getReferenceServiceCallInfo(componentId, operationId) {
    let operation = this.get(this.getComponent(componentId), 'operations', operationId);
    if (operation && operation.referenceServiceCalls) {
      let referenceServiceCall = operation.referenceServiceCalls[0];
      if (referenceServiceCall.serviceCallId) {
        return [referenceServiceCall.componentId, referenceServiceCall.serviceCallId];
      }
      return [referenceServiceCall.componentId];
    }
    return [];
  }

  getReferenceServiceCallExtract(componentId, operationId) {
    let operation = this.get(this.getComponent(componentId), 'operations', operationId);
    if (operation && operation.referenceServiceCalls) {
      let referenceServiceCall = operation.referenceServiceCalls[0];
      if (referenceServiceCall.extract) {
        return referenceServiceCall.extract;
      }
    }
    return '';
  }

  getReferenceServiceCallResultDataKey(componentId, operationId, serviceCallId) {
    let operation = this.get(this.getComponent(componentId), 'operations', operationId);
    if (operation && operation.referenceServiceCalls) {
      if (serviceCallId) {
        for (let i = 0, n = operation.referenceServiceCalls.length; i < n; i++) {
          let referenceServiceCall = operation.referenceServiceCalls[i];
          if (serviceCallId === referenceServiceCall.serviceCallId) {
            if (referenceServiceCall.resultDataKey) {
              return referenceServiceCall.resultDataKey;
            }
            break;
          }
        }
      } else {
        let referenceServiceCall = operation.referenceServiceCalls[0];
        if (referenceServiceCall.resultDataKey) {
          return referenceServiceCall.resultDataKey;
        }
      }
    }
    return '';
  }

  getColumnServiceCallServiceId(componentId, columnId, propertyName) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.serviceId) {
        return serviceCall.serviceId;
      }
    }
    return '';
  }

  getColumnServiceCallServiceTarget(componentId, columnId, propertyName) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.serviceTarget) {
        return serviceCall.serviceTarget;
      }
    }
    return '';
  }

  getColumnServiceCallUrl(componentId, columnId, propertyName) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.url) {
        return serviceCall.url;
      }
    }
    return '';
  }

  getColumnServiceCallMethod(componentId, columnId, propertyName) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.method) {
        return serviceCall.method;
      }
    }
    return '';
  }

  getColumnServiceCallParameterIds(componentId, columnId, propertyName) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.parameters) {
        let parameterIds = Object.keys(serviceCall.parameters);
        parameterIds.filter((item, index) => parameterIds.indexOf(item) === index);
        return parameterIds;
      }
    }
    return [];
  }

  getColumnServiceCallParameterReferenceId(componentId, columnId, propertyName, parameterId) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.parameters) {
        let parameter = serviceCall.parameters[parameterId];
        if (parameter && parameter.referenceId) {
          return parameter.referenceId;
        }
      }
    }
  }

  getColumnServiceCallParameterValue(componentId, columnId, propertyName, parameterId) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.parameters) {
        let parameter = serviceCall.parameters[parameterId];
        if (parameter && parameter.value !== undefined) {
          return parameter.value;
        }
      }
    }
    return null;
  }

  getColumnServiceCallParameterDefaultValue(componentId, columnId, propertyName, parameterId) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, propertyName, 'values', 'serviceCalls');
    if (serviceCalls) {
      let serviceCall = Object.values(serviceCalls)[0];
      if (serviceCall && serviceCall.parameters) {
        let parameter = serviceCall.parameters[parameterId];
        if (parameter && parameter.defaultValue !== undefined) {
          return parameter.defaultValue;
        }
      }
    }
    return null;
  }

  getColumnCandidateServiceCallId(componentId, columnId) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'values', 'serviceCalls');
    if (serviceCalls) {
      return Object.keys(serviceCalls)[0];
    }
    return '';
  }

  getColumnCandidateReferenceServiceCallId(componentId, columnId) {
    let referenceServiceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'values', 'referenceServiceCalls');
    if (referenceServiceCalls) {
      let referenceServiceCall = referenceServiceCalls[0];
      return referenceServiceCall.componentId + ':' + referenceServiceCall.serviceCallId;
    }
    return '';
  }

  getColumnCandidateReferenceServiceCallExtract(componentId, columnId) {
    let referenceServiceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'values', 'referenceServiceCalls');
    if (referenceServiceCalls) {
      if (referenceServiceCalls[0].extract) {
        return referenceServiceCalls[0].extract;
      }
    }
    return '';
  }

  getColumnDateLimitServiceCallId(componentId, columnId) {
    let serviceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'values', 'serviceCalls');
    if (serviceCalls) {
      return Object.keys(serviceCalls)[0];
    }
    return '';
  }

  getColumnDateLimitReferenceServiceCallId(componentId, columnId) {
    let referenceServiceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'values', 'referenceServiceCalls');
    if (referenceServiceCalls) {
      let referenceServiceCall = referenceServiceCalls[0];
      return referenceServiceCall.componentId + ':' + referenceServiceCall.serviceCallId;
    }
    return '';
  }

  getColumnDateLimitReferenceServiceCallExtract(componentId, columnId) {
    let referenceServiceCalls = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'values', 'referenceServiceCalls');
    if (referenceServiceCalls) {
      if (referenceServiceCalls[0].extract) {
        return referenceServiceCalls[0].extract;
      }
    }
    return '';
  }

  /**
   * Component properties.
   */
  propName(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'name');
  }

  propNamePosition(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'namePosition');
  }

  propHeight(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'height');
  }

  propWidth(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'width');
  }

  propTabIndex(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'tabindex');
  }

  propBackground(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'background');
  }

  propLang(componentId) {
    let lang = this.get(this.getComponent(componentId), 'props', 'lang');
    if (lang) {
      return true;
    }
    return false;
  }

  propFontBold(componentId) {
    let bold = this.get(this.getComponent(componentId), 'props', 'font', 'bold');
    if (bold) {
      return true;
    }
    return false;
  }

  propFontItalic(componentId) {
    let italic = this.get(this.getComponent(componentId), 'props', 'font', 'italic');
    if (italic) {
      return true;
    }
    return false;
  }

  propFontSize(componentId) {
    let size = this.get(this.getComponent(componentId), 'props', 'font', 'size');
    if (size) {
      return size;
    }
    return 0;
  }

  propFontColor(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'font', 'color');
  }

  propIcon(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'icon');
  }

  propTooltip(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'tooltip');
  }

  propTooltipVisible(componentId) {
    let visible = this.get(this.getComponent(componentId), 'props', 'tooptipVisible');
    if (visible) {
      return true;
    }
    return false;
  }

  propTooltipFormat(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'tooptipFormat');
  }

  propPlaceholder(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'placeholder');
  }

  propValueId(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'valueId');
  }

  /* Component toolbar properties. */
  propToolbarButtonPermissionType(componentId, toolbarButtonId) {
    return this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarButtonId, 'actionType');
  }

  propToolbarUsable(componentId) {
    let toolbarButtons = this.get(this.getComponent(componentId), 'props', 'toolbarButtons');
    if (toolbarButtons) {
      return true;
    }
    return false;
  }

  propToolbarButtonIds(componentId) {
    let toolbarButtons = this.get(this.getComponent(componentId), 'props', 'toolbarButtons');
    if (toolbarButtons) {
      return Object.keys(toolbarButtons);
    }
    return [];
  }

  propToolbarButtonEnable(componentId, toolbarButtonId) {
    let enable = this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarButtonId, 'enable');
    if (enable) {
      return true;
    }
    return false;
  }

  propToolbarButtonVisible(componentId, toolbarButtonId) {
    let visible = this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarButtonId, 'visible');
    if (visible) {
      return true;
    }
    return false;
  }

  propToolbarButtonPosition(componentId, toolbarButtonId) {
    return this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarButtonId, 'position');
  }

  propToolbarButtonTooltip(componentId, toolbarButtonId) {
    return this.get(this.getComponent(componentId), 'props', 'toolbarButtons', toolbarButtonId, 'tooltip');
  }

  /* common */
  propInitValue(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'initValue');
  }

  propEditable(componentId) {
    let editable = this.get(this.getComponent(componentId), 'props', 'editable');
    if (editable === false) {
      return false;
    }
    return true;
  }

  propTextId(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'textId');
  }

  propSelectId(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'selectId');
  }

  propTextIdSort(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'textIdSort');
  }

  /* Image component properties. */
  propImage(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'image');
  }

  /* Label component properties. */
  propPosition(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'position');
  }

  propLabelFormat(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'format');
  }

  /* Button component properties. */
  propDisable(componentId) {
    let lang = this.get(this.getComponent(componentId), 'props', 'disable');
    if (lang) {
      return true;
    }
    return false;
  }

  /* InputBox component properties. */
  propHidden(componentId) {
    let hidden = this.get(this.getComponent(componentId), 'props', 'hidden');
    if (hidden) {
      return true;
    }
    return false;
  }

  propType(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'type');
  }

  propMin(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'min');
  }

  propMax(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'max');
  }

  propSuggestValueId(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'suggest', 'valueId');
  }

  propSuggestDescriptionId(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'suggest', 'descriptionId');
  }

  propSuggestIgnoreCase(componentId) {
    let ignoreCase = this.get(this.getComponent(componentId), 'props', 'suggest', 'ignoreCase');
    if (ignoreCase) {
      return true;
    }
    return false;
  }

  hasSuggestValueId(componentId) {
    let valueId = this.get(this.getComponent(componentId), 'props', 'suggest', 'valueId');
    if (valueId) {
      return true;
    }
    return false;
  }

  /* DatePicker component properties. */
  propDateType(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'dateType');
  }

  propDateFormat(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'dateFormat');
  }

  propDatePickerDateValue(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'initValue');
  }

  propBaseValue(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'baseValue');
  }

  /* CheckBox component properties. */
  propCheckBoxInitValue(componentId) {
    let initValue = this.get(this.getComponent(componentId), 'props', 'initValue');
    if (initValue) {
      return true;
    }
    return false;
  }

  /* Radio component properties. */
  propOptionPropertyValue(option, propertyName) {
    let propertyValue = option[propertyName];
    if (propertyValue) {
      return propertyValue;
    }
    return '';
  }

  propOptionDeployment(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'optionDeployment');
  }

  propOptions(componentId) {
    let options = this.get(this.getComponent(componentId), 'props', 'initValue', 'options');
    if (options) {
      return options;
    }
    return [];
  }

  propOptionSelected(componentId, valueId) {
    let options = this.get(this.getComponent(componentId), 'props', 'initValue', 'options');
    if (options) {
      for (let i = 0, n = options.length; i < n; i++) {
        if (options[i].value === valueId && options[i].selected) {
          return true;
        }
      }
    }
    return false;
  }

  propOptionText(componentId, valueId) {
    let options = this.get(this.getComponent(componentId), 'props', 'initValue', 'options');
    if (options) {
      for (let i = 0, n = options.length; i < n; i++) {
        if (options[i].value === valueId && options[i].text) {
          return options[i].text;
        }
      }
    }
    return '';
  }

  propOptionTextPosition(componentId, valueId) {
    let options = this.get(this.getComponent(componentId), 'props', 'initValue', 'options');
    if (options) {
      for (let i = 0, n = options.length; i < n; i++) {
        if (options[i].value === valueId && options[i].textPosition) {
          return options[i].textPosition;
        }
      }
    }
    return '';
  }

  /* ComboBox component properties. */
  propDropdownHeight(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'dropdownHeight');
  }

  propIgnoreCase(componentId) {
    let ignoreCase = this.get(this.getComponent(componentId), 'props', 'ignoreCase');
    if (ignoreCase) {
      return true;
    }
    return false;
  }

  propInitValueOption(componentId) {
    let options = this.get(this.getComponent(componentId), 'props', 'initValue', 'options');
    if (options) {
      return options;
    }
    return [];
  }

  propSelectIndex(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'selectIndex');
  }

  propDataTooltip(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'tooltip');
  }

  propEnable(componentId) {
    let enable = this.get(this.getComponent(componentId), 'props', 'enable');
    if (enable === false) {
      return false;
    }
    return true;
  }

  /* TextArea, Editor component properties. */
  propValueType(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'valueType');
  }

  propPasteOption(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'pasteOption');
  }

  /* Tree component properties. */
  propCheckbox(componentId) {
    let checkbox = this.get(this.getComponent(componentId), 'props', 'checkbox');
    if (checkbox) {
      return true;
    }
    return false;
  }

  propValueSort(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'valueSort');
  }

  propGetvalueConcat(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'getvalueConcat');
  }

  /* Tab component properties. */
  propTabIds(componentId) {
    let tabIds = [];
    let tabs = this.get(this.getComponent(componentId), 'props', 'tabs');
    if (tabs) {
      for (let i = 0, n = tabs.length; i < n; i++) {
        tabIds.push(tabs[i].id);
      }
    }
    return tabIds;
  }

  propTabTitle(componentId, tabId) {
    let tabs = this.get(this.getComponent(componentId), 'props', 'tabs');
    if (tabs) {
      for (let i = 0, n = tabs.length; i < n; i++) {
        if (tabs[i].id === tabId && tabs[i].title) {
          return tabs[i].title;
        }
      }
    }
    return '';
  }

  propTabExpand(componentId, tabId) {
    let tabs = this.get(this.getComponent(componentId), 'props', 'tabs');
    if (tabs) {
      for (let i = 0, n = tabs.length; i < n; i++) {
        if (tabs[i].id === tabId && tabs[i].expand) {
          return true;
        }
      }
    }
    return false;
  }

  propTabInitRender(componentId, tabId) {
    let tabs = this.get(this.getComponent(componentId), 'props', 'tabs');
    if (tabs) {
      for (let i = 0, n = tabs.length; i < n; i++) {
        if (tabs[i].id === tabId && tabs[i].initRender) {
          return true;
        }
      }
    }
    return false;
  }

  /* Container component properties. */
  hasGroupBox(componentId) {
    let groupBox = this.get(this.getComponent(componentId), 'props', 'groupBox');
    if (groupBox) {
      return true;
    }
    return false;
  }

  propGroupBoxBorderColor(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupBox', 'borderColor');
  }

  propGroupBoxBorderWidth(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupBox', 'borderWidth');
  }

  propGroupBoxBorderStyle(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupBox', 'borderStyle');
  }

  propGroupBoxBorderRadius(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupBox', 'borderRadius');
  }

  propGroupBoxTitle(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupBox', 'title');
  }

  propGroupBoxTitlePosition(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupBox', 'titlePosition');
  }

  propContainerIds(componentId) {
    let containerIds = [];
    let containers = this.get(this.getComponent(componentId), 'props', 'containers');
    if (containers) {
      for (let i = 0, n = containers.length; i < n; i++) {
        containerIds.push(containers[i].id);
      }
    }
    return containerIds;
  }

  propContainerExpand(componentId, containerId) {
    let containers = this.get(this.getComponent(componentId), 'props', 'containers');
    if (containers) {
      for (let i = 0, n = containers.length; i < n; i++) {
        if (containers[i].id === containerId && containers[i].expand) {
          return true;
        }
      }
    }
    return false;
  }

  propContainerInitRender(componentId, containerId) {
    let containers = this.get(this.getComponent(componentId), 'props', 'containers');
    if (containers) {
      for (let i = 0, n = containers.length; i < n; i++) {
        if (containers[i].id === containerId && containers[i].initRender) {
          return true;
        }
      }
    }
    return false;
  }

  /* Split component properties. */
  propSplitIds(componentId) {
    let splitIds = [];
    let splits = this.get(this.getComponent(componentId), 'props', 'splits');
    if (splits) {
      for (let i = 0, n = splits.length; i < n; i++) {
        splitIds.push(splits[i].id);
      }
    }
    return splitIds;
  }

  propCollapsible(componentId, splitId) {
    let splits = this.get(this.getComponent(componentId), 'props', 'splits');
    if (splits) {
      for (let i = 0, n = splits.length; i < n; i++) {
        if (splits[i].id === splitId && splits[i].collapsible) {
          return true;
        }
      }
    }
    return false;
  }

  propCollapsed(componentId, splitId) {
    let splits = this.get(this.getComponent(componentId), 'props', 'splits');
    if (splits) {
      for (let i = 0, n = splits.length; i < n; i++) {
        if (splits[i].id === splitId && splits[i].collapsed) {
          return true;
        }
      }
    }
    return false;
  }

  propResizable(componentId, splitId) {
    let splits = this.get(this.getComponent(componentId), 'props', 'splits');
    if (splits) {
      for (let i = 0, n = splits.length; i < n; i++) {
        if (splits[i].id === splitId && splits[i].resizable === false) {
          return false;
        }
      }
    }
    return true;
  }

  propSplitSize(componentId, splitId) {
    let splits = this.get(this.getComponent(componentId), 'props', 'splits');
    if (splits) {
      for (let i = 0, n = splits.length; i < n; i++) {
        if (splits[i].id === splitId && splits[i].size) {
          return splits[i].size;
        }
      }
    }
    return '';
  }

  /* Window component properties. */
  propVisible(componentId) {
    let visible = this.get(this.getComponent(componentId), 'props', 'visible');
    if (visible === false) {
      return false;
    }
    return true;
  }

  propModal(componentId) {
    let modal = this.get(this.getComponent(componentId), 'props', 'modal');
    if (modal) {
      return true;
    }
    return false;
  }

  propUseButtons(componentId) {
    let useButtons = this.get(this.getComponent(componentId), 'props', 'useButtons');
    if (useButtons === false) {
      return false;
    }
    return true;
  }

  /* URLPage component properties. */
  propUrl(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'url');
  }

  propScroll(componentId) {
    let scroll = this.get(this.getComponent(componentId), 'props', 'scroll');
    if (scroll) {
      return true;
    }
    return false;
  }

  /* BPMN component properties. */
  propDataEditable(componentId) {
    let editable = this.get(this.getComponent(componentId), 'props', 'editable');
    if (editable === false) {
      return false;
    }
    return true;
  }

  /* Chart, PieChart component properties. */
  propDefaultType(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'defaultType');
  }

  propLegendHiddenFieldId(componentId) {
    let fieldId = this.get(this.getComponent(componentId), 'props', 'legendHiddenFieldId');
    if (fieldId) {
      return fieldId.split(',').map(item => item.trim());
    }
    return [];
  }

  propValueAxisCrossingValue(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');

    let axisCrossingValue;
    if (valueAxis) {
      if (valueId) {
        let valueObj = valueAxis[valueId];
        if (valueObj && valueObj.axisCrossingValue) {
          axisCrossingValue = valueObj.axisCrossingValue
        }
      } else {
        if (valueAxis.axisCrossingValue) {
          axisCrossingValue = valueAxis.axisCrossingValue;
        }
      }
    }

    if (!isNaN(axisCrossingValue)) {
      return axisCrossingValue;
    }

    if (axisCrossingValue) {
      axisCrossingValue = axisCrossingValue.toUpperCase();

      if (axisCrossingValue === 'LEFT' || axisCrossingValue === 'BOTTOM') {
        return 0;
      } else if (axisCrossingValue === 'RIGHT' || axisCrossingValue === 'TOP') {
        return 1000000;
      }
    }

    return 0;
  }

  propSeriesWidth(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'seriesWidth');
  }

  propCategoryAxisCategoryIds(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      return Object.keys(categories);
    }
    return [];
  }

  propCategoryAxisRotation(componentId, valueId) {
    let categoryAxis = this.get(this.getComponent(componentId), 'props', 'categoryAxis');
    if (categoryAxis) {
      if (valueId) {
        let categoryAxisObj = categoryAxis[valueId];
        if (categoryAxisObj && categoryAxisObj.rotation) {
          return categoryAxisObj.rotation;
        }
      } else {
        if (categoryAxis.rotation) {
          return categoryAxis.rotation;
        }
      }
    }
    return 0;
  }

  propCategoryAxisTitleText(componentId, valueId) {
    let categoryAxis = this.get(this.getComponent(componentId), 'props', 'categoryAxis');
    if (categoryAxis) {
      if (valueId) {
        let categoryAxisObj = categoryAxis[valueId];
        if (categoryAxisObj && categoryAxisObj.titleText) {
          return categoryAxisObj.titleText;
        }
      } else {
        if (categoryAxis.titleText) {
          return categoryAxis.titleText;
        }
      }
    }
    return '';
  }

  propCategoryAxisTitleColor(componentId, valueId) {
    let categoryAxis = this.get(this.getComponent(componentId), 'props', 'categoryAxis');
    if (categoryAxis) {
      if (valueId) {
        let categoryAxisObj = categoryAxis[valueId];
        if (categoryAxisObj && categoryAxisObj.titleColor) {
          return categoryAxisObj.titleColor;
        }
      } else {
        if (categoryAxis.titleColor) {
          return categoryAxis.titleColor;
        }
      }
    }
    return '';
  }

  propCategoryAxisTitleFont(componentId, valueId) {
    let categoryAxis = this.get(this.getComponent(componentId), 'props', 'categoryAxis');
    if (categoryAxis) {
      if (valueId) {
        let categoryAxisObj = categoryAxis[valueId];
        if (categoryAxisObj && categoryAxisObj.titleFont) {
          return categoryAxisObj.titleFont;
        }
      } else {
        if (categoryAxis.titleFont) {
          return categoryAxis.titleFont;
        }
      }
    }
    return '';
  }

  propValueAxisValueIds(componentId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      let valueAxisIds = Object.keys(valueAxis);
      if (valueAxisIds) {
        return valueAxisIds.filter(x => x !== 'axisCrossingValue' && x !== 'format' && x !== 'min' && x !== 'max' && x !== 'title');
      }
    }
    return [];
  }

  propValueAxisFormat(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.format) {
          return valueAxisObj.format;
        }
      } else {
        if (valueAxis.format) {
          return valueAxis.format;
        }
      }
    }
    return '';
  }

  propValueAxisVisible(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.visible) {
          return valueAxisObj.visible;
        }
      } else {
        if (valueAxis.visible) {
          return valueAxis.visible;
        }
      }
    }
    return '';
  }

  propValueAxisTitleText(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.titleText) {
          return valueAxisObj.titleText;
        }
      } else {
        if (valueAxis.titleText) {
          return valueAxis.titleText;
        }
      }
    }
    return '';
  }

  propValueAxisTitleColor(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.titleColor) {
          return valueAxisObj.titleColor;
        }
      } else {
        if (valueAxis.titleColor) {
          return valueAxis.titleColor;
        }
      }
    }
    return '';
  }

  propValueAxisTitleFont(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.titleFont) {
          return valueAxisObj.titleFont;
        }
      } else {
        if (valueAxis.titleFont) {
          return valueAxis.titleFont;
        }
      }
    }
    return '';
  }

  propValueAxisMin(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.min) {
          return valueAxisObj.min;
        }
      } else {
        if (valueAxis.min) {
          return valueAxis.min;
        }
      }
    }
    return '';
  }

  propValueAxisMax(componentId, valueId) {
    let valueAxis = this.get(this.getComponent(componentId), 'props', 'valueAxis');
    if (valueAxis) {
      if (valueId) {
        let valueAxisObj = valueAxis[valueId];
        if (valueAxisObj && valueAxisObj.max) {
          return valueAxisObj.max;
        }
      } else {
        if (valueAxis.max) {
          return valueAxis.max;
        }
      }
    }
    return '';
  }

  propSeriesVisible(componentId, valueId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series');
    if (series) {
      if (valueId) {
        let seriesObj = series[valueId];
        if (seriesObj && seriesObj.visible === true) {
          return true;
        }
      } else {
        if (series.visible === true) {
          return true;
        }
      }
    }
    return false;
  }

  propSeriesFormat(componentId, valueId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series');
    if (series) {
      if (valueId) {
        let seriesObj = series[valueId];
        if (seriesObj && seriesObj.format) {
          return seriesObj.format;
        }
      } else {
        if (series.format) {
          return series.format;
        }
      }
    }
    return '';
  }

  propModelSeriesVisible(componentId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series');
    if (series) {
      if (series.visible === true) {
        return true;
      }
    }
    return false;
  }

  propModelSeriesFormat(componentId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series');
    if (series) {
      if (series.format) {
        return series.format;
      }
    }
    return '';
  }

  propXAxisFormat(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'xAxis', 'format');
  }

  propYAxisFormat(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'yAxis', 'format');
  }

  propXAxisCrossingValue(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'xAxis', 'axisCrossingValue');
  }

  propCategories(componentId) {
    let categories = this.get(this.getComponent(componentId), 'props', 'categoryAxis');
    if (categories) {
      let newCategories = {};
      for (let categoryId in categories) {
        if (categoryId !== 'rotation' && categoryId !== 'title') {
          newCategories[categoryId] = categories[categoryId];
        }
      }

      return newCategories;
    }

    return [];
  }

  propCategoryId(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      let ids = Object.keys(categories);
      if (ids.length > 0) {
        return ids[0];
      }
    }
    return '';
  }

  propCategoryIds(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      return Object.keys(categories);
    }
    return [];
  }

  propCategorySortDirection(componentId) {
    let categories = this.propCategories(componentId);;
    if (categories) {
      let ids = Object.keys(categories);
      for (let i = 0, n = ids.length; i < n; i++) {
        let category = categories[ids[i]];
        if (category.sortDirection) {
          return category.sortDirection;
        }
      }
    }
    return '';
  }

  propCategoryType(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      let ids = Object.keys(categories);
      for (let i = 0, n = ids.length; i < n; i++) {
        let category = categories[ids[i]];
        if (category.type) {
          return category.type;
        }
      }
    }
    return '';
  }

  propCategoryDateGroup(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      let ids = Object.keys(categories);
      for (let i = 0, n = ids.length; i < n; i++) {
        let category = categories[ids[i]];
        if (category.dateGroup) {
          return true;
        }
      }
    }
    return false;
  }

  propCategoryBaseUnit(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      let ids = Object.keys(categories);
      for (let i = 0, n = ids.length; i < n; i++) {
        let category = categories[ids[i]];
        if (category.baseUnit) {
          return category.baseUnit;
        }
      }
    }
    return 0;
  }

  propCategoryBaseUnitStep(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      let ids = Object.keys(categories);
      for (let i = 0, n = ids.length; i < n; i++) {
        let category = categories[ids[i]];
        if (category.baseUnitStep) {
          return category.baseUnitStep;
        }
      }
    }
    return 0;
  }

  propCategoryFormat(componentId) {
    let categories = this.propCategories(componentId);
    if (categories) {
      let ids = Object.keys(categories);
      for (let i = 0, n = ids.length; i < n; i++) {
        let category = categories[ids[i]];
        if (category.format) {
          return category.format;
        }
      }
    }
    return '';
  }

  propCategoryDateGroupById(componentId, categoryId) {
    let dateGroup = this.get(this.getComponent(componentId), 'props', 'categoryAxis', categoryId, 'dateGroup');
    if (dateGroup) {
      return true;
    }
    return false;
  }

  propCategoryFormatById(componentId, categoryId) {
    let category = this.get(this.getComponent(componentId), 'props', 'categoryAxis', categoryId);
    if (category && category.format) {
      return category.format;
    }
    return '';
  }

  propSeriesXField(componentId, seriesId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series', seriesId);
    if (series && series.xField) {
      return series.xField;
    }
    return '';
  }

  propSeriesYField(componentId, seriesId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series', seriesId);
    if (series && series.yField) {
      return series.yField;
    }
    return '';
  }

  propSeriesCategoryField(componentId, seriesId) {
    let categoryField = this.get(this.getComponent(componentId), 'props', 'series', seriesId, 'categoryField');
    if (categoryField) {
      return categoryField;
    }
    return '';
  }

  propSeriesNoteTextFieldId(componentId, seriesId) {
    let noteTextFieldId = this.get(this.getComponent(componentId), 'props', 'series', seriesId, 'noteTextFieldId');
    if (noteTextFieldId) {
      return noteTextFieldId;
    }
    return '';
  }

  propSeriesChartType(componentId, seriesId) {
    let chartType = this.get(this.getComponent(componentId), 'props', 'series', seriesId, 'chartType');
    if (chartType) {
      return chartType;
    }
    return '';
  }

  propSeriesCriteriaAxis(componentId, seriesId) {
    let criteriaAxis = this.get(this.getComponent(componentId), 'props', 'series', seriesId, 'criteriaAxis');
    if (criteriaAxis) {
      return criteriaAxis;
    }
    return '';
  }

  propSeriesChartTypeStack(componentId, seriesId) {
    let chartTypeStack = this.get(this.getComponent(componentId), 'props', 'series', seriesId, 'chartTypeStack');
    if (chartTypeStack) {
      return chartTypeStack;
    }
    return '';
  }

  propSeriesChartTypeLineStyle(componentId, seriesId) {
    let chartTypeLineStyle = this.get(this.getComponent(componentId), 'props', 'series', seriesId, 'chartTypeLineStyle');
    if (chartTypeLineStyle) {
      return chartTypeLineStyle;
    }
    return '';
  }

  propDataGroupId(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'dataGroupId');
  }

  propTitlePosition(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'titlePosition');
  }

  propLabelVisible(componentId) {
    let visible = this.get(this.getComponent(componentId), 'props', 'labelsVisible');
    if (visible) {
      return true;
    }
    return false;
  }

  propLabelPercentage(componentId) {
    let percentage = this.get(this.getComponent(componentId), 'props', 'labelsPercentage');
    if (percentage) {
      return true;
    }
    return false;
  }

  propLabelPosition(componentId) {
    let position = this.get(this.getComponent(componentId), 'props', 'labelsPosition');
    if (position) {
      let preDefiendPosition = ['above', 'below', 'center', 'insideBase', 'insideEnd', 'left', 'outsideEnd', 'right', 'top', 'bottom'];

      let index = preDefiendPosition.indexOf(position);
      if (index > -1 && preDefiendPosition[index]) {
        return preDefiendPosition[index];
      }
    }
    return 'outsideEnd';
  }

  getChartSeriesCount(componentId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series');
    if (series) {
      return Object.keys(series).length;
    }
    return 0;
  }

  propBorderWidth(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'borderWidth');
  }

  propBorderColor(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'borderColor');
  }

  propTheme(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'theme');
  }

  propLegendVisible(componentId) {
    let legendVisible = this.get(this.getComponent(componentId), 'props', 'legendVisible');
    if (legendVisible) {
      return true;
    }
    return false;
  }

  propLegendPosition(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'legendPosition');
  }

  propSeriesIds(componentId) {
    let series = this.get(this.getComponent(componentId), 'props', 'series');
    if (series) {
      return Object.keys(series);
    }
    return [];
  }

  propTitle(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'title');
  }

  /* BPMN, R_GRID */
  propOperationFileName(componentId, operationId) {
    return this.get(this.getComponent(componentId), 'operations', operationId, 'fileName');
  }

  propIgnoreChange(componentId) {
    let ignoreChange = this.get(this.getComponent(componentId), 'props', 'ignoreChange');
    if (ignoreChange) {
      return true;
    }
    return false;
  }

  propPageable(componentId) {
    let pageable = this.get(this.getComponent(componentId), 'props', 'pageable');
    if (pageable) {
      return true;
    }
    return false;
  }

  propPageRowCount(componentId) {
    let pageRowCount = this.get(this.getComponent(componentId), 'props', 'pageRowCount');
    if (pageRowCount) {
      return pageRowCount;
    }
    return 20;
  }

  propPagingMode(componentId) {
    let pagingMode = this.get(this.getComponent(componentId), 'props', 'pagingMode');
    if (pagingMode === 'partial') {
      return 'PARTIAL';
    }
    return 'FULL';
  }

  propChartHeight(componentId) {
    let chartHeight = this.get(this.getComponent(componentId), 'props', 'chartHeight');
    if (chartHeight && !isNaN(chartHeight)) {
      return Number(chartHeight);
    }
    return 150;
  }

  propMeasureColumn(componentId) {
    let measureColumn = this.get(this.getComponent(componentId), 'props', 'measureColumn');
    if (measureColumn) {
      return measureColumn;
    }
    return 'CATEGORY';
  }

  propHeaderHeight(componentId) {
    let headerHeight = this.get(this.getComponent(componentId), 'props', 'headerHeight');
    if (headerHeight && !isNaN(headerHeight) && Number(headerHeight) > 0) {
      return headerHeight;
    }
    return 0;
  }

  propGroupable(componentId) {
    let groupable = this.get(this.getComponent(componentId), 'props', 'groupable');
    if (groupable) {
      return true;
    }
    return false;
  }

  propGroupHeader(componentId) {
    let groupHeader = this.get(this.getComponent(componentId), 'props', 'groupHeader');
    if (groupHeader === false) {
      return false;
    }
    return true;
  }

  propGroupSummary(componentId) {
    let groupSummary = this.get(this.getComponent(componentId), 'props', 'groupSummary');
    if (groupSummary === false) {
      return false;
    }
    return true;
  }

  propGroupExpander(componentId) {
    let groupExpander = this.get(this.getComponent(componentId), 'props', 'groupExpander');
    if (groupExpander === false) {
      return false;
    }
    return true;
  }

  propGroupSummaryOnHeader(componentId) {
    let groupExpander = this.get(this.getComponent(componentId), 'props', 'groupSummaryOnHeader');
    if (groupExpander) {
      return true;
    }
    return false;
  }

  propGroupSort(componentId) {
    let groupSort = this.get(this.getComponent(componentId), 'props', 'groupSort');
    if (groupSort === false) {
      return false;
    }
    return true;
  }

  propGroupSummaryMode(componentId) {
    let groupSummaryMode = this.get(this.getComponent(componentId), 'props', 'groupSummaryMode');
    if (groupSummaryMode && Object.getOwnPropertyNames(RealGridJS.SummaryMode).includes(groupSummaryMode.toUpperCase())) {
      return RealGridJS.SummaryMode[groupSummaryMode.toUpperCase()];
    }
    return RealGridJS.SummaryMode.AGGREGATE;
  }

  propGroupMergeMode(componentId) {
    let groupMergeMode = this.get(this.getComponent(componentId), 'props', 'groupMergeMode');
    if (groupMergeMode) {
      return true;
    }
    return false;
  }

  propGroupHeaderText(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupHeaderText');
  }

  propGroupFooterText(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'groupFooterText');
  }

  propGroupLevelStyle(componentId) {
    let groupLevelStyle = this.get(this.getComponent(componentId), 'props', 'groupLevelStyle');
    if (groupLevelStyle) {
      return true;
    }
    return false;
  }

  propColumnInitGroupOrder(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'initGroupOrder');
  }

  propColumnGroupSummaryExp(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'groupSummaryExp');
  }

  propOperationCurrentPage(componentId, operationId) {
    let currentPage = this.get(this.getComponent(componentId), 'operations', operationId, 'currentPage');
    if (currentPage) {
      return true;
    }
    return false;
  }

  propOperationRelieveMerge(componentId, operationId) {
    let relieveMerge = this.get(this.getComponent(componentId), 'operations', operationId, 'relieveMerge');
    if (relieveMerge) {
      return true;
    }
    return false;
  }

  propOperationExportFooter(componentId, operationId) {
    let exportFooter = this.get(this.getComponent(componentId), 'operations', operationId, 'exportFooter');
    if (exportFooter) {
      return 'visible';
    } else if (exportFooter === false) {
      return 'hidden';
    }
    return 'default';
  }

  propOperationAllColumns(componentId, operationId) {
    let allColumns = this.get(this.getComponent(componentId), 'operations', operationId, 'allColumns');
    if (allColumns) {
      return true;
    }
    return false;
  }

  propOperationExportLookup(componentId, operationId) {
    let exportLookup = this.get(this.getComponent(componentId), 'operations', operationId, 'exportLookup');
    if (exportLookup) {
      return true;
    }
    return false;
  }

  propOperationPosition(componentId, operationId) {
    let position = this.get(this.getComponent(componentId), 'operations', operationId, 'position');
    if (position) {
      return position.toUpperCase();
    }
    return '';
  }

  propOperationEditOnCell(componentId, operationId) {
    let editOnCell = this.get(this.getComponent(componentId), 'operations', operationId, 'editOnCell');
    if (editOnCell) {
      return true;
    }
    return false;
  }

  propInitExpandLevel(componentId) {
    let initExpandLevel = this.get(this.getComponent(componentId), 'props', 'initExpandLevel');
    if (initExpandLevel) {
      if (['NONE', 'ALL'].includes(String(initExpandLevel).toUpperCase())) {
        return initExpandLevel.toUpperCase();
      } else if (Number(initExpandLevel) !== NaN) {
        return Number(initExpandLevel);
      }
    }
    return 'NONE';
  }

  propCheckBar(componentId) {
    let checkBar = this.get(this.getComponent(componentId), 'props', 'checkBar');
    if (checkBar === false) {
      return false;
    }
    return true;
  }

  propCheckExclusive(componentId) {
    let checkExclusive = this.get(this.getComponent(componentId), 'props', 'checkExclusive');
    if (checkExclusive) {
      return true;
    }
    return false;
  }

  propIndicator(componentId) {
    let indicator = this.get(this.getComponent(componentId), 'props', 'indicator');
    if (indicator === false) {
      return false;
    }
    return true;
  }

  propStateBar(componentId) {
    let stateBar = this.get(this.getComponent(componentId), 'props', 'stateBar');
    if (stateBar === false) {
      return false;
    }
    return true;
  }

  propFitStyle(componentId) {
    let fitStyle = this.get(this.getComponent(componentId), 'props', 'fitStyle');
    if (fitStyle) {
      if (['none', 'even', 'evenFill'].includes(fitStyle)) {
        return fitStyle;
      }
    }
    return 'none';
  }

  propDataFit(componentId) {
    let dataFit = this.get(this.getComponent(componentId), 'props', 'dataFit');
    if (dataFit) {
      if (['none', 'vertical', 'horizontal'].includes(dataFit)) {
        return dataFit;
      }
    }
    return 'none';
  }

  propShowRowCount(componentId) {
    let showRowCount = this.get(this.getComponent(componentId), 'props', 'showRowCount');
    if (showRowCount) {
      return true;
    }
    return false;
  }

  propHeaderSortable(componentId) {
    let headerSortable = this.get(this.getComponent(componentId), 'props', 'headerSortable');
    if (headerSortable === false) {
      return false;
    }
    return true;
  }

  propGridSummary(componentId) {
    let gridSummary = this.get(this.getComponent(componentId), 'props', 'gridSummary');
    if (gridSummary) {
      return true;
    }
    return false;
  }

  propGridSummaryOnHeader(componentId) {
    let gridSummaryOnHeader = this.get(this.getComponent(componentId), 'props', 'gridSummaryOnHeader');
    if (gridSummaryOnHeader) {
      return true;
    }
    return false;
  }

  propGridSummaryMode(componentId) {
    let gridSummaryMode = this.get(this.getComponent(componentId), 'props', 'gridSummaryMode');
    if (gridSummaryMode && Object.getOwnPropertyNames(RealGridJS.SummaryMode).includes(gridSummaryMode.toUpperCase())) {
      return RealGridJS.SummaryMode[gridSummaryMode.toUpperCase()];
    }
    return RealGridJS.SummaryMode.AGGREGATE;
  }

  propSelectionMode(componentId) {
    return this.get(this.getComponent(componentId), 'props', 'selectionMode');
  }

  propCellAttributeIds(componentId) {
    let cellAttributes = this.get(this.getComponent(componentId), 'props', 'cellAttributes');
    if (cellAttributes) {
      return Object.keys(cellAttributes);
    }
    return [];
  }

  propCellAttributesApplyColumns(componentId) {
    let cellAttributes = this.get(this.getComponent(componentId), 'props', 'cellAttributes');
    if (cellAttributes) {
      let applyColumns = [];

      let cellAttributeIds = Object.keys(cellAttributes);
      for (let i = 0, n = cellAttributeIds.length; i < n; i++) {
        let cellAttribute = cellAttributes[cellAttributeIds[i]];
        if (cellAttribute.applies) {
          let applyIds = Object.keys(cellAttribute.applies);
          for (let j = 0, m = applyIds.length; j < m; j++) {
            let column = cellAttribute.applies[applyIds[j]].column;
            if (column) {
              applyColumns.push(column);
            }
          }
        }
      }
      return applyColumns;
    }
    return [];
  }

  propCellAttributeApplyIds(componentId, cellAttributeId) {
    let applies = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId, 'applies');
    if (applies) {
      return Object.keys(applies);
    }
    return [];
  }

  propCellAttributeApplyColumns(componentId, cellAttributeId, applyId) {
    let applyObj = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId, 'applies', applyId);
    if (applyObj && applyObj.column) {
      return applyObj.column.split(',').map(item => item.trim());
    }
    return [];
  }

  propCellAttributeApplyAttrs(componentId, cellAttributeId, applyId) {
    let attrsObj = this.get(this.getComponent(componentId), 'props', 'cellAttributes', cellAttributeId, 'applies', applyId, 'attrs');
    if (attrsObj) {
      if (attrsObj.hasOwnProperty('textAlignment')) {
        attrsObj['textAlignment'] = TEXT_ALIGNMENT[textAlignment.toUpperCase()];
      }
      return attrsObj;
    }
    return {};
  }

  propColumnIds(componentId) {
    let columns = this.get(this.getComponent(componentId), 'props', 'columns');
    if (columns) {
      return Object.keys(columns);
    }
    return [];
  }

  getColumnGroups(column) {
    if (column.iteration && column.iteration.group) {
      return column.iteration.group;
    }

    if (column.groups) {
      return column.groups;
    }
    return '';
  }

  getArrangedColumns(componentId) {
    let me = this;
    let columns = this.get(this.getComponent(componentId), 'props', 'columns');
    if (!columns) {
      return [];
    }

    let columnIds = Object.keys(columns);

    let viewMeta = com.get(this.id).getComponent(this.id +'-VIEW_META');
    if (viewMeta) {
      let prefInfo = viewMeta.getValue('PREF_INFO');
      if (prefInfo) {
        prefInfo = prefInfo.filter(prefRow => prefRow.gridCd === componentId);
        if (prefInfo.length > 0) {
          let columnObj = prefInfo.filter(prefRow => columnIds.includes(prefRow.fldCd)).map(function (prefRow) {
            return { name: prefRow.fldCd, seq: prefRow.fldSeq === undefined ? 10000 : prefRow.fldSeq };
          });

          columnObj = columnObj.sort((x, y) => x.seq < y.seq ? -1 : x.seq === y.seq ? 0 : 1);
          columnIds = columnObj.map(item => item.name);
        }
      }
    }

    let arrangedColumns = [];
    let processedColumns = [];

    for (let i = 0, n = columnIds.length; i < n; i++) {
      let columnId = columnIds[i];

      if (processedColumns.includes(columnId)) {
        continue;
      }

      let groups = this.getColumnGroups(columns[columnId]);
      if (groups) {
        let columnObj = [];
        for (let j = 0; j < n; j++) {
          let targetColumnId = columnIds[j];

          let targetGroups = this.getColumnGroups(columns[targetColumnId]);
          if (targetGroups === groups) {
            columnObj.push({ name: targetColumnId, seq: columnIds.indexOf(targetColumnId) });
            processedColumns.push(targetColumnId);
          }
        }

        columnObj = columnObj.sort((x, y) => x.seq < y.seq ? -1 : x.seq === y.seq ? 0 : 1);
        arrangedColumns.push(columnObj.map(item => item.name));
      } else {
        arrangedColumns.push([columnId]);
      }
    }

    return arrangedColumns;
  }

  propColumnTitle(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'title');
  }

  hasColumnTitle(componentId, columnId) {
    let gridColumnTitle = this.propColumnTitle(componentId, columnId);
    if (gridColumnTitle) {
      if (gridColumnTitle.toUpperCase() !== PREF_FIELD_NM) {
        return true;
      }
    }
    return false;
  }

  propColumnType(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'type');
  }

  propColumnSort(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'sort');
  }

  propColumnUseNumberComparer(componentId, columnId) {
    let useNumberComparer = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'useNumberComparer');
    if (useNumberComparer) {
      return true;
    }
    return false;
  }

  propColumnButton(componentId, columnId) {
    let button = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'button');
    if (button) {
      return true;
    }
    return false;
  }

  propColumnHeaderBackground(componentId, columnId) {
    let headerBackground = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'headerBackground');
    if (headerBackground) {
      if (/^(\#[\da-fA-F]{8})$/g.test(headerBackground)) {
        return headerBackground;
      }
    }
    return '';
  }

  propColumnHeaderForeground(componentId, columnId) {
    let headerForeground = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'headerForeground');
    if (headerForeground) {
      if (/^(\#[\da-fA-F]{8})$/g.test(headerForeground)) {
        return headerForeground;
      }
    }
    return '';
  }

  propColumnBackground(componentId, columnId) {
    let background = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'background');
    if (background) {
      if (/^(\#[\da-fA-F]{8})$/g.test(background)) {
        return background;
      }
    }
    return '';
  }

  propColumnForeground(componentId, columnId) {
    let foreground = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'foreground');
    if (foreground) {
      if (/^(\#[\da-fA-F]{8})$/g.test(foreground)) {
        return foreground;
      }
    }
    return '';
  }

  propColumnMerge(componentId, columnId) {
    let merge = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'merge');
    if (merge) {
      return true;
    }
    return false;
  }

  propColumnEditable(componentId, columnId) {
    let editable = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'editable');
    if (editable) {
      return true;
    }
    return false;
  }

  propColumnEditableIfNew(componentId, columnId) {
    let editableNew = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'editableNew');
    if (editableNew) {
      return true;
    }
    return false;
  }

  propColumnTextAlignment(componentId, columnId) {
    let textAlignment = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'textAlignment');
    if (textAlignment) {
      textAlignment = textAlignment.toUpperCase();
      if (Object.getOwnPropertyNames(TEXT_ALIGNMENT).includes(textAlignment)) {
        return TEXT_ALIGNMENT[textAlignment];
      }
    }
    return '';
  }

  propColumnFontBold(componentId, columnId) {
    let fontBold = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'fontBold');
    if (fontBold) {
      return true;
    }
    return false;
  }

  propColumnDatepicker(componentId, columnId) {
    let datepicker = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'datepicker');
    if (datepicker) {
      return true;
    }
    return false;
  }

  isApplyI18nGridColumn(componentId, columnId) {
    let lang = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'lang');
    if (lang) {
      return true;
    }
    return false;
  }

  isColumnMasking(componentId, columnId) {
    let masking = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'masking');
    if (masking) {
      return true;
    }
    return false;
  }

  isColumnCheckExclusive(componentId, columnId) {
    let checkExclusive = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'checkExclusive');
    if (checkExclusive) {
      return true;
    }
    return false;
  }

  isColumnVisible(componentId, columnId) {
    let visible = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'visible');
    if (visible === false) {
      return false;
    }
    return true;
  }

  isColumnPositiveOnly(componentId, columnId) {
    let positiveOnly = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'positiveOnly');
    if (positiveOnly) {
      return true;
    }
    return false;
  }

  isColumnFilterable(componentId, columnId) {
    let filterable = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'filterable');
    if (filterable) {
      return true;
    }
    return false;
  }

  propColumnWidth(componentId, columnId) {
    let width = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'width');
    if (width) {
      return width;
    }
    return 0;
  }

  propColumnCalc(componentId, columnId) {
    let calc = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'calc');
    if (calc) {
      let exp = calc.replace(/\${/gi, "values['");
      exp = exp.replace(/}/gi, "']");
      return exp;
    }
    return '';
  }

  propColumnTooltip(componentId, columnId) {
    let tooltip = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'tooltip');
    if (tooltip) {
      return tooltip.split(',').map(item => item.replace(/(^\s*)|(\s*$)/gi, ''));
    }
    return [];
  }

  isColumnFix(componentId, columnId) {
    let fix = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'fix');
    if (fix) {
      return true;
    }
    return false;
  }

  isColumnHeaderCheckable(componentId, columnId) {
    let headerCheckable = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'headerCheckable');
    if (headerCheckable) {
      return true;
    }
    return false;
  }

  propColumnHeaderCheckerPosition(componentId, columnId) {
    let headerCheckerPosition = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'headerCheckerPosition');
    if (headerCheckerPosition) {
      if (['NONE', 'LEFT', 'RIGHT', 'TOP', 'BOTTOM', 'CENTER'].includes(headerCheckerPosition.toUpperCase())) {
        return headerCheckerPosition.toLowerCase();
      }
    }
    return 'left';
  }

  hasColumnCandidate(componentId, columnId) {
    let candidate = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate');
    if (candidate) {
      return true;
    }
    return false;
  }

  propColumnCandidateDropDownCount(componentId, columnId) {
    let dropDownCount = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'dropDownCount');
    if (dropDownCount) {
      return dropDownCount;
    }
    return 10;
  }

  hasColumnCandidateInit(componentId, columnId) {
    let initValue = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'initValue');
    if (initValue) {
      return true;
    }
    return false;
  }

  propColumnCandidateInitValues(componentId, columnId) {
    let candidateInitOptions = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'initValue', 'options');
    if (candidateInitOptions) {
      let candidateInitValues = [];
      for (let i = 0; i < candidateInitOptions.length; i++) {
        if (candidateInitOptions[i].value) {
          candidateInitValues.push(candidateInitOptions[i].value);
        }
      }
      return candidateInitValues;
    }
    return [];
  }

  propColumnCandidateInitText(componentId, columnId, valueId) {
    let candidateInitOptions = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'initValue', 'options');
    if (candidateInitOptions) {
      for (let i = 0, n = candidateInitOptions.length; i < n; i++) {
        let value = candidateInitOptions[i].value;
        if (value === valueId) {
          return candidateInitOptions[i].text;
        }
      }
    }
    return '';
  }

  hasColumnCandidateService(componentId, columnId) {
    let candidateValues = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'values');
    if (candidateValues) {
      return true;
    }
    return false;
  }

  propColumnCandidateTextId(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'values', 'textId');
  }

  propColumnCandidateValueId(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'values', 'valueId');
  }

  hasDateLimit(componentId, columnId) {
    let dateLimit = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit');
    if (dateLimit) {
      return true;
    }
    return false;
  }

  hasColumnDateLimitInit(componentId, columnId) {
    let dateLimitInitValue = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'initValue');
    if (dateLimitInitValue) {
      return true;
    }
    return false;
  }

  hasColumnDateLimitValues(componentId, columnId) {
    let dateLimitValues = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'values');
    if (dateLimitValues) {
      return true;
    }
    return false;
  }

  hasColumnDateLimitInitValue(componentId, columnId, elementName) {
    let dateLimitValues = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'initValue', elementName);
    if (dateLimitValues) {
      return true;
    }
    return false;
  }

  propColumnDateLimitInitValue(componentId, columnId, elementName) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'initValue', elementName);
  }

  propColumnDateLimitValues(componentId, columnId, elementName) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'dateLimit', 'values', elementName);
  }

  hasCandidateReferenceColumn(componentId, columnId) {
    let referenceColumn = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'referenceColumn');
    if (referenceColumn) {
      return true;
    }
    return false;
  }

  propCandidateReferenceColumn(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'candidate', 'referenceColumn');
  }

  hasColumnLookup(componentId, columnId) {
    let lookup = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'lookup');
    if (lookup) {
      return true;
    }
    return false;
  }

  propColumnLookup(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'lookup');
  }

  hasColumnValidations(componentId, columnId) {
    let validations = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'validations');
    if (validations) {
      return true;
    }
    return false;
  }

  propColumnValidationIds(componentId, columnId) {
    let validations = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'validations');
    if (validations) {
      return Object.keys(validations);
    }
    return [];
  }

  propColumnValidationOperator(componentId, columnId, validationId) {
    let validationOperator = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'validations', validationId, 'operator');
    if (validationOperator) {
      validationOperator = validationOperator.toUpperCase();

      if (VALIDATION_OPERATOR.hasOwnProperty(validationOperator)) {
        return validationOperator;
      }
    }
    return '';
  }

  propColumnValidationValues(componentId, columnId, validationId) {
    let validationValue = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'validations', validationId, 'value');
    if (validationValue) {
      return validationValue.split(',').map(item => item.replace(/(^\s*)|(\s*$)/gi, ''));
    }
    return [];
  }

  propColumnValidationMessage(componentId, columnId, validationId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'validations', validationId, 'message');
  }

  propColumnFormat(componentId, columnId, columnDataType) {
    let format = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'format');
    if (format) {
      return format;
    } else {
      if (NUMBER_DATA_TYPE.includes(columnDataType)) {
        return '#,###.###';
      }

      if (DATETIME_DATA_TYPE.includes(columnDataType)) {
        return 'yyyy-MM-dd HH:mm:ss';
      }
    }
    return '';
  }

  propColumnExcelFormat(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'excelFormat');
  }

  propGridSummaryExp(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'gridSummaryExp');
  }

  propColumnGroups(componentId, columnId) {
    let groups = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'groups');
    if (groups) {
      return groups.trim();
    }
    return '';
  }

  isIterationColumn(componentId, columnId) {
    let iteration = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration');
    if (iteration) {
      return true;
    }
    return false;
  }

  propIterationColumnIds(componentId) {
    let columns = this.get(this.getComponent(componentId), 'props', 'columns');
    if (columns) {
      let iterationColumnIds = [];

      let columnIds = Object.keys(columns);
      for (let i = 0, n = columnIds.length; i < n; i++) {
        let columnId = columnIds[i];
        if (columns[columnId].iteration) {
          iterationColumnIds.push(columnId);
        }
      }
      return iterationColumnIds;
    }
    return [];
  }

  propColumnIterationPrefix(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'prefix');
  }

  propColumnIterationPostfix(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'postfix');
  }

  propColumnIterationPrefixRemove(componentId, columnId) {
    let iterationPrefixRemove = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'prefixRemove');
    if (iterationPrefixRemove) {
      return true;
    }
    return false;
  }

  propColumnIterationPostfixRemove(componentId, columnId) {
    let iterationPostfixRemove = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'postfixRemove');
    if (iterationPostfixRemove) {
      return true;
    }
    return false;
  }

  propColumnIterationDelimiter(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'delimiter');
  }

  hasColumnIterationDelimiter(componentId, columnId) {
    let delimiter = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'delimiter');
    if (delimiter) {
      return true;
    }
    return false;
  }

  propColumnIterationGroup(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'group');
  }

  propColumnIterationHeaderSeq(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'headerSeq');
  }

  propColumnIterationApplyColor(componentId, columnId) {
    return this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'applyColor');
  }

  propColumnIterationOrdinalPosition(componentId, columnId) {
    let ordinalPosition = this.get(this.getComponent(componentId), 'props', 'columns', columnId, 'iteration', 'ordinalPosition');
    if (ordinalPosition) {
      return ordinalPosition;
    }
    return null;
  }
}

export default ViewObject;
