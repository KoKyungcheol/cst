package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class ReferenceOperationCall implements Configurable {

    private final String id;

    public ReferenceOperationCall(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element referenceOperationCallElement = new Element("reference-operation-call");

        referenceOperationCallElement.setAttribute("id", id);

        return referenceOperationCallElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
