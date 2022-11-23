package com.zionex.t3series.web.view.migration;

import com.zionex.t3series.util.ArrayUtil;
import com.zionex.t3series.web.view.util.ElementUtil;

import org.jdom2.Element;

public class MigrationForColumnEditable implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            String type = component.getAttributeValue("type");
            if (!"R_GRID".equals(type)) {
                continue;
            }

            boolean exists = false;

            for (Element operation : ElementUtil.findElements(component, "operations", "operation")) {
                String id = operation.getAttributeValue("id");
                if ("INSERT_ROW".equals(id)) {
                    exists = true;
                    break;
                }
            }

            if (!exists) {
                continue;
            }

            for (Element column : ElementUtil.findElements(component, "model", "columns", "column")) {
                if (isSkip(column)) {
                    continue;
                }

                Element visible= column.getChild("visible");
                if (visible == null || "true".equals(visible.getText())) {
                    Element editable= column.getChild("editable");
                    if (editable != null && "false".equals(editable.getText())) {
                        String ifNew = editable.getAttributeValue("if-new");
                        if (ifNew == null) {
                            editable.setAttribute("if-new", "true");
                        }
                    }
                }
            }
        }
    }

    private boolean isSkip(Element column) {
        final String[] skipIds = new String[] { "CREATE_BY", "CREATE_DTTM", "MODIFY_BY", "MODIFY_DTTM" };
        String id = column.getAttributeValue("id");
        return id == null || ArrayUtil.contains(skipIds, id);
    }

}
