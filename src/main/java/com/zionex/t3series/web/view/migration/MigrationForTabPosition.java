package com.zionex.t3series.web.view.migration;

import com.zionex.t3series.web.view.util.ElementUtil;

import org.jdom2.Element;

public class MigrationForTabPosition implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            String type = component.getAttributeValue("type");
            if (!"TAB".equals(type)) {
                continue;
            }

            for (Element position : ElementUtil.findElements(component, "view-model", "tabs", "position")) {
                Element tabsElement = position.getParentElement();
                Element viewModelElement = tabsElement.getParentElement();

                tabsElement.removeContent(position);
                if (tabsElement.getContentSize() == 0) {
                    viewModelElement.removeContent(tabsElement);
                }
                viewModelElement.addContent(position);
            }
        }
    }

}
