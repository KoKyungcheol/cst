package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class SplitItem extends Properties implements Configurable {

    private final String id;

    public SplitItem(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element splitItemElement = new Element("split");
        splitItemElement.setAttribute("id", id);

        Object collapsed = getProp(".collapsed");
        Object collapsible = getProp(".collapsible");
        Object resizable = getProp(".resizable");
        Object size = getProp(".size");

        if (collapsed != null) splitItemElement.setAttribute("collapsed", collapsed.toString());
        if (collapsible != null) splitItemElement.setAttribute("collapsible", collapsible.toString());
        if (resizable != null) splitItemElement.setAttribute("resizable", resizable.toString());
        if (size != null) splitItemElement.setAttribute("size", size.toString());

        return splitItemElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
