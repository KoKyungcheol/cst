package com.zionex.t3series.web.view.migration;

import org.jdom2.Element;

public class MigrationForSuggestDescriptionId implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            String type = component.getAttributeValue("type");
            if (!"INPUTBOX".equals(type)) {
                continue;
            }

            Element model = component.getChild("model");
            if (model != null) {
                Element suggest = model.getChild("suggest");
                if (suggest != null) {
                    Element textId = suggest.getChild("text-id");
                    if (textId != null) {
                        Element descriptionId = suggest.getChild("description-id");
                        if (descriptionId == null) {
                            textId.setName("description-id");
                        } else {
                            suggest.removeContent(textId);
                        }
                    }
                }
            }
        }
    }

}
