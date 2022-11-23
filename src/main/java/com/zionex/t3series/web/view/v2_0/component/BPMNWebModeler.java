package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class BPMNWebModeler extends Component {

    private Toolbar toolbar;

    public BPMNWebModeler(String id, String type, String copy) {
        super(id, type, copy);
    }

    public Toolbar getToolbar() {
        return toolbar;
    }

    public void setToolbar(Toolbar toolbar) {
        this.toolbar = toolbar;
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object height = getProp("height");

        Element props = new Element("props");

        if (height != null ) props.addContent(new Element("height").setText(height.toString()));

        if (toolbar != null) {
            props.addContent(toolbar.toElement());
        }

        Object editable = getProp("editable");

        if (editable != null) props.addContent(new Element("editable").setText(editable.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object height = getProp("height");

        StringBuilder propsBuilder = new StringBuilder();

        if (height != null) {
            propsBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (toolbar != null) {
            String toolbarJson = toolbar.toJson();
            if (!toolbarJson.isEmpty()) {
                if (propsBuilder.length() > 0) {
                    propsBuilder.append(',');
                }
                propsBuilder.append(toolbarJson);
            }
        }

        Object editable = getProp("editable");

        if (editable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"editable\":").append(editable);
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
