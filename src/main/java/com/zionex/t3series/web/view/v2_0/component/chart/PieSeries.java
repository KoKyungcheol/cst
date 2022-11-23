package com.zionex.t3series.web.view.v2_0.component.chart;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class PieSeries extends Properties implements Configurable {

    private final String id;

    public PieSeries(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element seriesElement = new Element("series");

        seriesElement.setAttribute("id", id);

        Object categoryField = getProp("category-field");
        if (categoryField != null) {
            seriesElement.addContent(new Element("category-field").setText(categoryField.toString()));
        }
 
        return seriesElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        Object categoryField = getProp("category-field");

        if (categoryField != null) {
            builder.append("\"categoryField\":").append('"').append(categoryField).append('"');
        }

        builder.append('}');
        return builder.toString();
    }

}
