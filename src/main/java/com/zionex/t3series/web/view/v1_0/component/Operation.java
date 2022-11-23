package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Operation extends Properties implements Configurable {

    private final String id;
    private final Map<String, ServiceCall> serviceCalls = new HashMap<>();
    private final List<ReferenceServiceCall> referenceServiceCalls = new ArrayList<>();

    private final List<UIOperation> uiOperations = new ArrayList<>();

    private String type;

    public Operation(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public List<ServiceCall> getServiceCalls() {
        return Collections.unmodifiableList(new ArrayList<ServiceCall>(serviceCalls.values()));
    }

    public void addServiceCall(ServiceCall serviceCall) {
        serviceCalls.put(serviceCall.getId(), serviceCall);
    }

    public void removeServiceCall(String serviceCallId) {
        serviceCalls.remove(serviceCallId);
    }

    public List<ReferenceServiceCall> getReferenceServiceCalls() {
        return Collections.unmodifiableList(referenceServiceCalls);
    }

    public void addReferenceServiceCall(ReferenceServiceCall referenceServiceCall) {
        referenceServiceCalls.add(referenceServiceCall);
    }

    public List<UIOperation> getUIOperations() {
        return Collections.unmodifiableList(uiOperations);
    }

    public void addUIOperation(UIOperation uiOperation) {
        uiOperations.add(uiOperation);
    }

    @Override
    public Element toElement() {
        Element operationElement = new Element("operation");

        operationElement.setAttribute("id", id);

        if (type != null) {
            operationElement.setAttribute("operation-type", type);
        }

        Object position = getProp("position");
        Object editOnCell = getProp("edit-on-cell");
        Object fileName = getProp("file-name");
        Object currentPage = getProp("current-page");
        Object relieveMerge = getProp("relieve-merge");
        Object allColumns = getProp("all-columns");
        Object exportFooter = getProp("export-footer");
        Object exportLookup = getProp("export-lookup");

        if (position != null) operationElement.addContent(new Element("position").setText(position.toString()));
        if (editOnCell != null) operationElement.addContent(new Element("edit-on-cell").setText(editOnCell.toString()));
        if (fileName != null) operationElement.addContent(new Element("file-name").setText(fileName.toString()));
        if (currentPage != null) operationElement.addContent(new Element("current-page").setText(currentPage.toString()));
        if (relieveMerge != null) operationElement.addContent(new Element("relieve-merge").setText(relieveMerge.toString()));
        if (allColumns != null) operationElement.addContent(new Element("all-columns").setText(allColumns.toString()));
        if (exportFooter != null) operationElement.addContent(new Element("export-footer").setText(exportFooter.toString()));
        if (exportLookup != null) operationElement.addContent(new Element("export-lookup").setText(exportLookup.toString()));

        for (ServiceCall serviceCall : serviceCalls.values()) {
            operationElement.addContent(serviceCall.toElement());
        }

        for (ReferenceServiceCall referenceServiceCall : referenceServiceCalls) {
            operationElement.addContent(referenceServiceCall.toElement());
        }

        for (UIOperation uiOperation : uiOperations) {
            operationElement.addContent(uiOperation.toElement());
        }

        return operationElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
