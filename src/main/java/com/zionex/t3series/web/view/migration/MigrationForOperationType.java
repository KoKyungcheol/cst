package com.zionex.t3series.web.view.migration;

import org.jdom2.Element;

public class MigrationForOperationType implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            Element operations = component.getChild("operations");
            if (operations != null) {
                for (Element operation : operations.getChildren("operation")) {
                    String operationType = operation.getAttributeValue("operation-type");
                    if (operationType != null) {
                        operation.removeAttribute("operation-type");
                        operation.setAttribute("permission-type", operationType);
                    }
                }
            }
        }
    }

}
