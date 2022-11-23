package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class ReferenceServiceCall implements Configurable {

    private final String id;

    private String extract;
    private String resultDataKey;

    public ReferenceServiceCall(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getExtract() {
        return extract;
    }

    public void setExtract(String extract) {
        this.extract = extract;
    }

    public String getResultDataKey() {
        return resultDataKey;
    }

    public void setResultDataKey(String resultDataKey) {
        this.resultDataKey = resultDataKey;
    }

    @Override
    public Element toElement() {
        Element referenceServiceCallElement = new Element("reference-service-call");

        referenceServiceCallElement.setAttribute("id", id);

        if (extract != null) referenceServiceCallElement.setAttribute("extract", extract);
        if (resultDataKey != null) referenceServiceCallElement.addContent(new Element("result-data-key").setText(resultDataKey));

        return referenceServiceCallElement;
    }

    @Override
    public String toJson() {
        String[] values = id.split(":");
        if (values.length == 0) {
            return "";
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"componentId\":").append('"').append(values[0].trim()).append('"');

        if (values.length > 1) {
            builder.append(',').append("\"serviceCallId\":").append('"').append(values[1].trim()).append('"');
        }

        if (extract != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"extract\":").append('"').append(extract).append('"');
        }

        if (resultDataKey != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"resultDataKey\":").append('"').append(resultDataKey).append('"');
        }

        builder.append('}');
        return builder.toString();
    }

}
