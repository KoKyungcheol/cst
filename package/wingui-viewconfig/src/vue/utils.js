/**
 * 사용자의 화면 권한을 체크한다.
 * @params {String}} type 권한타입
 */
function checkUserPermission(type = '') {
  let permissionValue = permission.valueOf(PERMISSION_TYPE_PREFIX + type.toUpperCase());
  if (!permissionValue) {
    $('body').waitMe('hide');
    showToastMessage('Permission Denied', 'Permission Denied for ' + type.toUpperCase() + ' operation ', 2000);
  }
  return permissionValue;
}

/**
 * 사용자의 화면 권한을 가져온다.
 */
function getUserPermission() {
  return permission.get();
}

/*
 사용자가 관리자 권한인지 체크한다.
*/
function checkSystemAdmin() {
  return authentication.isSystemAdmin();
}

/* get user current menu id */
function gGetViewId() {
  return vom.active;
}

/**
 * 데이터를 정렬 타입에 따라 정렬한다.
 * @param {Array} data 데이터
 * @param {String} sortKey 정렬 기준 key
 * @param {String} type 정렬 타입 설정. default 는 'ASC'
 */
function gSort(data, sortKey, type = 'ASC') {
  if (type === 'ASC') {
    data = data.sort((a, b) => {
      if (typeof a[sortKey] === 'string') {
        return a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
      } else if (typeof a[sortKey] === 'number') {
        return a[sortKey] - b[sortKey];
      }
    });
  } else if (type === 'DSC') {
    data = data.sort((a, b) => {
      if (typeof a[sortKey] === 'string') {
        return a[sortKey] > b[sortKey] ? -1 : a[sortKey] < b[sortKey] ? 1 : 0;
      } else if (typeof a[sortKey] === 'number') {
        return b[sortKey] - a[sortKey];
      }
    });
  }
  return data;
}

/**
 * 메뉴 Layout 을 설정한다.
 * @param {String} layout Layout type. default 는 'top'
 */
function gSetMenuLayout(layout = 'top') {
  let storageLayout = localStorage.getItem('sm-setmenu');
  if (!storageLayout) {
    storageLayout = 'top';

    localStorage.setItem('sm-setmenu', storageLayout);
  }

  let storageTheme = localStorage.getItem('sm-theme');
  if (!storageTheme) {
    storageTheme = 'smart-style-0';

    localStorage.setItem('sm-theme', storageTheme);
  }

  let layoutSet;

  if (layout === 'left') {
    layoutSet = '';
    $('#smart-topmenu').prop('checked', false);
  } else if (layout === 'top') {
    layoutSet = 'menu-on-top';
    $('#smart-topmenu').prop('checked', true);
  }

  let bodyClasses = 'fixed-header fixed-navigation fixed-page-footer';
  if (layoutSet) {
    bodyClasses += ' ' + layoutSet;
  }
  if (storageTheme) {
    bodyClasses += ' ' + layoutSet;
  }

  if (storageLayout !== 'top' && $('body').hasClass('minified')) {
    bodyClasses += ' ' + 'minified'
  }
  document.getElementsByTagName('body')[0].className = bodyClasses;
}

/**
 * 설정된 메뉴 Layout 타입을 반환한다.
 */
function gGetMenuLayout() {
  let bodyClass = document.getElementsByTagName('body')[0].className;
  let layout;

  if (bodyClass.includes('menu-on-top')) {
    layout = 'top';
  } else {
    layout = 'left';
  }

  return layout;
}

export {
  gGetViewId,
  gSort,
  gSetMenuLayout,
  gGetMenuLayout,
  checkUserPermission,
  getUserPermission,
  checkSystemAdmin
};
