package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Label extends Component {

    public Label(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object lang = getProp("lang");
        Object position = getProp("position");
        Object tooltip = getProp("tooltip");
        Object icon = getProp("icon");
        Element font = ViewUtil.toFontElement(this);

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (position != null) viewModel.addContent(new Element("position").setText(position.toString()));
        if (tooltip != null) viewModel.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (icon != null) viewModel.addContent(new Element("icon").setText(icon.toString()));
        if (font != null) viewModel.addContent(font);

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object format = getProp("format");

        Element model = new Element("model");

        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (format != null) model.addContent(new Element("format").setText(format.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
