package com.zionex.t3series.web.view.v1_0.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class ValueAxis extends Properties implements Configurable {

    private final String id;

    public ValueAxis(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element valueAxisElement = new Element("value");

        valueAxisElement.setAttribute("id", id);

        Object titleText = getProp("title", "text");
        Object titleFont = getProp("title", "font");
        Object titleColor = getProp("title", "color");

        if (titleText != null || titleColor != null) {
            Element titleElement = new Element("title");

            if (titleText != null) titleElement.addContent(new Element("text").setText(titleText.toString()));
            if (titleFont != null) titleElement.addContent(new Element("font").setText(titleFont.toString()));
            if (titleColor != null) titleElement.addContent(new Element("color").setText(titleColor.toString()));

            valueAxisElement.addContent(titleElement);
        }

        Object axisCrossingValue = getProp("axisCrossingValue");
        Object visible = getProp("visible");
        Object format = getProp("format");
        Object min = getProp("min");
        Object max = getProp("max");

        if (axisCrossingValue != null) valueAxisElement.addContent(0, new Element("axisCrossingValue").setText(axisCrossingValue.toString()));
        if (visible != null) valueAxisElement.addContent(0, new Element("visible").setText(visible.toString()));
        if (format != null) valueAxisElement.addContent(0, new Element("format").setText(format.toString()));
        if (max != null) valueAxisElement.addContent(0, new Element("max").setText(max.toString()));
        if (min != null) valueAxisElement.addContent(0, new Element("min").setText(min.toString()));

        return valueAxisElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
