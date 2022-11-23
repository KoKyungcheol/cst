package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class ToolbarButton extends Properties implements Configurable {

    private final String operationId;

    private final List<OperationCall> successOperationCalls = new ArrayList<>();
    private final List<OperationCall> failOperationCalls = new ArrayList<>();
    private final List<OperationCall> completeOperationCalls = new ArrayList<>();

    public ToolbarButton(String operationId) {
        this.operationId = operationId;
    }

    public String getOperationId() {
        return operationId;
    }

    public List<OperationCall> getSuccessOperationCall() {
        return Collections.unmodifiableList(successOperationCalls);
    }

    public void addSuccessOperationCall(OperationCall operationCall) {
        successOperationCalls.add(operationCall);
    }

    public List<OperationCall> getFailOperationCall() {
        return Collections.unmodifiableList(failOperationCalls);
    }

    public void addFailOperationCall(OperationCall operationCall) {
        failOperationCalls.add(operationCall);
    }

    public List<OperationCall> getCompleteOperationCall() {
        return Collections.unmodifiableList(completeOperationCalls);
    }

    public void addCompleteOperationCall(OperationCall operationCall) {
        completeOperationCalls.add(operationCall);
    }

    @Override
    public Element toElement() {
        Element toolbarButtonElement = new Element("toolbar-button");

        toolbarButtonElement.setAttribute("operation-id", operationId);

        Object actionType = getProp(".action-type");
        Object enable = getProp(".enable");
        Object visible = getProp(".visible");
        Object position = getProp(".position");
        Object tooltip = getProp(".tooltip");

        if (actionType != null) toolbarButtonElement.setAttribute("action-type", actionType.toString());
        if (enable != null) toolbarButtonElement.setAttribute("enable", enable.toString());
        if (visible != null) toolbarButtonElement.setAttribute("visible", visible.toString());
        if (position != null) toolbarButtonElement.setAttribute("position", position.toString());
        if (tooltip != null) toolbarButtonElement.setAttribute("tooltip", tooltip.toString());

        if (!successOperationCalls.isEmpty()) {
            Element successElement = new Element("success");
            for (OperationCall successOperationCall : successOperationCalls) {
                successElement.addContent(successOperationCall.toElement());
            }
            toolbarButtonElement.addContent(successElement);
        }

        if (!failOperationCalls.isEmpty()) {
            Element failElement = new Element("fail");
            for (OperationCall failOperationCall : failOperationCalls) {
                failElement.addContent(failOperationCall.toElement());
            }
            toolbarButtonElement.addContent(failElement);
        }

        if (!completeOperationCalls.isEmpty()) {
            Element completeElement = new Element("complete");
            for (OperationCall completeOperationCall : completeOperationCalls) {
                completeElement.addContent(completeOperationCall.toElement());
            }
            toolbarButtonElement.addContent(completeElement);
        }

        return toolbarButtonElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
