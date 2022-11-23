package com.zionex.t3series.web.view.v1_2.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Series extends Properties implements Configurable {

    private final String fieldId;

    private boolean isPieChart = false;

    public Series(String fieldId) {
        this.fieldId = fieldId;
    }

    public String getFieldId() {
        return fieldId;
    }

    public boolean isPieChart() {
        return isPieChart;
    }

    public void setPieChart(boolean isPieChart) {
        this.isPieChart = isPieChart;
    }

    @Override
    public Element toElement() {
        Element seriesElement = new Element("series");

        seriesElement.setAttribute("field-id", fieldId);

        if (isPieChart) {
            Object categoryField = getProp("category-field");

            if (categoryField != null) seriesElement.addContent(new Element("category-field").setText(categoryField.toString()));
        } else {
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
        }
 
        return seriesElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (isPieChart) {
            Object categoryField = getProp("category-field");

            if (categoryField != null) {
                builder.append("\"categoryField\":").append('"').append(categoryField).append('"');
            }
        } else {
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
        }

        builder.append('}');
        return builder.toString();
    }

}
