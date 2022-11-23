package com.zionex.t3series.web.view.v1_2.component.chart;

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

        builder.append('}');
        return builder.toString();
    }

}
