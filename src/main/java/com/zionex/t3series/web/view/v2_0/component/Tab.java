package com.zionex.t3series.web.view.v2_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Tab extends Component {

    private List<TabItem> tabItems = new ArrayList<>();

    public Tab(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<TabItem> getTabItems() {
        return Collections.unmodifiableList(tabItems);
    }

    public void addTabItem(TabItem tabItem) {
        this.tabItems.add(tabItem);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object position = getProp("position");

        Element props = new Element("props");

        if (width != null ) {
            props.addContent(new Element("width").setText(width.toString()));
        }

        if (height != null) {
            props.addContent(new Element("height").setText(height.toString()));
        }

        if (position != null) {
            props.addContent(new Element("position").setText(position.toString()));
        }
    
        if (!tabItems.isEmpty()) {
            Element tabsElement = new Element("tabs");
            for (TabItem tabItem : tabItems) {
                tabsElement.addContent(tabItem.toElement());
            }

            props.addContent(tabsElement);
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object height = getProp("height");
        Object position = getProp("position");

        StringBuilder propsBuilder = new StringBuilder();

        if (width != null) {
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (height != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (position != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"position\":").append('"').append(position).append('"');
        }

        if (!tabItems.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"tabs\":[");

            for (int i = 0; i < tabItems.size(); i++) {
                TabItem tabItem = tabItems.get(i);

                String json = tabItem.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                
                if (i > 0) {
                    propsBuilder.append(',');
                }
                propsBuilder.append(json);
            }
            propsBuilder.append(']');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (propsBuilder.length() > 0) {
            builder.append(",\"props\":").append('{').append(propsBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
