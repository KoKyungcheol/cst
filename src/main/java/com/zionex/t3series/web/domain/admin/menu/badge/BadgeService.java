package com.zionex.t3series.web.domain.admin.menu.badge;

import java.time.LocalDateTime;
import java.util.List;

import com.zionex.t3series.web.domain.admin.menu.Menu;
import com.zionex.t3series.web.domain.admin.menu.MenuService;
import com.zionex.t3series.web.domain.util.noticeboard.NoticeBoardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    
    private final MenuService menuService;

    @Autowired
    private NoticeBoardService noticeBoardService;

    private static final String NOTICEBOARD_MENU_CD = "UI_UT_01";
    private final Integer EXPIRED_DAYS = 7;

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public Badge getBadge(String menuId) {
        return badgeRepository.findById(menuId).orElse(null);
    }

    public List<Badge> getBadges() {
        return badgeRepository.findByExpiredDttmAfter(LocalDateTime.now());
    }

    public void deleteBadges(List<String> menuIds) {
        badgeRepository.deleteByMenuIdIn(menuIds);
    }

    public void saveBadges(List<Badge> badges) {
        badgeRepository.saveAll(badges);
    }

    String getNoticeBoardMenuId() {
        Menu noticeBoardMenu = menuService.getMenu(NOTICEBOARD_MENU_CD);
        if(noticeBoardMenu == null) {
            return null;
        }
        return noticeBoardMenu.getId();
    }

    public int getNoticeBoardExpiredDays() {
        Badge noticeBoardBadge = this.getNoticeBoardBadge();
        if(noticeBoardBadge == null) {
            return EXPIRED_DAYS;
        }
        Integer expiredDays = noticeBoardBadge.getExpiredDays();
        if(expiredDays == null) {
            return EXPIRED_DAYS;
        }
        return expiredDays;
    }

    public Badge getNoticeBoardBadge() {
        String noticeBoardMenuId = this.getNoticeBoardMenuId();
        if(noticeBoardMenuId == null) {
            return null;
        }
        return this.getBadge(noticeBoardMenuId);
    }

    public void updateNoticeBoardBadge(LocalDateTime expiredDttm) {
        this.updateNoticeBoardBadge(expiredDttm, this.getNoticeBoardExpiredDays());
    }

    public void updateNoticeBoardBadge(LocalDateTime expiredDttm, Integer expiredDays) {
        String noticeBoardMenuId = this.getNoticeBoardMenuId();        
        if(noticeBoardMenuId == null) {
            return;
        }

        int newCount = noticeBoardService.getNewContentsCount(expiredDttm.minusDays(1 + expiredDays));
        LocalDateTime newExpiredDttm = expiredDttm;
        if (newCount < 1) {
            newExpiredDttm = expiredDttm.minusDays(2);
        }
        Badge badge = new Badge();
        badge.setMenuId(noticeBoardMenuId);
        badge.setMenuCd(NOTICEBOARD_MENU_CD);            
        badge.setExpiredDttm(newExpiredDttm);
        badge.setBadgeContent(Integer.toString(newCount));
        badge.setExpiredDays(expiredDays);
        
        badgeRepository.save(badge);
    }

}
