package com.zionex.t3series.web.domain.admin.menu;

import static com.zionex.t3series.web.constant.ApplicationConstants.ICON_DEFAULT;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.menu.bookmark.Bookmark;
import com.zionex.t3series.web.domain.admin.menu.bookmark.BookmarkService;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.delegation.DelegationService;
import com.zionex.t3series.web.domain.admin.user.permission.GroupPermission;
import com.zionex.t3series.web.domain.admin.user.permission.GroupPermissionService;
import com.zionex.t3series.web.domain.admin.user.permission.Permission;
import com.zionex.t3series.web.domain.admin.user.permission.PermissionService;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    private final AccountManager accountManager;
    private final UserService userService;
    private final DelegationService delegationService;
    private final GroupPermissionService groupPermissionService;

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private PermissionService permissionService;

    private final String ADMIN_MODULE_PREFIX = "UI_AD_";
    public final String MENU_PROFILE = "UI_AD_00";

    private final Set<String> userMenus = new HashSet<>(Arrays.asList("UI_AD_01", "UI_AD_07"));
    private final Set<String> filterMenus = new HashSet<>(Arrays.asList(MENU_PROFILE, "UI_AD_MENU_MST"));

    @Getter
    private Map<String, String> menuCdMap = new HashMap<>();

    public List<Menu> getMenusByUse(boolean allMenus) {
        if (allMenus) {
            return menuRepository.findAll();
        } else {
            return menuRepository.findByUseYnTrue();
        }
    }

    public List<Menu> getOpenViews() {
        List<Menu> menus = getMenusByUse(false);
        return menus
                .stream()
                .filter(menu -> (!StringUtils.isEmpty(menu.getParentId()) && !StringUtils.isEmpty(menu.getMenuPath())))
                .collect(Collectors.toList());
    }

    public List<Menu> getUserOpenViews() {
        List<Menu> views = getOpenViews().stream().sorted(Comparator.comparing(Menu::getMenuCd)).filter(view -> {
            if (view.getMenuCd().startsWith("UI_AD_")) {
                return isUserMenus(view.getMenuCd());
            } else {
                return true;
            }
        }).collect(Collectors.toList());

        return views;
    }

    public MenuItem getMenus() {
        MenuItem rootMenuItem = new MenuItem("", "", ICON_DEFAULT, "", "", 0, false, true);
        Map<String, MenuItem> menuGroup = new HashMap<>();
        Map<String, MenuItem> menuView = new HashMap<>();

        String username = userService.getUserDetails().getUsername();
        if (StringUtils.isEmpty(username)) {
            return rootMenuItem;
        }

        List<Menu> menus = getMenusByUse(false);
        menuCdMap = menus.stream().collect(Collectors.toMap(Menu::getId, Menu::getMenuCd));
        
        menus.forEach(menu -> {
            if (StringUtils.isEmpty(menu.getMenuPath())) {
                String parentId = StringUtils.isEmpty(menu.getParentId()) ? "" : menuCdMap.get(menu.getParentId());
                menuGroup.put(menu.getMenuCd(), new MenuItem(menu.getMenuCd(), parentId, menu.getMenuIcon(), "", "", menu.getMenuSeq(), false, true));
            }

            if (!StringUtils.isEmpty(menu.getParentId()) && !StringUtils.isEmpty(menu.getMenuPath())) {
                menuView.put(menu.getMenuCd(), new MenuItem(menu.getMenuCd(), menuCdMap.get(menu.getParentId()), "", menu.getMenuPath(), menu.getMenuTp(), menu.getMenuSeq(), false, true));
            }
        });

        Set<String> acceptMenus = getAcceptMenus(username, menuView.keySet());

        String userId = userService.getUser(username).getId();
        List<Bookmark> bookmarks = bookmarkService.getBookmarks(userId);

        MenuItem bookmarkMenuItem = new MenuItem("BOOKMARK", "", "Bookmark", "", "", -1, false, true);

        bookmarks.forEach(bookmark -> {
            String menuCd = bookmark.getMenuCd();
            if (bookmark.getBookmark() && menuCdMap.containsValue(menuCd) && acceptMenus.contains(menuCd)) {
                Menu menu = menus.stream().filter(m -> m.getMenuCd().equals(menuCd)).findFirst().get();
                bookmarkMenuItem.addItems(new MenuItem(menuCd, menuCdMap.get(menu.getParentId()), "", menu.getMenuPath(), menu.getMenuTp(), menu.getMenuSeq(), true, true));
            }
        });

        if (!bookmarkMenuItem.getItems().isEmpty()) {
            rootMenuItem.addItems(bookmarkMenuItem);
        }

        menuView.values().forEach(menu -> {
            if (acceptMenus.contains(menu.getId())) {
                appendMenuItems(menu, menuGroup);
            }
        });

        menuGroup.values().forEach(menu -> {
            if (StringUtils.isEmpty(menu.getParentId()) && !menu.getItems().isEmpty()) {
                rootMenuItem.addItems(menu);
            }
        });

        return rootMenuItem;
    }

    public Set<MenuItem> getMenusTree(boolean allMenus) {
        Set<MenuItem> menuItems = new TreeSet<>();
        Map<String, MenuItem> menuGroup = new HashMap<>();
        Map<String, MenuItem> menuView = new HashMap<>();

        String username = userService.getUserDetails().getUsername();
        if (StringUtils.isEmpty(username)) {
            return menuItems;
        }

        List<Menu> menus = getMenusByUse(allMenus);
        menuCdMap = menus.stream().collect(Collectors.toMap(Menu::getId, Menu::getMenuCd));
        
        String userId = userService.getUser(username).getId();
        List<Bookmark> bookmarks = bookmarkService.getBookmarks(userId);
        Map<String, Boolean> bookmarkMap = bookmarks.stream().filter(Bookmark::getBookmark).collect(Collectors.toMap(Bookmark::getMenuId, Bookmark::getBookmark));
        
        menus.forEach(menu -> {
            if (StringUtils.isEmpty(menu.getMenuPath())) {
                String parentId = StringUtils.isEmpty(menu.getParentId()) ? "" : menuCdMap.get(menu.getParentId());
                menuGroup.put(menu.getMenuCd(), new MenuItem(menu.getMenuCd(), parentId, menu.getMenuIcon(), "", "", menu.getMenuSeq(), false, menu.getUseYn()));
            }

            if (!StringUtils.isEmpty(menu.getParentId()) && !StringUtils.isEmpty(menu.getMenuPath()) && !filterMenus.contains(menu.getMenuCd())) {
                menuView.put(menu.getMenuCd(), new MenuItem(menu.getMenuCd(), menuCdMap.get(menu.getParentId()), "", menu.getMenuPath(), menu.getMenuTp(), menu.getMenuSeq(), bookmarkMap.getOrDefault(menu.getId(), false), menu.getUseYn()));
            }
        });

        if (allMenus) {
            menuView.values().forEach(menu -> appendMenuItems(menu, menuGroup));
        } else {
            Set<String> acceptMenus = getAcceptMenus(username, menuView.keySet());
            menuView.values().forEach(menu -> {
                if (acceptMenus.contains(menu.getId())) {
                    appendMenuItems(menu, menuGroup);
                }
            });
        }

        menuGroup.values().forEach(menu -> {
            if (StringUtils.isEmpty(menu.getParentId()) && !menu.getItems().isEmpty()) {
                menuItems.add(menu);
            }
        });

        return menuItems;
    }

    public void appendMenuItems(MenuItem menu, Map<String, MenuItem> menuGroup) {
        MenuItem group = menuGroup.get(menu.getParentId());
        
        if (group != null) {
            group.addItems(menu);
            if (!StringUtils.isEmpty(group.getParentId())) {
                appendMenuItems(group, menuGroup);
            }
        }
    }

    public boolean isAdminModuleMenu(String menuCd) {
        if (menuCd == null) {
            return false;
        }
        return menuCd.startsWith(ADMIN_MODULE_PREFIX);
    }

    public Set<String> getAcceptMenus(String username, Set<String> allViews) {
        Set<String> acceptMenus = new HashSet<>();

        if (accountManager.isSystemAdmin(username)) {
            return allViews;
        }

        String userId = userService.getUser(username).getId();
        List<String> delegationUserIds = delegationService.getDelegatedUserIds(userId);
        delegationUserIds.add(userId);

        for (String user : delegationUserIds) {
            List<Permission> permissions = permissionService.getPermissionsByPermissionTp(user, "READ");
            acceptMenus.addAll(permissions.stream().map(Permission::getMenuId).collect(Collectors.toSet()));

            List<GroupPermission> groupPermissions = groupPermissionService.getGroupPermissionsByPermissionTp(user, "READ");
            acceptMenus.addAll(groupPermissions.stream().map(GroupPermission::getMenuId).collect(Collectors.toSet()));
        }

        acceptMenus = acceptMenus
            .stream()
            .map(menu -> menuCdMap.get(menu))
            .filter(menuCd -> {
                boolean existMenu = menuCdMap.containsValue(menuCd);
                if (existMenu) {
                    if (isAdminModuleMenu(menuCd)) {
                        return isUserMenus(menuCd);
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            })
            .collect(Collectors.toSet());

        acceptMenus.add(MENU_PROFILE);
        return acceptMenus;
    }

    public Menu getMenuById(String menuId) {
        return menuRepository.findById(menuId).orElse(null);
    }

    public Menu getMenu(String menuCd) {
        return menuRepository.findByMenuCd(menuCd).orElse(null);
    }
    
    public boolean isUserMenus(String menuCd) {
        return userMenus.contains(menuCd);
    }

    public boolean existsMenu(String menuCd) {
        return menuRepository.existsByMenuCd(menuCd);
    }

    public void saveMenus(List<MenuItem> menus) {
        List<Menu> saveMenus = new ArrayList<>();

        menus.forEach(menu -> {
            if (existsMenu(menu.getId())) {
                Menu existsMenu = getMenu(menu.getId());

                existsMenu.setMenuPath(StringUtils.isEmpty(menu.getPath()) ? null : menu.getPath());
                existsMenu.setMenuTp(menu.getType());
                existsMenu.setMenuSeq(menu.getSeq());
                existsMenu.setMenuIcon(StringUtils.isEmpty(menu.getIcon()) ? null : menu.getIcon());
                existsMenu.setUseYn(menu.isUsable());

                saveMenus.add(existsMenu);
            } else {
                Menu newMenu = new Menu();

                newMenu.setMenuCd(menu.getId());
                newMenu.setMenuPath(menu.getPath());
                newMenu.setMenuTp(menu.getType());
                newMenu.setMenuSeq(menu.getSeq());
                newMenu.setMenuIcon(StringUtils.isEmpty(menu.getIcon()) ? null : menu.getIcon());
                newMenu.setUseYn(menu.isUsable());

                saveMenus.add(newMenu);
            }
        });
        menuRepository.saveAll(saveMenus);

        for (MenuItem menu : menus) {
            Menu savedMenu = getMenu(menu.getId());
            if (savedMenu == null) {
                continue;
            }

            String parentId = menu.getParentId();
            if (StringUtils.isEmpty(menu.getParentId())) {
                continue;
            }

            Menu parentMenu = getMenu(parentId);
            if (parentMenu != null) {
                savedMenu.setParentId(parentMenu.getId());
                menuRepository.save(savedMenu);
            }
        }
        menuCdMap.clear();
    }

    public void deleteMenus(List<String> menuCds) {
        menuRepository.deleteByMenuCdIn(menuCds);
        menuCdMap.clear();
    }

}
