package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import com.zionex.t3series.web.domain.admin.menu.Menu;
import com.zionex.t3series.web.domain.admin.menu.MenuService;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.util.ResponseMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;
    private final MenuService menuService;
    private final UserService userService;

    @GetMapping("/system/users/{username}/permissions/{menu-cd}")
    public ResponseEntity<Map<String, Object>> getPermission(@PathVariable("username") String username, @PathVariable("menu-cd") String menuCd) {
        String authUsername = userService.getUserDetails().getUsername();

        if (authUsername.equals(username)) {
            return new ResponseEntity<Map<String, Object>>(permissionService.getPermissionByMenuCd(username, menuCd), HttpStatus.OK);
        } else {
            return new ResponseEntity<Map<String, Object>>(HttpStatus.FORBIDDEN);
        }
    }

    @GetMapping("/system/users/{username}/permissions/{menu-cd}/{permission-type}")
    public ResponseEntity<Permission> getPermission(@PathVariable("username") String username, @PathVariable("menu-cd") String menuCd, @PathVariable("permission-type") String permissionType) {
        String authUsername = userService.getUserDetails().getUsername();

        if (authUsername.equals(username)) {
            String userId = userService.getUser(username).getId();
            Menu menu = menuService.getMenu(menuCd);
            String menuId = (menu == null) ? "" : menu.getId();
            
            return new ResponseEntity<Permission>(permissionService.getPermission(userId, menuId, permissionType), HttpStatus.OK);
        } else {
            return new ResponseEntity<Permission>(HttpStatus.FORBIDDEN);
        }
    }

    @GetMapping("/system/users/{username}/permissions")
    public List<Map<String, Object>> getPermissions(@PathVariable("username") String username) {
        return permissionService.getPermissions(username);
    }

    @GetMapping("/system/user/permissions/union")
    public List<Map<String, Object>> getUnionPermissions(@RequestParam("username") String username) {
        return permissionService.getUnionPermissions(username);
    }

    @PostMapping("/system/users/permissions")
    public ResponseEntity<ResponseMessage> savePermissions(@RequestBody List<PermissionData> permissionDatas, HttpServletRequest request) {
        List<Permission> permissions = PermissionData.convertToPermissionEntities(permissionDatas);
        permissions.forEach(permission -> {
            Permission oldPermission = permissionService.getPermission(permission.getUserId(), permission.getMenuId(), permission.getPermissionTp());
            if (oldPermission != null) {
                permission.setId(oldPermission.getId());
            }
        });

        permissionService.saveAllPermission(permissions);

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated user permission entities"), HttpStatus.OK);
    }

}
