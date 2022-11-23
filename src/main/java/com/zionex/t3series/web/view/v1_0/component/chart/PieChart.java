package com.zionex.t3series.web.view.v1_0.component.chart;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;
import com.zionex.t3series.web.view.v1_0.component.Component;

import org.jdom2.Element;

public class PieChart extends Component {

    private List<Series> serieses = new ArrayList<>();

    public PieChart(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<Series> getSerieses() {
        return Collections.unmodifiableList(serieses);
    }

    public void addSeries(Series series) {
        serieses.add(series);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object title = getProp("title");
        Object titlePosition = getProp("title-position");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object startAngle = getProp("startAngle");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object labelsVisible = getProp("labels", "visible");
        Object labelsPosition = getProp("labels", "position");
        Object labelsPercentage = getProp("labels", "percentage");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        Element viewModel = new Element("view-model");

        if (title != null ) viewModel.addContent(new Element("title").setText(title.toString()));
        if (titlePosition != null ) viewModel.addContent(new Element("title-position").setText(titlePosition.toString()));
        if (height != null ) viewModel.addContent(new Element("height").setText(height.toString()));
        if (theme != null ) viewModel.addContent(new Element("theme").setText(theme.toString()));
        if (startAngle != null ) viewModel.addContent(new Element("startAngle").setText(startAngle.toString()));

        if (borderWidth != null || borderColor != null) {
            Element borderElement = new Element("border");

            if (borderWidth != null ) borderElement.addContent(new Element("width").setText(borderWidth.toString()));
            if (borderWidth != null ) borderElement.addContent(new Element("color").setText(borderColor.toString()));

            viewModel.addContent(borderElement);
        }

        if (legendVisible != null || legendPosition != null) {
            Element legendElement = new Element("legend");

            if (legendVisible != null ) legendElement.addContent(new Element("visible").setText(legendVisible.toString()));
            if (legendPosition != null ) legendElement.addContent(new Element("position").setText(legendPosition.toString()));

            viewModel.addContent(legendElement);
        }

        if (labelsVisible != null || labelsPosition != null || labelsPercentage != null) {
            Element labelsElement = new Element("labels");

            if (labelsVisible != null ) labelsElement.addContent(new Element("visible").setText(labelsVisible.toString()));
            if (labelsPosition != null ) labelsElement.addContent(new Element("position").setText(labelsPosition.toString()));
            if (labelsPercentage != null ) labelsElement.addContent(new Element("percentage").setText(labelsPercentage.toString()));

            viewModel.addContent(labelsElement);
        }

        if (tooptipVisible != null || tooptipFormat != null) {
            Element tooptipElement = new Element("tooltip");

            if (tooptipVisible != null ) tooptipElement.addContent(new Element("visible").setText(tooptipVisible.toString()));
            if (tooptipFormat != null ) tooptipElement.addContent(new Element("format").setText(tooptipFormat.toString()));

            viewModel.addContent(tooptipElement);
        }

        Element model = new Element("model");

        if (!serieses.isEmpty()) {
            Element seriesesElement = new Element("serieses");
            for (Series series : serieses) {
                seriesesElement.addContent(series.toElement());
            }
            model.addContent(seriesesElement);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
