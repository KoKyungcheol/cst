package com.zionex.t3series.web.view.v1_0.component;

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
        return "";
    }

}
