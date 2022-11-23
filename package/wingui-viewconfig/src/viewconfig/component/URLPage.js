import Component from './Component';


export default class URLPage extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    let width = vom.get(me.viewId).propWidth(this.id) ? vom.get(me.viewId).propWidth(this.id) + 'px' : '100%';
    width = width ? width + 'px' : '100%';

    let height = vom.get(me.viewId).propHeight(this.id);
    let src = vom.get(me.viewId).propUrl(this.id);
    let scroll = vom.get(me.viewId).propScroll(this.id) ? 'yes' : 'no';

    let iframe = document.createElement('iframe');
    iframe.setAttribute('name', 'content');
    iframe.setAttribute('src', src);
    iframe.setAttribute('width', width);
    iframe.setAttribute('height', height);
    iframe.setAttribute('scrolling', scroll);
    iframe.setAttribute('frameborder', '0');
    iframe.classList.add('urlPage_wrap');

    let that = this;
    window.requestAnimationFrame(function () {
      that.element.appendChild(iframe);
    });

    this.isMounted = true;
    this.mounted();
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
  }
}
