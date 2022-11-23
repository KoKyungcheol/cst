package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Radio extends Component {

    private List<Option> initValueOptions = new ArrayList<>();

    public Radio(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<Option> getInitValueOptions() {
        return Collections.unmodifiableList(initValueOptions);
    }

    public void addInitValueOption(Option initValueOption) {
        initValueOptions.add(initValueOption);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object name = getProp("name");
        Object lang = getProp("lang");
        Object optionDeployment = getProp("option-deployment");

        Element viewModel = new Element("view-model");

        if (name != null ) viewModel.addContent(new Element("name").setText(name.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (optionDeployment != null) viewModel.addContent(new Element("option-deployment").setText(optionDeployment.toString()));

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");

        Element model = new Element("model");

        if (!initValueOptions.isEmpty()) {
            Element initValue = new Element("init-value");
            for (Option initValueOption : initValueOptions) {
                initValue.addContent(initValueOption.toElement());
            }
            model.addContent(initValue);
        }

        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (textId != null) model.addContent(new Element("text-id").setText(textId.toString()));
        if (selectId != null) model.addContent(new Element("select-id").setText(selectId.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
