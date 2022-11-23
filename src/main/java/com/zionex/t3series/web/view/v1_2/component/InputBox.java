package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

import org.jdom2.Element;

public class InputBox extends Component {

    public InputBox(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object placeholder = getProp("placeholder");
        Object editable = getProp("editable");
        Object hidden = getProp("hidden");
        Object lang = getProp("lang");
        Object background = getProp("background");
        Element font = ViewUtil.toFontElement(this);

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (name != null ) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null ) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));
        if (placeholder != null ) viewModel.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (editable != null ) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (hidden != null ) viewModel.addContent(new Element("hidden").setText(hidden.toString()));
        if (lang != null ) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (background != null ) viewModel.addContent(new Element("background").setText(background.toString()));
        if (font != null ) viewModel.addContent(font);

        Object type = getProp("type");
        Object min = getProp("min");
        Object max = getProp("max");
        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        Element model = new Element("model");

        if (type != null) model.addContent(new Element("type").setText(type.toString()));
        if (min != null) model.addContent(new Element("min").setText(min.toString()));
        if (max != null) model.addContent(new Element("max").setText(min.toString()));
        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));

        if (hasProp("suggest")) {
            Object suggestValueId = getProp("suggest", "value-id");
            Object suggestDescriptionId = getProp("suggest", "description-id");
            Object suggestIgnoreCase = getProp("suggest", "ignore-case");

            Element suggest = new Element("suggest");

            if (suggestValueId != null) suggest.addContent(new Element("value-id").setText(suggestValueId.toString()));
            if (suggestDescriptionId != null) suggest.addContent(new Element("description-id").setText(suggestDescriptionId.toString()));
            if (suggestIgnoreCase != null) suggest.addContent(new Element("ignore-case").setText(suggestIgnoreCase.toString()));

            model.addContent(suggest);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object placeholder = getProp("placeholder");
        Object editable = getProp("editable");
        Object hidden = getProp("hidden");
        Object lang = getProp("lang");
        Object background = getProp("background");
        String font = ViewUtil.toFontJson(this);

        StringBuilder viewModelBuilder = new StringBuilder();

        if (width != null ) {
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (name != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (namePosition != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"namePosition\":").append('"').append(namePosition).append('"');
        }

        if (placeholder != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"placeholder\":").append('"').append(placeholder).append('"');
        }

        if (editable != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"editable\":").append(editable);
        }

        if (hidden != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"hidden\":").append(hidden);
        }

        if (lang != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        if (background != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"background\":").append('"').append(background).append('"');
        }

        if (font != null && !font.isEmpty()) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"font\":").append(font);
        }

        Object type = getProp("type");
        Object min = getProp("min");
        Object max = getProp("max");
        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        StringBuilder modelBuilder = new StringBuilder();

        if (type != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"type\":").append('"').append(type).append('"');
        }

        if (min != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"min\":").append('"').append(min).append('"');
        }

        if (max != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"max\":").append('"').append(max).append('"');
        }

        if (initValue != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"initValue\":").append('"').append(initValue).append('"');
        }

        if (valueId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (hasProp("suggest")) {
            Object suggestValueId = getProp("suggest", "value-id");
            Object suggestDescriptionId = getProp("suggest", "description-id");
            Object suggestIgnoreCase = getProp("suggest", "ignore-case");
            
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"suggest\":").append('{');

            if (suggestValueId != null) {
                modelBuilder.append("\"valueId\":").append('"').append(suggestValueId).append('"');
            }
            
            if (suggestDescriptionId != null) {
                if (modelBuilder.length() > 0) {
                    modelBuilder.append(',');
                }
                modelBuilder.append("\"descriptionId\":").append('"').append(suggestDescriptionId).append('"');
            }

            if (suggestIgnoreCase != null) {
                if (modelBuilder.length() > 0) {
                    modelBuilder.append(',');
                }
                modelBuilder.append("\"ignoreCase\":").append(suggestIgnoreCase);
            }
            modelBuilder.append('}');
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
