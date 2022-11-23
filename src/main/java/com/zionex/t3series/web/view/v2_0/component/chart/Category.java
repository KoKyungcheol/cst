package com.zionex.t3series.web.view.v2_0.component.chart;

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
        Object sortDirection = getProp("sort-direction");

        if (type != null) categoryElement.addContent(new Element("type").setText(type.toString()));
        if (dateGroup != null) categoryElement.addContent(new Element("date-group").setText(dateGroup.toString()));
        if (format != null) categoryElement.addContent(new Element("format").setText(format.toString()));
        if (sortDirection != null) categoryElement.addContent(new Element("sort-direction").setText(sortDirection.toString()));

        return categoryElement;
    }

    @Override
    public String toJson() {
        Object type = getProp("type");
        Object dateGroup = getProp("date-group");
        Object format = getProp("format");
        Object sortDirection = getProp("sort-direction");

        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (type != null) {
            builder.append("\"type\":").append('"').append(type).append('"');
        }

        if (dateGroup != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"dateGroup\":").append(dateGroup);
        }

        if (format != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            format = format.toString().replace("\\","\\\\");
            builder.append("\"format\":").append('"').append(format).append('"');
        }

        if (sortDirection == null) {
            sortDirection = "asc";
        } else {
            sortDirection = sortDirection.toString().toLowerCase();
            if (!"asc".equals(sortDirection) && !"desc".equals(sortDirection)) {
                sortDirection = "asc";
            }
        }

        if (builder.length() > 1) {
            builder.append(',');
        }
        builder.append("\"sortDirection\":").append('"').append(sortDirection).append('"');

        builder.append('}');
        return builder.toString();
    }
}
