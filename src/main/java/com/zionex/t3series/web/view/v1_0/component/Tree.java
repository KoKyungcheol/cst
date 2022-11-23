package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Tree extends Component {

    public Tree(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object checkbox = getProp("checkbox");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));
        if (checkbox != null) viewModel.addContent(new Element("checkbox").setText(checkbox.toString()));

        Object valueId = getProp("value-id");
        Object valueSort = getProp("value-id.sort");
        Object textId = getProp("text-id");
        Object textSort = getProp("text-id.sort");
        Object getvalueConcat = getProp("getvalue-concat");

        Element model = new Element("model");

        if (valueId != null) {
            Element valueIdElement = new Element("value-id").setText(valueId.toString());
            if (valueSort != null) {
                valueIdElement.setAttribute("sort", valueSort.toString());
            }
            model.addContent(valueIdElement);
        }

        if (textId != null) {
            Element textIdElement = new Element("text-id").setText(textId.toString());
            if (textSort != null) {
                textIdElement.setAttribute("sort", textSort.toString());
            }
            model.addContent(textIdElement);
        }

        if (getvalueConcat != null) model.addContent(new Element("getvalue-concat").setText(getvalueConcat.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
