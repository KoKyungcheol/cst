package com.zionex.t3series.web.view.v1_2.component.grid;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Iteration extends Properties implements Configurable {

    private List<Object[]> prefixInfos = new ArrayList<>();
    private List<Object[]> postfixInfos = new ArrayList<>();

    public Iteration() {
    }

    public void addPrefixInfo(Object[] prefixInfo) {
        prefixInfos.add(prefixInfo);
    }

    public void addPostfixInfo(Object[] postfixInfo) {
        postfixInfos.add(postfixInfo);
    }

    @Override
    public Element toElement() {
        Element iterationElement = new Element("iteration");

        Object delimiter = getProp("delimiter");
        Object headerSeq = getProp("header-seq");
        Object group = getProp("group");
        Object applyColor = getProp("apply-color");
        Object ordinalPosition = getProp("ordinal-position");

        for (Object[] prefixInfo : prefixInfos) {
            Element prefixElement = new Element("prefix").setText(prefixInfo[0].toString());
            if (prefixInfo.length == 2) {
                prefixElement.setAttribute("remove", prefixInfo[1].toString());
            }
            iterationElement.addContent(prefixElement);
        }

        for (Object[] postfixInfo : postfixInfos) {
            Element postfixElement = new Element("postfix").setText(postfixInfo[0].toString());
            if (postfixInfo.length == 2) {
                postfixElement.setAttribute("remove", postfixInfo[1].toString());
            }
            iterationElement.addContent(postfixElement);
        }

        if (delimiter != null) iterationElement.addContent(new Element("delimiter").setText(delimiter.toString()));
        if (headerSeq != null) iterationElement.addContent(new Element("header-seq").setText(headerSeq.toString()));
        if (group != null) iterationElement.addContent(new Element("group").setText(group.toString()));
        if (applyColor != null) iterationElement.addContent(new Element("apply-color").setText(applyColor.toString()));
        if (ordinalPosition != null) iterationElement.addContent(new Element("ordinal-position").setText(ordinalPosition.toString()));

        return iterationElement;
    }

    @Override
    public String toJson() {
        Object delimiter = getProp("delimiter");
        Object headerSeq = getProp("header-seq");
        Object group = getProp("group");
        Object applyColor = getProp("apply-color");
        Object ordinalPosition = getProp("ordinal-position");

        StringBuilder builder = new StringBuilder();
        builder.append('{');

        for (Object[] prefixInfo : prefixInfos) {
            Object prefix = prefixInfo[0];
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"prefix\":").append('"').append(prefix.toString()).append('"');

            if (prefixInfo.length == 2) {
                Object prefixRemove = prefixInfo[1];
                builder.append(",\"prefixRemove\":").append('"').append(prefixRemove.toString()).append('"');
            }
        }

        for (Object[] postfixInfo : postfixInfos) {
            Object postfix = postfixInfo[0];
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"postfix\":").append('"').append(postfix.toString()).append('"');

            if (postfixInfo.length == 2) {
                Object postfixRemove = postfixInfo[1];
                builder.append(",\"postfixRemove\":").append('"').append(postfixRemove.toString()).append('"');
            }
        }

        if (delimiter != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"delimiter\":").append('"').append(delimiter).append('"');
        }

        if (headerSeq != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"headerSeq\":").append('"').append(headerSeq).append('"');
        }

        if (group != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"group\":").append('"').append(group).append('"');
        }

        if (applyColor != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"applyColor\":").append('"').append(applyColor).append('"');
        }

        if (ordinalPosition != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }

            String[] ordinalPositions = ordinalPosition.toString().split(",");
            String parsedOrdinalPosition = Arrays.asList(ordinalPositions).stream().map(s -> "\"" + s + "\"").collect(Collectors.joining(","));
            builder.append("\"ordinalPosition\":").append('[').append(parsedOrdinalPosition).append(']');
        }

        builder.append('}');
        return builder.toString();
    }

}
