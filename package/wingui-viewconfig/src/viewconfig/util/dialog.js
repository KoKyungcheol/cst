export function showDialog(title, msg, dialogType, modalType, escClose, xButton) {
  let defer = $.Deferred();
  let buttons = {};
  let modal = true;
  let closeOnEscape = true;

  if (escClose !== undefined && escClose === false) {
    closeOnEscape = escClose
  }

  if (modalType === false) {
    modal = modalType;
  }

  let icon = DIALOG_ICON_TYPE.INFO;

  if (dialogType === DIALOG_TYPE.CONFIRM) {
    buttons = {
      'OK': function () {
        defer.resolve(true);
        $(this).dialog('close');
      },
      'Cancel': function () {
        defer.resolve(false);
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.CONFIRM;
  } else if (dialogType === DIALOG_TYPE.ALERT) {
    buttons = {
      'OK': function () {
        defer.resolve(true);
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.ALERT;
  } else if (dialogType === DIALOG_TYPE.INFO) {
    buttons = {
      'OK': function () {
        defer.resolve(true);
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.INFO;
  } else if (dialogType === DIALOG_TYPE.NOTICE) {
    buttons = {
      'OK': function () {
        defer.resolve(true);
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.NOTICE;
  } else if (dialogType === DIALOG_TYPE.CONFIRM3) {
    buttons = {
      'Yes': function () {
        defer.resolve(true);
        $(this).dialog('close');
      },
      'No': function () {
        defer.resolve(false);
        $(this).dialog('close');
      },
      'Cancel': function () {
        defer.resolve('Cancel');
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.CONFIRM;
  } else if (dialogType === DIALOG_TYPE.FILTERS) {
    buttons = {
      'Yes': function () {
        defer.resolve(true);
        $(this).dialog('close');
      },
      'No': function () {
        defer.resolve(false);
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.CONFIRM;
  }

  $('<div></div>').html(transLangKey(msg)).dialog({
    autoOpen: true,
    modal: modal,
    title: transLangKey(title),
    buttons: buttons,
    closeOnEscape: closeOnEscape,
    close: function (evt, ui) {
      $(this).remove();
      evt.stopImmediatePropagation();
    }
  });

  $('.ui-dialog-title').prepend(`<span class="btnIcon fa fa-lg fa-${icon}">&nbsp;</span>`);

  if (xButton !== undefined && xButton === false) {
    $('.ui-dialog-titlebar-close').css('display', 'none');
  }

  return defer.promise();
}

export function showToastMessage(title, msg, timer) {
  let defer = $.Deferred();
  let modal = true;
  let icon = DIALOG_ICON_TYPE.TOAST;

  $('<div id="toastMessage"></div>').html(transLangKey(msg)).dialog({
    autoOpen: true,
    modal: modal,
    title: transLangKey(title),
    close: function () {
      $(this).remove();
    }
  });
  $('.ui-dialog-titlebar-close').css('display', 'none');
  $('.ui-dialog-title').prepend(`<span class="btnIcon fa fa-lg fa-${icon}">&nbsp;</span>`);

  setTimeout(function () {
    defer.resolve(true);
    $('#toastMessage').dialog('close');
  }, timer);

  return defer.promise();
}

export function showPromptDialog(title, labelText, msg, dialogType, modalType) {
  let defer = $.Deferred();
  let buttons = {};
  let modal = true;
  let resolveData = {};

  if (modalType === false) {
    modal = modalType;
  }

  if (msg === undefined) {
    msg = '';
  }

  let icon = DIALOG_ICON_TYPE.INFO;

  if (dialogType == DIALOG_TYPE.CONFIRM) {
    buttons = {
      'Save': function () {
        resolveData.comfirmation = true;
        resolveData.inputString = $('#inputString').val();
        defer.resolve(resolveData);
        $(this).dialog('close');
      },
      'Cancel': function () {
        resolveData.comfirmation = false;
        resolveData.inputString = '';
        defer.resolve(resolveData);
        $(this).dialog('close');
      }
    };
    icon = DIALOG_ICON_TYPE.CONFIRM;
  }

  let dialogT = `
    <div id="dialog-form" title="${transLangKey(title)}">
      <form>
        <fieldset style="text-align: center">
          <label for="name">${labelText}</label>
          <input type="text" name="stringInput" id="inputString" value="${msg}" class="text ui-widget-content ui-corner-all" style="width: 215px">
        </fieldset>
      </form>
    </div>
    `;

  $('<div></div>').html(dialogT).dialog({
    autoOpen: true,
    modal: modal,
    width: 350,
    title: transLangKey(title),
    buttons: buttons,
    close: function () {
      $(this).remove();
    }
  });

  $('.ui-dialog-title').prepend(`<span class="btnIcon fa fa-lg fa-${icon}">&nbsp;</span>`);

  return defer.promise();
}
