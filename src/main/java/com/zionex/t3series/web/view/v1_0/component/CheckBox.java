package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class CheckBox extends Component {

    public CheckBox(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object editable = getProp("editable");
        Object lang = getProp("lang");

        Element viewModel = new Element("view-model");

        if (name != null ) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));
        if (editable != null) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");

        Element model = new Element("model");

        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (textId != null) model.addContent(new Element("text-id").setText(textId.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
