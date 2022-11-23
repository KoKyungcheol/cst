import {
  getDateFromDateString
} from '../util/utils';
import {
  showDialog, showToastMessage
} from '../util/dialog';
import { createActionParamMap, getDataFromDataManager } from './parameter';



class ConditionCheckerTub {
  constructor(id) {
    this.id = id;
    this.nullAcceptOperatorNames = ['EQUAL', 'NOTEQUAL'];
    this.checkerTub = {};
  }

  init() {
    const me = this;

    this.checkerTub.BETWEEN = (target, values) => {
      if (values.length < 2) {
        return false;
      }
      return target >= values[0] * 1 && target <= values[1] * 1;
    };

    this.checkerTub.STARTSWITH = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target.startsWith(value)) {
          return true;
        }
      }
      return false;
    }

    this.checkerTub.ENDSWITH = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target.endsWith(value)) {
          return true;
        }
      }
      return false;
    }

    this.checkerTub.EQUAL = (target, values) => {
      const type = typeof target;

      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);

        const valueString = value.toString().toUpperCase();
        if (valueString !== 'EMPTY' && type === 'boolean') {
          if (target === value) {
            return true;
          }
        } else if (valueString !== 'EMPTY' && target instanceof Date && type === 'object') {
          if (target.getTime() === value.getTime()) {
            return true;
          }
        } else {
          if (valueString === 'EMPTY') {
            if (!target) {
              return true;
            }
          } else {
            if (target === value) {
              return true;
            }
          }
        }
      }

      return false;
    }

    this.checkerTub.NOTEQUAL = (target, values) => {
      const type = typeof target;

      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);

        const valueString = value.toString().toUpperCase();
        if (valueString !== 'EMPTY' && type === 'boolean') {
          if (target !== value) {
            return true;
          }
        } else if (valueString !== 'EMPTY' && target instanceof Date && type === 'object') {
          if (target.getTime() !== value.getTime()) {
            return true;
          }
        } else {
          if (valueString === 'EMPTY') {
            if (target) {
              return true;
            }
          } else {
            if (target !== value) {
              return true;
            }
          }
        }
      }

      return false;
    }

    this.checkerTub.GREATEREQUAL = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target >= value) {
          return true;
        }
      }
      return false;
    }

    this.checkerTub.LESSEQUAL = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target <= value) {
          return true;
        }
      }
      return false;
    }

    this.checkerTub.GREATER = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target > value) {
          return true;
        }
      }
      return false;
    }

    this.checkerTub.LESS = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target < value) {
          return true;
        }
      }
      return false;
    }

    this.checkerTub.INCLUDES = (target, values) => {
      for (let i = 0, n = values.length; i < n; i++) {
        const value = me.convertValue(target, values[i]);
        if (target.includes(value)) {
          return true;
        }
      }
      return false;
    }
  }

  addConditionChecker(operatorName, conditionChecker) {
    this.checkerTub[operatorName] = conditionChecker;
  }

  convertValue(target, value) {
    const type = typeof target;

    if (type === 'boolean') {
      value = (value === 'true' || value === true);
    } else if (type === 'number') {
      if (!isNaN(value)) {
        value = Number(value);
      }
    }
    return value;
  }

  checkCondition(operatorName, target, values) {
    operatorName = operatorName.toUpperCase();

    if (!this.nullAcceptOperatorNames.includes(operatorName)) {
      if (target === undefined || target === null || target.length <= 0) {
        let operatorNames = Object.keys(this.checkerTub).filter(x => !this.nullAcceptOperatorNames.includes(x));
        console.error('target value is ', target, '\n', `Don't use these operators if you are expecting null/undefined ids. (operators: ${operatorNames})`);
        return false;
      }
    }

    const conditionChecker = this.checkerTub[operatorName];
    if (!conditionChecker || typeof conditionChecker !== 'function') {
      console.error('The condition checker does not exist or is not a function.');
      return false;
    }

    return conditionChecker(target, values);
  }

  checkAllCondition(componentId, operationCallId) {
    let isSatisfied = true;

    let msg = '';
    let msgMap = {};

    if (vom.get(this.id).hasOperationCallCondition(componentId, operationCallId)) {
      let arrAarrangedOperationCallConditionIds = vom.get(this.id).getOperationCallArrangedConditions(componentId, operationCallId);
      let conditionResult = JSON.parse(JSON.stringify(arrAarrangedOperationCallConditionIds));

      for (let i = 0; i < arrAarrangedOperationCallConditionIds.length; i++) {
        let arrangedOperationCallConditionIds = arrAarrangedOperationCallConditionIds[i];

        for (let j = 0; j < arrangedOperationCallConditionIds.length; j++) {
          let operationCallConditionId = arrangedOperationCallConditionIds[j];

          let conditionComponentId = vom.get(this.id).propConditionComponent(componentId, operationCallId, operationCallConditionId);
          let conditionOperator = vom.get(this.id).propConditionOperator(componentId, operationCallId, operationCallConditionId);
          let conditionValues = vom.get(this.id).propConditionValues(componentId, operationCallId, operationCallConditionId);

          let conditionFailMessage = vom.get(this.id).propConditionMsg(componentId, operationCallId, operationCallConditionId);

          if (!conditionComponentId) {
            conditionComponentId = componentId;
          }

          let conditionReferenceData = vom.get(this.id).propConditionReferenceData(componentId, operationCallId, operationCallConditionId);

          if (conditionReferenceData) {
            let extractBy = vom.get(this.id).propConditionExtractBy(componentId, operationCallId, operationCallConditionId);
            let targetValue = getDataFromDataManager(conditionReferenceData, extractBy, this.id);

            conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
            if (!conditionResult[i][j]) {
              msgMap[operationCallConditionId] = conditionFailMessage;
              msg = msg + conditionFailMessage + '\n';
            }
          } else {
            if (conditionComponentId === 'COMMON') {
              let key = vom.get(this.id).propConditionKey(componentId, operationCallId, operationCallConditionId);
              let targetValue = com.get(this.id).getComponent('COMMON').getValue(key);
              conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
              if (!conditionResult[i][j]) {
                msgMap[operationCallConditionId] = conditionFailMessage;
                msg = msg + conditionFailMessage + '\n';
              }
            } else {
              const componentType = vom.get(this.id).getComponentType(conditionComponentId);

              if (componentType === 'R_GRID' || componentType === 'R_TREE') {
                let rGridView = com.get(this.id).getComponent(conditionComponentId);
                let gridView = rGridView.getActualComponent();
                let dataColumns = gridView.dataColumns;
                let dataColumnsDB = TAFFY(dataColumns);
                let columnNames = (dataColumnsDB().select('columnIdOrg')).unique();

                let current = gridView.getCurrent();
                let currentColumnName = current.column;
                let currentItemIndex = current.itemIndex;
                let currentDataColumn = dataColumnsDB().filter({name: currentColumnName}).get()[0];

                if (currentDataColumn.isIterationColumn) {
                  currentColumnName = currentDataColumn.columnIdOrg;
                }

                let onColumns = vom.get(this.id).propConditionOnColumns(componentId, operationCallId, operationCallConditionId);
                let conditionColumn = vom.get(this.id).propConditionColumn(componentId, operationCallId, operationCallConditionId);
                let conditionValueKey = vom.get(this.id).propConditionKey(componentId, operationCallId, operationCallConditionId);

                if (onColumns.length > 0) {
                  let onColumnsValid = onColumns.every(onColumn => columnNames.includes(onColumn));
                  if (!onColumnsValid) {
                    console.error('\nSome of', onColumns, 'are not exists in', conditionComponentId + '.'
                      , '\nCheck condition', operationCallConditionId, 'at operation-call', operationCallId + '.'
                    );
                  }
                }

                let conditionColumnValid = true;
                if (conditionColumn && conditionColumn.toUpperCase() !== 'CHECKBAR') {
                  conditionColumnValid = columnNames.includes(conditionColumn);
                  if (!conditionColumnValid) {
                    console.error('\nColumn', conditionColumn, 'is not exists in', conditionComponentId + '.'
                      , '\nCheck condition', operationCallConditionId, 'at operation-call', operationCallId + '.'
                    );
                  }
                }

                if (conditionColumn && conditionColumn.toUpperCase() !== 'CHECKBAR'
                  && DATETIME_DATA_TYPE.includes(vom.get(this.id).propColumnType(conditionComponentId, conditionColumn).toUpperCase())) {
                  let temp = [];
                  for (let k = 0, n = conditionValues.length; k < n; k++) {
                    let valTemp = conditionValues[k];
                    if (valTemp.toUpperCase() === 'EMPTY') {
                      temp.push(valTemp);
                    } else {
                      if (valTemp !== undefined && valTemp.length > 0) {
                        temp.push(getDateFromDateString(valTemp));
                      }
                    }
                  }
                  conditionValues = temp;
                }

                let targetValue;

                if (onColumns.length === 0) {
                  if (!conditionColumn) {
                    if (conditionValues.length === 0) {
                      conditionResult[i][j] = false;
                    } else {
                      if (conditionValueKey && GRID_REFER_TYPE.hasOwnProperty(conditionValueKey.toUpperCase())) {
                        targetValue = rGridView.getValue(conditionValueKey);
                        conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                      } else {
                        conditionResult[i][j] = false;
                      }
                    }
                  } else {
                    if (conditionValues.length === 0) {
                      conditionResult[i][j] = false;
                    } else {
                      if (conditionColumn.toUpperCase() === 'CHECKBAR') {
                        targetValue = gridView.isCheckedItem(currentItemIndex);
                      } else {
                        targetValue = gridView.getValue(currentItemIndex, conditionColumn);
                      }

                      conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                    }
                  }
                } else {
                  if (!onColumns.includes(currentColumnName)) {
                    conditionResult[i][j] = false;
                    continue;
                  }

                  if (!conditionColumn) {
                    if (conditionValues.length === 0) {
                      conditionResult[i][j] = true;
                    } else {
                      if (conditionValueKey && GRID_REFER_TYPE.hasOwnProperty(conditionValueKey.toUpperCase())) {
                        targetValue = rGridView.getValue(conditionValueKey);
                        conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                      } else {
                        conditionValues.push(gridView.getValue(currentItemIndex, conditionColumn));

                        if (DATETIME_DATA_TYPE.includes(vom.get(this.id).propColumnType(conditionComponentId, conditionColumn).toUpperCase())) {
                          let temp = [];
                          for (let k = 0, n = conditionValues.length; k < n; k++) {
                            let valTemp = conditionValues[k];

                            temp.push(getDateFromDateString(valTemp));
                          }
                          conditionValues = temp;
                        }

                        targetValue = gridView.getValue(currentItemIndex, currentColumnName);

                        conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                      }
                    }
                  } else {
                    if (conditionValues.length === 0) {
                      conditionResult[i][j] = false;
                    } else {
                      if (conditionValueKey && GRID_REFER_TYPE.hasOwnProperty(conditionValueKey.toUpperCase())) {
                        targetValue = rGridView.getValue(conditionValueKey);
                        conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                      } else {
                        if (conditionColumn.toUpperCase() === 'CHECKBAR') {
                          targetValue = gridView.isCheckedItem(currentItemIndex);
                        } else {
                          targetValue = gridView.getValue(currentItemIndex, conditionColumn);
                        }

                        conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                      }
                    }
                  }
                }

                if (!conditionResult[i][j]) {
                  msgMap[operationCallConditionId] = conditionFailMessage;
                  msg = msg + conditionFailMessage + '\n';
                }
              } else if (['INPUTBOX', 'CHECKBOX', 'RADIO', 'COMBOBOX', 'TAB', 'CONTAINER'].includes(componentType)) {
                let targetValue = com.get(this.id).getComponent(conditionComponentId).getValue();
                conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                if (!conditionResult[i][j]) {
                  msgMap[operationCallConditionId] = conditionFailMessage;
                  msg = msg + conditionFailMessage + '\n';
                }
              } else if (componentType === 'TREE') {
                let extractBy = vom.get(this.id).propConditionExtractBy(componentId, operationCallId, operationCallConditionId);
                let targetValue;

                if (!extractBy) {
                  targetValue = com.get(this.id).getComponent(conditionComponentId).getValue('selectedId');
                } else {
                  let selected = com.get(this.id).getComponent(conditionComponentId).getValue('selected');
                  targetValue = selected[extractBy];
                }

                conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);

                if (!conditionResult[i][j]) {
                  msgMap[operationCallConditionId] = conditionFailMessage;
                  msg = msg + conditionFailMessage + '\n';
                }
              } else if (componentType === 'DATEPICKER') {
                let datetimeValue = com.get(this.id).getComponent(conditionComponentId).getValue();
                let datePattern = /\d{4}-\d{2}-\d{2}/g;
                let timePattern = /\d{2}:\d{2}:\d{2}/g;
                let dateTest = datetimeValue.match(datePattern);
                let date = dateTest[0];
                let timeTest = datetimeValue.match(timePattern);
                let time = timeTest[0];

                let targetValue = new Date(date + 'T' + time);

                for (let k = 0, n = conditionValues.length; k < n; k++) {
                  let conditionValue = conditionValues[k];
                  let conditionValueTimeTest = conditionValue.match(timePattern);
                  if (conditionValueTimeTest === null || conditionValueTimeTest === undefined
                    || conditionValueTimeTest === '' || conditionValueTimeTest.length <= 0) {
                    conditionValue = conditionValue + 'T' + '00:00:00';
                  }
                  conditionValues[k] = new Date(conditionValue);
                }

                conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                if (!conditionResult[i][j]) {
                  msgMap[operationCallConditionId] = conditionFailMessage;
                  msg = msg + conditionFailMessage + '\n';
                }
              } else if (componentType === 'DATA') {
                let key = vom.get(this.id).propConditionKey(componentId, operationCallId, operationCallConditionId);
                let extractBy = vom.get(this.id).propConditionExtractBy(componentId, operationCallId, operationCallConditionId);
                let targetValue = com.get(this.id).getComponent(conditionComponentId).getValue(key);

                if (targetValue !== undefined) {
                  if (extractBy !== undefined && extractBy.length > 0) {
                    if (targetValue instanceof Array) {
                      if (targetValue.length > 0 && targetValue[0].hasOwnProperty(extractBy)) {
                        targetValue = targetValue[0][extractBy];
                      }
                    } else if (targetValue instanceof Object) {
                      if (targetValue.hasOwnProperty(extractBy)) {
                        targetValue = targetValue[extractBy];
                      }
                    }
                  } else {
                    if (targetValue instanceof Array) {
                      targetValue = targetValue[0];
                    }
                  }
                }

                conditionResult[i][j] = this.checkCondition(conditionOperator, targetValue, conditionValues);
                if (!conditionResult[i][j]) {
                  msgMap[operationCallConditionId] = conditionFailMessage;
                  msg = msg + conditionFailMessage + '\n';
                }
              }
            }
          }
        }
      }

      let resultCondition = [];
      for (let i = 0; i < conditionResult.length; i++) {
        let temp = conditionResult[i];
        if (temp.includes(false)) {
          resultCondition.push(false);
        } else {
          resultCondition.push(true);
        }
      }

      if (!resultCondition.includes(true)) {
        isSatisfied = false;
      }
    }

    if (!isSatisfied && msg.trim().length > 0) {
      showDialog('Action Condition Fail', msg.trim(), DIALOG_TYPE.ALERT, true);
    }

    return isSatisfied;
  }
}

class OperationManager {
  constructor(id) {
    this.id = id;
    this.conditionCheckerTub = new ConditionCheckerTub(id);
    this.conditionCheckerTub.init();
  }

  getConditionCheckerTub() {
    return this.conditionCheckerTub;
  }

  actionOperation(componentId, eventType) {
    let me = this;
    let operationCallIds = vom.get(this.id).getOperationCallIds(componentId, eventType);

    let repeat = vom.get(this.id).getActionRepeatSec(componentId, eventType);
    if (repeat > 0) {
      const currentIntervals = co.getIntervals();

      let currentInterval = currentIntervals[componentId];
      if (currentInterval) {
        let currentHandle = currentInterval[eventType];
        if (currentHandle) {
          window.clearInterval(currentHandle);
        }
      }

      currentIntervals[componentId] = {};
      currentIntervals[componentId][eventType] = setInterval(vsm.get(me.id).doOperations.bind(om), repeat * 1000, componentId, operationCallIds);
      console.log(`Do the action operation.\n\tcomponent id: ${componentId}\n\tevent-type: ${eventType}\n\trepeat-second: ${repeat}`);
    } else {
      console.log(`Do the action operation.\n\tcomponent id: ${componentId}\n\tevent-type: ${eventType}`);
    }

    this.doOperations(componentId, operationCallIds);
  }

  doOperations(actionComponentId, operationCallIds, params) {
    for (let i = 0, n = operationCallIds.length; i < n; i++) {
      let operationCallId = operationCallIds[i];
      if (!operationCallId) {
        console.warn('Operation failed. (message: missing operation-call-id)');
        continue;
      }

      let targetComponentId = vom.get(this.id).getOperationCallComponentId(actionComponentId, operationCallId);
      if (!targetComponentId) {
        console.warn('Operation call stopped. (message: missing target-component-id)');
        continue;
      }

      let targetOperationId = vom.get(this.id).getOperationCallOperationId(actionComponentId, operationCallId);
      if (!targetOperationId) {
        console.warn('Operation call stopped. (message: missing target-operation-id)');
        continue;
      }

      let doBeforeOperationCallResult = com.get(this.id).getComponent(actionComponentId).doBeforeOperationCall(actionComponentId, targetComponentId, targetOperationId, operationCallId);

      if (doBeforeOperationCallResult === false) {
        console.warn('Operation call stopped. (message: condition is not valid on custom code)');
        continue;
      }

      let conditionFlag = this.conditionCheckerTub.checkAllCondition(actionComponentId, operationCallId);
      if (!conditionFlag) {
        continue;
      }

      let isStaticComponent = STATIC_COMPONENTS.includes(targetComponentId.toUpperCase());
      let isCommonOperation = COMMON_OPERATIONS.includes(targetOperationId.toUpperCase());

      let permissionType = vom.get(this.id).getPermissionType(targetComponentId, targetOperationId);
      let mappedPermissions = Object.keys(PERMISSION_TYPE_MAP);

      if (permissionType.length <= 0) {
        if (mappedPermissions.includes(targetOperationId)) {
          permissionType = PERMISSION_TYPE_MAP[targetOperationId];
        } else {
          for (let j = 0, len = mappedPermissions.length; j < len; j++) {
            let mappedPermission = mappedPermissions[j];
            if (targetOperationId.startsWith(mappedPermission)) {
              permissionType = PERMISSION_TYPE_MAP[mappedPermission];
            }
          }
        }
      }

      if (permissionType) {
        let permissionValue = permission.valueOf(PERMISSION_TYPE_PREFIX + permissionType);
        if (!permissionValue) {
          waitOff('body');
          com.removeWaitStatus(this.id);
          showToastMessage('Permission Denied'
            , 'Permission Denied for operation ' + targetOperationId + ' on ' + targetComponentId + '.'
            , 2000);
          continue;
        }
      }

      let targetComponentType = vom.get(this.id).getComponentType(targetComponentId);
      let isTreeDefaultOperation = false;
      if (targetComponentType === 'TREE' && (targetOperationId === 'EXPAND_ALL' || targetOperationId === 'COLLAPSE_ALL')) {
        isTreeDefaultOperation = true;
      }

      let isUrlPageComponent = false;
      if (targetComponentType === 'URL_PAGE') {
        isUrlPageComponent = true;
      }

      if (!isStaticComponent && !isUrlPageComponent) {
        if (targetOperationId.toUpperCase() !== 'INIT' && !isTreeDefaultOperation) {
          if (!vom.get(this.id).hasOperation(targetComponentId, targetOperationId)) {
            console.error(`Operation '${targetOperationId}' is not exist on '${targetComponentId}'!\nCheck configuration component: '${actionComponentId}' and '${targetComponentId}'`);
            continue;
          }
        }
      }

      console.log(`Operation Info.\n\tcomponent id: ${targetComponentId}\n\tcomponent type: ${vom.get(this.id).getComponentType(targetComponentId)}\n\toperation id: ${targetOperationId}`);

      try {
        const successFunc = (a, b, data) => {
          this.successOperation(actionComponentId, operationCallId, data);
        };

        const failFunc = (a, b, data) => {
          this.failOperation(actionComponentId, operationCallId, data);
        };

        const completeFunc = (a, b, data) => {
          this.completeOperation(actionComponentId, operationCallId, data);
        };

        const callParams = {
          CURRENT_OPERATION_CALL_ID: operationCallId
        };
        const actionParamMap = Object.assign({}, createActionParamMap(actionComponentId, operationCallId, this.id), params, callParams);
        console.log('Action parameters:', actionParamMap);

        const component = com.get(this.id).getComponent(targetComponentId);

        let doBeforeOperationResult = component.doBeforeOperation(actionComponentId, targetComponentId, targetOperationId, actionParamMap);
        if (doBeforeOperationResult) {
          if (isCommonOperation) {
            component.doCommonOperation(targetComponentId, targetOperationId, actionParamMap, successFunc, failFunc, completeFunc);
          } else {
            component.doOperation(targetComponentId, targetOperationId, actionParamMap, successFunc, failFunc, completeFunc);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  successOperation(actionComponentId, currentOperationCallId, resultData, serviceCallId) {
    console.log(`Do success operation of\n\tcomponent id: ${actionComponentId}\n\toperation id: ${currentOperationCallId}`);
    let operationCallIds = vom.get(this.id).getSuccessOperationCallIds(actionComponentId, currentOperationCallId);
    this.doRecursiveOperation(actionComponentId, operationCallIds, resultData, currentOperationCallId);
  }

  failOperation(actionComponentId, currentOperationCallId, resultData, serviceCallId) {
    console.log(`Do fail operation with\n\tcomponent id: ${actionComponentId}\n\toperation id: ${currentOperationCallId}`);
    let operationCallIds = vom.get(this.id).getFailOperationCallIds(actionComponentId, currentOperationCallId);
    this.doRecursiveOperation(actionComponentId, operationCallIds, resultData, currentOperationCallId);
  }

  completeOperation(actionComponentId, currentOperationCallId, resultData, serviceCallId) {
    console.log(`Do complete operation with\n\tcomponent id: ${actionComponentId}\n\toperation id: ${currentOperationCallId}`);
    let operationCallIds = vom.get(this.id).getCompleteOperationCallIds(actionComponentId, currentOperationCallId);
    this.doRecursiveOperation(actionComponentId, operationCallIds, resultData, currentOperationCallId);
  }

  doRecursiveOperation(actionComponentId, operationCallIds, prevOperationData, prevOperationCallId) {
    if (operationCallIds.length === 0) {
      return;
    }

    const previousParams = {
      'PREV_OPERATION_CALL_ID': prevOperationCallId
    };

    if (prevOperationData && prevOperationData.hasOwnProperty(RESULT_CODE)) {
      previousParams['PREV_OPERATION_' + RESULT_CODE] = prevOperationData[RESULT_CODE];
      previousParams['PREV_OPERATION_' + RESULT_MESSAGE] = prevOperationData[RESULT_MESSAGE];
      previousParams['PREV_OPERATION_' + RESULT_SUCCESS] = prevOperationData[RESULT_SUCCESS];
    }

    this.doOperations(actionComponentId, operationCallIds, previousParams);
  }
}

export default OperationManager;
