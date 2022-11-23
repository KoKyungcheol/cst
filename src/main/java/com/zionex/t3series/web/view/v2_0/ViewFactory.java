package com.zionex.t3series.web.view.v2_0;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.ElementUtil;
import com.zionex.t3series.web.view.util.ViewCreator;
import com.zionex.t3series.web.view.v2_0.component.Action;
import com.zionex.t3series.web.view.v2_0.component.BPMNWebModeler;
import com.zionex.t3series.web.view.v2_0.component.Button;
import com.zionex.t3series.web.view.v2_0.component.CheckBox;
import com.zionex.t3series.web.view.v2_0.component.ComboBox;
import com.zionex.t3series.web.view.v2_0.component.Component;
import com.zionex.t3series.web.view.v2_0.component.Condition;
import com.zionex.t3series.web.view.v2_0.component.Container;
import com.zionex.t3series.web.view.v2_0.component.ContainerItem;
import com.zionex.t3series.web.view.v2_0.component.Data;
import com.zionex.t3series.web.view.v2_0.component.DatePicker;
import com.zionex.t3series.web.view.v2_0.component.Editor;
import com.zionex.t3series.web.view.v2_0.component.FileUpload;
import com.zionex.t3series.web.view.v2_0.component.Image;
import com.zionex.t3series.web.view.v2_0.component.InputBox;
import com.zionex.t3series.web.view.v2_0.component.KFileUpload;
import com.zionex.t3series.web.view.v2_0.component.Label;
import com.zionex.t3series.web.view.v2_0.component.Operation;
import com.zionex.t3series.web.view.v2_0.component.OperationCall;
import com.zionex.t3series.web.view.v2_0.component.Option;
import com.zionex.t3series.web.view.v2_0.component.Parameter;
import com.zionex.t3series.web.view.v2_0.component.Radio;
import com.zionex.t3series.web.view.v2_0.component.ReferenceOperationCall;
import com.zionex.t3series.web.view.v2_0.component.ReferenceServiceCall;
import com.zionex.t3series.web.view.v2_0.component.Scheduler;
import com.zionex.t3series.web.view.v2_0.component.ServiceCall;
import com.zionex.t3series.web.view.v2_0.component.Split;
import com.zionex.t3series.web.view.v2_0.component.SplitItem;
import com.zionex.t3series.web.view.v2_0.component.Tab;
import com.zionex.t3series.web.view.v2_0.component.TabItem;
import com.zionex.t3series.web.view.v2_0.component.Textarea;
import com.zionex.t3series.web.view.v2_0.component.Toolbar;
import com.zionex.t3series.web.view.v2_0.component.ToolbarButton;
import com.zionex.t3series.web.view.v2_0.component.Tree;
import com.zionex.t3series.web.view.v2_0.component.URLPage;
import com.zionex.t3series.web.view.v2_0.component.Window;
import com.zionex.t3series.web.view.v2_0.component.chart.CategoryAxis;
import com.zionex.t3series.web.view.v2_0.component.chart.Chart;
import com.zionex.t3series.web.view.v2_0.component.chart.PieChart;
import com.zionex.t3series.web.view.v2_0.component.chart.PieSeries;
import com.zionex.t3series.web.view.v2_0.component.chart.Series;
import com.zionex.t3series.web.view.v2_0.component.chart.ValueAxis;
import com.zionex.t3series.web.view.v2_0.component.grid.Apply;
import com.zionex.t3series.web.view.v2_0.component.grid.Candidate;
import com.zionex.t3series.web.view.v2_0.component.grid.CellAttribute;
import com.zionex.t3series.web.view.v2_0.component.grid.Column;
import com.zionex.t3series.web.view.v2_0.component.grid.DateLimit;
import com.zionex.t3series.web.view.v2_0.component.grid.Grid;
import com.zionex.t3series.web.view.v2_0.component.grid.Iteration;
import com.zionex.t3series.web.view.v2_0.component.grid.TreeGrid;
import com.zionex.t3series.web.view.v2_0.component.grid.Validation;

import org.jdom2.Element;

public class ViewFactory implements ViewCreator {
    private ViewFactory() {
    }

    public static ViewFactory getViewFactory() {
        return LazyHolder.INSTANCE;
    }

    private static class LazyHolder {
        private static final ViewFactory INSTANCE = new ViewFactory();
    }

    @Override
    public View create(Element root) {
        String id = root.getAttributeValue("id");
        String template = root.getAttributeValue("template");
        String copyfrom = root.getAttributeValue("copyfrom");
        String include = root.getAttributeValue("include");

        Element publishElement = root.getChild("publish");

        Publish publish = null;
        if (publishElement != null) {
            boolean open = Boolean.parseBoolean(publishElement.getAttributeValue("open"));
            int seq = Integer.parseInt(publishElement.getAttributeValue("seq"));

            publish = new Publish(open, seq);

            String parent = publishElement.getAttributeValue("parent");
            if (parent != null) {
                publish.setParent(parent);
            }

            String icon = publishElement.getAttributeValue("icon");
            if (icon != null) {
                publish.setIcon(icon);
            }
        }

        View view = new View(id, template, copyfrom, include, publish);

        Element aliases = root.getChild("service-target-aliases");
        if (aliases != null) {
            for (Element alias : aliases.getChildren("alias")) {
                String from = alias.getAttributeValue("from");
                String to = alias.getAttributeValue("to");
                if (from != null && to != null) {
                    view.addServiceTargetAlias(new ServiceTargetAlias(from, to));
                }
            }
        }

        for (Element element : root.getChildren("component")) {
            Component component = createComponent(element);
            if (component == null) {
                continue;
            }

            List<Action> actions = createActions(element);
            if (actions != null) {
                for (Action action : actions) {
                    component.addAction(action);
                }
            }

            List<Operation> operations = createOperations(element);
            if (operations != null) {
                for (Operation operation : operations) {
                    component.addOperation(operation);
                }
            }

            view.addComponent(component);
        }
        return view;
    }

    public Component createComponent(Element element) {
        String type = element.getAttributeValue("type");
        switch (type) {
            case "SCHEDULER":
                return createScheduler(element);

            case "DATA":
                return createData(element);

            case "IMG":
                return createImage(element);

            case "LABEL":
                return createLabel(element);

            case "INPUTBOX":
                return createInputBox(element);

            case "BUTTON":
                return createButton(element);

            case "COMBOBOX":
                return createComboBox(element);

            case "CHECKBOX":
                return createCheckBox(element);

            case "RADIO":
                return createRadio(element);

            case "DATEPICKER":
                return createDatePicker(element);

            case "FILEUPLOAD":
                return createFileUpload(element);

            case "K_FILEUPLOAD":
                return createKFileUpload(element);

            case "TEXTAREA":
                return createTextarea(element);

            case "EDITOR":
                return createEditor(element);

            case "TREE":
                return createTree(element);

            case "CHART":
                return createChart(element);

            case "CHART_PIE":
                return createPieChart(element);

            case "R_GRID":
                return createGrid(element);

            case "R_TREE":
                return createTreeGrid(element);

            case "BPMN_WEB_MODELER":
                return createBPMNWebModeler(element);

            case "TAB":
                return createTab(element);

            case "CONTAINER":
                return createContainer(element);

            case "SPLIT":
                return createSplit(element);

            case "URL_PAGE":
                return createURLPage(element);

            case "WINDOW":
                return createWindow(element);
        }

        return null;
    }

    public List<Option> createInitValueOptions(Element initValueElement) {
        List<Option> initValueOptions = new ArrayList<>();
        for (Element optionElement : initValueElement.getChildren("option")) {
            String value = optionElement.getAttributeValue("value");
            if (value == null) {
                continue;
            }

            Option option = new Option(value);

            option.setProp(".text", ElementUtil.findString(optionElement, ".text"));
            option.setProp(".text-position", ElementUtil.findString(optionElement, ".text-position"));
            option.setProp(".selected", ElementUtil.findBoolean(optionElement, ".selected"));

            initValueOptions.add(option);
        }
        return initValueOptions;
    }

    public List<Parameter> createParameters(Element parametersElement) {
        List<Parameter> parameters = new ArrayList<>();
        for (Element parameterElement : parametersElement.getChildren("parameter")) {
            String id = parameterElement.getAttributeValue("id");
            if (id != null) {
                Parameter parameter = new Parameter(id);

                parameter.setProp(".value", ElementUtil.findString(parameterElement, ".value"));
                parameter.setProp(".reference-id", ElementUtil.findString(parameterElement, ".reference-id"));
                parameter.setProp(".reference-data", ElementUtil.findString(parameterElement, ".reference-data"));
                parameter.setProp(".extract-by", ElementUtil.findString(parameterElement, ".extract-by"));
                parameter.setProp(".row-extract", ElementUtil.findString(parameterElement, ".row-extract"));
                parameter.setProp(".delimiter", ElementUtil.findString(parameterElement, ".delimiter"));
                parameter.setProp(".default-value", ElementUtil.findString(parameterElement, ".default-value"));

                parameters.add(parameter);
            }
        }
        return parameters;
    }

    public List<Condition> createConditions(Element conditionsElement) {
        List<Condition> conditions = new ArrayList<>();
        for (Element conditionElement : conditionsElement.getChildren("condition")) {
            String id = conditionElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Condition condition = new Condition(id);

            condition.setProp(".group", ElementUtil.findString(conditionElement, ".group"));
            condition.setProp("component", ElementUtil.findString(conditionElement, "component"));
            condition.setProp("key", ElementUtil.findString(conditionElement, "key"));
            condition.setProp("on-column", ElementUtil.findString(conditionElement, "on-column"));
            condition.setProp("column", ElementUtil.findString(conditionElement, "column"));
            condition.setProp("operator", ElementUtil.findString(conditionElement, "operator"));
            condition.setProp("value", ElementUtil.findString(conditionElement, "value"));
            condition.setProp("extract-by", ElementUtil.findString(conditionElement, "extract-by"));
            condition.setProp("msg", ElementUtil.findString(conditionElement, "msg"));

            conditions.add(condition);
        }
        return conditions;
    }

    public List<Apply> createApplies(Element appliesElement) {
        List<Apply> applies = new ArrayList<>();
        for (Element applyElement : appliesElement.getChildren("apply")) {
            String id = applyElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Apply apply = new Apply(id);

            apply.setProp("column", ElementUtil.findString(applyElement, "column"));
            apply.setProp(new String[] { "attrs", "editable" }, ElementUtil.findBoolean(applyElement, "attrs", "editable"));
            apply.setProp(new String[] { "attrs", "background" }, ElementUtil.findString(applyElement, "attrs", "background"));
            apply.setProp(new String[] { "attrs", "foreground" }, ElementUtil.findString(applyElement, "attrs", "foreground"));
            apply.setProp(new String[] { "attrs", "fontSize" }, ElementUtil.findString(applyElement, "attrs", "fontSize"));
            apply.setProp(new String[] { "attrs", "fontBold" }, ElementUtil.findString(applyElement, "attrs", "fontBold"));
            apply.setProp(new String[] { "attrs", "textAlignment" }, ElementUtil.findString(applyElement, "attrs", "textAlignment"));

            applies.add(apply);
        }
        return applies;
    }

    public List<ToolbarButton> createToolbarButtons(Element toolbarElement) {
        List<ToolbarButton> toolbarButtons = new ArrayList<>();
        for (Element toolbarButtonElement : toolbarElement.getChildren("toolbar-button")) {
            String operationId = toolbarButtonElement.getAttributeValue("operation-id");
            if (operationId == null) {
                continue;
            }

            ToolbarButton toolbarButton = new ToolbarButton(operationId);

            toolbarButton.setProp(".action-type", ElementUtil.findString(toolbarButtonElement, ".action-type"));
            toolbarButton.setProp(".enable", ElementUtil.findBoolean(toolbarButtonElement, ".enable"));
            toolbarButton.setProp(".visible", ElementUtil.findBoolean(toolbarButtonElement, ".visible"));
            toolbarButton.setProp(".position", ElementUtil.findString(toolbarButtonElement, ".position"));
            toolbarButton.setProp(".tooltip", ElementUtil.findString(toolbarButtonElement, ".tooltip"));

            Element successElement = toolbarButtonElement.getChild("success");
            if (successElement != null) {
                List<OperationCall> operationCalls = createOperationCalls(successElement);
                for (OperationCall operationCall : operationCalls) {
                    toolbarButton.addSuccessOperationCall(operationCall);
                }
            }

            Element failElement = toolbarButtonElement.getChild("fail");
            if (failElement != null) {
                List<OperationCall> operationCalls = createOperationCalls(failElement);
                for (OperationCall operationCall : operationCalls) {
                    toolbarButton.addFailOperationCall(operationCall);
                }
            }

            Element completeElement = toolbarButtonElement.getChild("complete");
            if (completeElement != null) {
                List<OperationCall> operationCalls = createOperationCalls(completeElement);
                for (OperationCall operationCall : operationCalls) {
                    toolbarButton.addCompleteOperationCall(operationCall);
                }
            }

            toolbarButtons.add(toolbarButton);
        }
        return toolbarButtons;
    }

    public List<Column> createColumns(Element columnsElement, boolean isTreeColumn) {
        if (columnsElement == null) {
            return Collections.emptyList();
        }

        List<Column> columns = new ArrayList<>();
        for (Element columnElement : columnsElement.getChildren("column")) {
            String id = columnElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Column column = new Column(id);

            column.setTreeColumn(isTreeColumn);

            column.setProp(".title", columnElement.getAttributeValue("title"));
            column.setProp(".type", columnElement.getAttributeValue("type"));

            if (!isTreeColumn) {
                column.setProp(".sort", columnElement.getAttributeValue("sort"));
            }

            column.setProp(".use-number-comparer", columnElement.getAttributeValue("use-number-comparer"));

            column.setProp("width", ElementUtil.findString(columnElement, "width"));
            column.setProp("visible", ElementUtil.findBoolean(columnElement, "visible"));
            column.setProp("editable", ElementUtil.findBoolean(columnElement, "editable"));
            column.setProp("editable.if-new", ElementUtil.findBoolean(columnElement, "editable.if-new"));
            column.setProp("text-alignment", ElementUtil.findString(columnElement, "text-alignment"));
            column.setProp("button", ElementUtil.findBoolean(columnElement, "button"));
            column.setProp("lang", ElementUtil.findBoolean(columnElement, "lang"));
            column.setProp("fix", ElementUtil.findBoolean(columnElement, "fix"));
            column.setProp("font-bold", ElementUtil.findBoolean(columnElement, "font-bold"));
            column.setProp("background", ElementUtil.findString(columnElement, "background"));
            column.setProp("foreground", ElementUtil.findString(columnElement, "foreground"));
            column.setProp("header-background", ElementUtil.findString(columnElement, "header-background"));
            column.setProp("header-foreground", ElementUtil.findString(columnElement, "header-foreground"));
            column.setProp("masking", ElementUtil.findBoolean(columnElement, "masking"));

            if (!isTreeColumn) {
                column.setProp("merge", ElementUtil.findBoolean(columnElement, "merge"));
            }

            column.setProp("filterable", ElementUtil.findBoolean(columnElement, "filterable"));
            column.setProp("tooltip", ElementUtil.findString(columnElement, "tooltip"));
            column.setProp("lookup", ElementUtil.findString(columnElement, "lookup"));
            column.setProp("calc", ElementUtil.findString(columnElement, "calc"));
            column.setProp("format", ElementUtil.findString(columnElement, "format"));
            column.setProp("positive-only", ElementUtil.findString(columnElement, "positive-only"));
            column.setProp("datepicker", ElementUtil.findBoolean(columnElement, "datepicker"));
            column.setProp("excel-format", ElementUtil.findString(columnElement, "excel-format"));
            column.setProp("header-checkable", ElementUtil.findBoolean(columnElement, "header-checkable"));
            column.setProp("header-checker-position", ElementUtil.findString(columnElement, "header-checker-position"));
            column.setProp("check-exclusive", ElementUtil.findString(columnElement, "check-exclusive"));
            column.setProp("groups", ElementUtil.findString(columnElement, "groups"));

            if (!isTreeColumn) {
                column.setProp("init-group-order", ElementUtil.findString(columnElement, "init-group-order"));
            }

            column.setProp("grid-summary-exp", ElementUtil.findString(columnElement, "grid-summary-exp"));

            if (!isTreeColumn) {
                column.setProp("group-summary-exp", ElementUtil.findString(columnElement, "group-summary-exp"));
            }

            Element candidateElement = columnElement.getChild("candidate");
            if (candidateElement != null && candidateElement.getContentSize() > 0) {
                Candidate candidate = createCandidate(candidateElement);
                column.setCandidate(candidate);
            }

            Element dateLimitElement = columnElement.getChild("date-limit");
            if (dateLimitElement != null && dateLimitElement.getContentSize() > 0) {
                DateLimit dateLimit = createDateLimit(dateLimitElement);
                column.setDateLimit(dateLimit);
            }

            Element iterationElement = columnElement.getChild("iteration");
            if (iterationElement != null && iterationElement.getContentSize() > 0) {
                Iteration iteration = createIteration(iterationElement);
                column.setIteration(iteration);
            }

            Element validationsElement = columnElement.getChild("validations");
            if (validationsElement != null) {
                List<Validation> validations = createValidations(validationsElement);
                for (Validation validation : validations) {
                    column.addValidation(validation);
                }
            }

            columns.add(column);
        }
        return columns;
    }

    public Candidate createCandidate(Element candidateElement) {
        Candidate candidate = new Candidate();

        Element initValueElement = candidateElement.getChild("init-value");
        if (initValueElement != null) {
            List<Option> initValueOptions = createInitValueOptions(initValueElement);
            for (Option initValueOption : initValueOptions) {
                candidate.addInitValueOption(initValueOption);
            }
        }

        Element valuesElement = candidateElement.getChild("values");
        if (valuesElement != null) {
            candidate.setProp(new String[] { "values", "value-id" }, ElementUtil.findString(candidateElement, "values", "value-id"));
            candidate.setProp(new String[] { "values", "text-id" }, ElementUtil.findString(candidateElement, "values", "text-id"));

            List<ServiceCall> serviceCalls = createServiceCalls(valuesElement);
            if (!serviceCalls.isEmpty()) {
                candidate.setServiceCall(serviceCalls.get(0));
            }

            List<ReferenceServiceCall> referenceServiceCalls = createReferenceServiceCalls(valuesElement);
            if (!referenceServiceCalls.isEmpty()) {
                candidate.setReferenceServiceCall(referenceServiceCalls.get(0));
            }
        }

        candidate.setProp("drop-down-count", ElementUtil.findString(candidateElement, "drop-down-count"));
        candidate.setProp("reference-column", ElementUtil.findString(candidateElement, "reference-column"));

        return candidate;
    }

    public DateLimit createDateLimit(Element dateLimitElement) {
        DateLimit dateLimit = new DateLimit();

        dateLimit.setProp(new String[] { "init-value", "min-date" }, ElementUtil.findString(dateLimitElement, "init-value", "min-date"));
        dateLimit.setProp(new String[] { "init-value", "max-date" }, ElementUtil.findString(dateLimitElement, "init-value", "max-date"));

        Element valuesElement = dateLimitElement.getChild("values");
        if (valuesElement != null) {
            dateLimit.setProp(new String[] { "values", "min-date" }, ElementUtil.findString(valuesElement, "min-date"));
            dateLimit.setProp(new String[] { "values", "max-date" }, ElementUtil.findString(valuesElement, "max-date"));

            List<ServiceCall> serviceCalls = createServiceCalls(valuesElement);
            if (!serviceCalls.isEmpty()) {
                dateLimit.setServiceCall(serviceCalls.get(0));
            }

            List<ReferenceServiceCall> referenceServiceCalls = createReferenceServiceCalls(valuesElement);
            if (!referenceServiceCalls.isEmpty()) {
                dateLimit.setReferenceServiceCall(referenceServiceCalls.get(0));
            }
        }
        return dateLimit;
    }

    public Iteration createIteration(Element iterationElement) {
        Iteration iteration = new Iteration();

        for (Element prefixElement : iterationElement.getChildren("prefix")) {
            String prefix = prefixElement.getText();

            String remove = prefixElement.getAttributeValue("remove");
            if (remove == null) {
                iteration.addPrefixInfo(new Object[] { prefix });
            } else {
                iteration.addPrefixInfo(new Object[] { prefix, Boolean.valueOf(remove) });
            }
        }

        for (Element postfixElement : iterationElement.getChildren("postfix")) {
            String postfix = postfixElement.getText();

            String remove = postfixElement.getAttributeValue("remove");
            if (remove == null) {
                iteration.addPostfixInfo(new Object[] { postfix });
            } else {
                iteration.addPostfixInfo(new Object[] { postfix, Boolean.valueOf(remove) });
            }
        }

        iteration.setProp("delimiter", ElementUtil.findString(iterationElement, "delimiter"));
        iteration.setProp("header-seq", ElementUtil.findString(iterationElement, "header-seq"));
        iteration.setProp("group", ElementUtil.findString(iterationElement, "group"));
        iteration.setProp("groups", ElementUtil.findString(iterationElement, "groups"));
        iteration.setProp("apply-color", ElementUtil.findString(iterationElement, "apply-color"));

        String ordinalPosition = ElementUtil.findString(iterationElement, "ordinal-position");
        if (ordinalPosition != null && !ordinalPosition.trim().isEmpty()) {
            ordinalPosition = ordinalPosition.trim().replaceAll("\\s+", "");
            iteration.setProp("ordinal-position", ordinalPosition);
        }

        return iteration;
    }

    public List<Validation> createValidations(Element validationsElement) {
        List<Validation> validations = new ArrayList<>();
        for (Element validationElement : validationsElement.getChildren("validation")) {
            String id = validationElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Validation validation = new Validation(id);

            validation.setProp("operator", ElementUtil.findString(validationElement, "operator"));
            validation.setProp("value", ElementUtil.findString(validationElement, "value"));
            validation.setProp("message", ElementUtil.findString(validationElement, "message"));

            validations.add(validation);
        }
        return validations;
    }

    public List<OperationCall> createOperationCalls(Element targetElement) {
        List<OperationCall> operationCalls = new ArrayList<>();
        for (Element operationCallElement : targetElement.getChildren("operation-call")) {
            String id = operationCallElement.getAttributeValue("id");
            String componentId = operationCallElement.getChildText("component-id");
            String operationId = operationCallElement.getChildText("operation-id");

            if (id != null && componentId != null && operationId != null) {
                OperationCall operationCall = new OperationCall(id, componentId, operationId);

                Element parametersElement = operationCallElement.getChild("parameters");
                if (parametersElement != null) {
                    List<Parameter> parameters = createParameters(parametersElement);
                    for (Parameter parameter : parameters) {
                        operationCall.addParameter(parameter);
                    }
                }

                Element conditionsElement = operationCallElement.getChild("conditions");
                if (conditionsElement != null) {
                    List<Condition> conditions = createConditions(conditionsElement);
                    for (Condition condition : conditions) {
                        operationCall.addCondition(condition);
                    }
                }

                Element successElement = operationCallElement.getChild("success");
                if (successElement != null) {
                    List<OperationCall> successOperationCalls = createOperationCalls(successElement);
                    for (OperationCall successOperationCall : successOperationCalls) {
                        operationCall.addSuccessOperationCall(successOperationCall);
                    }
                }

                Element failElement = operationCallElement.getChild("fail");
                if (failElement != null) {
                    List<OperationCall> failOperationCalls = createOperationCalls(failElement);
                    for (OperationCall failOperationCall : failOperationCalls) {
                        operationCall.addFailOperationCall(failOperationCall);
                    }
                }

                Element completeElement = operationCallElement.getChild("complete");
                if (completeElement != null) {
                    List<OperationCall> completeOperationCalls = createOperationCalls(completeElement);
                    for (OperationCall completeOperationCall : completeOperationCalls) {
                        operationCall.addCompleteOperationCall(completeOperationCall);
                    }
                }

                operationCalls.add(operationCall);
            }
        }
        return operationCalls;
    }

    public List<ReferenceOperationCall> createReferenceOperationCalls(Element targetElement) {
        List<ReferenceOperationCall> referenceOperationCalls = new ArrayList<>();
        for (Element operationCallElement : targetElement.getChildren("reference-operation-call")) {
            String id = operationCallElement.getAttributeValue("id");
            if (id != null) {
                referenceOperationCalls.add(new ReferenceOperationCall(id));
            }
        }
        return referenceOperationCalls;
    }

    public List<ServiceCall> createServiceCalls(Element targetElement) {
        List<ServiceCall> serviceCalls = new ArrayList<>();
        for (Element serviceCallElement : targetElement.getChildren("service-call")) {
            String id = serviceCallElement.getAttributeValue("id");

            String serviceId = serviceCallElement.getChildText("service-id");
            String serviceTarget = serviceCallElement.getChildText("service-target");

            String serviceUrl = serviceCallElement.getChildText("url");
            String serviceMethod = serviceCallElement.getChildText("method");

            if (id != null) {
                ServiceCall serviceCall = new ServiceCall(id);

                if (serviceId != null) {
                    serviceCall.setServiceId(serviceId);
                }

                if (serviceTarget != null) {
                    serviceCall.setServiceTarget(serviceTarget);
                }

                if (serviceUrl != null) {
                    serviceCall.setServiceUrl(serviceUrl);
                }

                if (serviceMethod != null) {
                    serviceCall.setServiceMethod(serviceMethod);
                }

                Element parametersElement = serviceCallElement.getChild("parameters");
                if (parametersElement != null) {
                    List<Parameter> parameters = createParameters(parametersElement);
                    for (Parameter parameter : parameters) {
                        serviceCall.addParameter(parameter);
                    }
                }

                String paramEmptyCheck = serviceCallElement.getChildText("param-empty-check");
                if (paramEmptyCheck != null) {
                    serviceCall.setParamEmptyCheck(paramEmptyCheck);
                }

                String resultDataKey = serviceCallElement.getChildText("result-data-key");
                if (resultDataKey != null) {
                    serviceCall.setResultDataKey(resultDataKey);
                }

                String editOnCell = serviceCallElement.getChildText("edit-on-cell");
                if (editOnCell != null) {
                    serviceCall.setEditOnCell(Boolean.valueOf(editOnCell));
                }

                String position = serviceCallElement.getChildText("position");
                if (position != null) {
                    serviceCall.setPosition(position);
                }

                serviceCalls.add(serviceCall);
            }
        }
        return serviceCalls;
    }

    public List<ReferenceServiceCall> createReferenceServiceCalls(Element targetElement) {
        List<ReferenceServiceCall> referenceServiceCalls = new ArrayList<>();
        for (Element referenceServiceCallElement : targetElement.getChildren("reference-service-call")) {
            String id = referenceServiceCallElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            ReferenceServiceCall feferenceServiceCall = new ReferenceServiceCall(id);

            String extract = referenceServiceCallElement.getAttributeValue("extract");
            String resultDataKey = ElementUtil.findString(referenceServiceCallElement, "result-data-key");

            feferenceServiceCall.setExtract(extract);
            feferenceServiceCall.setResultDataKey(resultDataKey);

            referenceServiceCalls.add(feferenceServiceCall);
        }
        return referenceServiceCalls;
    }

    public List<Action> createActions(Element element) {
        Element actionsElements = element.getChild("actions");
        if (actionsElements == null) {
            return null;
        }

        List<Action> actions = new ArrayList<>();
        for (Element actionElement : actionsElements.getChildren("action")) {
            String eventType = actionElement.getAttributeValue("event-type");
            if (eventType == null) {
                continue;
            }

            Action action = new Action(eventType);

            String actionType = actionElement.getAttributeValue("action-type");
            if (actionType != null) {
                action.setActionType(actionType);
            }

            String repeatSec = actionElement.getAttributeValue("repeat-sec");
            if (repeatSec != null) {
                action.setRepeatSec(Integer.valueOf(repeatSec));
            }

            List<OperationCall> operationCalls = createOperationCalls(actionElement);
            for (OperationCall operationCall : operationCalls) {
                action.addOperationCall(operationCall);
            }

            List<ReferenceOperationCall> referenceOperationCalls = createReferenceOperationCalls(actionElement);
            for (ReferenceOperationCall referenceOperationCall : referenceOperationCalls) {
                action.addReferenceOperationCall(referenceOperationCall);
            }

            actions.add(action);
        }
        return actions;
    }

    public List<Operation> createOperations(Element element) {
        Element operationsElement = element.getChild("operations");
        if (operationsElement == null) {
            return null;
        }

        List<Operation> operations = new ArrayList<>();
        for (Element operationElement : operationsElement.getChildren("operation")) {
            String id = operationElement.getAttributeValue("id");
            if ("INIT".equalsIgnoreCase(id)) {
                continue;
            }

            Operation operation = new Operation(id);

            String permissionType = operationElement.getAttributeValue("operation-type");
            if (permissionType == null) {
                permissionType = operationElement.getAttributeValue("permission-type");
            }

            if (permissionType != null) {
                operation.setPermissionType(permissionType);
            }

            operation.setProp("position", ElementUtil.findString(operationElement, "position"));
            operation.setProp("edit-on-cell", ElementUtil.findBoolean(operationElement, "edit-on-cell"));
            operation.setProp("file-name", ElementUtil.findString(operationElement, "file-name"));
            operation.setProp("current-page", ElementUtil.findBoolean(operationElement, "current-page"));
            operation.setProp("relieve-merge", ElementUtil.findBoolean(operationElement, "relieve-merge"));
            operation.setProp("all-columns", ElementUtil.findBoolean(operationElement, "all-columns"));
            operation.setProp("export-footer", ElementUtil.findBoolean(operationElement, "export-footer"));
            operation.setProp("export-lookup", ElementUtil.findBoolean(operationElement, "export-lookup"));

            List<ServiceCall> serviceCalls = createServiceCalls(operationElement);
            for (ServiceCall serviceCall : serviceCalls) {
                operation.addServiceCall(serviceCall);
            }

            List<ReferenceServiceCall> referenceServiceCalls = createReferenceServiceCalls(operationElement);
            for (ReferenceServiceCall referenceServiceCall : referenceServiceCalls) {
                operation.addReferenceServiceCall(referenceServiceCall);
            }

            operations.add(operation);
        }
        return operations;
    }

    public Scheduler createScheduler(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        return new Scheduler(id, type, copy);
    }

    public Data createData(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Data data = new Data(id, type, copy);
        return data;
    }

    public Image createImage(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Image image = new Image(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            image.setProp("image", ElementUtil.findString(props, "image"));
            image.setProp("init-value", ElementUtil.findString(props, "init-value"));
            image.setProp("value-id", ElementUtil.findString(props, "value-id"));
        }

        return image;
    }

    public Label createLabel(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Label label = new Label(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            label.setProp("width", ElementUtil.findString(props, "width"));
            label.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            label.setProp("position", ElementUtil.findString(props, "position"));
            label.setProp("tooltip", ElementUtil.findString(props, "tooltip"));
            label.setProp("icon", ElementUtil.findString(props, "icon"));

            label.setProp(new String[] { "font", "bold" }, ElementUtil.findBoolean(props, "font", "bold"));
            label.setProp(new String[] { "font", "italic" }, ElementUtil.findBoolean(props, "font", "italic"));
            label.setProp(new String[] { "font", "size" }, ElementUtil.findInteger(props, "font", "size"));
            label.setProp(new String[] { "font", "color" }, ElementUtil.findString(props, "font", "color"));

            label.setProp("init-value", ElementUtil.findString(props, "init-value"));
            label.setProp("value-id", ElementUtil.findString(props, "value-id"));
            label.setProp("format", ElementUtil.findString(props, "format"));
        }

        return label;
    }

    public InputBox createInputBox(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        InputBox inputBox = new InputBox(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            inputBox.setProp("width", ElementUtil.findString(props, "width"));
            inputBox.setProp("name", ElementUtil.findString(props, "name"));
            inputBox.setProp("name-position", ElementUtil.findString(props, "name-position"));
            inputBox.setProp("placeholder", ElementUtil.findString(props, "placeholder"));
            inputBox.setProp("editable", ElementUtil.findBoolean(props, "editable"));
            inputBox.setProp("hidden", ElementUtil.findBoolean(props, "hidden"));
            inputBox.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            inputBox.setProp("background", ElementUtil.findString(props, "background"));

            inputBox.setProp(new String[] { "font", "bold" }, ElementUtil.findBoolean(props, "font", "bold"));
            inputBox.setProp(new String[] { "font", "italic" }, ElementUtil.findBoolean(props, "font", "italic"));
            inputBox.setProp(new String[] { "font", "size" }, ElementUtil.findInteger(props, "font", "size"));
            inputBox.setProp(new String[] { "font", "color" }, ElementUtil.findString(props, "font", "color"));

            inputBox.setProp("type", ElementUtil.findString(props, "type"));
            inputBox.setProp("min", ElementUtil.findString(props, "min"));
            inputBox.setProp("max", ElementUtil.findString(props, "max"));
            inputBox.setProp("init-value", ElementUtil.findString(props, "init-value"));
            inputBox.setProp("value-id", ElementUtil.findString(props, "value-id"));

            inputBox.setProp(new String[] { "suggest", "value-id" }, ElementUtil.findString(props, "suggest", "value-id"));
            inputBox.setProp(new String[] { "suggest", "description-id" }, ElementUtil.findString(props, "suggest", "description-id"));
            inputBox.setProp(new String[] { "suggest", "ignore-case" }, ElementUtil.findBoolean(props, "suggest", "ignore-case"));
        }

        return inputBox;
    }

    public Button createButton(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Button button = new Button(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            button.setProp("width", ElementUtil.findString(props, "width"));
            button.setProp("name", ElementUtil.findString(props, "name"));
            button.setProp("tooltip", ElementUtil.findString(props, "tooltip"));
            button.setProp("icon", ElementUtil.findString(props, "icon"));
            button.setProp("disable", ElementUtil.findBoolean(props, "disable"));
            button.setProp("visible", ElementUtil.findBoolean(props, "visible"));
            button.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            button.setProp("background", ElementUtil.findString(props, "background"));

            button.setProp(new String[] { "font", "bold" }, ElementUtil.findBoolean(props, "font", "bold"));
            button.setProp(new String[] { "font", "italic" }, ElementUtil.findBoolean(props, "font", "italic"));
            button.setProp(new String[] { "font", "size" }, ElementUtil.findInteger(props, "font", "size"));
            button.setProp(new String[] { "font", "color" }, ElementUtil.findString(props, "font", "color"));
        }

        return button;
    }

    public ComboBox createComboBox(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        ComboBox comboBox = new ComboBox(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            comboBox.setProp("width", ElementUtil.findString(props, "width"));
            comboBox.setProp("name", ElementUtil.findString(props, "name"));
            comboBox.setProp("name-position", ElementUtil.findString(props, "name-position"));
            comboBox.setProp("placeholder", ElementUtil.findString(props, "placeholder"));
            comboBox.setProp("editable", ElementUtil.findBoolean(props, "editable"));
            comboBox.setProp("enable", ElementUtil.findBoolean(props, "enable"));
            comboBox.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            comboBox.setProp("select-index", ElementUtil.findString(props, "select-index"));
            comboBox.setProp("dropdown-height", ElementUtil.findInteger(props, "dropdown-height"));

            Element initValueElement = props.getChild("init-value");
            if (initValueElement != null) {
                List<Option> initValueOptions = createInitValueOptions(initValueElement);
                for (Option initValueOption : initValueOptions) {
                    comboBox.addInitValueOption(initValueOption);
                }
            }

            comboBox.setProp("value-id", ElementUtil.findString(props, "value-id"));
            comboBox.setProp("text-id", ElementUtil.findString(props, "text-id"));
            comboBox.setProp("text-id.sort", ElementUtil.findString(props, "text-id.sort"));
            comboBox.setProp("select-id", ElementUtil.findString(props, "select-id"));
            comboBox.setProp("ignore-case", ElementUtil.findBoolean(props, "ignore-case"));
            comboBox.setProp("tooltip", ElementUtil.findString(props, "tooltip"));
        }

        return comboBox;
    }

    public CheckBox createCheckBox(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        CheckBox checkBox = new CheckBox(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            checkBox.setProp("name", ElementUtil.findString(props, "name"));
            checkBox.setProp("name-position", ElementUtil.findString(props, "name-position"));
            checkBox.setProp("editable", ElementUtil.findBoolean(props, "editable"));
            checkBox.setProp("lang", ElementUtil.findBoolean(props, "lang"));

            checkBox.setProp("init-value", ElementUtil.findBoolean(props, "init-value"));
            checkBox.setProp("value-id", ElementUtil.findString(props, "value-id"));
            checkBox.setProp("text-id", ElementUtil.findString(props, "text-id"));
        }

        return checkBox;
    }

    public Radio createRadio(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Radio radio = new Radio(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            radio.setProp("name", ElementUtil.findString(props, "name"));
            radio.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            radio.setProp("option-deployment", ElementUtil.findString(props, "option-deployment"));

            Element initValueElement = props.getChild("init-value");
            if (initValueElement != null) {
                List<Option> initValueOptions = createInitValueOptions(initValueElement);
                for (Option initValueOption : initValueOptions) {
                    radio.addInitValueOption(initValueOption);
                }
            }

            radio.setProp("value-id", ElementUtil.findString(props, "value-id"));
            radio.setProp("text-id", ElementUtil.findString(props, "text-id"));
            radio.setProp("select-id", ElementUtil.findString(props, "select-id"));
        }

        return radio;
    }

    public DatePicker createDatePicker(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        DatePicker datePicker = new DatePicker(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            datePicker.setProp("width", ElementUtil.findString(props, "width"));
            datePicker.setProp("name", ElementUtil.findString(props, "name"));
            datePicker.setProp("name-position", ElementUtil.findString(props, "name-position"));
            datePicker.setProp("editable", ElementUtil.findBoolean(props, "editable"));
            datePicker.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            datePicker.setProp("date-type", ElementUtil.findString(props, "date-type"));
            datePicker.setProp("date-format", ElementUtil.findString(props, "date-format"));

            datePicker.setProp("init-value", ElementUtil.findString(props, "init-value"));
            datePicker.setProp("value-id", ElementUtil.findString(props, "value-id"));
            datePicker.setProp("base-value", ElementUtil.findString(props, "base-value"));
        }

        return datePicker;
    }

    public FileUpload createFileUpload(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        FileUpload fileUpload = new FileUpload(id, type, copy);

        return fileUpload;
    }

    public KFileUpload createKFileUpload(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        KFileUpload kFileUpload = new KFileUpload(id, type, copy);

        return kFileUpload;
    }

    public Textarea createTextarea(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Textarea textarea = new Textarea(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            textarea.setProp("width", ElementUtil.findString(props, "width"));
            textarea.setProp("height", ElementUtil.findString(props, "height"));
            textarea.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            textarea.setProp("editable", ElementUtil.findBoolean(props, "editable"));
            textarea.setProp("placeholder", ElementUtil.findString(props, "placeholder"));
            textarea.setProp("name", ElementUtil.findString(props, "name"));
            textarea.setProp("name-position", ElementUtil.findString(props, "name-position"));

            textarea.setProp("value-id", ElementUtil.findString(props, "value-id"));
            textarea.setProp(new String[] { "init-value", "data" }, ElementUtil.findString(props, "init-value", "data"));
        }

        return textarea;
    }

    public Editor createEditor(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Editor editor = new Editor(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            editor.setProp("width", ElementUtil.findString(props, "width"));
            editor.setProp("height", ElementUtil.findString(props, "height"));
            editor.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            editor.setProp("editable", ElementUtil.findBoolean(props, "editable"));
            editor.setProp("paste-option", ElementUtil.findString(props, "paste-option"));
            editor.setProp("toolbar.use", ElementUtil.findBoolean(props, "toolbar.use"));

            editor.setProp("value-id", ElementUtil.findString(props, "value-id"));
            editor.setProp("value-type", ElementUtil.findString(props, "value-type"));
            editor.setProp(new String[] { "init-value", "data" }, ElementUtil.findString(props, "init-value", "data"));
        }

        return editor;
    }

    public Tree createTree(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Tree tree = new Tree(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            tree.setProp("width", ElementUtil.findString(props, "width"));
            tree.setProp("height", ElementUtil.findString(props, "height"));
            tree.setProp("checkbox", ElementUtil.findBoolean(props, "checkbox"));

            tree.setProp("value-id", ElementUtil.findString(props, "value-id"));
            tree.setProp("value-id.sort", ElementUtil.findString(props, "value-id.sort"));
            tree.setProp("text-id", ElementUtil.findString(props, "text-id"));
            tree.setProp("text-id.sort", ElementUtil.findString(props, "text-id.sort"));
            tree.setProp("getvalue-concat", ElementUtil.findString(props, "getvalue-concat"));
        }

        return tree;
    }

    public Chart createChart(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Chart chart = new Chart(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            chart.setProp("title", ElementUtil.findString(props, "title"));
            chart.setProp("height", ElementUtil.findString(props, "height"));
            chart.setProp("theme", ElementUtil.findString(props, "theme"));
            chart.setProp("default-type", ElementUtil.findString(props, "default-type"));
            chart.setProp("series-width", ElementUtil.findInteger(props, "series-width"));
            chart.setProp(new String[] { "border", "width" }, ElementUtil.findString(props, "border", "width"));
            chart.setProp(new String[] { "border", "color" }, ElementUtil.findString(props, "border", "color"));
            chart.setProp(new String[] { "legend", "visible" }, ElementUtil.findBoolean(props, "legend", "visible"));
            chart.setProp(new String[] { "legend", "position" }, ElementUtil.findString(props, "legend", "position"));
            chart.setProp(new String[] { "legend", "hidden", "field-id" }, ElementUtil.findString(props, "legend", "hidden", "field-id"));
            chart.setProp(new String[] { "tooltip", "visible" }, ElementUtil.findBoolean(props, "tooltip", "visible"));
            chart.setProp(new String[] { "tooltip", "format" }, ElementUtil.findString(props, "tooltip", "format"));

            chart.setProp(new String[] { "category-axis", "title", "text" }, ElementUtil.findString(props, "category-axis", "title", "text"));
            chart.setProp(new String[] { "category-axis", "title", "font" }, ElementUtil.findString(props, "category-axis", "title", "font"));
            chart.setProp(new String[] { "category-axis", "title", "color" }, ElementUtil.findString(props, "category-axis", "title", "color"));
            chart.setProp(new String[] { "category-axis", "rotation" }, ElementUtil.findString(props, "category-axis", "rotation"));

            chart.setProp(new String[] { "value-axis", "title", "text" }, ElementUtil.findString(props, "value-axis", "title", "text"));
            chart.setProp(new String[] { "value-axis", "title", "font" }, ElementUtil.findString(props, "value-axis", "title", "font"));
            chart.setProp(new String[] { "value-axis", "title", "color" },  ElementUtil.findString(props, "value-axis", "title", "color"));
            chart.setProp(new String[] { "value-axis", "axis-crossing-value" }, ElementUtil.findString(props, "value-axis", "axis-crossing-value"));
            chart.setProp(new String[] { "value-axis", "format" }, ElementUtil.findString(props, "value-axis", "format"));
            chart.setProp(new String[] { "value-axis", "min" }, ElementUtil.findInteger(props, "value-axis", "min"));
            chart.setProp(new String[] { "value-axis", "max" }, ElementUtil.findInteger(props, "value-axis", "max"));

            chart.setProp(new String[] { "x-axis", "format" }, ElementUtil.findString(props, "x-axis", "format"));
            chart.setProp(new String[] { "x-axis", "axis-crossing-value" }, ElementUtil.findString(props, "x-axis", "axis-crossing-value"));
            chart.setProp(new String[] { "y-axis", "format" }, ElementUtil.findString(props, "y-axis", "format"));

            Element categoryAxisElement = props.getChild("category-axis");
            if (categoryAxisElement != null) {
                for (Element categoryElement : categoryAxisElement.getChildren("category")) {
                    String categoryId = categoryElement.getAttributeValue("id");
                    if (categoryId == null) {
                        continue;
                    }

                    CategoryAxis categoryAxis = new CategoryAxis(categoryId);

                    categoryAxis.setProp(new String[] { "title", "text" }, ElementUtil.findString(categoryElement, "title", "text"));
                    categoryAxis.setProp(new String[] { "title", "font" }, ElementUtil.findString(categoryElement, "title", "font"));
                    categoryAxis.setProp(new String[] { "title", "color" }, ElementUtil.findString(categoryElement, "title", "color"));
                    categoryAxis.setProp("rotation", ElementUtil.findString(categoryElement, "rotation"));
                    categoryAxis.setProp("base-unit", ElementUtil.findString(categoryElement, "base-unit"));
                    categoryAxis.setProp("base-unit-step", ElementUtil.findString(categoryElement, "base-unit-step"));
                    categoryAxis.setProp("format", ElementUtil.findString(categoryElement, "format"));
                    categoryAxis.setProp("type", ElementUtil.findString(categoryElement, "type"));
                    categoryAxis.setProp("date-group", ElementUtil.findBoolean(categoryElement, "date-group"));
                    categoryAxis.setProp("sort-direction", ElementUtil.findString(categoryElement, "sort-direction"));

                    chart.addCategoryAxis(categoryAxis);
                }
            }

            Element valueAxisElement = props.getChild("value-axis");
            if (valueAxisElement != null) {
                for (Element valueElement : valueAxisElement.getChildren("value")) {
                    String valueId = valueElement.getAttributeValue("id");
                    if (valueId == null) {
                        continue;
                    }

                    ValueAxis valueAxis = new ValueAxis(valueId);

                    valueAxis.setProp(new String[] { "title", "text" }, ElementUtil.findString(valueElement, "title", "text"));
                    valueAxis.setProp(new String[] { "title", "font" }, ElementUtil.findString(valueElement, "title", "font"));
                    valueAxis.setProp(new String[] { "title", "color" }, ElementUtil.findString(valueElement, "title", "color"));
                    valueAxis.setProp("axis-crossing-value", ElementUtil.findString(valueElement, "axis-crossing-value"));
                    valueAxis.setProp("visible", ElementUtil.findBoolean(valueElement, "visible"));
                    valueAxis.setProp("format", ElementUtil.findString(valueElement, "format"));
                    valueAxis.setProp("min", ElementUtil.findInteger(valueElement, "min"));
                    valueAxis.setProp("max", ElementUtil.findInteger(valueElement, "max"));

                    chart.addValueAxis(valueAxis);
                }
            }

            for (Element seriesElement : ElementUtil.findElements(props, "serieses", "series")) {
                String seriesId = seriesElement.getAttributeValue("id");
                if (seriesId == null) {
                    continue;
                }

                Series series = new Series(seriesId);

                series.setProp(".note-text-field-id", ElementUtil.findString(seriesElement, ".note-text-field-id"));
                series.setProp("chart-type.type", ElementUtil.findString(seriesElement, "chart-type.type"));
                series.setProp(new String[] { "chart-type", "stack" }, ElementUtil.findBoolean(seriesElement, "chart-type", "stack"));
                series.setProp(new String[] { "chart-type", "line-style" }, ElementUtil.findString(seriesElement, "chart-type", "line-style"));
                series.setProp("type", ElementUtil.findString(seriesElement, "type"));
                series.setProp("criteria-axis", ElementUtil.findString(seriesElement, "criteria-axis"));
                series.setProp("x-field", ElementUtil.findString(seriesElement, "x-field"));
                series.setProp("y-field", ElementUtil.findString(seriesElement, "y-field"));
                series.setProp("category-field", ElementUtil.findString(seriesElement, "category-field"));
                series.setProp("visible", ElementUtil.findBoolean(seriesElement, "visible"));
                series.setProp("format", ElementUtil.findString(seriesElement, "format"));

                chart.addSeries(series);
            }

            chart.setProp("data-group-id", ElementUtil.findString(props, "data-group-id"));
            chart.setProp(new String[] { "serieses", "visible" }, ElementUtil.findString(props, "serieses", "visible"));
            chart.setProp(new String[] { "serieses", "format" }, ElementUtil.findString(props, "serieses", "format"));
        }

        return chart;
    }

    public PieChart createPieChart(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        PieChart pieChart = new PieChart(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            pieChart.setProp("title", ElementUtil.findString(props, "title"));
            pieChart.setProp("title-position", ElementUtil.findString(props, "title-position"));
            pieChart.setProp("height", ElementUtil.findString(props, "height"));
            pieChart.setProp("theme", ElementUtil.findString(props, "theme"));
            pieChart.setProp(new String[] { "border", "width" }, ElementUtil.findString(props, "border", "width"));
            pieChart.setProp(new String[] { "border", "color" }, ElementUtil.findString(props, "border", "color"));
            pieChart.setProp(new String[] { "legend", "visible" }, ElementUtil.findBoolean(props, "legend", "visible"));
            pieChart.setProp(new String[] { "legend", "position" }, ElementUtil.findString(props, "legend", "position"));
            pieChart.setProp(new String[] { "labels", "visible" }, ElementUtil.findBoolean(props, "labels", "visible"));
            pieChart.setProp(new String[] { "labels", "position" }, ElementUtil.findString(props, "labels", "position"));
            pieChart.setProp(new String[] { "labels", "percentage" }, ElementUtil.findBoolean(props, "labels", "percentage"));
            pieChart.setProp(new String[] { "tooltip", "visible" }, ElementUtil.findBoolean(props, "tooltip", "visible"));
            pieChart.setProp(new String[] { "tooltip", "format" }, ElementUtil.findString(props, "tooltip", "format"));

            Element seriesesElement = props.getChild("serieses");
            if (seriesesElement != null) {
                for (Element seriesElement : seriesesElement.getChildren("series")) {
                    String seriesId = seriesElement.getAttributeValue("id");
                    if (seriesId == null) {
                        continue;
                    }

                    PieSeries series = new PieSeries(seriesId);

                    series.setProp("category-field", ElementUtil.findString(seriesElement, "category-field"));

                    pieChart.addPieSeries(series);
                }
            }
        }

        return pieChart;
    }

    public Grid createGrid(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Grid grid = new Grid(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            /* General Properties */
            grid.setProp("height", ElementUtil.findString(props, "height"));
            grid.setProp("header-height", ElementUtil.findString(props, "header-height"));
            grid.setProp("ignore-change", ElementUtil.findBoolean(props, "ignore-change"));
            grid.setProp("selection-mode", ElementUtil.findString(props, "selection-mode"));
            grid.setProp("indicator", ElementUtil.findBoolean(props, "indicator"));
            grid.setProp("state-bar", ElementUtil.findBoolean(props, "state-bar"));
            grid.setProp("check-bar", ElementUtil.findBoolean(props, "check-bar"));
            grid.setProp("check-exclusive", ElementUtil.findBoolean(props, "check-exclusive"));
            grid.setProp("fit-style", ElementUtil.findString(props, "fit-style"));
            grid.setProp("data-fit", ElementUtil.findString(props, "data-fit"));
            grid.setProp("header-sortable", ElementUtil.findBoolean(props, "header-sortable"));
            grid.setProp("show-row-count", ElementUtil.findBoolean(props, "show-row-count"));

            /* Paging Properties */
            grid.setProp("pageable", ElementUtil.findBoolean(props, "pageable"));
            grid.setProp("page-row-count", ElementUtil.findInteger(props, "page-row-count"));
            grid.setProp("paging-mode", ElementUtil.findString(props, "paging-mode"));

            /* Summary Properties */
            grid.setProp("grid-summary", ElementUtil.findBoolean(props, "grid-summary"));
            grid.setProp("grid-summary-on-header", ElementUtil.findBoolean(props, "grid-summary-on-header"));
            grid.setProp("grid-summary-mode", ElementUtil.findString(props, "grid-summary-mode"));

            /* Row Grouping Properties */
            grid.setProp("groupable", ElementUtil.findBoolean(props, "groupable"));
            grid.setProp("group-header", ElementUtil.findBoolean(props, "group-header"));
            grid.setProp("group-summary", ElementUtil.findBoolean(props, "group-summary"));
            grid.setProp("group-summary-on-header", ElementUtil.findBoolean(props, "group-summary-on-header"));
            grid.setProp("group-sort", ElementUtil.findBoolean(props, "group-sort"));
            grid.setProp("group-summary-mode", ElementUtil.findString(props, "group-summary-mode"));
            grid.setProp("group-header-text", ElementUtil.findString(props, "group-header-text"));
            grid.setProp("group-footer-text", ElementUtil.findString(props, "group-footer-text"));
            grid.setProp("group-merge-mode", ElementUtil.findBoolean(props, "group-merge-mode"));
            grid.setProp("group-level-style", ElementUtil.findBoolean(props, "group-level-style"));
            grid.setProp("group-expander", ElementUtil.findBoolean(props, "group-expander"));

            /* Chart Properties */
            grid.setProp("chart-height", ElementUtil.findString(props, "chart-height"));
            grid.setProp("measure-column", ElementUtil.findString(props, "measure-column"));

            List<Element> cellAttributeElements = ElementUtil.findElements(props, "cell-attributes", "cell-attribute");
            for (Element cellAttributeElement : cellAttributeElements) {
                String cellAttributeId = cellAttributeElement.getAttributeValue("id");
                if (cellAttributeId == null) {
                    continue;
                }

                CellAttribute cellAttribute = new CellAttribute(cellAttributeId);

                Element conditionsElement = cellAttributeElement.getChild("conditions");
                if (conditionsElement != null) {
                    List<Condition> conditions = createConditions(conditionsElement);
                    for (Condition condition : conditions) {
                        cellAttribute.addCondition(condition);
                    }
                }

                Element appliesElement = cellAttributeElement.getChild("applies");
                if (appliesElement != null) {
                    List<Apply> applies = createApplies(appliesElement);
                    for (Apply apply : applies) {
                        cellAttribute.addApply(apply);
                    }
                }

                grid.addCellAttribute(cellAttribute);
            }

            Element toolbarElement = props.getChild("toolbar");
            if (toolbarElement != null) {
                Toolbar toolbar = new Toolbar();

                toolbar.setProp(".use", ElementUtil.findBoolean(toolbarElement, ".use"));

                List<ToolbarButton> toolbarButtons = createToolbarButtons(toolbarElement);
                for (ToolbarButton toolbarButton : toolbarButtons) {
                    toolbar.addToolbarButton(toolbarButton);
                }

                grid.setToolbar(toolbar);
            }

            Element columnsElement = props.getChild("columns");

            List<Column> columns = createColumns(columnsElement, false);
            for (Column column : columns) {
                grid.addColumn(column);
            }
        }

        return grid;
    }

    public TreeGrid createTreeGrid(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        TreeGrid treeGrid = new TreeGrid(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            /* General Properties */
            treeGrid.setProp("height", ElementUtil.findString(props, "height"));
            treeGrid.setProp("header-height", ElementUtil.findString(props, "header-height"));
            treeGrid.setProp("indicator", ElementUtil.findBoolean(props, "indicator"));
            treeGrid.setProp("state-bar", ElementUtil.findBoolean(props, "state-bar"));
            treeGrid.setProp("check-bar", ElementUtil.findBoolean(props, "check-bar"));
            treeGrid.setProp("fit-style", ElementUtil.findString(props, "fit-style"));
            treeGrid.setProp("data-fit", ElementUtil.findString(props, "data-fit"));
            treeGrid.setProp("header-sortable", ElementUtil.findBoolean(props, "header-sortable"));
            treeGrid.setProp("init-expand-level", ElementUtil.findString(props, "init-expand-level"));
            treeGrid.setProp("selection-mode", ElementUtil.findString(props, "selection-mode"));
            treeGrid.setProp("show-row-count", ElementUtil.findBoolean(props, "show-row-count"));

            /* Summary Properties */
            treeGrid.setProp("grid-summary", ElementUtil.findBoolean(props, "grid-summary"));
            treeGrid.setProp("grid-summary-mode", ElementUtil.findString(props, "grid-summary-mode"));

            List<Element> cellAttributeElements = ElementUtil.findElements(props, "cell-attributes", "cell-attribute");
            for (Element cellAttributeElement : cellAttributeElements) {
                String cellAttributeId = cellAttributeElement.getAttributeValue("id");
                if (cellAttributeId == null) {
                    continue;
                }

                CellAttribute cellAttribute = new CellAttribute(cellAttributeId);

                Element conditionsElement = cellAttributeElement.getChild("conditions");
                if (conditionsElement != null) {
                    List<Condition> conditions = createConditions(conditionsElement);
                    for (Condition condition : conditions) {
                        cellAttribute.addCondition(condition);
                    }
                }

                Element appliesElement = cellAttributeElement.getChild("applies");
                if (appliesElement != null) {
                    List<Apply> applies = createApplies(appliesElement);
                    for (Apply apply : applies) {
                        cellAttribute.addApply(apply);
                    }
                }

                treeGrid.addCellAttribute(cellAttribute);
            }

            Element toolbarElement = props.getChild("toolbar");
            if (toolbarElement != null) {
                Toolbar toolbar = new Toolbar();

                toolbar.setProp(".use", ElementUtil.findBoolean(toolbarElement, ".use"));

                List<ToolbarButton> toolbarButtons = createToolbarButtons(toolbarElement);
                for (ToolbarButton toolbarButton : toolbarButtons) {
                    toolbar.addToolbarButton(toolbarButton);
                }

                treeGrid.setToolbar(toolbar);
            }

            Element columnsElement = props.getChild("columns");

            List<Column> columns = createColumns(columnsElement, true);
            for (Column column : columns) {
                treeGrid.addColumn(column);
            }
        }

        return treeGrid;
    }

    public BPMNWebModeler createBPMNWebModeler(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        BPMNWebModeler bpmnWebModeler = new BPMNWebModeler(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            bpmnWebModeler.setProp("height", ElementUtil.findString(props, "height"));

            Element toolbarElement = props.getChild("toolbar");
            if (toolbarElement != null) {
                Toolbar toolbar = new Toolbar();

                toolbar.setProp(".use", ElementUtil.findBoolean(toolbarElement, ".use"));

                List<ToolbarButton> toolbarButtons = createToolbarButtons(toolbarElement);
                for (ToolbarButton toolbarButton : toolbarButtons) {
                    toolbar.addToolbarButton(toolbarButton);
                }

                bpmnWebModeler.setToolbar(toolbar);
            }

            bpmnWebModeler.setProp("editable", ElementUtil.findBoolean(props, "editable"));
        }

        return bpmnWebModeler;
    }

    public Tab createTab(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Tab tab = new Tab(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            tab.setProp("width", ElementUtil.findString(props, "width"));
            tab.setProp("height", ElementUtil.findString(props, "height"));

            String position = ElementUtil.findString(props, "position");
            if (position == null) {
                position = ElementUtil.findString(props, "tabs", "position");
            }
            tab.setProp("position", position);

            List<Element> tabElements = ElementUtil.findElements(props, "tabs", "tab");
            for (Element tabElement : tabElements) {
                String tabId = tabElement.getAttributeValue("id");
                if (tabId == null) {
                    continue;
                }

                TabItem tabItem = new TabItem(tabId);

                tabItem.setProp(".title", ElementUtil.findString(tabElement, ".title"));
                tabItem.setProp(".expand", ElementUtil.findBoolean(tabElement, ".expand"));
                tabItem.setProp(".init-render", ElementUtil.findBoolean(tabElement, ".init-render"));

                tab.addTabItem(tabItem);
            }
        }

        return tab;
    }

    public Container createContainer(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Container container = new Container(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            Element groupBoxElement = ElementUtil.findElement(props, "group-box");
            if (groupBoxElement != null) {
                container.existGroupBox(true);
            }

            container.setProp("width", ElementUtil.findString(props, "width"));
            container.setProp("height", ElementUtil.findString(props, "height"));
            container.setProp(new String[] { "group-box", "border-radius" }, ElementUtil.findString(props, "group-box", "border-radius"));
            container.setProp(new String[] { "group-box", "border-color" }, ElementUtil.findString(props, "group-box", "border-color"));
            container.setProp(new String[] { "group-box", "border-width" }, ElementUtil.findString(props, "group-box", "border-width"));
            container.setProp(new String[] { "group-box", "border-style" }, ElementUtil.findString(props, "group-box", "border-style"));
            container.setProp(new String[] { "group-box", "title" }, ElementUtil.findString(props, "group-box", "title"));
            container.setProp(new String[] { "group-box", "title-position" }, ElementUtil.findString(props, "group-box", "title-position"));

            List<Element> containerElements = ElementUtil.findElements(props, "containers", "container");
            for (Element containerElement : containerElements) {
                String containerId = containerElement.getAttributeValue("id");
                if (containerId == null) {
                    continue;
                }

                ContainerItem containerItem = new ContainerItem(containerId);

                containerItem.setProp(".expand", ElementUtil.findBoolean(containerElement, ".expand"));
                containerItem.setProp(".init-render", ElementUtil.findBoolean(containerElement, ".init-render"));

                container.addContainerItem(containerItem);
            }
        }

        return container;
    }

    public Split createSplit(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Split split = new Split(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            split.setProp("width", ElementUtil.findString(props, "width"));
            split.setProp("height", ElementUtil.findString(props, "height"));

            String position = ElementUtil.findString(props, "position");
            if (position == null) {
                position = ElementUtil.findString(props, "splits", "position");
            }
            split.setProp("position", position);

            List<Element> splitElements = ElementUtil.findElements(props, "splits", "split");
            for (Element splitElement : splitElements) {
                String splitId = splitElement.getAttributeValue("id");
                if (splitId == null) {
                    continue;
                }

                SplitItem splitItem = new SplitItem(splitId);

                splitItem.setProp(".collapsed", ElementUtil.findBoolean(splitElement, ".collapsed"));
                splitItem.setProp(".collapsible", ElementUtil.findBoolean(splitElement, ".collapsible"));
                splitItem.setProp(".resizable", ElementUtil.findBoolean(splitElement, ".resizable"));
                splitItem.setProp(".size", ElementUtil.findString(splitElement, ".size"));

                split.addSplitItem(splitItem);
            }
        }

        return split;
    }

    public URLPage createURLPage(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        URLPage urlPage = new URLPage(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            urlPage.setProp("url", ElementUtil.findString(props, "url"));
            urlPage.setProp("width", ElementUtil.findString(props, "width"));
            urlPage.setProp("height", ElementUtil.findString(props, "height"));
            urlPage.setProp("scroll", ElementUtil.findBoolean(props, "scroll"));
        }

        return urlPage;
    }

    public Window createWindow(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Window window = new Window(id, type, copy);

        Element props = element.getChild("props");
        if (props != null) {
            window.setProp("lang", ElementUtil.findBoolean(props, "lang"));
            window.setProp("title", ElementUtil.findString(props, "title"));
            window.setProp("width", ElementUtil.findString(props, "width"));
            window.setProp("height", ElementUtil.findString(props, "height"));
            window.setProp("visible", ElementUtil.findBoolean(props, "visible"));
            window.setProp("modal", ElementUtil.findBoolean(props, "modal"));
            window.setProp("init-render", ElementUtil.findBoolean(props, "init-render"));
            window.setProp("use-buttons", ElementUtil.findBoolean(props, "use-buttons"));
        }

        return window;
    }
}
