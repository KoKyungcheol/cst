package com.zionex.t3series.web.view.v2_0.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Series extends Properties implements Configurable {

    private final String id;

    public Series(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element seriesElement = new Element("series");

        seriesElement.setAttribute("id", id);

        Object noteTextFieldId = getProp(".note-text-field-id");
        Object chartType = getProp("chart-type.type");
        Object chartTypeStack = getProp("chart-type", "stack");
        Object chartTypeLineStyle = getProp("chart-type", "line-style");

        if (noteTextFieldId != null) {
            seriesElement.setAttribute("note-text-field-id", noteTextFieldId.toString());
        }

        if (chartType != null) {
            Element chartTypeElement = new Element("chart-type");

            chartTypeElement.setAttribute("type", chartType.toString());

            if (chartTypeStack != null) chartTypeElement.addContent(new Element("stack").setText(chartTypeStack.toString()));
            if (chartTypeLineStyle != null) chartTypeElement.addContent(new Element("line-style").setText(chartTypeLineStyle.toString()));

            seriesElement.addContent(chartTypeElement);
        }

        Object type = getProp("type");
        Object criteriaAxis = getProp("criteria-axis");
        Object xField = getProp("x-field");
        Object yField = getProp("y-field");
        Object categoryField = getProp("category-field");

        if (type != null) seriesElement.addContent(new Element("type").setText(type.toString()));
        if (criteriaAxis != null) seriesElement.addContent(new Element("criteria-axis").setText(criteriaAxis.toString()));
        if (xField != null) seriesElement.addContent(new Element("x-field").setText(xField.toString()));
        if (yField != null) seriesElement.addContent(new Element("y-field").setText(yField.toString()));
        if (categoryField != null) seriesElement.addContent(new Element("category-field").setText(categoryField.toString()));
 
        Object visible = getProp("visible");
        Object format = getProp("format");

        if (visible != null) seriesElement.addContent(new Element("visible").setText(visible.toString()));
        if (format != null) seriesElement.addContent(new Element("format").setText(format.toString()));

        return seriesElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        Object noteTextFieldId = getProp(".note-text-field-id");
        Object chartType = getProp("chart-type.type");
        Object chartTypeStack = getProp("chart-type", "stack");
        Object chartTypeLineStyle = getProp("chart-type", "line-style");

        if (noteTextFieldId != null) {
            builder.append("\"noteTextFieldId\":").append('"').append(noteTextFieldId).append('"');
        }

        if (chartType != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"chartType\":").append('"').append(chartType).append('"');
        }

        if (chartTypeStack != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"chartTypeStack\":").append('"').append(chartTypeStack).append('"');
        }

        if (chartTypeLineStyle != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"chartTypeLineStyle\":").append('"').append(chartTypeLineStyle).append('"');
        }

        Object type = getProp("type");
        Object criteriaAxis = getProp("criteria-axis");
        Object xField = getProp("x-field");
        Object yField = getProp("y-field");
        Object categoryField = getProp("category-field");

        if (type != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"type\":").append('"').append(type).append('"');
        }

        if (criteriaAxis != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"criteriaAxis\":").append('"').append(criteriaAxis).append('"');
        }

        if (xField != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"xField\":").append('"').append(xField).append('"');
        }

        if (yField != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"yField\":").append('"').append(yField).append('"');
        }

        if (categoryField != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"categoryField\":").append('"').append(categoryField).append('"');
        }

        Object visible = getProp("visible");
        Object format = getProp("format");

        if (visible != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"visible\":").append(visible);
        }

        if (format != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            format = format.toString().replace("\\", "\\\\");
            builder.append("\"format\":").append('"').append(format).append('"');
        }

        builder.append('}');
        return builder.toString();
    }

}
