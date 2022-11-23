package com.zionex.t3series.web.view.v1_2.component.chart;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_2.ViewUtil;
import com.zionex.t3series.web.view.v1_2.component.Component;

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
        Object seriesWidth = getProp("series-width");
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
        if (seriesWidth != null) viewModel.addContent(new Element("series-width").setText(seriesWidth.toString()));

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

        Object categoryAxisText = getProp("labels", "category-axis", "title", "text");
        Object categoryAxisFont = getProp("labels", "category-axis", "title", "font");
        Object categoryAxisColor = getProp("labels", "category-axis", "title", "color");
        Object categoryAxisRotation = getProp("labels", "category-axis", "rotation");

        Object valueAxisText = getProp("labels", "value-axis", "title", "text");
        Object valueAxisFont = getProp("labels", "value-axis", "title", "font");
        Object valueAxisColor = getProp("labels", "value-axis", "title", "color");
        Object valueAxisCrossingValue = getProp("labels", "value-axis", "axis-crossing-value");
        Object valueAxisFormat = getProp("labels", "value-axis", "format");
        Object valueAxisMin = getProp("labels", "value-axis", "min");
        Object valueAxisMax = getProp("labels", "value-axis", "max");

        boolean isCategoryAxis = categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null || categoryAxisRotation != null;
        boolean isValueAxis = valueAxisText != null || valueAxisFont != null || valueAxisColor != null || valueAxisCrossingValue != null || valueAxisFormat != null || valueAxisMin != null || valueAxisMax != null;

        Element labelsElement = null;
        Element categoryAxisElement = null;
        Element valueAxisElement = null;

        if (isCategoryAxis || isValueAxis) {
            labelsElement = new Element("labels");

            if (isCategoryAxis) {
                categoryAxisElement = new Element("category-axis");

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
                valueAxisElement = new Element("value-axis");

                if (valueAxisText != null || valueAxisFont != null || valueAxisColor != null) {
                    Element titleElement = new Element("title");
                    if (valueAxisText != null) titleElement.addContent(new Element("text").setText(valueAxisText.toString()));
                    if (valueAxisFont != null) titleElement.addContent(new Element("font").setText(valueAxisFont.toString()));
                    if (valueAxisColor != null) titleElement.addContent(new Element("color").setText(valueAxisColor.toString()));
                    valueAxisElement.addContent(titleElement);
                }

                if (valueAxisCrossingValue != null) valueAxisElement.addContent(new Element("axis-crossing-value").setText(valueAxisCrossingValue.toString()));
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
                    categoryAxisElement = new Element("category-axis");
                    labelsElement.addContent(categoryAxisElement);
                }

                for (CategoryAxis categoryAxis : categoryAxises) {
                    categoryAxisElement.addContent(categoryAxis.toElement());
                }
            }

            if (!valueAxises.isEmpty()) {
                if (valueAxisElement == null) {
                    valueAxisElement = new Element("value-axis");
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

        Object xAxisFormat = getProp("labels", "x-axis", "format");
        Object xAxisCrossingValue = getProp("labels", "x-axis", "axis-crossing-value");
        Object yAxisFormat = getProp("labels", "y-axis", "format");

        if (xAxisFormat != null || xAxisCrossingValue != null || yAxisFormat != null) {
            if (labelsElement == null) {
                labelsElement = new Element("labels");
            }

            if (xAxisFormat != null || xAxisCrossingValue != null) {
                Element xAxisElement = new Element("x-axis");

                if (xAxisFormat != null) xAxisElement.addContent(new Element("format").setText(xAxisFormat.toString()));
                if (xAxisCrossingValue != null) xAxisElement.addContent(new Element("axis-crossing-value").setText(xAxisCrossingValue.toString()));

                labelsElement.addContent(xAxisElement);
            }

            if (yAxisFormat != null) {
                Element yAxisElement = new Element("y-axis");

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

    @Override
    public String toJson() {
        Object title = getProp("title");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object defaultType = getProp("default-type");
        Object seriesWidth = getProp("series-width");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object legendHiddenFieldId = getProp("legend", "hidden", "field-id");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (title != null) {
            viewModelBuilder.append("\"title\":").append('"').append(title).append('"');
        }

        if (height != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (theme != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"theme\":").append('"').append(theme).append('"');
        }

        if (defaultType != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"defaultType\":").append('"').append(defaultType).append('"');
        }

        if (seriesWidth != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"seriesWidth\":").append(seriesWidth);
        }

        if (borderWidth != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"borderWidth\":").append('"').append(borderWidth).append('"');
        }

        if (borderColor != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"borderColor\":").append('"').append(borderColor).append('"');
        }

        if (legendVisible != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"legendVisible\":").append(legendVisible);
        }

        if (legendPosition != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"legendPosition\":").append('"').append(legendPosition).append('"');
        }

        if (legendHiddenFieldId != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"legendHiddenFieldId\":").append('"').append(legendHiddenFieldId).append('"');
        }

        if (tooptipVisible != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"tooptipVisible\":").append(tooptipVisible);
        }

        if (tooptipFormat != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            tooptipFormat = tooptipFormat.toString().replace("\\", "\\\\");
            viewModelBuilder.append("\"tooptipFormat\":").append('"').append(tooptipFormat).append('"');
        }

        Object categoryAxisText = getProp("labels", "category-axis", "title", "text");
        Object categoryAxisFont = getProp("labels", "category-axis", "title", "font");
        Object categoryAxisColor = getProp("labels", "category-axis", "title", "color");
        Object categoryAxisRotation = getProp("labels", "category-axis", "rotation");

        Object valueAxisText = getProp("labels", "value-axis", "title", "text");
        Object valueAxisFont = getProp("labels", "value-axis", "title", "font");
        Object valueAxisColor = getProp("labels", "value-axis", "title", "color");
        Object valueAxisCrossingValue = getProp("labels", "value-axis", "axis-crossing-value");
        Object valueAxisFormat = getProp("labels", "value-axis", "format");
        Object valueAxisMin = getProp("labels", "value-axis", "min");
        Object valueAxisMax = getProp("labels", "value-axis", "max");

        StringBuilder categoryAxisBuilder = new StringBuilder();
        StringBuilder valueAxisBuilder = new StringBuilder();

        if (categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null || categoryAxisRotation != null) {
            if (categoryAxisText != null) {
                categoryAxisBuilder.append("\"titleText\":").append('"').append(categoryAxisText).append('"');
            }

            if (categoryAxisFont != null) {
                if (categoryAxisBuilder.length() > 0) {
                    categoryAxisBuilder.append(',');
                }
                categoryAxisBuilder.append("\"titleFont\":").append('"').append(categoryAxisFont).append('"');
            }

            if (categoryAxisColor != null) {
                if (categoryAxisBuilder.length() > 0) {
                    categoryAxisBuilder.append(',');
                }
                categoryAxisBuilder.append("\"titleColor\":").append('"').append(categoryAxisColor).append('"');
            }

            if (categoryAxisRotation != null) {
                if (categoryAxisBuilder.length() > 0) {
                    categoryAxisBuilder.append(',');
                }
                categoryAxisBuilder.append("\"rotation\":").append('"').append(categoryAxisRotation).append('"');
            }
        }

        if (valueAxisText != null || valueAxisFont != null || valueAxisColor != null || valueAxisCrossingValue != null
                || valueAxisFormat != null || valueAxisMin != null || valueAxisMax != null) {

            if (valueAxisText != null) {
                valueAxisBuilder.append("\"titleText\":").append('"').append(valueAxisText).append('"');
            }

            if (valueAxisFont != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"titleFont\":").append('"').append(valueAxisFont).append('"');
            }

            if (valueAxisColor != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"titleColor\":").append('"').append(valueAxisColor).append('"');
            }

            if (valueAxisCrossingValue != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"axisCrossingValue\":").append('"').append(valueAxisCrossingValue).append('"');
            }

            if (valueAxisFormat != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisFormat = valueAxisFormat.toString().replace("\\", "\\\\");
                valueAxisBuilder.append("\"format\":").append('"').append(valueAxisFormat).append('"');
            }

            if (valueAxisMin != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"min\":").append('"').append(valueAxisMin).append('"');
            }

            if (valueAxisMax != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"max\":").append('"').append(valueAxisMax).append('"');
            }
        }

        if (!categoryAxises.isEmpty()) {
            if (categoryAxisBuilder.length() > 0) {
                categoryAxisBuilder.append(',');
            }

            for (int i = 0; i < categoryAxises.size(); i++) {
                CategoryAxis categoryAxis = categoryAxises.get(i);

                if (i > 0) {
                    categoryAxisBuilder.append(',');
                }

                String json = categoryAxis.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                categoryAxisBuilder.append('"').append(categoryAxis.getId()).append('"').append(':').append(json);
            }
        }

        if (!valueAxises.isEmpty()) {
            if (valueAxisBuilder.length() > 0) {
                valueAxisBuilder.append(',');
            }

            for (int i = 0; i < valueAxises.size(); i++) {
                ValueAxis valueAxis = valueAxises.get(i);

                if (i > 0) {
                    valueAxisBuilder.append(',');
                }

                String json = valueAxis.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                valueAxisBuilder.append('"').append(valueAxis.getId()).append('"').append(':').append(json);
            }
        }

        StringBuilder labelSeriesBuilder = new StringBuilder();

        if (!labelsSerieses.isEmpty()) {
            if (labelSeriesBuilder.length() > 0) {
                labelSeriesBuilder.append(',');
            }

            for (int i = 0; i < labelsSerieses.size(); i++) {
                LabelsSeries labelSeries = labelsSerieses.get(i);

                if (i > 0) {
                    labelSeriesBuilder.append(',');
                }

                String json = labelSeries.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                labelSeriesBuilder.append('"').append(labelSeries.getId()).append('"').append(':').append(json);
            }
        }

        StringBuilder xAxisBuilder = new StringBuilder();
        StringBuilder yAxisBuilder = new StringBuilder();

        Object xAxisFormat = getProp("labels", "x-axis", "format");
        Object xAxisCrossingValue = getProp("labels", "x-axis", "axis-crossing-value");
        Object yAxisFormat = getProp("labels", "y-axis", "format");

        if (xAxisFormat != null || xAxisCrossingValue != null || yAxisFormat != null) {
            if (xAxisFormat != null) {
                if (xAxisBuilder.length() > 0) {
                    xAxisBuilder.append(',');
                }
                xAxisFormat = xAxisFormat.toString().replace("\\", "\\\\");
                xAxisBuilder.append("\"format\":").append('"').append(xAxisFormat).append('"');
            }

            if (xAxisCrossingValue != null) {
                if (xAxisBuilder.length() > 0) {
                    xAxisBuilder.append(',');
                }
                xAxisBuilder.append("\"axisCrossingValue\":").append('"').append(xAxisCrossingValue).append('"');
            }

            if (yAxisFormat != null) {
                if (yAxisBuilder.length() > 0) {
                    yAxisBuilder.append(',');
                }
                yAxisFormat = yAxisFormat.toString().replace("\\", "\\\\");
                yAxisBuilder.append("\"format\":").append('"').append(yAxisFormat).append('"');
            }
        }

        StringBuilder labelBuilder = new StringBuilder();

        if (categoryAxisBuilder.length() > 0) {
            labelBuilder.append("\"categoryAxis\":{").append(categoryAxisBuilder.toString()).append('}');
        }

        if (valueAxisBuilder.length() > 0) {
            if (labelBuilder.length() > 0) {
                labelBuilder.append(',');
            }
            labelBuilder.append("\"valueAxis\":{").append(valueAxisBuilder.toString()).append('}');
        }

        if (labelSeriesBuilder.length() > 0) {
            if (labelBuilder.length() > 0) {
                labelBuilder.append(',');
            }
            labelBuilder.append("\"series\":{").append(labelSeriesBuilder.toString()).append('}');
        }

        if (xAxisBuilder.length() > 0) {
            if (labelBuilder.length() > 0) {
                labelBuilder.append(',');
            }
            labelBuilder.append("\"xAxis\":{").append(xAxisBuilder.toString()).append('}');
        }

        if (yAxisBuilder.length() > 0) {
            if (labelBuilder.length() > 0) {
                labelBuilder.append(',');
            }
            labelBuilder.append("\"yAxis\":{").append(yAxisBuilder.toString()).append('}');
        }

        StringBuilder modelCategoriesBuilder = new StringBuilder();
        StringBuilder modelSeriesesBuilder = new StringBuilder();

        if (!categories.isEmpty()) {
            for (int i = 0; i < categories.size(); i++) {
                Category category = categories.get(i);

                if (i > 0) {
                    modelCategoriesBuilder.append(',');
                }

                String json = category.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                modelCategoriesBuilder.append('"').append(category.getFieldId()).append('"').append(':').append(json);
            }
        }

        if (!serieses.isEmpty()) {
            for (int i = 0; i < serieses.size(); i++) {
                Series series = serieses.get(i);

                if (i > 0) {
                    modelSeriesesBuilder.append(',');
                }

                String json = series.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                modelSeriesesBuilder.append('"').append(series.getFieldId()).append('"').append(':').append(json);
            }
        }

        StringBuilder modelBuilder = new StringBuilder();

        Object dataGroupId = getProp("data-group-id");
        if (dataGroupId != null) {
            modelBuilder.append("\"dataGroupId\":").append('"').append(dataGroupId).append('"');
        }

        if (modelCategoriesBuilder.length() > 0) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"categories\":{").append(modelCategoriesBuilder.toString()).append('}');
        }

        if (modelSeriesesBuilder.length() > 0) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }

            modelBuilder.append("\"series\":{");

            Object seriesesVisible = getProp("serieses", "visible");
            Object seriesesFormat = getProp("serieses", "format");

            if (seriesesVisible != null) {
                modelBuilder.append("\"visible\":").append(seriesesVisible);
            }

            if (seriesesFormat != null) {
                if (seriesesVisible != null) {
                    modelBuilder.append(',');
                }
                seriesesFormat = seriesesFormat.toString().replace("\\", "\\\\");
                modelBuilder.append("\"format\":").append('"').append(seriesesFormat).append('"');
            }

            if (seriesesVisible != null || seriesesFormat != null) {
                modelBuilder.append(',');
            }

            modelBuilder.append(modelSeriesesBuilder.toString());
            modelBuilder.append('}');
        }

        if (labelBuilder.length() > 0) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append(labelBuilder);
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
