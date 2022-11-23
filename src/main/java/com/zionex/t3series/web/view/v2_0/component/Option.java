package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Option extends Properties implements Configurable {

    private final String value;

    public Option(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public Element toElement() {
        Element optionElement = new Element("option");
        optionElement.setAttribute("value", value);

        Object text = getProp(".text");
        Object textPosition = getProp(".text-position");
        Object selected = getProp(".selected");

        if (text != null) optionElement.setAttribute("text", text.toString());
        if (textPosition != null) optionElement.setAttribute("text-position", textPosition.toString());
        if (selected != null) optionElement.setAttribute("selected", selected.toString());

        return optionElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        String value = getValue();
        Object text = getProp(".text");
        Object textPosition = getProp(".text-position");
        Object selected = getProp(".selected");

        if (value != null) {
            builder.append("\"value\":").append('"').append(value).append('"');
        }

        if (text != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"text\":").append('"').append(text).append('"');
        }

        if (textPosition != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"textPosition\":").append('"').append(textPosition).append('"');
        }

        if (selected != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"selected\":").append('"').append(selected).append('"');
        }

        builder.append('}');
        return builder.toString();
    }

}
