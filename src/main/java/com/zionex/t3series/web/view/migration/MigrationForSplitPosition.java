package com.zionex.t3series.web.view.migration;

import com.zionex.t3series.web.view.util.ElementUtil;

import org.jdom2.Element;

public class MigrationForSplitPosition implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            String type = component.getAttributeValue("type");
            if (!"SPLIT".equals(type)) {
                continue;
            }

            for (Element position : ElementUtil.findElements(component, "view-model", "splits", "position")) {
                Element splitsElement = position.getParentElement();
                Element viewModelElement = splitsElement.getParentElement();

                splitsElement.removeContent(position);
                if (splitsElement.getContentSize() == 0) {
                    viewModelElement.removeContent(splitsElement);
                }
                viewModelElement.addContent(position);
            }
        }
    }

}
