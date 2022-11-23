package com.zionex.t3series.web.view.v1_0.component.chart;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;
import com.zionex.t3series.web.view.v1_0.component.Component;

import org.jdom2.Element;

public class Chart extends Component {

    private List<CategoryAxis> categoryAxises = new ArrayList<>();
    private List<ValueAxis> valueAxises = new ArrayList<>();

    private List<Category> categories = new ArrayList<>();
    private List<Series> serieses = new ArrayList<>();

    private List<LabelsSeries> labelsSerieses = new ArrayList<>();

    public Chart(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<CategoryAxis> getCategoryAxises() {
        return Collections.unmodifiableList(categoryAxises);
    }

    public void addCategoryAxis(CategoryAxis categoryAxis) {
        categoryAxises.add(categoryAxis);
    }

    public List<ValueAxis> getValueAxises() {
        return Collections.unmodifiableList(valueAxises);
    }

    public void addValueAxis(ValueAxis valueAxis) {
        valueAxises.add(valueAxis);
    }

    public List<Category> getCategories() {
        return Collections.unmodifiableList(categories);
    }

    public void addCategory(Category category) {
        categories.add(category);
    }

    public List<Series> getSerieses() {
        return Collections.unmodifiableList(serieses);
    }

    public void addSeries(Series series) {
        serieses.add(series);
    }

    public List<LabelsSeries> getLabelsSerieses() {
        return Collections.unmodifiableList(labelsSerieses);
    }

    public void addLabelsSeries(LabelsSeries labelsSeries) {
        labelsSerieses.add(labelsSeries);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object title = getProp("title");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object defaultType = getProp("default-type");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object legendHiddenFieldId = getProp("legend", "hidden", "field-id");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        Element viewModel = new Element("view-model");

        if (title != null ) viewModel.addContent(new Element("title").setText(title.toString()));
        if (height != null ) viewModel.addContent(new Element("height").setText(height.toString()));
        if (theme != null ) viewModel.addContent(new Element("theme").setText(theme.toString()));
        if (defaultType != null ) viewModel.addContent(new Element("default-type").setText(defaultType.toString()));

        if (borderWidth != null || borderColor != null) {
            Element borderElement = new Element("border");

            if (borderWidth != null ) borderElement.addContent(new Element("width").setText(borderWidth.toString()));
            if (borderWidth != null ) borderElement.addContent(new Element("color").setText(borderColor.toString()));

            viewModel.addContent(borderElement);
        }

        if (legendVisible != null || legendPosition != null || legendHiddenFieldId != null) {
            Element legendElement = new Element("legend");

            if (legendVisible != null ) legendElement.addContent(new Element("visible").setText(legendVisible.toString()));
            if (legendPosition != null ) legendElement.addContent(new Element("position").setText(legendPosition.toString()));
            if (legendHiddenFieldId != null) {
                Element hiddenElement = new Element("hidden");
                hiddenElement.addContent(new Element("field-id").setText(legendHiddenFieldId.toString()));
                legendElement.addContent(hiddenElement);
            }

            viewModel.addContent(legendElement);
        }

        if (tooptipVisible != null || tooptipFormat != null) {
            Element tooptipElement = new Element("tooltip");

            if (tooptipVisible != null ) tooptipElement.addContent(new Element("visible").setText(tooptipVisible.toString()));
            if (tooptipFormat != null ) tooptipElement.addContent(new Element("format").setText(tooptipFormat.toString()));

            viewModel.addContent(tooptipElement);
        }

        Object categoryAxisText = getProp("labels", "categoryAxis", "title", "text");
        Object categoryAxisFont = getProp("labels", "categoryAxis", "title", "font");
        Object categoryAxisColor = getProp("labels", "categoryAxis", "title", "color");
        Object categoryAxisRotation = getProp("labels", "categoryAxis", "rotation");

        Object valueAxisText = getProp("labels", "valueAxis", "title", "text");
        Object valueAxisFont = getProp("labels", "valueAxis", "title", "font");
        Object valueAxisColor = getProp("labels", "valueAxis", "title", "color");
        Object valueAxisCrossingValue = getProp("labels", "valueAxis", "axisCrossingValue");
        Object valueAxisFormat = getProp("labels", "valueAxis", "format");
        Object valueAxisMin = getProp("labels", "valueAxis", "min");
        Object valueAxisMax = getProp("labels", "valueAxis", "max");

        boolean isCategoryAxis = categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null || categoryAxisRotation != null;
        boolean isValueAxis = valueAxisText != null || valueAxisFont != null || valueAxisColor != null || valueAxisCrossingValue != null || valueAxisFormat != null || valueAxisMin != null || valueAxisMax != null;

        Element labelsElement = null;
        Element categoryAxisElement = null;
        Element valueAxisElement = null;

        if (isCategoryAxis || isValueAxis) {
            labelsElement = new Element("labels");

            if (isCategoryAxis) {
                categoryAxisElement = new Element("categoryAxis");

                if (categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null) {
                    Element titleElement = new Element("title");
                    if (categoryAxisText != null) titleElement.addContent(new Element("text").setText(categoryAxisText.toString()));
                    if (categoryAxisFont != null) titleElement.addContent(new Element("font").setText(categoryAxisFont.toString()));
                    if (categoryAxisColor != null) titleElement.addContent(new Element("color").setText(categoryAxisColor.toString()));
                    categoryAxisElement.addContent(titleElement);
                }

                if (categoryAxisRotation != null) categoryAxisElement.addContent(new Element("rotation").setText(categoryAxisRotation.toString()));

                labelsElement.addContent(categoryAxisElement);
            }

            if (isValueAxis) {
                valueAxisElement = new Element("valueAxis");

                if (valueAxisText != null || valueAxisFont != null || valueAxisColor != null) {
                    Element titleElement = new Element("title");
                    if (valueAxisText != null) titleElement.addContent(new Element("text").setText(valueAxisText.toString()));
                    if (valueAxisFont != null) titleElement.addContent(new Element("font").setText(valueAxisFont.toString()));
                    if (valueAxisColor != null) titleElement.addContent(new Element("color").setText(valueAxisColor.toString()));
                    valueAxisElement.addContent(titleElement);
                }

                if (valueAxisCrossingValue != null) valueAxisElement.addContent(new Element("axisCrossingValue").setText(valueAxisCrossingValue.toString()));
                if (valueAxisFormat != null) valueAxisElement.addContent(new Element("format").setText(valueAxisFormat.toString()));
                if (valueAxisMin != null) valueAxisElement.addContent(new Element("min").setText(valueAxisMin.toString()));
                if (valueAxisMax != null) valueAxisElement.addContent(new Element("max").setText(valueAxisMax.toString()));

                labelsElement.addContent(valueAxisElement);
            }
        }

        if (!categoryAxises.isEmpty() || !valueAxises.isEmpty()) {
            if (labelsElement == null) {
                labelsElement = new Element("labels");
            }

            if (!categoryAxises.isEmpty()) {
                if (categoryAxisElement == null) {
                    categoryAxisElement = new Element("categoryAxis");
                    labelsElement.addContent(categoryAxisElement);
                }

                for (CategoryAxis categoryAxis : categoryAxises) {
                    categoryAxisElement.addContent(categoryAxis.toElement());
                }
            }

            if (!valueAxises.isEmpty()) {
                if (valueAxisElement == null) {
                    valueAxisElement = new Element("valueAxis");
                    labelsElement.addContent(valueAxisElement);
                }

                for (ValueAxis valueAxis : valueAxises) {
                    valueAxisElement.addContent(valueAxis.toElement());
                }
            }
        }

        if (!labelsSerieses.isEmpty()) {
            if (labelsElement == null) {
                labelsElement = new Element("labels");
            }

            Element seriesesElement = new Element("serieses");
            for (LabelsSeries labelsSeries : labelsSerieses) {
                seriesesElement.addContent(labelsSeries.toElement());
            }
            labelsElement.addContent(seriesesElement);
        }

        Object xAxisFormat = getProp("labels", "xAxis", "format");
        Object xAxisCrossingValue = getProp("labels", "xAxis", "axis-crossing-value");
        Object yAxisFormat = getProp("labels", "yAxis", "format");

        if (xAxisFormat != null || xAxisCrossingValue != null || yAxisFormat != null) {
            if (labelsElement == null) {
                labelsElement = new Element("labels");
            }

            if (xAxisFormat != null || xAxisCrossingValue != null) {
                Element xAxisElement = new Element("xAxis");

                if (xAxisFormat != null) xAxisElement.addContent(new Element("format").setText(xAxisFormat.toString()));
                if (xAxisCrossingValue != null) xAxisElement.addContent(new Element("axis-crossing-value").setText(xAxisCrossingValue.toString()));

                labelsElement.addContent(xAxisElement);
            }

            if (yAxisFormat != null) {
                Element yAxisElement = new Element("yAxis");

                if (yAxisFormat != null) yAxisElement.addContent(new Element("format").setText(yAxisFormat.toString()));

                labelsElement.addContent(yAxisElement);
            }
        }

        if (labelsElement != null && labelsElement.getContentSize() > 0) {
            viewModel.addContent(labelsElement);
        }

        Object dataGroupId = getProp("data-group-id");

        Element model = new Element("model");

        if (dataGroupId != null ) model.addContent(new Element("data-group-id").setText(dataGroupId.toString()));

        if (!categories.isEmpty()) {
            Element categoriesElement = new Element("categories");
            for (Category category : categories) {
                categoriesElement.addContent(category.toElement());
            }
            model.addContent(categoriesElement);
        }

        if (!serieses.isEmpty()) {
            Element seriesesElement = new Element("serieses");
            for (Series series : serieses) {
                seriesesElement.addContent(series.toElement());
            }
            model.addContent(seriesesElement);
        }

        Object seriesesVisible = getProp("serieses", "visible");
        Object seriesesFormat = getProp("serieses", "format");

        if (seriesesVisible != null || seriesesFormat != null) {
            Element seriesesElement = model.getChild("serieses");
            if (seriesesElement == null) {
                seriesesElement = new Element("serieses");
                model.addContent(seriesesElement);
            }
            
            if (seriesesFormat != null) seriesesElement.addContent(0, new Element("format").setText(seriesesFormat.toString()));            
            if (seriesesVisible != null) seriesesElement.addContent(0, new Element("visible").setText(seriesesVisible.toString()));
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
