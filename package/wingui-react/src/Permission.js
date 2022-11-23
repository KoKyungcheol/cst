import baseURI from './baseURI';
import {
  PERMISSION_TYPE_PREFIX
} from './const';
import getHeaders from './getHeaders';
import authentication from './Authentication';

const Permission = () => {
  let permissions = [];

  const remove = (viewId) => {
    let index = permissions.findIndex(element => element.menuCd === viewId);
    if(index !== -1) {
      permissions.splice(index, 1)
    }
  }

  const get = () => {
    permissions.map(function (permission) {
      if(permission.menuCd === vom.active) { 
        return permission;
      }
    });
  };

  const getPermissions = () => {
    return permissions;
  };

  const valueOf = (permissionType) => {
    if (permissions.length != 0) {
      let value;

      permissions.map(function (permission) {
        if(permission.menuCd === vom.active) {
          value = permission[permissionType];
        }
      })

      if (value === undefined) {
        return true;
      }
      return value;
    }
    return false;
  };

  const check = (componentId, eventType, viewId) => {
    let activeId = viewId === undefined ? vom.active : viewId; 
    if (!eventType) {
      return true;
    }

    let permissionType = vom.get(activeId).getActionPermissionType(componentId, eventType);
    if (!permissionType) {
      return true;
    }

    return getValue(PERMISSION_TYPE_PREFIX + permissionType);
  };

  const load = (viewId) => {
    let permission = null;

    if (viewId === 'home') {
      permission = {
        PERMISSION_TYPE_CREATE: true,
        PERMISSION_TYPE_READ: true,
        PERMISSION_TYPE_UPDATE: true,
        PERMISSION_TYPE_DELETE: true,
        PERMISSION_TYPE_IMPORT: true
      };

      permissions.push(permission);
      return;
    }

    $.ajax({
      url: baseURI() + 'system/users/' + authentication.getSessionInfo().username + '/permissions/' + viewId,
      headers: getHeaders(),
      async: false
    }).done(function (data) {
      if (data) {
        permissions.push(data);
      }
    }).fail(function (request, statusText, error) {
      console.error('Failed to load permission data.');
    });
  };

  return {
    get: get,
    remove: remove,
    valueOf: valueOf,
    check: check,
    load: load,
    getPermissions: getPermissions
  };
};

const permission = new Permission();

export default permission;
