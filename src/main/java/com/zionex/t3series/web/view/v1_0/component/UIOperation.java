package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class UIOperation implements Configurable {

    private final String id;

    private final List<Parameter> parameters = new ArrayList<>();

    private Boolean editOnCell;
    private String position;

    public UIOperation(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public List<Parameter> getParameters() {
        return Collections.unmodifiableList(parameters);
    }

    public void addParameter(Parameter parameter) {
        parameters.add(parameter);
    }

    public Boolean isEditOnCell() {
        return editOnCell;
    }

    public void setEditOnCell(Boolean editOnCell) {
        this.editOnCell = editOnCell;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    @Override
    public Element toElement() {
        Element uiOperationElement = new Element("ui-operation");
        uiOperationElement.setAttribute("id", id);

        if (editOnCell != null) {
            Element editOnCellElement = new Element("edit-on-cell").setText(editOnCell.toString());
            uiOperationElement.addContent(editOnCellElement);
        }

        if (position != null) {
            Element positionElement = new Element("position").setText(position);
            uiOperationElement.addContent(positionElement);
        }

        if (!parameters.isEmpty()) {
            Element parametersElement = new Element("parameters");

            for (Parameter parameter : parameters) {
                parametersElement.addContent(parameter.toElement());
            }

            uiOperationElement.addContent(parametersElement);
        }

        return uiOperationElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
