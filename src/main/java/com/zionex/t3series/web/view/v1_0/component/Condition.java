package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Condition extends Properties implements Configurable {

    private final String id;

    public Condition(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element conditionElement = new Element("condition");

        conditionElement.setAttribute("id", id);

        Object group = getProp(".group");
        Object component = getProp("component");
        Object key = getProp("key");
        Object onColumn = getProp("on-column");
        Object column = getProp("column");
        Object operator = getProp("operator");
        Object value = getProp("value");
        Object extractBy = getProp("extract-by");
        Object msg = getProp("msg");

        if (group != null) conditionElement.setAttribute("group", group.toString());
        if (component != null) conditionElement.addContent(new Element("component").setText(component.toString()));
        if (key != null) conditionElement.addContent(new Element("key").setText(key.toString()));
        if (onColumn != null) conditionElement.addContent(new Element("on-column").setText(onColumn.toString()));
        if (column != null) conditionElement.addContent(new Element("column").setText(column.toString()));
        if (operator != null) conditionElement.addContent(new Element("operator").setText(operator.toString()));
        if (value != null) conditionElement.addContent(new Element("value").setText(value.toString()));
        if (extractBy != null) conditionElement.addContent(new Element("extract-by").setText(extractBy.toString()));
        if (msg != null) conditionElement.addContent(new Element("msg").setText(msg.toString()));

        return conditionElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
