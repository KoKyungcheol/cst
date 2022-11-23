package com.zionex.t3series.web.view.v1_0.component.grid;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Validation extends Properties implements Configurable {

    private final String id;

    public Validation(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element validationElement = new Element("validation");

        validationElement.setAttribute("id", id);

        Object operator = getProp("operator");
        Object value = getProp("value");
        Object message = getProp("message");

        if (operator != null) validationElement.addContent(new Element("operator").setText(operator.toString()));
        if (value != null) validationElement.addContent(new Element("value").setText(value.toString()));
        if (message != null) validationElement.addContent(new Element("message").setText(message.toString()));

        return validationElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
