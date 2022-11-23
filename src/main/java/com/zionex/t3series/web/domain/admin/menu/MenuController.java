package com.zionex.t3series.web.domain.admin.menu;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/menus")
    public MenuItem getMenus() {
        return menuService.getMenus();
    }

    @GetMapping("/system/menus")
    public Set<MenuItem> getMenusTree(@RequestParam(value = "all-menus", required = false) boolean allMenus) {
        return menuService.getMenusTree(allMenus);
    }

    @PostMapping("/system/menus")
    public void saveMenus(@RequestBody List<MenuItem> menus) {
        menuService.saveMenus(menus);
    }

    @PostMapping("/system/menus/delete")
    public void deleteMenus(@RequestBody List<String> menuCds) {
        menuService.deleteMenus(menuCds);
    }

}
