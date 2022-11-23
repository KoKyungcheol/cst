package com.zionex.t3series.web.view.v1_0.component.grid;

import java.util.ArrayList;
import java.util.List;

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

        return iterationElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
