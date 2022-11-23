package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GroupPermissionController {

    private final GroupPermissionService groupPermissionService;

    @GetMapping("/system/groups/{group-cd}/permissions")
    public List<Map<String, Object>> getGroupPermissions(@PathVariable("group-cd") String grpCd) {
        return groupPermissionService.getGroupPermissions(grpCd);
    }

    @PostMapping("/system/groups/permissions")
    public void setGroupPermissions(@RequestBody List<PermissionData> permissionDatas) {
        List<GroupPermission> groupPermissions = PermissionData.convertToGroupPermissionEntities(permissionDatas);
        groupPermissions.forEach(groupPermission -> {
            GroupPermission oldGroupPermission = groupPermissionService.getGroupPermission(groupPermission.getGrpId(), groupPermission.getMenuId(), groupPermission.getPermissionTp());
            if (oldGroupPermission != null) {
                groupPermission.setId(oldGroupPermission.getId());
            }
        });

        groupPermissionService.saveGroupPermissions(groupPermissions);
    }

}
