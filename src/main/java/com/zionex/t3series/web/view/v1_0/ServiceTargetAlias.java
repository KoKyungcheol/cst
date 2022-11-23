package com.zionex.t3series.web.view.v1_0;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class ServiceTargetAlias implements Configurable {

    private final String from;
    private final String to;

    public ServiceTargetAlias(String from, String to) {
        this.from = from;
        this.to = to;
    }

    @Override
    public Element toElement() {
        Element alias = new Element("alias");

        alias.setAttribute("from", from);
        alias.setAttribute("to", to);

        return alias;
    }

    @Override
    public String toJson() {
        return "";
    }

}
