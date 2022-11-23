package com.zionex.t3series.web.view.v1_2.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

import org.jdom2.Element;

public class Container extends Component {

    private List<ContainerItem> containerItems = new ArrayList<>();

    private boolean existGroupBox = false;

    public Container(String id, String type, String copy) {
        super(id, type, copy);
    }

    public void existGroupBox(boolean existGroupBox) {
        this.existGroupBox = existGroupBox;
    }

    public List<ContainerItem> getContainerItems() {
        return Collections.unmodifiableList(containerItems);
    }

    public void addContainerItem(ContainerItem containerItem) {
        this.containerItems.add(containerItem);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object borderRadius = getProp("group-box", "border-radius");
        Object borderColor = getProp("group-box", "border-color");
        Object borderWith = getProp("group-box", "border-width");
        Object borderStyle = getProp("group-box", "border-style");
        Object title = getProp("group-box", "title");
        Object titlePosition = getProp("group-box", "title-position");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));

        if (borderRadius != null || borderColor != null || borderWith != null || borderStyle != null || title != null || titlePosition != null) {
            Element groupBox = new Element("group-box");

            if (borderRadius != null) groupBox.addContent(new Element("border-radius").setText(borderRadius.toString()));
            if (borderColor != null) groupBox.addContent(new Element("border-color").setText(borderColor.toString()));
            if (borderWith != null) groupBox.addContent(new Element("border-width").setText(borderWith.toString()));
            if (borderStyle != null) groupBox.addContent(new Element("border-style").setText(borderStyle.toString()));
            if (title != null) groupBox.addContent(new Element("title").setText(title.toString()));
            if (titlePosition != null) groupBox.addContent(new Element("title-position").setText(titlePosition.toString()));

            viewModel.addContent(groupBox);
        } else if (existGroupBox) {
            viewModel.addContent(new Element("group-box"));
        }

        Element model = new Element("model");

        if (!containerItems.isEmpty()) {
            Element containers = new Element("containers");
            for (ContainerItem containerItem : containerItems) {
                containers.addContent(containerItem.toElement());
            }
            model.addContent(containers);
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
        Object height = getProp("height");
        
        StringBuilder viewModelBuilder = new StringBuilder();
        
        if (width != null) {
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }
        
        if (height != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }
        
        Object borderRadius = getProp("group-box", "border-radius");
        Object borderColor = getProp("group-box", "border-color");
        Object borderWidth = getProp("group-box", "border-width");
        Object borderStyle = getProp("group-box", "border-style");
        Object title = getProp("group-box", "title");
        Object titlePosition = getProp("group-box", "title-position");

        StringBuilder groupBoxBuilder = new StringBuilder();

        if (borderRadius != null) {
            groupBoxBuilder.append("\"borderRadius\":").append('"').append(borderRadius).append('"');
        }

        if (borderColor != null) {
            if(groupBoxBuilder.length() > 0) {
                groupBoxBuilder.append(',');
            }
            groupBoxBuilder.append("\"borderColor\":").append('"').append(borderColor).append('"');
        }

        if (borderWidth != null) {
            if(groupBoxBuilder.length() > 0) {
                groupBoxBuilder.append(',');
            }
            groupBoxBuilder.append("\"borderWidth\":").append('"').append(borderWidth).append('"');
        }

        if (borderStyle != null) {
            if(groupBoxBuilder.length() > 0) {
                groupBoxBuilder.append(',');
            }
            groupBoxBuilder.append("\"borderStyle\":").append('"').append(borderStyle).append('"');
        }

        if (title != null) {
            if(groupBoxBuilder.length() > 0) {
                groupBoxBuilder.append(',');
            }
            groupBoxBuilder.append("\"title\":").append('"').append(title).append('"');
        }

        if (titlePosition != null) {
            if(groupBoxBuilder.length() > 0) {
                groupBoxBuilder.append(',');
            }
            groupBoxBuilder.append("\"titlePosition\":").append('"').append(titlePosition).append('"');
        }

        if (groupBoxBuilder.length() > 0) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupBox\":").append('{').append(groupBoxBuilder.toString()).append('}');
        } else if (existGroupBox) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupBox\":").append("{}");
        }

        StringBuilder modelBuilder = new StringBuilder();

        if (!containerItems.isEmpty()) {
            modelBuilder.append("\"containers\":[");

            for (int i = 0; i < containerItems.size(); i++) {
                ContainerItem containerItem = containerItems.get(i);

                String json = containerItem.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                if (i > 0) {
                    modelBuilder.append(',');
                }
                modelBuilder.append(json);
            }
            modelBuilder.append(']');
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
