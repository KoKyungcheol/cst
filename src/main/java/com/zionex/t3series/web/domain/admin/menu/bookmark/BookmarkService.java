package com.zionex.t3series.web.domain.admin.menu.bookmark;

import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.domain.admin.menu.MenuService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;

    private final MenuService menuService;

    public Bookmark getBookmark(String userId, String menuId) {
        return bookmarkRepository.findByUserIdAndMenuId(userId, menuId);
    }

    public List<Bookmark> getBookmarks(String userId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByUserId(userId);

        Map<String,String> menuCdMap = menuService.getMenuCdMap();
        bookmarks.forEach(bookmark -> bookmark.setMenuCd(menuCdMap.get(bookmark.getMenuId())));

        return bookmarks;
    }

    public void saveBookmarks(List<Bookmark> bookmarks) {
        bookmarkRepository.saveAll(bookmarks);
    }

}
