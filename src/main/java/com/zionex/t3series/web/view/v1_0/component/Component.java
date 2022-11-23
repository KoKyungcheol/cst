package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Component extends Properties implements Configurable {

    private final String id;
    private final String type;
    private final String copy;

    private final List<Action> actions = new ArrayList<>();
    private final List<Operation> operations = new ArrayList<>();

    public Component(String id, String type, String copy) {
        if (copy == null) {
            copy = "";
        }

        this.id = id;
        this.type = type;
        this.copy = copy;
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public String getCopy() {
        return copy;
    }

    public Action getAction(String eventType) {
        for (Action action : actions) {
            if (eventType.equals(action.getEventType())) {
                return action;
            }
        }
        return null;
    }

    public List<Action> getActions() {
        return Collections.unmodifiableList(actions);
    }

    public void addAction(Action action) {
        actions.add(action);
    }

    public Operation getOperation(String id) {
        for (Operation operation : operations) {
            if (id.equals(operation.getId())) {
                return operation;
            }
        }
        return null;
    }

    public List<Operation> getOperations() {
        return Collections.unmodifiableList(operations);
    }

    public void addOperation(Operation operation) {
        operations.add(operation);
    }

    @Override
    public Element toElement() {
        Element component = new Element("component");

        component.setAttribute("id", id);
        component.setAttribute("type", type);

        if (!copy.isEmpty()) {
            component.setAttribute("copy", copy);
        }

        return component;
    }

    @Override
    public String toJson() {
        return "";
    }

}
