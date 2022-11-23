package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class TabItem extends Properties implements Configurable {

    private final String id;

    public TabItem(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element tabItemElement = new Element("tab");
        tabItemElement.setAttribute("id", id);

        Object title = getProp(".title");
        Object expand = getProp(".expand");
        Object initRender = getProp(".init-render");

        if (title != null) tabItemElement.setAttribute("title", title.toString());
        if (expand != null) tabItemElement.setAttribute("expand", expand.toString());
        if (initRender != null) tabItemElement.setAttribute("init-render", initRender.toString());

        return tabItemElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        String id = getId();
        Object title = getProp(".title");
        Object expand = getProp(".expand");
        Object initRender = getProp(".init-render");

        if (id != null) {
            builder.append("\"id\":").append('"').append(id).append('"');
        }

        if (title != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"title\":").append('"').append(title).append('"');
        }

        if (expand != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"expand\":").append(expand);
        }

        if (initRender != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"initRender\":").append(initRender);
        }

        builder.append('}');
        return builder.toString();
    }

}
