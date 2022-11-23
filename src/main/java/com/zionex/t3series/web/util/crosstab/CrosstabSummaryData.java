package com.zionex.t3series.web.util.crosstab;

import java.util.ArrayList;
import java.util.List;

public class CrosstabSummaryData {

    private final String column;
    private final String type;

    private List<Number> data = new ArrayList<>();

    public CrosstabSummaryData(String column, String type) {
        this.column = column;
        this.type = type;
    }

    public boolean append(Object value) {
        if ("COUNT".equals(type)) {
            data.add(0);
        } else {
            if (value instanceof Number) {
                data.add((Number) value);
            }
        }
        return true;
    }

    public static boolean accept(String summaryType) {
        if ("SUM".equals(summaryType)) {
            return true;
        } else if ("AVG".equals(summaryType)) {
            return true;
        } else if ("MIN".equals(summaryType)) {
            return true;
        } else if ("MAX".equals(summaryType)) {
            return true;
        } else {
            return "COUNT".equals(summaryType);
        }
    }

    public Object getSummary() {
        if (data.isEmpty()) {
            return null;
        }

        if ("SUM".equals(type)) {
            return data.stream().mapToDouble(Number::doubleValue).sum();
        } else if ("AVG".equals(type)) {
            return data.stream().mapToDouble(Number::doubleValue).average().orElse(0);
        } else if ("MIN".equals(type)) {
            return data.stream().mapToDouble(Number::doubleValue).min().orElse(Double.MIN_VALUE);
        } else if ("MAX".equals(type)) {
            return data.stream().mapToDouble(Number::doubleValue).max().orElse(Double.MAX_VALUE);
        } else if ("COUNT".equals(type)) {
            return data.size();
        } else {
            return null;
        }
    }

    @Override
    public String toString() {
        return column + ", " + type + ", " + data;
    }

}
