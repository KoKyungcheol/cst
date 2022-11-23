package com.zionex.t3series.web.view.migration;

import org.jdom2.Element;

public class MigrationForHyphenCase implements Migration {

    @Override
    public String getVersion() {
        return "1.2";
    }

    @Override
    public void migrate(Element view) {
        for (Element component : view.getChildren("component")) {
            String type = component.getAttributeValue("type");
            if ("CHART".equals(type)) {
                migrateChart(component);
            }
        }
    }

    private void migrateChart(Element component) {
        Element viewModel = component.getChild("view-model");
        if (viewModel != null) {
            Element labels = viewModel.getChild("labels");
            if (labels != null) {
                Element categoryAxis = labels.getChild("categoryAxis");
                if (categoryAxis != null) {
                    categoryAxis.setName("category-axis");
                }

                Element xAxis = labels.getChild("xAxis");
                if (xAxis != null) {
                    xAxis.setName("x-axis");
                }

                Element yAxis = labels.getChild("yAxis");
                if (yAxis != null) {
                    yAxis.setName("y-axis");
                }

                Element valueAxis = labels.getChild("valueAxis");
                if (valueAxis != null) {
                    valueAxis.setName("value-axis");

                    Element crossingValue = valueAxis.getChild("axisCrossingValue");
                    if (crossingValue != null) {
                        crossingValue.setName("axis-crossing-value");
                    }

                    for (Element value : valueAxis.getChildren("value")) {
                        Element axisCrossingValue = value.getChild("axisCrossingValue");
                        if (axisCrossingValue != null) {
                            axisCrossingValue.setName("axis-crossing-value");
                        }
                    }
                }
            }
        }
    }

}
