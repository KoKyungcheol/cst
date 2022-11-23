import { isJson } from '../util/utils';

export function createActionParamMap(componentId, operationCallId, activeId) {
  let viewId = activeId !== undefined ? activeId : vom.active;
  const parameterInfo = {
    referenceId: (paramId) => {
      return vom.get(viewId).getOperationCallParameterReferenceId(componentId, operationCallId, paramId);
    },
    referenceData: (paramId) => {
      return vom.get(viewId).getOperationCallParameterReferenceData(componentId, operationCallId, paramId);
    },
    parameterValue: (paramId) => {
      return vom.get(viewId).getOperationCallParameterValue(componentId, operationCallId, paramId);
    },
    defaultValue: (paramId) => {
      return vom.get(viewId).getOperationCallParameterDefaultValue(componentId, operationCallId, paramId);
    },
    extractBy: (paramId) => {
      return vom.get(viewId).getOperationCallParameterExtractBy(componentId, operationCallId, paramId);
    },
    delimiter: (paramId) => {
      return vom.get(viewId).getOperationCallParameterDelimiter(componentId, operationCallId, paramId);
    },
    rowExtractor: (paramId) => {
      return vom.get(viewId).getOperationCallParameterRowExtract(componentId, operationCallId, paramId);
    }
  };

  const paramsIds = vom.get(viewId).getOperationCallParameterIds(componentId, operationCallId);

  return createParamMap(parameterInfo, paramsIds, viewId);
}

export function createOperationParamMap(componentId, operationId, serviceCallId, activeId) {
  let viewId = activeId !== undefined ? activeId : com.active;
  const parameterInfo = {
    referenceId: (paramId) => {
      return vom.get(viewId).getServiceCallParameterReferenceId(componentId, operationId, serviceCallId, paramId);
    },
    referenceData: (paramId) => {
      return vom.get(viewId).getServiceCallParameterReferenceData(componentId, operationId, serviceCallId, paramId);
    },
    parameterValue: (paramId) => {
      return vom.get(viewId).getServiceCallParameterValue(componentId, operationId, serviceCallId, paramId);
    },
    defaultValue: (paramId) => {
      return vom.get(viewId).getServiceCallParameterDefaultValue(componentId, operationId, serviceCallId, paramId);
    },
    extractBy: (paramId) => {
      return vom.get(viewId).getServiceCallParameterExtractBy(componentId, operationId, serviceCallId, paramId);
    },
    delimiter: (paramId) => {
      return vom.get(viewId).getServiceCallParameterDelimiter(componentId, operationId, serviceCallId, paramId);
    },
    rowExtractor: (paramId) => {
      return vom.get(viewId).getServiceCallParameterRowExtract(componentId, operationId, serviceCallId, paramId);
    }
  };

  const paramsIds = vom.get(viewId).getServiceCallParameterIds(componentId, operationId, serviceCallId);

  let paramMap = createParamMap(parameterInfo, paramsIds, viewId);

  paramMap.service = vom.get(viewId).getServiceCallServiceId(componentId, operationId, serviceCallId);
  paramMap.target = vom.get(viewId).getServiceCallServiceTarget(componentId, operationId, serviceCallId);
  paramMap.timeout = vom.get(viewId).getServiceCallTimeoutSec(componentId, operationId, serviceCallId);

  let newTarget = vom.get(viewId).getServiceTargetAliases()[paramMap.target];
  if (newTarget) {
    paramMap.target = newTarget;
  }

  let url = vom.get(viewId).getServiceCallUrl(componentId, operationId, serviceCallId);
  if (url) {
    paramMap.url = url;
  }

  let method = vom.get(viewId).getServiceCallMethod(componentId, operationId, serviceCallId);
  if (method) {
    paramMap.method = method;
  }

  const component = com.get(viewId).getComponent(componentId);
  if (component.type === 'R_GRID' || component.type === 'R_TREE') {
    let crossTabInfo = component.getActualComponent().crossTabInfo;
    if (crossTabInfo) {
      paramMap['CROSSTAB'] = JSON.stringify(crossTabInfo);
    }
  }

  return paramMap;
}

function createParamMap(parameterInfo, paramsIds, activeId) {
  let viewId = activeId !== undefined ? activeId : com.active;
  let paramMap = {};

  for (let i = 0, n = paramsIds.length; i < n; i++) {
    let paramId = paramsIds[i];
    paramId = paramId.replace(/\./g, '//.');

    let referenceId = parameterInfo.referenceId(paramId);
    let referenceData = parameterInfo.referenceData(paramId);
    let parameterValue = parameterInfo.parameterValue(paramId);
    let defaultValue = parameterInfo.defaultValue(paramId);
    let extractBy = parameterInfo.extractBy(paramId);
    let delimiter = parameterInfo.delimiter(paramId);
    let rowExtractor = parameterInfo.rowExtractor(paramId);

    if (referenceId) {
      let data = [];

      let referenceItems = referenceId.split(':');

      let id = referenceItems[0];

      let type;
      if (referenceItems.length > 1) {
        type = referenceItems[1];
      }

      if (id !== 'COMMON') {
        let referenceComponent = com.get(viewId).getComponent(id);

        if (referenceComponent && referenceComponent.isMounted) {
          let referenceValue;

          if (referenceComponent.type === 'R_GRID' && rowExtractor) {
            referenceValue = referenceComponent.getValue(type, rowExtractor);
          } else {
            referenceValue = referenceComponent.getValue(type);
          }

          if (referenceValue !== null && referenceValue !== undefined && referenceValue.toString().length > 0) {
            if (typeof referenceValue === 'boolean' || typeof referenceValue === 'number') {
              data.push(referenceValue);
            } else {
              referenceValue = extractParameterValue(id, referenceValue, extractBy, delimiter, viewId);

              if (referenceValue !== null && referenceValue !== undefined && referenceValue.toString().length > 0) {
                data.push(referenceValue);
              } else {
                if (defaultValue !== null) {
                  data.push(defaultValue);
                } else {
                  if (referenceComponent.type === 'R_GRID') {
                    data.push.apply(data, null);
                  }
                }
              }
            }
          } else {
            if (defaultValue !== null) {
              data.push(defaultValue);
            } else {
              if (referenceComponent.type === 'R_GRID') {
                data.push.apply(data, null);
              }
            }
          }
        } else {
          if (defaultValue !== null) {
            data.push(defaultValue);
          }
        }
      } else {
        data.push(com.get(viewId).getComponent('COMMON').getValue(type));
      }

      if (paramId.toUpperCase() === 'REVERSE_TARGET') {
        paramId = 'REVERSE_TARGET';
      }

      if (data.length === 1) {
        paramMap[paramId] = data[0];
      } else if (data.length > 1) {
        paramMap[paramId] = data;
      }
    }

    if (parameterValue !== null) {
      if (paramId.toUpperCase() === 'REVERSE_TARGET') {
        paramId = 'REVERSE_TARGET';
      }
      paramMap[paramId] = parameterValue;
    }

    if (referenceData) {
      const data = [];

      let tempData = getDataFromDataManager(referenceData, extractBy, viewId);
      if (tempData !== undefined) {
        data.push(tempData);
      }

      if (data.length === 1) {
        paramMap[paramId] = data[0];
      } else if (data.length > 1) {
        paramMap[paramId] = data;
      }
    }
  }

  return paramMap;
}

export function getDataFromDataManager(referenceData, extractBy, activeId) {
  let viewId = activeId !== undefined ? activeId : com.active;

  if (!(/:/g.test(referenceData))) {
    return;
  }

  let values = referenceData.split(':');

  let componentId = values[0];
  let serviceCallId = values[1];
  let dataKey = values[2];

  console.log(`reference-data parameters\n\treferenced-component id: ${componentId}\n\treferenced-service id: ${serviceCallId}\n\treferenced-data key: ${dataKey}`);

  if (extractBy.length > 0) {
    console.log('referenced-data extract-by', extractBy);
  }

  if (!com.get(viewId).hasComponent(componentId)) {
    console.warn('reference-component ID is not valid');
    return;
  }

  if (!vsm.get(viewId, "dataManager").getDataState(componentId, serviceCallId)) {
    console.warn('reference-service data is not valid');
    return;
  }

  if (!(vsm.get(viewId, "dataManager").getDataState(componentId, serviceCallId)[RESULT_SUCCESS] && vsm.get(viewId, "dataManager").getDataState(componentId, serviceCallId)[RESULT_DATA])) {
    console.warn('reference-service result data is not valid');
    return;
  }

  let data = vsm.get(viewId, "dataManager").getDataState(componentId, serviceCallId)[RESULT_DATA];

  if (dataKey) {
    data = vsm.get(viewId, "dataManager").getDataState(componentId, serviceCallId)[RESULT_DATA][dataKey];
  }

  if (extractBy.length > 0) {
    data = vsm.get(viewId, "dataManager").getDataState(componentId, serviceCallId)[RESULT_DATA][dataKey][extractBy];
  }

  return data;
}

function extractParameterValue(componentId, referenceValue, extractBy, delimiter, viewId) {
  const component = com.get(viewId).getComponent(componentId);
  const componentType = component.type;

  if (extractBy.length > 0) {
    if (componentType === 'COMBOBOX') {
      let actualComponent = component.getActualComponent();
      let orgDataSource = actualComponent.dataSource.data();

      let dataSource = [];
      for (let i = 0; i < orgDataSource.length; i++) {
        dataSource.push(orgDataSource[i].toJSON());
      }

      let valueId = vom.get(viewId).propValueId(componentId);
      let textId = vom.get(viewId).propTextId(componentId);
      let selectedValue = actualComponent.value();
      let selectedText = actualComponent.text();

      let filter = {};
      filter[valueId] = referenceValue;
      if (selectedValue === referenceValue) {
        filter[textId] = selectedText;
      }

      let referenceDB = TAFFY(dataSource);
      referenceValue = TAFFY(referenceDB().filter(filter).get())().select(extractBy)[0];

      return referenceValue;
    }
  }

  if (componentType === 'CHECKBOX') {
    const actualComponent = component.getActualComponent();
    const dataSource = JSON.parse(actualComponent.attr('data-source'));

    if (extractBy.length === 0) {
      const valueId = vom.get(viewId).propValueId(componentId);
      referenceValue = dataSource[valueId];
    } else {
      const len = extractBy.length;

      if (len === 1) {
        referenceValue = dataSource[extractBy[0]];
      } else {
        let temp = {};
        for (let i = 0; i < len; i++) {
          temp[extractBy[i]] = dataSource[extractBy[i]];
        }

        let selectVal = [];
        selectVal.push(temp);
        referenceValue = JSON.stringify(selectVal);
      }
    }

    return referenceValue;
  }

  if (componentType === 'RADIO') {
    if (extractBy.length === 0) {
      return referenceValue;
    } else {
      const actualComponent = component.getActualComponent();
      const dataSource = JSON.parse(actualComponent.attr('data-source'));

      const len = extractBy.length;

      if (len === 1) {
        referenceValue = dataSource[extractBy[0]];
      } else {
        let temp = {};
        for (let i = 0; i < len; i++) {
          temp[extractBy[i]] = dataSource[extractBy[i]];
        }

        let selectVal = [];
        selectVal.push(temp);
        referenceValue = JSON.stringify(selectVal);
      }
    }
  }

  if (componentType === 'TREE') {
    if (extractBy.length === 0) {
      referenceValue = component.selectedId;
    } else {
      let len = extractBy.length;

      if (len === 1) {
        referenceValue = referenceValue[extractBy[0]];
      } else {
        let temp = {};
        for (let i = 0; i < len; i++) {
          temp[extractBy[i]] = referenceValue[extractBy[i]];
        }

        let selectVal = [];
        selectVal.push(temp);
        referenceValue = JSON.stringify(selectVal);
      }
    }

    return referenceValue;
  }

  if (typeof referenceValue === 'object') {
    let referenceValueJsonString = JSON.stringify(referenceValue);

    if (isJson(referenceValueJsonString)) {
      referenceValue = referenceValueJsonString;
    } else {
      return referenceValue;
    }
  }

  if (isJson(referenceValue)) {
    let parsedReferenceValue = JSON.parse(referenceValue);
    let referenceDB = TAFFY(parsedReferenceValue);

    if ((componentType === 'R_GRID' || componentType === 'DATA' || componentType === 'R_TREE')
      && parsedReferenceValue instanceof Array && extractBy !== undefined) {
      let extractedValue;

      if (extractBy.length === 1) {
        if (typeof extractBy[0] === 'string') {
          let pattern = /.*\(.*\)/gi;
          let test = extractBy[0].match(pattern);
          if (test && componentType === 'R_GRID') {
            extractBy = extractBy[0].replace(')', '');
            extractBy = extractBy.split('(');
            let extractColumnId = extractBy[0];
            let extractFieldId = extractBy[1];

            let referDataRow = parsedReferenceValue[0];
            extractedValue = referDataRow[extractColumnId];

            let dataColumns = component.getActualComponent().dataColumns;
            let dataColumnsDB = TAFFY(dataColumns);
            let valueId = vom.get(viewId).propColumnCandidateValueId(componentId, extractColumnId);

            if (valueId !== undefined && valueId.length > 0 && extractedValue !== undefined && extractedValue.length > 0) {
              let extractColumn = dataColumnsDB().filter({name: extractColumnId}).get()[0];
              let dropDownDataSourceOnExtractColumn = extractColumn.dropDownDataSource;
              let dropDownDataSourceOnExtractColumnDB = TAFFY(dropDownDataSourceOnExtractColumn);

              let arrReferenceColumn = [];
              if (vom.get(viewId).hasCandidateReferenceColumn(componentId, valueId)) {
                findReferenceColumn(dataColumnsDB, valueId, arrReferenceColumn);
              }

              let filter = {};
              filter[valueId] = extractedValue;

              for (let i = 0, len = arrReferenceColumn.length; i < len; i++) {
                filter[arrReferenceColumn[i]] = referDataRow[arrReferenceColumn[i]];
              }

              referenceValue = dropDownDataSourceOnExtractColumnDB().filter(filter).get()[0][extractFieldId];
              return referenceValue;
            } else {
              return;
            }
          }

          let extractedValues = referenceDB().select(extractBy);

          extractedValue = '';
          if (extractedValues.length > 1 && delimiter) {
            for (let i = 0; i < extractedValues.length; i++) {
              extractedValue = extractedValue + extractedValues[i];
              if (i < extractedValues.length - 1) {
                extractedValue = extractedValue + delimiter;
              }
            }
          } else {
            extractedValue = extractedValues[0];
          }

          referenceValue = extractedValue;
        } else if (typeof extractBy[0] === 'object') {
          let targetColumnId = Object.getOwnPropertyNames(extractBy[0])[0];
          let alias = extractBy[0][targetColumnId];

          let extractedValues = referenceDB().select(targetColumnId);

          extractedValue = [];
          if (extractedValues.length > 1 && delimiter) {
            for (let i = 0; i < extractedValues.length; i++) {
              let temp = {};
              temp[alias] = extractedValues[i];
              extractedValue.push(temp);
            }
          } else {
            let temp = {};
            temp[alias] = extractedValues[0];
            extractedValue.push(temp);
          }

          referenceValue = JSON.stringify(extractedValue);
        }
      } else {
        if (typeof extractBy[0] === 'string') {
          let extractedValues = [];
          for (let i = 0; i < extractBy.length; i++) {
            extractedValues.push(referenceDB().select(extractBy[i]));
          }
          extractedValue = [];

          if (extractedValues.length > 1 && delimiter) {
            for (let i = 0; i < extractedValues[0].length; i++) {
              let temp = {};
              for (let j = 0; j < extractBy.length; j++) {
                temp[extractBy[j]] = extractedValues[j][i];
              }
              extractedValue.push(temp);
            }
          } else {
            let temp = {};
            for (let i = 0; i < extractBy.length; i++) {
              temp[extractBy[i]] = extractedValues[i][0];
            }
            extractedValue.push(temp);
          }

          referenceValue = JSON.stringify(extractedValue);
        } else if (typeof extractBy[0] === 'object') {
          let targetColumnIds = [];
          let aliases = [];

          for (let i = 0; i < extractBy.length; i++) {
            let temp = Object.getOwnPropertyNames(extractBy[i]);
            targetColumnIds.push(temp[0]);
            aliases.push(extractBy[i][temp[0]]);
          }

          let extractedValues = [];
          for (let i = 0; i < targetColumnIds.length; i++) {
            extractedValues.push(referenceDB().select(targetColumnIds[i]));
          }
          extractedValue = [];

          if (extractedValues.length > 1 && delimiter) {
            for (let i = 0; i < extractedValues[0].length; i++) {
              let temp = {};
              for (let j = 0; j < aliases.length; j++) {
                temp[aliases[j]] = extractedValues[j][i];
              }
              extractedValue.push(temp);
            }
          } else {
            let temp = {};
            for (let i = 0; i < aliases.length; i++) {
              temp[aliases[i]] = extractedValues[i][0];
            }
            extractedValue.push(temp);
          }

          referenceValue = JSON.stringify(extractedValue);
        }
      }
    }
  }

  return referenceValue;
}

function findReferenceColumn(dataColumnsDB, columnId, arrReferenceColumn) {
  let referenceColumnId = dataColumnsDB().filter({ name: columnId }).get()[0].referenceColumnId;
  if (referenceColumnId) {
    arrReferenceColumn.push(referenceColumnId);
    findReferenceColumn(dataColumnsDB, referenceColumnId, arrReferenceColumn);
  } else {
    return arrReferenceColumn;
  }
}
