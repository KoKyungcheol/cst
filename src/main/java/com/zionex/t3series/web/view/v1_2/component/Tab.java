package com.zionex.t3series.web.view.v1_2.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

        Element viewModel = new Element("view-model");

        if (width != null ) {
            viewModel.addContent(new Element("width").setText(width.toString()));
        }

        if (height != null) {
            viewModel.addContent(new Element("height").setText(height.toString()));
        }

        if (position != null) {
            viewModel.addContent(new Element("position").setText(position.toString()));
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
    
        if (!tabItems.isEmpty()) {
            Element model = new Element("model");

            Element tabsElement = new Element("tabs");
            for (TabItem tabItem : tabItems) {
                tabsElement.addContent(tabItem.toElement());
            }

            model.addContent(tabsElement);
            component.addContent(model);
        }

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object height = getProp("height");
        Object position = getProp("position");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (width != null) {
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (height != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (position != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"position\":").append('"').append(position).append('"');
        }

        StringBuilder modelBuilder = new StringBuilder();
        
        if (!tabItems.isEmpty()) {
            modelBuilder.append("\"tabs\":[");

            for (int i = 0; i < tabItems.size(); i++) {
                TabItem tabItem = tabItems.get(i);

                String json = tabItem.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                
                if (i > 0) {
                    modelBuilder.append(',');
                }
                modelBuilder.append(json);
            }
            modelBuilder.append(']');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (viewModelBuilder.length() > 0) {
            builder.append(",\"viewModel\":").append('{').append(viewModelBuilder.toString()).append('}');
        }

        if (modelBuilder.length() > 0) {
            builder.append(",\"model\":").append('{').append(modelBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
