package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zionex.t3series.web.view.ViewConfigManager;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonDeserialize(using = PermissionDataDeserializer.class)
public class PermissionData {

    private String grpId;

    private String userId;

    private String menuId;

    private Boolean PERMISSION_TYPE_CREATE;

    private Boolean PERMISSION_TYPE_READ;

    private Boolean PERMISSION_TYPE_UPDATE;

    private Boolean PERMISSION_TYPE_DELETE;

    private Boolean PERMISSION_TYPE_IMPORT;

    public static List<Permission> convertToPermissionEntities(List<PermissionData> permissionDatas) {
        List<Permission> permissions = new ArrayList<>();

        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();
        List<String> permissionTypes = viewConfigManager.getPermissionTypes();

        permissionDatas.forEach(permissionData -> {
            if (permissionData.getMenuId() == null) {
                return;
            }

            for (String permissionType : permissionTypes) {
                Permission permission = new Permission();

                permission.setUserId(permissionData.getUserId());
                permission.setMenuId(permissionData.getMenuId());
                permission.setPermissionTp(permissionType);

                switch (permissionType) {
                    case "CREATE":
                        if (permissionData.getPERMISSION_TYPE_CREATE() != null) {
                            permission.setUsability(permissionData.getPERMISSION_TYPE_CREATE());
                            permissions.add(permission);
                        }
                        break;

                    case "READ":
                        if (permissionData.getPERMISSION_TYPE_READ() != null) {
                            permission.setUsability(permissionData.getPERMISSION_TYPE_READ());
                            permissions.add(permission);
                        }
                        break;

                    case "UPDATE":
                        if (permissionData.getPERMISSION_TYPE_UPDATE() != null) {
                            permission.setUsability(permissionData.getPERMISSION_TYPE_UPDATE());
                            permissions.add(permission);
                        }
                        break;

                    case "DELETE":
                        if (permissionData.getPERMISSION_TYPE_DELETE() != null) {
                            permission.setUsability(permissionData.getPERMISSION_TYPE_DELETE());
                            permissions.add(permission);
                        }
                        break;

                    case "IMPORT":
                        if (permissionData.getPERMISSION_TYPE_IMPORT() != null) {
                            permission.setUsability(permissionData.getPERMISSION_TYPE_IMPORT());
                            permissions.add(permission);
                        }
                        break;
                }
            }
        });

        return permissions;
    }

    public static List<GroupPermission> convertToGroupPermissionEntities(List<PermissionData> permissionDatas) {
        List<GroupPermission> permissions = new ArrayList<>();

        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();
        List<String> permissionTypes = viewConfigManager.getPermissionTypes();

        permissionDatas.forEach(permissionData -> {
            if (permissionData.getMenuId() == null) {
                return;
            }

            for (String permissionType : permissionTypes) {
                GroupPermission groupPermission = new GroupPermission();

                groupPermission.setGrpId(permissionData.getGrpId());
                groupPermission.setMenuId(permissionData.getMenuId());
                groupPermission.setPermissionTp(permissionType);

                switch (permissionType) {
                    case "CREATE":
                        if (permissionData.getPERMISSION_TYPE_CREATE() != null) {
                            groupPermission.setUsability(permissionData.getPERMISSION_TYPE_CREATE());
                            permissions.add(groupPermission);
                        }
                        break;

                    case "READ":
                        if (permissionData.getPERMISSION_TYPE_READ() != null) {
                            groupPermission.setUsability(permissionData.getPERMISSION_TYPE_READ());
                            permissions.add(groupPermission);
                        }
                        break;

                    case "UPDATE":
                        if (permissionData.getPERMISSION_TYPE_UPDATE() != null) {
                            groupPermission.setUsability(permissionData.getPERMISSION_TYPE_UPDATE());
                            permissions.add(groupPermission);
                        }
                        break;

                    case "DELETE":
                        if (permissionData.getPERMISSION_TYPE_DELETE() != null) {
                            groupPermission.setUsability(permissionData.getPERMISSION_TYPE_DELETE());
                            permissions.add(groupPermission);
                        }
                        break;

                    case "IMPORT":
                        if (permissionData.getPERMISSION_TYPE_IMPORT() != null) {
                            groupPermission.setUsability(permissionData.getPERMISSION_TYPE_IMPORT());
                            permissions.add(groupPermission);
                        }
                        break;
                }
            }
        });

        return permissions;
    }

}
