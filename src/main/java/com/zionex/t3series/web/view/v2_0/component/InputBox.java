package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

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

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (name != null ) props.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null ) props.addContent(new Element("name-position").setText(namePosition.toString()));
        if (placeholder != null ) props.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (editable != null ) props.addContent(new Element("editable").setText(editable.toString()));
        if (hidden != null ) props.addContent(new Element("hidden").setText(hidden.toString()));
        if (lang != null ) props.addContent(new Element("lang").setText(lang.toString()));
        if (background != null ) props.addContent(new Element("background").setText(background.toString()));
        if (font != null ) props.addContent(font);

        Object type = getProp("type");
        Object min = getProp("min");
        Object max = getProp("max");
        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        if (type != null) props.addContent(new Element("type").setText(type.toString()));
        if (min != null) props.addContent(new Element("min").setText(min.toString()));
        if (max != null) props.addContent(new Element("max").setText(min.toString()));
        if (initValue != null) props.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) props.addContent(new Element("value-id").setText(valueId.toString()));

        if (hasProp("suggest")) {
            Object suggestValueId = getProp("suggest", "value-id");
            Object suggestDescriptionId = getProp("suggest", "description-id");
            Object suggestIgnoreCase = getProp("suggest", "ignore-case");

            Element suggest = new Element("suggest");

            if (suggestValueId != null) suggest.addContent(new Element("value-id").setText(suggestValueId.toString()));
            if (suggestDescriptionId != null) suggest.addContent(new Element("description-id").setText(suggestDescriptionId.toString()));
            if (suggestIgnoreCase != null) suggest.addContent(new Element("ignore-case").setText(suggestIgnoreCase.toString()));

            props.addContent(suggest);
        }

        if (props.getContentSize() > 0) component.addContent(props);

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

        StringBuilder propsBuilder = new StringBuilder();

        if (width != null ) {
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (name != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (namePosition != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"namePosition\":").append('"').append(namePosition).append('"');
        }

        if (placeholder != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"placeholder\":").append('"').append(placeholder).append('"');
        }

        if (editable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"editable\":").append(editable);
        }

        if (hidden != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"hidden\":").append(hidden);
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (background != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"background\":").append('"').append(background).append('"');
        }

        if (font != null && !font.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"font\":").append(font);
        }

        Object type = getProp("type");
        Object min = getProp("min");
        Object max = getProp("max");
        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        if (type != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"type\":").append('"').append(type).append('"');
        }

        if (min != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"min\":").append('"').append(min).append('"');
        }

        if (max != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"max\":").append('"').append(max).append('"');
        }

        if (initValue != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initValue\":").append('"').append(initValue).append('"');
        }

        if (valueId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (hasProp("suggest")) {
            Object suggestValueId = getProp("suggest", "value-id");
            Object suggestDescriptionId = getProp("suggest", "description-id");
            Object suggestIgnoreCase = getProp("suggest", "ignore-case");
            
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"suggest\":").append('{');

            if (suggestValueId != null) {
                propsBuilder.append("\"valueId\":").append('"').append(suggestValueId).append('"');
            }
            
            if (suggestDescriptionId != null) {
                if (propsBuilder.length() > 0) {
                    propsBuilder.append(',');
                }
                propsBuilder.append("\"descriptionId\":").append('"').append(suggestDescriptionId).append('"');
            }

            if (suggestIgnoreCase != null) {
                if (propsBuilder.length() > 0) {
                    propsBuilder.append(',');
                }
                propsBuilder.append("\"ignoreCase\":").append(suggestIgnoreCase);
            }
            propsBuilder.append('}');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (propsBuilder.length() > 0) {
            builder.append(",\"props\":").append('{').append(propsBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
