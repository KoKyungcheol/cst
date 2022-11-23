import vo from "./ViewObject";

class ViewObjectManager {
  constructor() {
    this.views = [];
    this.active = '';
    this.elements = {
      dataLimit: 'dateLimit',
      minDate: 'minDate',
      maxDate: 'maxDate',
      candidate: 'candidate'
    };
  }
  init() {
    this.views = [];
  }
  create(viewId) {
    vom.get(vom.active).create(viewId);

    this.add(viewId)
  }
  clearAll() {
    this.views = [];
  }
  remove(viewId) {
    const index = this.views.findIndex(element => element.id === viewId);

    if (vom.get(viewId)) {
      this.destroyWindows(viewId);
    }

    if (index !== -1) {
      this.views.splice(index, 1)
    }
  }
  destroyWindows(viewId) {
    const viewComponent = com.get(viewId);
    for (const componentId in viewComponent.getComponents()) {
      if (Object.prototype.hasOwnProperty.call(viewComponent.getComponents(), componentId)) {
        const component = com.get(viewComponent.id).getComponent(componentId);
        if (component.type === 'WINDOW') {
          component.destroy();
        }
      }
    }
  }
  add(d) {
    this.views.push(d)
  }
  hasComponent(componentId) {
    return vom.get(vom.active).hasComponent(component);
  }
  get(viewId) {
    return this.views.find(element => element.view.id === viewId)
  }
  getActive() {
    return this.views.find(element => element.view.id === this.active)
  }
  getComponentsByType(components, type) {
    let res = [];
    for (const [key, value] of Object.entries(components)) {
      if (value.type === type) {
        value.id = key;
        res.push(value)
      }
    }
    return res;
  }
  getComponentsById(components, id) {
    for (const [key, value] of Object.entries(components)) {
      if (key === id) {
        return value
      }
    }
    return null;
  }
  getElement(el, id) {
    for (const [key, value] of Object.entries(el)) {
      if (key === id) {
        return value
      }
    }
    return null;
  }
  printScript(scripts) {
    this.addSummary('<script>')
    scripts.map(script => this.addSummary(script))
    this.addSummary('</script>')
  }
  addIndent(seq) {
    let indent = ''
    for (let i = 0; i < seq; i++)
      indent += '  '
    return indent;
  }
  printComponent(comp, elem, indent) {
    let src = ''
    src += this.addIndent(indent) + `<${comp.type}`
    src += comp.id ? ` id='${comp.id}'` : ''
    src += this.printProps(comp)
    src += this.printAction(comp)
    src += '>\n'
    src += this.addIndent(indent) + this.printOperation(comp)
    src += this.addIndent(indent) + `</${comp.type}>`
    return src;
  }
  addSummary(summary) {
    this.compSummary += summary;
    this.compSummary += "\n"
  }
  printElementWithComponent(windowEl, components, indent) {
    let className = windowEl.getAttribute('class');
    let id = windowEl.getAttribute('id');

    let d = this.addIndent(indent) + '<' + windowEl.tagName
    d += id ? ' id=' + id : ''
    d += className ? ' class=' + className : ''
    d += '>'
    this.addSummary(d);

    if (className && className.indexOf('component_ui') >= 0) {
      let comp = this.getComponentsById(components, id)
      if (comp)
        this.addSummary(this.printComponent(comp, windowEl, indent + 1))
    }

    for (let i = 0; i < windowEl.children.length; i++) {
      this.printElementWithComponent(windowEl.children[i], components, indent + 1);
    }
    d = '';
    d += this.addIndent(indent) + '</' + windowEl.tagName + '>'
    this.addSummary(d)
  }
  saveToFile(fileName, content) {
    let blob = new Blob([content], { type: 'text/plain' });
    let objURL = window.URL.createObjectURL(blob);

    if (window.__Xr_objURL_forCreatingFile__) {
      window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;
    let a = document.createElement('a');
    a.download = transLangKey(vom.active) + '_' + fileName;
    a.href = objURL;
    a.click();
  }
  getComponentSummary() {
    this.compSummary = '';

    let curView = this.getActive();
    let el = com.getActive();

    console.log(el);

    this.printScript(el.scriptContents);
    curView = curView.view;

    let components = curView.components;
    let containers = curView.containers;
    let dataCom = [];
    let layoutComp = [];

    this.addSummary('<<<<< 그리드 칼럼 >>>>>');
    let grids = this.getComponentsByType(components, 'R_GRID')
    for (let i = 0; i < grids.length; i++) {
      let grd = grids[i];
      grd.gridId = 'grd' + (i + 1);
      this.printGridColumns(grd.gridId, grd.props.columns)
    }
    this.addSummary('\n\n')

    for (const [key, value] of Object.entries(containers)) {
      let cons = this.getComponentsById(containers, key)

      for (let i = 0; i < cons.length; i++) {
        let comp = this.getComponentsById(components, cons[i])
        comp.id = cons[i];

        if (comp.type === 'DATA')
          dataCom.push(comp)
        else if (key === 'DOCUMENT')
          layoutComp.push(comp)
      }
    }

    this.addSummary('<<<<< Document >>>>>');
    let docComp = layoutComp.find(item => item.id.indexOf('CONTENT') >= 0)
    if(docComp) {
      let docEl = this.getElement(el.elements, docComp.id)
      this.printElementWithComponent(docEl, components, 0)
    }
    this.addSummary('<<<<< Document 끝 >>>>>');

    this.addSummary('<<<<< 팝업 >>>>>');
    let popupComps = this.getComponentsByType(components, 'WINDOW')
    for (let i = 0; i < popupComps.length; i++) {
      let popWndComp = popupComps[i];
      let popWndEl = this.getElement(el.elements, popWndComp.id)

      this.addSummary(`<<<<< 팝업 ${i} >>>>>`);
      this.printElementWithComponent(popWndEl, components, 0)
      this.addSummary(`<<<<< 팝업 ${i} 끝 >>>>>`);
      this.addSummary('\n')
    }
    this.addSummary('\n\n')

    this.addSummary('<<<<< TEXTAREA >>>>>');
    let textAreaComps = this.getComponentsByType(components, 'TEXTAREA')
    for (let i = 0; i < textAreaComps.length; i++) {
      let popWndComp = textAreaComps[i];
      let popWndEl = this.getElement(el.elements, popWndComp.id)

      this.addSummary(`<<<<< TEXTAREA ${i} >>>>>`);
      this.printElementWithComponent(popWndEl, components, 0)
      this.addSummary(`<<<<< TEXTAREA ${i} 끝 >>>>>`);
      this.addSummary('\n')
    }
    this.addSummary('\n\n')


    this.addSummary('<<<<< 데이타 콤포넌트 >>>>>');
    this.addSummary(JSON.stringify(dataCom, undefined, 2));
    this.addSummary('<<<<< 데이타 콤포넌트 끝>>>>>');

    this.saveToFile('summary', this.compSummary)
  }
  printGridColumns(id, columns) {
    let colarr = [];
    for (const [key, value] of Object.entries(columns)) {
      let col = {}
      col.name = key;
      Object.keys(value).forEach(kn => {
        if(kn == 'type') {
          col.dataType = value.type
        } else if (kn == 'format') {
          col.numberFormat = value.format
        } else if (kn == 'title') {
          col.headerText = value.title
        } else {
          col[kn] = value[kn]
        }
      })
      colarr.push(col);
    }
    let src = "let " + id + 'Items=[\n';
    colarr.map(colObj => { 
      src += JSON.stringify(colObj).replace(/"([^"]+)":/g, '$1:'); 
      src += ',\n'
    })
    src += ']\n'
    this.addSummary(src)
    return src;
  }
  printProps(comp) {
    let props = comp.props;
    if (!props)
      return ''
    let src = ' '
    for (const [key, value] of Object.entries(props)) {
      if (key == 'columns') {
        src += 'items'
        src += '='
        src += `{${comp.gridId}Items}`
        src += ", "
      }
      else {
        src += key
        if (value) {
          src += '='
          src += JSON.stringify(value, undefined, 2);
        }
        src += ", "
      }
    }
    src += ' ';
    return src;
  }
  printAction(comp) {
    let actInfos = []
    let acts = comp.actions;
    if (!acts)
      return '';

    let src = ' '
    for (const [key, value] of Object.entries(acts)) {
      let actName = key;
      let operationCalls = value.operationCalls;

      src += actName
      if (operationCalls) {
        src += '='
        src += JSON.stringify(operationCalls, undefined, 2)
      }
      src += ' ';
    }
    src += ' ';

    return src
  }
  printOperation(comp) {
    let opInfos = []
    let ops = comp.operations;
    if (!ops)
      return '\n'

    let src = '\tOPERATION :[\n'
    for (const [key, value] of Object.entries(ops)) {
      let opName = key;
      let serviceCalls = value.serviceCalls;

      src += '\t\t';
      src += opName

      if (serviceCalls) {
        src += ':'
        src += JSON.stringify(serviceCalls, undefined, 2)
      }
      src += '\n';
    }
    src += '\t]\n';
    return src
  }
  isCommonComponent(comp) {
    let idx = exceptCompNm.findIndex((v) => comp.id.indexOf(v) >= 0)
    if (idx >= 0)
      return true;
    else
      return false;
  }
  isCommonComponent2(key) {
    let compNm = ['POP_COMM_CPT_HELP', 'TTL_COMM_CPT_HELP'];

    let idx = exceptCompNm.findIndex((v) => key.indexOf(v) >= 0)
    if (idx >= 0)
      return true;
    else
      return false;
  }
}

const vom = new ViewObjectManager();

export default vom;