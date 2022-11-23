package com.zionex.t3series.web.view.migration;

import org.jdom2.Element;

public class MigrationForLangDefaultTrue implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            if (!usableComponent(component)) {
                continue;
            }

            Element viewModel = component.getChild("view-model");
            if (viewModel == null) {
                viewModel = new Element("view-model");
                component.addContent(viewModel);
            }

            Element lang = viewModel.getChild("lang");
            if (lang == null) {
                viewModel.addContent(new Element("lang").setText("true"));
            }
        }
    }

    private boolean usableComponent(Element component) {
        String type = component.getAttributeValue("type");
        if ("LABEL".equals(type)) {
            return true;
        } else if ("INPUTBOX".equals(type)) {
            return true;
        } else if ("BUTTON".equals(type)) {
            return true;
        } else if ("COMBOBOX".equals(type)) {
            return true;
        } else if ("CHECKBOX".equals(type)) {
            return true;
        } else if ("RADIO".equals(type)) {
            return true;
        } else if ("DATEPICKER".equals(type)) {
            return true;
        } else if ("TEXTAREA".equals(type)) {
            return true;
        } else if ("EDITOR".equals(type)) {
            return true;
        } else if ("WINDOW".equals(type)) {
            return true;
        }
        return false;
    }

}
