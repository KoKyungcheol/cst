package com.zionex.t3series.web.view.migration;

import org.jdom2.Element;

public class MigrationForUIOperation implements Migration {

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
                    for (Element uiOperation : operation.getChildren("ui-operation")) {
                        uiOperation.setName("service-call");

                        String uiService = "";

                        Element parameters = uiOperation.getChild("parameters");
                        if (parameters != null) {
                            for (Element parameter : parameters.getChildren("parameter")) {
                                String id = parameter.getAttributeValue("id");
                                if (id.equals("ui_service")) {
                                    uiService = parameter.getAttributeValue("value");
                                    parameters.removeContent(parameter);
                                    break;
                                }
                            }
                        }

                        Element serviceId = new Element("service-id");
                        if (!uiService.isEmpty()) {
                            serviceId.setText(uiService);
                        }

                        uiOperation.addContent(0, serviceId);
                        uiOperation.addContent(1, new Element("service-target"));
                    }
                }
            }
        }
    }

}
