package com.zionex.t3series.web.view.v2_0;

import org.jdom2.Element;

import java.util.List;

import com.zionex.t3series.web.view.v2_0.component.Action;
import com.zionex.t3series.web.view.v2_0.component.Component;
import com.zionex.t3series.web.view.v2_0.component.Operation;

public class ViewUtil {

    public static Element toFontElement(Component component) {
        if (!component.hasProp("font")) {
            return null;
        }

        Element font = new Element("font");

        Object bold = component.getProp("font", "bold");
        if (bold != null) {
            font.addContent(new Element("bold").setText(bold.toString()));
        }

        Object italic = component.getProp("font", "italic");
        if (italic != null) {
            font.addContent(new Element("italic").setText(italic.toString()));
        }

        Object size = component.getProp("font", "size");
        if (size != null) {
            font.addContent(new Element("size").setText(size.toString()));
        }

        Object color = component.getProp("font", "color");
        if (color != null) {
            font.addContent(new Element("color").setText(color.toString()));
        }
        return font;
    }

    public static void addContentAction(Element element, Component component) {
        List<Action> actions = component.getActions();
        if (!actions.isEmpty()) {
            Element actionsElement = new Element("actions");
            for (Action action : actions) {
                actionsElement.addContent(action.toElement());
            }
            element.addContent(actionsElement);
        }
    }

    public static void addContentOperation(Element element, Component component) {
        List<Operation> operations = component.getOperations();
        if (!operations.isEmpty()) {
            Element operationsElement = new Element("operations");
            for (Operation operation : operations) {
                operationsElement.addContent(operation.toElement());
            }
            element.addContent(operationsElement);
        }
    }

    public static String toFontJson(Component component) {
        if (!component.hasProp("font")) {
            return "";
        }

        StringBuilder builder = new StringBuilder();

        Object bold = component.getProp("font", "bold");
        if (bold != null) {
            builder.append("\"bold\":").append(bold.toString());
        }

        Object italic = component.getProp("font", "italic");
        if (italic != null) {
            if (builder.length() > 0) {
                builder.append(',');
            }
            builder.append("\"italic\":").append(italic.toString());
        }

        Object size = component.getProp("font", "size");
        if (size != null) {
            if (builder.length() > 0) {
                builder.append(',');
            }
            builder.append("\"size\":").append(size.toString());
        }

        Object color = component.getProp("font", "color");
        if (color != null) {
            if (builder.length() > 0) {
                builder.append(',');
            }
            builder.append("\"color\":").append('"').append(color.toString()).append('"');
        }

        return builder.length() > 0 ? "{" + builder.toString() + "}" : "";
    }

    public static String toJsonAction(Component component) {
        List<Action> actions = component.getActions();
        if (actions.isEmpty()) {
            return "";
        }

        StringBuilder builder = new StringBuilder();

        builder.append("\"actions\":").append('{');
        for (int i = 0; i < actions.size(); i++) {
            Action action = actions.get(i);
            if (i > 0) {
                builder.append(',');
            }
            builder.append('"').append(action.getEventType()).append("\":").append(action.toJson());
        }
        builder.append('}');

        return builder.toString();
    }

    public static String toJsonOperation(Component component) {
        List<Operation> operations = component.getOperations();
        if (operations.isEmpty()) {
            return "";
        }

        StringBuilder builder = new StringBuilder();

        builder.append("\"operations\":").append('{');
        for (int i = 0; i < operations.size(); i++) {
            Operation operation = operations.get(i);
            if (i > 0) {
                builder.append(',');
            }
            builder.append('"').append(operation.getId()).append("\":").append(operation.toJson());
        }
        builder.append('}');

        return builder.toString();
    }

}
