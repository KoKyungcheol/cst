package com.zionex.t3series.web.view.v2_0.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class CategoryAxis extends Properties implements Configurable {

    private final String id;

    public CategoryAxis(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element categoryAxisElement = new Element("category");

        categoryAxisElement.setAttribute("id", id);

        Object titleText = getProp("title", "text");
        Object titleFont = getProp("title", "font");
        Object titleColor = getProp("title", "color");

        if (titleText != null || titleColor != null) {
            Element titleElement = new Element("title");

            if (titleText != null) titleElement.addContent(new Element("text").setText(titleText.toString()));
            if (titleFont != null) titleElement.addContent(new Element("font").setText(titleFont.toString()));
            if (titleColor != null) titleElement.addContent(new Element("color").setText(titleColor.toString()));

            categoryAxisElement.addContent(titleElement);
        }

        Object rotation = getProp("rotation");
        Object format = getProp("format");

        if (rotation != null) categoryAxisElement.addContent(0, new Element("rotation").setText(rotation.toString()));
        if (format != null) categoryAxisElement.addContent(0, new Element("format").setText(format.toString()));

        Object type = getProp("type");
        Object dateGroup = getProp("date-group");
        Object baseUnit = getProp("base-unit");
        Object baseUnitStep = getProp("base-unit-step");
        Object sortDirection = getProp("sort-direction");

        if (type != null) categoryAxisElement.addContent(new Element("type").setText(type.toString()));
        if (dateGroup != null) categoryAxisElement.addContent(new Element("date-group").setText(dateGroup.toString()));
        if (baseUnit != null) categoryAxisElement.addContent(new Element("base-unit").setText(baseUnit.toString()));
        if (baseUnitStep != null) categoryAxisElement.addContent(new Element("base-unit-step").setText(baseUnitStep.toString()));
        if (sortDirection != null) categoryAxisElement.addContent(new Element("sort-direction").setText(sortDirection.toString()));

        return categoryAxisElement;
    }

    @Override
    public String toJson() {
        Object titleText = getProp("title", "text");
        Object titleFont = getProp("title", "font");
        Object titleColor = getProp("title", "color");

        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (titleText != null) {
            builder.append("\"titleText\":").append('"').append(titleText).append('"');
        }

        if (titleFont != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"titleFont\":").append('"').append(titleFont).append('"');
        }

        if (titleColor != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"titleColor\":").append('"').append(titleColor).append('"');
        }

        Object rotation = getProp("rotation");
        Object format = getProp("format");

        if (rotation != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"rotation\":").append('"').append(rotation).append('"');
        }

        if (format != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            format = format.toString().replace("\\", "\\\\");
            builder.append("\"format\":").append('"').append(format).append('"');
        }

        Object type = getProp("type");
        Object dateGroup = getProp("date-group");
        Object sortDirection = getProp("sort-direction");
        Object baseUnit = getProp("base-unit");
        Object baseUnitStep = getProp("base-unit-step");

        if (type != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"type\":").append('"').append(type).append('"');
        }

        if (dateGroup != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"dateGroup\":").append(dateGroup);
        }

        if (baseUnit != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"baseUnit\":").append('"').append(baseUnit).append('"');
        }

        if (baseUnitStep != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"baseUnitStep\":").append('"').append(baseUnitStep).append('"');
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
