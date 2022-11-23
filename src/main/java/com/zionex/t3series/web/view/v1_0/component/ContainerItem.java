package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class ContainerItem extends Properties implements Configurable {

    private final String id;

    public ContainerItem(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element containerItemElement = new Element("container");
        containerItemElement.setAttribute("id", id);

        Object expand = getProp(".expand");
        Object initRender = getProp(".init-render");

        if (expand != null) containerItemElement.setAttribute("expand", expand.toString());
        if (initRender != null) containerItemElement.setAttribute("init-render", initRender.toString());

        return containerItemElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
