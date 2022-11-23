package com.zionex.t3series.web.view.migration;

import org.jdom2.Attribute;
import org.jdom2.Element;

public class MigrationForPermissionType implements Migration {

    @Override
    public String getVersion() {
        return "2.0";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            Element operations = component.getChild("operations");
            if (operations != null) {
                for (Element operation : operations.getChildren("operation")) {
                    Attribute permissionType = operation.getAttribute("permission-type");
                    if (permissionType != null) {
                        changePermissionType(permissionType);
                    }
                }
            }
        }
    }

    private void changePermissionType(Attribute permissionType) {
        String permissionValue = permissionType.getValue();
        if ("MENU_VIEW".equals(permissionValue) || "EXPORT".equals(permissionValue)) {
            permissionType.setValue("READ");
        }
    }

}
