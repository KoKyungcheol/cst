package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Toolbar extends Properties implements Configurable {

    private List<ToolbarButton> toolbarButtons = new ArrayList<>();

    public Toolbar() {
    }

    public List<ToolbarButton> getToolbarButtons() {
        return Collections.unmodifiableList(toolbarButtons);
    }

    public void addToolbarButton(ToolbarButton toolbarButton) {
        toolbarButtons.add(toolbarButton);
    }

    @Override
    public Element toElement() {
        Element toolbarElement = new Element("toolbar");

        Object useAttribute = getProp(".use");
        if (useAttribute != null) toolbarElement.setAttribute("use", useAttribute.toString());

        for (ToolbarButton toolbarButton : toolbarButtons) {
            toolbarElement.addContent(toolbarButton.toElement());
        }

        return toolbarElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
