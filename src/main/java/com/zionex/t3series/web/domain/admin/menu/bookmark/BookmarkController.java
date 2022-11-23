package com.zionex.t3series.web.domain.admin.menu.bookmark;

import java.util.List;

import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.util.ResponseMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final UserService userService;

    @PostMapping("/system/menus/bookmarks")
    public ResponseEntity<ResponseMessage> saveBookmarks(@RequestBody List<Bookmark> bookmarks) {
        String username = userService.getUserDetails().getUsername();
        String userId = userService.getUser(username).getId();

        bookmarks.forEach(bookmark -> {
            Bookmark existsBookmark = bookmarkService.getBookmark(userId, bookmark.getMenuId());
            if (existsBookmark != null) {
                bookmark.setId(existsBookmark.getId());
            }
            bookmark.setUserId(userId);
        });

        bookmarkService.saveBookmarks(bookmarks);

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated bookmark entities"), HttpStatus.OK);
    }

}
