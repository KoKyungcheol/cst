package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Split extends Component {

    private List<SplitItem> splitItems = new ArrayList<>();

    public Split(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<SplitItem> getSplitItems() {
        return Collections.unmodifiableList(splitItems);
    }

    public void addSplitItem(SplitItem splitItem) {
        this.splitItems.add(splitItem);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object position = getProp("splits", "position");

        Element viewModel = new Element("view-model");

        if (width != null ) {
            viewModel.addContent(new Element("width").setText(width.toString()));
        }

        if (height != null) {
            viewModel.addContent(new Element("height").setText(height.toString()));
        }

        if (position != null) {
            Element splitsElement = new Element("splits");
            splitsElement.addContent(new Element("position").setText(position.toString()));
            viewModel.addContent(splitsElement);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);

        if (!splitItems.isEmpty()) {
            Element model = new Element("model");

            Element splitsElement = new Element("splits");
            for (SplitItem splitItem : splitItems) {
                splitsElement.addContent(splitItem.toElement());
            }

            model.addContent(splitsElement);
            component.addContent(model);
        }

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
