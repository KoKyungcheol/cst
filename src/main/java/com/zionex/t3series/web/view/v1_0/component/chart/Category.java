package com.zionex.t3series.web.view.v1_0.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Category extends Properties implements Configurable {

    private final String fieldId;

    public Category(String fieldId) {
        this.fieldId = fieldId;
    }

    public String getFieldId() {
        return fieldId;
    }

    @Override
    public Element toElement() {
        Element categoryElement = new Element("category");

        categoryElement.setAttribute("field-id", fieldId);

        Object type = getProp("type");
        Object dateGroup = getProp("date-group");
        Object format = getProp("format");

        if (type != null) categoryElement.addContent(new Element("type").setText(type.toString()));
        if (dateGroup != null) categoryElement.addContent(new Element("date-group").setText(dateGroup.toString()));
        if (format != null) categoryElement.addContent(new Element("format").setText(format.toString()));

        return categoryElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
