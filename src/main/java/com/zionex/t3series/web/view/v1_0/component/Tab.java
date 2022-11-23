package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

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
        Object position = getProp("tabs", "position");

        Element viewModel = new Element("view-model");

        if (width != null) {
            viewModel.addContent(new Element("width").setText(width.toString()));
        }

        if (height != null) {
            viewModel.addContent(new Element("height").setText(height.toString()));
        }

        if (position != null) {
            Element tabsElement = new Element("tabs");
            tabsElement.addContent(new Element("position").setText(position.toString()));
            viewModel.addContent(tabsElement);
        }

        if (viewModel.getContentSize() > 0)
            component.addContent(viewModel);

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

}
