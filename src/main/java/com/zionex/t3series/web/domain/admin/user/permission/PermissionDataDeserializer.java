package com.zionex.t3series.web.domain.admin.user.permission;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.zionex.t3series.web.domain.admin.menu.Menu;
import com.zionex.t3series.web.domain.admin.menu.MenuService;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;

import org.springframework.beans.factory.annotation.Autowired;

public class PermissionDataDeserializer extends StdDeserializer<PermissionData> {

    private static final long serialVersionUID = 1617426912791821663L;

    @Autowired
    private MenuService menuService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupService groupService;

    public PermissionDataDeserializer() {
        this(null);
    }

    public PermissionDataDeserializer(final Class<PermissionData> vc) {
        super(vc);
    }

    @Override
    public PermissionData deserialize(final JsonParser jp, final DeserializationContext ctxt) throws IOException {
        final JsonNode node = jp.getCodec().readTree(jp);

        JsonNode permissionCreate = node.get("PERMISSION_TYPE_CREATE");
        JsonNode permissionRead = node.get("PERMISSION_TYPE_READ");
        JsonNode permissionUpdate = node.get("PERMISSION_TYPE_UPDATE");
        JsonNode permissionDelete = node.get("PERMISSION_TYPE_DELETE");
        JsonNode permissionImport = node.get("PERMISSION_TYPE_IMPORT");

        final PermissionData permissionData = new PermissionData();

        JsonNode grpCd = node.get("grpCd");
        if (grpCd != null) {
            permissionData.setGrpId(groupService.getGroup(grpCd.asText()).getId());
        }

        JsonNode username = node.get("username");
        if (username != null) {
            permissionData.setUserId(userService.getUser(username.asText()).getId());
        }

        JsonNode menuCd = node.get("menuCd");
        if (menuCd != null) {
            Menu menu = menuService.getMenu(menuCd.asText());
            if (menu != null) {
                permissionData.setMenuId(menu.getId());
            }
        }

        if (permissionCreate != null) permissionData.setPERMISSION_TYPE_CREATE(permissionCreate.asBoolean());
        if (permissionRead != null) permissionData.setPERMISSION_TYPE_READ(permissionRead.asBoolean());
        if (permissionUpdate != null) permissionData.setPERMISSION_TYPE_UPDATE(permissionUpdate.asBoolean());
        if (permissionDelete != null) permissionData.setPERMISSION_TYPE_DELETE(permissionDelete.asBoolean());
        if (permissionImport != null) permissionData.setPERMISSION_TYPE_IMPORT(permissionImport.asBoolean());

        return permissionData;
    }

}
