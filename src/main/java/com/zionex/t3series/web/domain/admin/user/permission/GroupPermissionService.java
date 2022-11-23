package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.menu.Menu;
import com.zionex.t3series.web.domain.admin.menu.MenuService;
import com.zionex.t3series.web.domain.admin.user.group.Group;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;
import com.zionex.t3series.web.domain.admin.user.group.UserGroup;
import com.zionex.t3series.web.domain.admin.user.group.UserGroupService;
import com.zionex.t3series.web.view.ViewConfigManager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupPermissionService {

    private final GroupPermissionRepository groupPermissionRepository;

    private final GroupService groupService;
    private final UserGroupService userGroupService;

    @Autowired
    private MenuService menuService;

    private final String PERMISSION_TYPE_PREFIX = "PERMISSION_TYPE_";

    public GroupPermission getGroupPermission(String grpId, String menuId, String permissionTp) {
        return groupPermissionRepository.findByGrpIdAndMenuIdAndPermissionTp(grpId, menuId, permissionTp);
    }

    public List<GroupPermission> getGroupPermissionByUsers(List<String> userIds, String menuId) {
        List<String> grpIds = userGroupService.getGroupsByUsers(userIds)
                               .stream()
                               .map(UserGroup::getGrpId)
                               .collect(Collectors.toList());

        return groupPermissionRepository.findByGrpIdInAndMenuId(grpIds, menuId);
    }

    public List<GroupPermission> getGroupPermissionsByPermissionTp(String userId, String permissionTp) {
        List<String> grpIds = userGroupService.getUserGroups(userId, false)
                               .stream()
                               .map(Group::getId)
                               .collect(Collectors.toList());

        return groupPermissionRepository.findByGrpIdInAndPermissionTpAndUsabilityTrue(grpIds, permissionTp);
    }

    public List<Map<String, Object>> getGroupPermissions(String grpCd) {
        List<Map<String, Object>> rows = new ArrayList<>();

        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();
        List<String> permissionTypes = viewConfigManager.getPermissionTypes();

        String grpId = groupService.getGroup(grpCd).getId();
        if (grpId != null) {
            List<GroupPermission> groupPermissions = groupPermissionRepository.findByGrpId(grpId);
            
            List<Menu> views = menuService.getUserOpenViews();
            Map<String, String> menuCdMap = views.stream().collect(Collectors.toMap(Menu::getId, Menu::getMenuCd));

            views.forEach(view -> {
                Map<String, Object> row = new HashMap<>();
                row.put("grpCd", grpCd);
                row.put("menuCd", view.getMenuCd());
    
                permissionTypes.forEach(type -> row.put(PERMISSION_TYPE_PREFIX + type, false));
    
                groupPermissions
                    .stream()
                    .filter(gp -> view.getMenuCd().equals(menuCdMap.get(gp.getMenuId())) && permissionTypes.contains(gp.getPermissionTp()))
                    .forEach(gp -> row.put(PERMISSION_TYPE_PREFIX + gp.getPermissionTp(), gp.getUsability()));
    
                rows.add(row);
             });
        }

        return rows;
    }

    public void saveGroupPermissions(List<GroupPermission> groupPermissions) {
        groupPermissionRepository.saveAll(groupPermissions);
    }

    public void deleteGroupPermissions(List<String> groupIds) {
        groupPermissionRepository.deleteByGrpIdIn(groupIds);
    }

}
