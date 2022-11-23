package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.menu.Menu;
import com.zionex.t3series.web.domain.admin.menu.MenuService;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.delegation.DelegationService;
import com.zionex.t3series.web.view.ViewConfigManager;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionQueryRepository permissionQueryRepository;

    private final AccountManager accountManager;
    private final UserService userService;

    private final GroupPermissionService permissionGroupService;
    private final DelegationService delegationService;
    private final MenuService menuService;

    private final String PERMISSION_TYPE_PREFIX = "PERMISSION_TYPE_";

    public Map<String, Object> getPermissionByMenuCd(String username, String menuCd) {
        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();
        List<String> permissionTypes = viewConfigManager.getPermissionTypes();

        Map<String, Object> row = new HashMap<>();
        row.put("username", username);
        row.put("menuCd", menuCd);

        if (!StringUtils.isEmpty(username) && accountManager.isSystemAdmin(username)) {
            permissionTypes.forEach(type -> row.put(PERMISSION_TYPE_PREFIX + type, true));
        } else {
            permissionTypes.forEach(type -> row.put(PERMISSION_TYPE_PREFIX + type, false));

            if (!menuService.isAdminModuleMenu(menuCd) || menuService.isUserMenus(menuCd)) {
                String userId = userService.getUser(username).getId();
                List<String> userIds = delegationService.getDelegatedUserIds(userId);
                userIds.add(userId);
    
                List<Permission> permissions = Collections.emptyList();
    
                Menu menu = menuService.getMenu(menuCd);
                if (menu != null) {
                    permissions = permissionRepository.findByMenuIdAndUserIdIn(menu.getId(), userIds);
                }
    
                List<GroupPermission> permissionGroups = permissionGroupService.getGroupPermissionByUsers(userIds, menu.getId());
    
                permissions.addAll(
                    permissionGroups
                        .stream()
                        .map(permission -> {
                            Permission oldPermission = getPermission(userId, menu.getId(), permission.getPermissionTp());
                            if (oldPermission != null) {
                                return new Permission(oldPermission.getId(), userId, permission.getMenuId(), menuCd, permission.getPermissionTp(), permission.getUsability());
                            } else {
                                return new Permission(null, userId, permission.getMenuId(), menuCd, permission.getPermissionTp(), permission.getUsability());
                            }
                        })
                        .collect(Collectors.toList())
                );
    
                permissions
                    .stream()
                    .collect(Collectors.groupingBy(Permission::getPermissionTp, Collectors.maxBy(Comparator.comparing(Permission::getUsability))))
                    .values()
                    .stream()
                    .map(permission -> permission.orElseGet(Permission::new))
                    .filter(permission -> permissionTypes.contains(permission.getPermissionTp()))
                    .forEach(permission -> row.put(PERMISSION_TYPE_PREFIX + permission.getPermissionTp(), permission.getUsability()));
            }
        }

        return row;
    }

    public List<Map<String, Object>> getPermissions(String username) {
        List<Map<String, Object>> rows = new ArrayList<>();
        
        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();
        List<String> permissionTypes = viewConfigManager.getPermissionTypes();
        
        String userId = userService.getUser(username).getId();
        if (userId != null) {
            List<Permission> permissions = permissionRepository.findByUserId(userId);
            
            List<Menu> views = menuService.getUserOpenViews();
            Map<String, String> menuCdMap = views.stream().collect(Collectors.toMap(Menu::getId, Menu::getMenuCd));
            
            views.forEach(view -> {
                Map<String, Object> row = new HashMap<>();
                row.put("username", username);
                row.put("menuCd", view.getMenuCd());
                permissionTypes.forEach(type -> row.put(PERMISSION_TYPE_PREFIX + type, false));

                permissions
                    .stream()
                    .filter(p -> view.getMenuCd().equals(menuCdMap.get(p.getMenuId())) && permissionTypes.contains(p.getPermissionTp()))
                    .forEach(p -> row.put(PERMISSION_TYPE_PREFIX + p.getPermissionTp(), p.getUsability()));

                rows.add(row);
            });

        }

        return rows;
    }

    private List<Permission> findUnionPermissions(String username, Menu menu) {
        String userId = userService.getUser(username).getId();

        List<String> userIds = delegationService.getDelegatedUserIds(username);
        userIds.add(userId);

        List<Permission> permissionsFromUsers = permissionRepository.findByMenuIdAndUserIdIn(menu.getId(), userIds);
        List<GroupPermission> permissionsFromGroups = permissionGroupService.getGroupPermissionByUsers(userIds, menu.getId());

        String menuId = menu.getId();
        String menuCd = menu.getMenuCd();

        List<Permission> unionPermissions = new ArrayList<>();
        unionPermissions.addAll(permissionsFromUsers);
        unionPermissions.addAll(
            permissionsFromGroups
                .stream()
                .map(groupPermission -> {
                    String newPermissionId = null;
                    Permission myPermission = this.getPermission(userId, menuId, groupPermission.getPermissionTp());
                    if (myPermission != null) {
                        newPermissionId = myPermission.getId();
                    }
                    return new Permission(newPermissionId, userId, menuId, menuCd, groupPermission.getPermissionTp(), groupPermission.getUsability());
                })
                .collect(Collectors.toList())
        );

        unionPermissions
            .stream()
            .collect(Collectors.groupingBy(Permission::getPermissionTp, Collectors.maxBy(Comparator.comparing(Permission::getUsability))))
            .values()
            .stream()
            .map(permission -> permission.orElseGet(Permission::new));
        return unionPermissions;
    }

    public List<Map<String, Object>> getUnionPermissions(String username) {
        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();
        List<String> permissionTypes = viewConfigManager.getPermissionTypes();
        Map<String, Object> defaultPermissions = new HashMap<>();
        permissionTypes.forEach(type -> defaultPermissions.put(PERMISSION_TYPE_PREFIX + type, !StringUtils.isEmpty(username) && accountManager.isSystemAdmin(username)));

        List<Map<String, Object>> result = new ArrayList<>();
        Set<String> viewIds = menuService.getOpenViews().stream().map(Menu::getMenuCd).collect(Collectors.toSet());

        Set<String> unionMenuCodes = menuService.getAcceptMenus(username, viewIds);
        unionMenuCodes.forEach(menuCd -> {
            Menu menu = menuService.getMenu(menuCd);            
            if (menu != null) {

                Map<String, Object> menuPermissions = new HashMap<>();                
                menuPermissions.put("menuCd", menuCd);
                menuPermissions.putAll(defaultPermissions);

                if (!accountManager.isSystemAdmin(username)) {
                    List<Permission> unionPermissions = findUnionPermissions(username, menu);
                    unionPermissions.stream()
                        .filter(permission -> permissionTypes.contains(permission.getPermissionTp()) && permission.getUsability())
                        .forEach(permission -> menuPermissions.put(PERMISSION_TYPE_PREFIX + permission.getPermissionTp(), permission.getUsability()));
                    if (menuCd.equals(menuService.MENU_PROFILE)) {
                        permissionTypes.forEach(type -> menuPermissions.put(PERMISSION_TYPE_PREFIX + type, true));
                    }
                }
                result.add(menuPermissions);
            }            
        });

        return result;
    }

    public List<Permission> getPermissionsByPermissionTp(String userId, String permissionTp) {
        return permissionRepository.findByUserIdAndPermissionTpAndUsabilityTrue(userId, permissionTp);
    }

    public Permission getPermission(String userId, String menuId, String permissionTp) {
        return permissionRepository.findByUserIdAndMenuIdAndPermissionTp(userId, menuId, permissionTp);
    }

    public boolean checkPermission(String userId, String menuCd, String permissionType) {
        String username = userService.getUserDetails().getUsername();
        if (accountManager.isSystemAdmin(username)) {
            return true;
        }
        
        return permissionQueryRepository.checkPermission(userId, menuCd, permissionType);
    }

    public void saveAllPermission(List<Permission> permissions) {
        permissionRepository.saveAll(permissions);
    }
 
    public void savePermission(Permission permission) {
        permissionRepository.save(permission);
    }

    public void deletePermissions(List<String> userIds) {
        permissionRepository.deleteByUserIdIn(userIds);
    }

}
