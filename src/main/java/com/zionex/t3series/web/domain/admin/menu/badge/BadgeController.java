package com.zionex.t3series.web.domain.admin.menu.badge;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.menu.Menu;
import com.zionex.t3series.web.domain.admin.menu.MenuService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;
    private final MenuService menuService;

    private static final String NOTICEBOARD_MENU_CD = "UI_UT_01";

    @GetMapping("/system/menus/badges/general")
    public List<Badge> getBadgesGeneral(@RequestParam(value = "menu-cd", required = false) String menuCd) {
        List<Badge> badges = new ArrayList<>();

        if (menuCd != null) {
            badgeService.getAllBadges().forEach(badge -> {
                Menu menu = menuService.getMenuById(badge.getMenuId());
                if (menu != null && menu.getMenuCd().contains(menuCd.toUpperCase()) && !NOTICEBOARD_MENU_CD.equals(menu.getMenuCd())) {
                    badge.setMenuCd(menu.getMenuCd());
                    badges.add(badge);
                }
            });
        } else {
            badgeService.getBadges().forEach(badge -> {
                Menu menu = menuService.getMenuById(badge.getMenuId());
                if (menu != null && !NOTICEBOARD_MENU_CD.equals(menu.getMenuCd())) {
                    badge.setMenuCd(menu.getMenuCd());
                    badges.add(badge);
                }
            });

        }
        return badges;
    }    

    @GetMapping("/system/menus/badges")
    public List<Badge> getBadges() {
        List<Badge> badges = new ArrayList<>();
        badgeService.getBadges().forEach(badge -> {
            Menu menu = menuService.getMenuById(badge.getMenuId());
            if (menu != null) {
                badge.setMenuCd(menu.getMenuCd());
                badges.add(badge);
            }
        });

        //Temparary code : because we don't got notification function
        //this function calls only wingui-setting.js to display badges...
        Badge noticeBoardBadge = this.getNoticeBoardBadge();
        if(noticeBoardBadge != null && !badges.contains(noticeBoardBadge)) {
            LocalDateTime expiredDttm = LocalDateTime.now().plusDays(1);
            expiredDttm = LocalDateTime.of(expiredDttm.toLocalDate(), LocalTime.of(23, 59, 59));            
            badgeService.updateNoticeBoardBadge(expiredDttm);
        }

        return badges;
    }

    @PostMapping("/system/menus/badges")
    public void saveBadges(@RequestBody List<Badge> badges) {
        List<Badge> filteredBadges = new ArrayList<>();

        badges.forEach(badge -> {
            Menu menu = menuService.getMenu(badge.getMenuCd());
            if (menu != null) {
                badge.setMenuId(menu.getId());

                LocalDateTime expiredDttm = badge.getExpiredDttm();
                if (expiredDttm == null) {
                    expiredDttm = LocalDateTime.of(LocalDate.now().plusDays(3), LocalTime.of(23, 59, 59));                    
                } else {
                    expiredDttm = LocalDateTime.of(expiredDttm.toLocalDate(), LocalTime.of(23, 59, 59));
                }
                badge.setExpiredDttm(expiredDttm);

                filteredBadges.add(badge);
            }
        });

        badgeService.saveBadges(filteredBadges);
    }
    
    @PostMapping("/system/menus/badge/delete")
    public void deleteBadges(@RequestBody List<String> menuCds) {
        List<String> menuIds = menuCds.stream().map(menuCd -> menuService.getMenu(menuCd).getId()).collect(Collectors.toList());
        badgeService.deleteBadges(menuIds);
    }

    @GetMapping("/system/menus/badges/noticeboard")
    public Badge getNoticeBoardBadge() {
        return badgeService.getNoticeBoardBadge();
    }

    @PostMapping("/system/menus/badges/noticeboard")
    public void saveNoticeBoardBadge(@RequestParam("USE_YN") String useYn, @RequestParam("EXPIRED_DAYS") int expiredDays) {
        if("N".equals(useYn)) {
            String noticeBoardMenuId = badgeService.getNoticeBoardMenuId();
            if(noticeBoardMenuId == null) {
                return;
            }

            List<String> menuIds = new ArrayList<String>();
            menuIds.add(noticeBoardMenuId);
            badgeService.deleteBadges(menuIds);
            return;
        }

        LocalDateTime expiredDttm = LocalDateTime.now().plusDays(1);
        expiredDttm = LocalDateTime.of(expiredDttm.toLocalDate(), LocalTime.of(23, 59, 59));
        badgeService.updateNoticeBoardBadge(expiredDttm, expiredDays);
    }

}
