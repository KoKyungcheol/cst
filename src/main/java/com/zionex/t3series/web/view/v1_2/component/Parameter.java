package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Parameter extends Properties implements Configurable {

    private final String id;

    public Parameter(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    @Override
    public Element toElement() {
        Element parameter = new Element("parameter");
        parameter.setAttribute("id", id);

        Object value = getProp(".value");
        Object referenceId = getProp(".reference-id");
        Object referenceData = getProp(".reference-data");
        Object extractBy = getProp(".extract-by");
        Object rowExtract = getProp(".row-extract");
        Object delimiter = getProp(".delimiter");
        Object defaultValue = getProp(".default-value");

        if (value != null) parameter.setAttribute("value", value.toString());
        if (referenceId != null) parameter.setAttribute("reference-id", referenceId.toString());
        if (referenceData != null) parameter.setAttribute("reference-data", referenceData.toString());
        if (extractBy != null) parameter.setAttribute("extract-by", extractBy.toString());
        if (rowExtract != null) parameter.setAttribute("row-extract", rowExtract.toString());
        if (delimiter != null) parameter.setAttribute("delimiter", delimiter.toString());
        if (defaultValue != null) parameter.setAttribute("default-value", defaultValue.toString());
    
        return parameter;
    }

    @Override
    public String toJson() {
        Object value = getProp(".value");
        Object referenceId = getProp(".reference-id");
        Object referenceData = getProp(".reference-data");
        Object extractBy = getProp(".extract-by");
        Object rowExtract = getProp(".row-extract");
        Object delimiter = getProp(".delimiter");
        Object defaultValue = getProp(".default-value");

        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (value != null) {
            builder.append("\"value\":").append('"').append(value).append('"');
        }

        if (referenceId != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"referenceId\":").append('"').append(referenceId).append('"');
        }

        if (referenceData != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"referenceData\":").append('"').append(referenceData).append('"');
        }

        if (extractBy != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"extractBy\":").append('"').append(extractBy).append('"');
        }

        if (rowExtract != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"rowExtract\":").append('"').append(rowExtract).append('"');
        }

        if (delimiter != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"delimiter\":").append('"').append(delimiter).append('"');
        }

        if (defaultValue != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"defaultValue\":").append('"').append(defaultValue).append('"');
        }

        builder.append('}');
        return builder.toString();
    }

}
