package com.zionex.t3series.web.domain.admin.menu.bookmark;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.zionex.t3series.web.domain.admin.menu.MenuService;

import org.springframework.beans.factory.annotation.Autowired;

public class BookmarkDeserializer extends StdDeserializer<Bookmark> {

    private static final long serialVersionUID = 5977009491983534534L;

    @Autowired
    private MenuService menuService;

    public BookmarkDeserializer() {
        this(null);
    }

    public BookmarkDeserializer(final Class<Bookmark> vc) {
        super(vc);
    }

    @Override
    public Bookmark deserialize(final JsonParser jp, final DeserializationContext ctxt) throws IOException {
        final JsonNode node = jp.getCodec().readTree(jp);

        String menuCd = node.get("id").asText();
        String menuId = menuService.getMenu(menuCd).getId();

        final Bookmark bookmark = new Bookmark();
        bookmark.setMenuId(menuId);
        bookmark.setMenuCd(menuCd);
        bookmark.setBookmark(node.get("bookmarked").asBoolean());

        return bookmark;
    }

}
