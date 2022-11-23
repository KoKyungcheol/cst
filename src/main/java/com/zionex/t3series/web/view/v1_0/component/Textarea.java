package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Textarea extends Component {

    public Textarea(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object lang = getProp("lang");
        Object editable = getProp("editable");
        Object placeholder = getProp("placeholder");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (editable != null) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (placeholder != null) viewModel.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (name != null) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));

        Object valueId = getProp("value-id");
        Object data = getProp("init-value", "data");

        Element model = new Element("model");

        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (data != null) {
            Element initValueElement = new Element("init-value");
            initValueElement.addContent(new Element("data").setText(data.toString()));
            model.addContent(initValueElement);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
