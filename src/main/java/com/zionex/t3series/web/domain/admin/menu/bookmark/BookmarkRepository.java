package com.zionex.t3series.web.domain.admin.menu.bookmark;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

public interface BookmarkRepository extends CrudRepository<Bookmark, String> {

    List<Bookmark> findByUserId(String userId);

    Bookmark findByUserIdAndMenuId(String userId, String menuId);

}
