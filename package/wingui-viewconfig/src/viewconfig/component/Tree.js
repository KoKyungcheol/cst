import Component from './Component';

import {
  callService,
  doReferenceService,
  getCompleteParamMap
} from '../service/ServiceManager';
import { combine } from '../util/utils';

export default class Tree extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    this.selectedId = '';
    this.selectedVal = '';
    this.selectedTarget = '';

    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let height = vom.get(me.viewId).propHeight(this.id);
    let width = vom.get(me.viewId).propWidth(this.id);

    this.element.style.overflow = 'auto';
    this.element.style.height = height ? height + 'px' : '100%';
    this.element.style.width = width ? width + 'px' : 'auto';

    this.element.classList.add('kd_treeViewWrap');

    this.widget = window.kendo.jQuery(this.element);
    this.widget.kendoTreeView(this.opt(me));

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  destroy() {
    if (this.widget) {
      let treeview = this.getActualComponent();
      treeview && treeview.destroy();
    }
    this.destroyed();
  }

  opt(me) {
    let dataTextField = vom.get(me.viewId).propTextId(this.id);
    let checkbox = vom.get(me.viewId).propCheckbox(this.id) ? { checkChildren: true, name: 'checkedItems[]' } : false;

    const opt = {
      checkboxes: checkbox,
      autoScroll: true,
      dataTextField: dataTextField,
      dataSpriteCssClassField: 'spriteCssClass'
    };

    if (vom.get(me.viewId).hasAction(this.id, 'select-item')) {
      let id = vom.get(me.viewId).propValueId(this.id);

      opt.select = function (e) {
        let target = e.node || me.selectedTarget;
        if (target) {
          me.selectedId = e.sender.dataItem(target)[id];
          me.selectedVal = e.sender.dataItem(target)._childrenOptions.data;
        }

        vsm.get(me.viewId, "operationManager").actionOperation(me.id, 'select-item');
      }
    }

    return opt;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
    } else if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    } else if (operationId.startsWith('SELECT')) {
      const paramMap = getCompleteParamMap(this.id, operationId, actionParamMap, me.viewId);

      let text = paramMap['TEXT'];
      let value = paramMap['VALUE'];
      let selectRoot = paramMap['SELECT_ROOT'];
      let isSelectAction = paramMap['SELECT_ACTION'] !== 'false';
      let isScrollAction = paramMap['SCROLL_ACTION'] !== 'false';
      let targetHeight = 23;
      let componentHeight = this.widget.height();
      let componentOffsetTop = this.widget.offset().top;

      const treeview = this.getActualComponent();

      let target;
      if (text) {
        target = treeview.findByText(text);
      } else if (value) {
        let dataValue = treeview.dataSource.get(value);
        target = treeview.findByUid(dataValue.uid);
      } else if (selectRoot) {
        let dataValue = treeview.dataSource.at(0);
        target = treeview.findByUid(dataValue.uid);
      }

      if (target && (target.length > 0)) {
        treeview.expandTo(target);
        this.widget.scrollTop(0);

        let valueId = vom.get(me.viewId).propValueId(this.id);

        this.selectedTarget = target;
        this.selectedId = treeview.dataItem(target)[valueId];
        this.selectedVal = treeview.dataItem(target)._childrenOptions.data;

        treeview.select(target);

        let animatedObj = {};
        let targetScrollTop = $(target[0]).offset().top;

        if (isSelectAction) {
          treeview.trigger('select');
        }

        if (isScrollAction) {
          if ((targetScrollTop + targetHeight) > (componentOffsetTop + componentHeight)) {
            (() => {
              animatedObj.scrollTop = (targetScrollTop - componentHeight + targetHeight);
              me.widget.animate(animatedObj, 200);
            })();
          }
        }

        successFunc(this.id, operationId, null);
      } else {
        console.warn(`The value or text is not defined. (component id: ${this.id})`);
        failFunc(this.id, operationId, null);
      }

      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId === 'EXPAND_ALL') {
      this.getActualComponent().expand(".k-item");
      completeFunc(this.id, operationId, null);
    } else if (operationId === 'COLLAPSE_ALL') {
      this.getActualComponent().collapse(".k-item");
      completeFunc(this.id, operationId, null);
    }

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else {
      callService(actionParamMap, this.id, operationId, successFuncs, failFunc, completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }

  getActualComponent() {
    return this.widget.data('kendoTreeView');
  }

  getValue(type) {
    let me = this;
    let checkboxOption = vom.get(me.viewId).propCheckbox(this.id);

    const treeView = this.getActualComponent();
    if (treeView === null) {
      return null;
    }

    if (!checkboxOption || type === 'selected' || type === 'selectedId') {
      let selectedNode = null;

      if (treeView.hasOwnProperty('_clickTarget')) {
        selectedNode = this.selectedVal;
        if (type === 'selected') {
          selectedNode = this.selectedVal;
        } else {
          selectedNode = this.selectedId;
        }
      }
      return selectedNode;
    } else {
      let checkedNodes = [];
      let isConcat = vom.get(me.viewId).propGetvalueConcat(this.id);

      if (type === 'highCheckedHierarchy') {
        let highCheckedHierarchy = function (nodes, checkedNodes) {
          function upper(node, nodeIds) {
            let grandparent = node.parent().parent();
            nodeIds.unshift(node.id);
            grandparent && upper(grandparent, nodeIds);
          }

          for (let i = 0, n = nodes.length; i < n; i++) {
            let node = nodes[i];

            if (node.hasChildren) {
              if (node.checked) {
                let nodeIds = [];
                nodeIds.push(node.id);

                let parent = node.parent().parent();
                if (parent) {
                  upper(parent, nodeIds);
                }

                checkedNodes.push(nodeIds)
              } else {
                highCheckedHierarchy(node.children.view(), checkedNodes);
              }
            } else if (node.checked) {
              let nodeIds = [];
              nodeIds.push(node.id);

              let parent = node.parent().parent();
              if (parent) {
                upper(parent, nodeIds);
              }

              checkedNodes.push(nodeIds)
            }
          }
        };

        highCheckedHierarchy(treeView.dataSource.view(), checkedNodes);
      } else if (type == 'highChecked') {
        let highChecked = function (nodes, checkedNodes) {
          for (let i = 0, n = nodes.length; i < n; i++) {
            let node = nodes[i];

            if (node.hasChildren) {
              if (node.checked) {
                checkedNodes.push(node.id);
              } else {
                highChecked(node.children.view(), checkedNodes);
              }
            } else if (node.checked) {
              checkedNodes.push(node.id);
            }
          }
        };

        highChecked(treeView.dataSource.view(), checkedNodes);
      } else {
        let checkedNodeIds = function (nodes, checkedNodes) {
          for (let i = 0, n = nodes.length; i < n; i++) {
            let node = nodes[i];
            if (node.checked) {
              checkedNodes.push(node.id);
            }

            if (node.hasChildren) {
              checkedNodeIds(node.children.view(), checkedNodes);
            }
          }
        };

        checkedNodeIds(treeView.dataSource.view(), checkedNodes);
      }

      if (isConcat) {
        value = checkedNodes.join(isConcat);
      } else {
        value = checkedNodes;
      }
      return value;
    }
  }

  setValue(resultData) {
    let me = this;
    let id = vom.get(me.viewId).propValueId(this.id);
    let dataTextField = vom.get(me.viewId).propTextId(this.id);
    let sortByText = vom.get(me.viewId).propTextIdSort(this.id);
    let sortById = vom.get(me.viewId).propValueSort(this.id);

    let resultDataObj = {
      data: resultData,
      schema: {
        model: {
          id: id,
          children: 'items'
        }
      }
    };

    const hierarchyDataSort = function (items, field) {
      let sort;
      if (field === dataTextField) {
        sort = sortByText
      } else if (field === id) {
        sort = sortById
      } else {
        sort = 'asc';
      }

      for (let i = 0, n = items.length; i < n; i++) {
        let item = items[i];

        if (item.hasChildren) {
          item.children.sort({ field: field, dir: sort });
          hierarchyDataSort(item.children.view(), field);
        }
      }
    };

    let treeDataSource = new kendo.data.HierarchicalDataSource(resultDataObj);
    let treeViewData = this.getActualComponent();

    treeViewData.setDataSource(treeDataSource);

    if (sortByText) {
      hierarchyDataSort(treeDataSource.view(), dataTextField);
    } else if (sortById) {
      hierarchyDataSort(treeDataSource.view(), id);
    }

    /**
     * event-type: dblclick
     * Add after TREE dataSource set
     */
    let treeView = this.getActualComponent();
    let items = treeView.items();

    for (let i = 0, n = items.length; i < n; i++) {
      items[i].addEventListener('dblclick', (event) => {
        vsm.get(me.viewId, "operationManager").actionOperation(me.id, event.type);
      });
    }
  }

  initValue() {
    this.getActualComponent().setDataSource('');
  }
}
