package com.zionex.t3series.web.view.migration;

import java.util.ArrayList;
import java.util.List;

import com.zionex.t3series.web.view.util.ElementUtil;

import org.jdom2.Element;

public class MigrationForProps implements Migration {

    @Override
    public String getVersion() {
        return "2.0";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            String type = component.getAttributeValue("type");
            if ("CHART".equals(type)) {
                changesChartProps(component);
            } else if ("CHART_PIE".equals(type)) {
                changesPieChartProps(component);
            }

            Element props = new Element("props");

            Element viewModel = component.getChild("view-model");
            if (viewModel != null) {
                List<Element> children = new ArrayList<>(viewModel.getChildren());
                for (Element child : children) {
                    viewModel.removeContent(child);
                    props.addContent(child);
                }
                component.removeContent(viewModel);
            }

            Element model = component.getChild("model");
            if (model != null) {
                List<Element> children = new ArrayList<>(model.getChildren());
                for (Element child : children) {
                    model.removeContent(child);
                    props.addContent(child);
                }
                component.removeContent(model);
            }

            component.addContent(props);
        }
    }

    private void changesChartProps(Element component) {
        Element categoryAxis = ElementUtil.findElement(component, "view-model", "labels", "category-axis");
        if (categoryAxis != null) {
            Element labels = categoryAxis.getParentElement();
            labels.removeContent(categoryAxis);

            Element viewModel = labels.getParentElement();
            viewModel.addContent(categoryAxis);
        }

        Element valueAxis = ElementUtil.findElement(component, "view-model", "labels", "value-axis");
        if (valueAxis != null) {
            Element labels = valueAxis.getParentElement();
            labels.removeContent(valueAxis);

            Element viewModel = labels.getParentElement();
            viewModel.addContent(valueAxis);
        }

        Element serieses = ElementUtil.findElement(component, "view-model", "labels", "serieses");
        if (serieses != null) {
            Element labels = serieses.getParentElement();
            labels.removeContent(serieses);

            Element viewModel = labels.getParentElement();
            viewModel.addContent(serieses);
        }

        Element xAxis = ElementUtil.findElement(component, "view-model", "labels", "x-axis");
        if (xAxis != null) {
            Element labels = xAxis.getParentElement();
            labels.removeContent(xAxis);

            Element viewModel = labels.getParentElement();
            viewModel.addContent(xAxis);
        }

        Element yAxis = ElementUtil.findElement(component, "view-model", "labels", "y-axis");
        if (yAxis != null) {
            Element labels = yAxis.getParentElement();
            labels.removeContent(yAxis);

            Element viewModel = labels.getParentElement();
            viewModel.addContent(yAxis);
        }

        Element labels = ElementUtil.findElement(component, "view-model", "labels");
        if (labels != null) {
            ElementUtil.removeParent(labels);
        }

        List<Element> categories = ElementUtil.findElements(component, "model", "categories", "category");
        for (Element category : new ArrayList<>(categories)) {
            ElementUtil.removeParent(category);

            String fieldId = category.getAttributeValue("field-id");
            if (fieldId == null) {
                continue;
            }

            Element parent = ElementUtil.findAndNewElement(component, "view-model", "category-axis");

            Element foundCategory = null;
            assert parent != null;
            for (Element oldCategory : parent.getChildren("category")) {
                String id = oldCategory.getAttributeValue("id");
                if (fieldId.equals(id)) {
                    foundCategory = oldCategory;
                    break;
                }
            }

            if (foundCategory == null) {
                category.removeAttribute("field-id");
                category.setAttribute("id", fieldId);
                parent.addContent(category);
            } else {
                ElementUtil.moveChildren(category, foundCategory);
            }
        }
        ElementUtil.removeElement(component, "model", "categories");

        Element visible = ElementUtil.findElement(component, "model", "serieses", "visible");
        if (visible != null) {
            ElementUtil.removeParent(visible);
            Element parent = ElementUtil.findAndNewElement(component, "view-model", "serieses");
            assert parent != null;
            parent.addContent(visible);
        }

        Element format = ElementUtil.findElement(component, "model", "serieses", "format");
        if (format != null) {
            ElementUtil.removeParent(format);
            Element parent = ElementUtil.findAndNewElement(component, "view-model", "serieses");
            assert parent != null;
            parent.addContent(format);
        }

        List<Element> modelSerieses = ElementUtil.findElements(component, "model", "serieses", "series");
        for (Element series : new ArrayList<>(modelSerieses)) {
            ElementUtil.removeParent(series);

            String fieldId = series.getAttributeValue("field-id");
            if (fieldId == null) {
                continue;
            }

            Element parent = ElementUtil.findAndNewElement(component, "view-model", "serieses");

            Element foundSeries = null;
            assert parent != null;
            for (Element oldSeries : parent.getChildren("series")) {
                String id = oldSeries.getAttributeValue("id");
                if (fieldId.equals(id)) {
                    foundSeries = oldSeries;
                    break;
                }
            }

            if (foundSeries == null) {
                series.removeAttribute("field-id");
                series.setAttribute("id", fieldId);
                parent.addContent(series);
            } else {
                String noteTextFieldId = series.getAttributeValue("note-text-field-id");
                if (noteTextFieldId != null) {
                    foundSeries.setAttribute("note-text-field-id", noteTextFieldId);
                }
                ElementUtil.moveChildren(series, foundSeries);
            }
        }
        ElementUtil.removeElement(component, "model", "serieses");
    }

    private void changesPieChartProps(Element component) {
        List<Element> serieses = ElementUtil.findElements(component, "model", "serieses", "series");
        for (Element series : serieses) {
            String fieldId = series.getAttributeValue("field-id");
            if (fieldId == null) {
                Element parent = series.getParentElement();
                parent.removeContent(series);
                continue;
            }

            series.removeAttribute("field-id");
            series.setAttribute("id", fieldId);
        }
    }

}
