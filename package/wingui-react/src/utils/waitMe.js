function waitOn(selector = 'body', msg, cancelzAxiosFn) {
  let target = selector == 'body' ? 'body' : '#' + selector ;
  let targets = jQuery(target);
  if (targets.length > 0) {
    targets.waitMe({
      effect: 'bouncePulse',
      text: msg || 'Please Wait...',
      bg: 'rgba(255, 255, 255, 0.7)',
      color: ['#000066', '#6666CC', '#993399'],
      source: '',
      onCancelAxios: cancelzAxiosFn,
      cancelAxiosMsg: 'Canceld by User'
    });
  }
  
  if(document.querySelector('.content-area .k-widget.k-window') !== null) {
    let windowElement = document.querySelector('.content-area .k-widget.k-window');
    windowElement.style.position = 'absolute'
    windowElement.style.top = Math.max(0, ($('body').height() - $('.k-window').height())/2 - 100 ) +'px'
    windowElement.style.left = Math.max(0, ($('body').width()/2 - $('.k-window').width())) +'px'
  }
}

function waitOff(selector = 'body') {
  let target = selector == 'body' ? 'body' : '#' + selector;
  let targets = jQuery(target);
  if (targets.length > 0) {
    if (targets[0].classList && targets[0].classList.contains('waitMe_container')) {
      targets.waitMe('hide');
    } else {
      let otherSelector = selector === 'body' ? '#' + vom.active + '-content' : 'body';
      let otherTargets = $(otherSelector);
      if (otherTargets.length > 0) {
        if (otherTargets[0].classList && otherTargets[0].classList.contains('waitMe_container')) {
          otherTargets.waitMe('hide');
        }
      }
    }
  }
}

export { waitOn, waitOff };
