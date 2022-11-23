package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class DatePicker extends Component {

    public DatePicker(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object editable = getProp("editable");
        Object lang = getProp("lang");
        Object dateType = getProp("date-type");
        Object dateFormat = getProp("date-format");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (name != null) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));
        if (editable != null) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (dateType != null) viewModel.addContent(new Element("date-type").setText(dateType.toString()));
        if (dateFormat != null) viewModel.addContent(new Element("date-format").setText(dateFormat.toString()));

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object baseValue = getProp("base-value");

        Element model = new Element("model");

        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (baseValue != null) model.addContent(new Element("base-value").setText(baseValue.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
