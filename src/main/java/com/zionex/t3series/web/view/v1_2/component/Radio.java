package com.zionex.t3series.web.view.v1_2.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

    @Override
    public String toJson(){
        Object name = getProp("name");
        Object lang = getProp("lang");
        Object optionDeployment = getProp("option-deployment");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (name != null) {
            viewModelBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (lang != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        if (optionDeployment != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"optionDeployment\":").append('"').append(optionDeployment).append('"');
        }

        StringBuilder modelBuilder = new StringBuilder();

        if (!initValueOptions.isEmpty()) {
            modelBuilder.append("\"initValue\":{\"options\":[");

            for (int i = 0; i < initValueOptions.size(); i++) {
                Option option = initValueOptions.get(i);

                String json = option.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                if (i > 0){
                    modelBuilder.append(',');
                }
                modelBuilder.append(json);
            }
            modelBuilder.append("]}");
        }

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");

        if (valueId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (textId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"textId\":").append('"').append(textId).append('"');
        }

        if (selectId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"selectId\":").append('"').append(selectId).append('"');
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
