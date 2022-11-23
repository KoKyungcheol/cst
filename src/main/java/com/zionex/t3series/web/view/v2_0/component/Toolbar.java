package com.zionex.t3series.web.view.v2_0.component;

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
        Object useAttribute = getProp(".use");
        if (useAttribute != null && "false".equals(useAttribute.toString())) {
            return "";
        }

        StringBuilder builder = new StringBuilder();

        if (!toolbarButtons.isEmpty()) {
            builder.append("\"toolbarButtons\":").append('{');

            for (int i = 0; i < toolbarButtons.size(); i++) {
                ToolbarButton toolbarbutton = toolbarButtons.get(i);

                if (i > 0) {
                    builder.append(',');
                }

                String json = toolbarbutton.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                builder.append('"').append(toolbarbutton.getOperationId()).append("\":").append(json);
            }
            builder.append('}');
        }

        return builder.toString();
    }

}
