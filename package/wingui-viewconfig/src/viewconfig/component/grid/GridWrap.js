import Component from '../Component';
import xl from '../../util/ExcelTool';
export default class GridWrap extends Component {
  constructor(id, element, viewId) {
    super(id + '_WRAP', element, viewId);

    this.componentId = id;
    this.viewId = viewId;
    this.componentType = vom.get(viewId).getComponentType(id);
    this.buttonIds = [];

    this.usableToolbar = vom.get(viewId).propToolbarUsable(id);
    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    this.element.classList.add('wingui_component');

    let gridHeight = parseInt(vom.get(this.viewId).propHeight(this.componentId));
    if (gridHeight && gridHeight != 'NaN') {
      this.element.style.height = gridHeight + 'px';
    } else {
      this.element.style.height = '100%';
    }

    if (this.componentType === 'R_GRID') {
      xl.template(this.element, false);
    }

    if (!this.usableToolbar) {
      return;
    }

    let leftButtons = [];
    let rightButtons = [];

    let toolBarButtonIds = vom.get(this.viewId).propToolbarButtonIds(this.componentId);
    for (let i = 0, n = toolBarButtonIds.length; i < n; i++) {
      let toolBarButtonId = toolBarButtonIds[i];

      if (!vom.get(this.viewId).propToolbarButtonVisible(this.componentId, toolBarButtonId) || !vom.get(this.viewId).hasOperation(this.componentId, toolBarButtonId)) {
        continue;
      }

      let toolBarButtonEnable = vom.get(this.viewId).propToolbarButtonEnable(this.componentId, toolBarButtonId);

      let disableToolbar = true;
      if (toolBarButtonEnable && vom.get(this.viewId).hasOperation(this.componentId, toolBarButtonId)) {
        disableToolbar = false;
      }

      let toolBarTooptip = vom.get(this.viewId).propToolbarButtonTooltip(this.componentId, toolBarButtonId) ? vom.get(this.viewId).propToolbarButtonTooltip(this.componentId, toolBarButtonId) : toolBarButtonId;

      toolBarTooptip = (toolBarTooptip.substr(0, 1).toUpperCase() + toolBarTooptip.substr(1).toLowerCase()).replaceAll('_', ' ');

      let iconMap = {
        'PRINT': 'printer',
        'LOAD': 'search',
        'ROLLBACK': 'undo',
        'REFRESH': 'refresh',
        'CONFIG': 'cog',
        'INSERT_ROW': 'plus',
        'INSERT_SIBLING': 'plus',
        'INSERT_CHILD': 'plus-square',
        'REMOVE_ROW': 'minus',
        'SAVE': 'save',
        'IMPORT': 'upload',
        'EXPORT': 'download',
        'COPY': 'clone'
      };

      const button = document.createElement('button');

      button.id = toolBarButtonId + '_' + this.componentId;
      button.setAttribute('title', transLangKey(toolBarTooptip));
      button.setAttribute('type', 'button');
      if (disableToolbar) {
        button.setAttribute('disabled', true);
      }
      button.classList.add('k-button');

      button.style['padding-top'] = '7px';
      button.style['padding-bottom'] = '6px';

      this.buttonIds.push(button.id);

      if (iconMap.hasOwnProperty(toolBarButtonId)) {
        const icon = document.createElement('i');
        const iconClasses = icon.classList;

        iconClasses.add('btnIcon');
        iconClasses.add('fa');
        iconClasses.add('fa-lg');
        iconClasses.add('fa-' + iconMap[toolBarButtonId]);

        button.appendChild(icon);
      }

      if (vom.get(this.viewId).propToolbarButtonPosition(this.componentId, toolBarButtonId) === 'left') {
        leftButtons.push(button);
      } else {
        rightButtons.push(button);
      }
    }

    let wrapDiv = document.createElement('div');
    wrapDiv.classList.add('ui_gridToolBarWrap');

    if (leftButtons.length > 0) {
      const leftDiv = document.createElement('div');
      leftDiv.classList.add('leftCon');

      for (let i = 0, n = leftButtons.length; i < n; i++) {
        leftDiv.appendChild(leftButtons[i]);
      }
      wrapDiv.appendChild(leftDiv);
    }

    if (rightButtons.length > 0) {
      const rightDiv = document.createElement('div');
      rightDiv.classList.add('rightCon');

      for (let i = 0, n = rightButtons.length; i < n; i++) {
        rightDiv.appendChild(rightButtons[i]);
      }
      wrapDiv.appendChild(rightDiv);
    }

    this.element.appendChild(wrapDiv);

    if (!this.usableToolbar) {
      return;
    }

    let componentId = this.componentId;
    let componentLen = this.componentId.length;

    let component = com.get(me.viewId).getComponent(componentId);

    for (let i = 0, n = this.buttonIds.length; i < n; i++) {
      let buttonId = this.buttonIds[i];
      let operationId = buttonId.substr(0, buttonId.length - componentLen - 1);

      this.element.querySelector('#' + buttonId).addEventListener('click', (event) => {
        let permissionType = vom.get(this.viewId).getPermissionType(componentId, operationId);
        let mappedOperations = Object.keys(PERMISSION_TYPE_MAP);

        if (permissionType.length <= 0) {
          if (mappedOperations.includes(operationId)) {
            permissionType = PERMISSION_TYPE_MAP[operationId];
          } else {
            for (let i = 0, len = mappedOperations.length; i < len; i++) {
              let mappedOperation = mappedOperations[i];
              if (operationId.startsWith(mappedOperation)) {
                permissionType = PERMISSION_TYPE_MAP[mappedOperation];
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
              , 'Permission Denied for operation ' + operationId + ' on ' + componentId + '.'
              , 2000);
            return;
          }
        }

        let successFunc = function (a, b, data) {
          component.doToolbarSuccessOperation(componentId, operationId, data);
        };

        let failFunc = function (a, b, data) {
          component.doToolbarFailOperation(componentId, operationId, data);
        };

        let completeFunc = function (a, b, data) {
          component.doToolbarCompleteOperation(componentId, operationId, data);
        };

        let doBeforeOperationResult = com.get(me.viewId).getComponent(componentId).doBeforeOperation(componentId, componentId, operationId, {});
        if (doBeforeOperationResult) {
          component.doOperation(componentId, operationId, {}, successFunc, failFunc, completeFunc);
        }
      });
    }

    this.isMounted = true;
    this.mounted();
  }
}
