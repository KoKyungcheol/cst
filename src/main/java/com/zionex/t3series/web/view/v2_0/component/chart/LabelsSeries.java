package com.zionex.t3series.web.view.v2_0.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class LabelsSeries extends Properties implements Configurable {
    private final String id;

    public LabelsSeries(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element seriesElement = new Element("series");

        seriesElement.setAttribute("id", id);
 
        Object visible = getProp("visible");
        Object format = getProp("format");

        if (visible != null) seriesElement.addContent(new Element("visible").setText(visible.toString()));
        if (format != null) seriesElement.addContent(new Element("format").setText(format.toString()));

        return seriesElement;
    }

    @Override
    public String toJson() {
        Object visible = getProp("visible");
        Object format = getProp("format");

        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (visible != null) {
            builder.append("\"visible\":").append(visible);
        }

        if (format != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            format = format.toString().replace("\\","\\\\");
            builder.append("\"format\":").append('"').append(format).append('"');
        }

        builder.append('}');
        return builder.toString();
    }
}
