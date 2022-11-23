package com.zionex.t3series.web.util.crosstab;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.constant.ServiceConstants;

public class CrosstabBuilder {

    public static final String PARAMETER_KEY_INFO = "INFO";

    public static final String RESULT_COLUMNS_1 = "COLUMNS_1";
    public static final String RESULT_COLUMNS_2 = "COLUMNS_2";
    public static final String RESULT_DATA = "TABLEDATA";

    // Type1
    public static final String GROUP_KEY = "group-key";
    public static final String GROUP_VALUE = "group-value";
    public static final String GROUP_COLUMNS = "group-columns";

    // Type2
    public static final String GROUP_ROWS = "group-rows";
    public static final String GROUP_HORIZONTAL_VALUES = "group-horizontal-values";
    public static final String GROUP_VERTICAL_VALUES = "group-vertical-values";
    public static final String DATA_KEYS = "data-keys";
    public static final String IGNORE_EMPTY_ROW = "ignoreEmptyrow";
    public static final String OMIT_ROW = "omitrow";

    public static final String ROW_VALUE_VALUE = "VALUE";
    public static final String COLUMN_VALUE_CATEGORY = "CATEGORY";
    public static final String COLUMN_VALUE_CATEGORY_GROUP = "CATEGORY_GROUP";
    
    public static final String DATE_FORMAT_PATTERN = "yyyy-MM-dd'T'HH:mm:ss";
    public static final String DATE_FORMAT_REGEX = "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}";

    private static ObjectListComparator objectListComparator;

    protected static ObjectListComparator getObjectListComparator() {
        if (objectListComparator == null) {
            objectListComparator = new ObjectListComparator();
        }
        return objectListComparator;
    }

    private static class ObjectListComparator implements Comparator<List<Object>> {
        @SuppressWarnings("unchecked")
        @Override
        public int compare(List<Object> o1, List<Object> o2) {
            if (o1 == o2) {
                return 0;
            }

            if (o1 == null) {
                return 1;
            }

            if (o2 == null) {
                return -1;
            }

            if (o1.size() > o2.size()) {
                return -1;
            }

            if (o1.size() < o2.size()) {
                return 1;
            }

            for (int i = 0, s = o1.size(); i < s; i++) {
                Object object1 = o1.get(i);
                Object object2 = o2.get(i);
                if (object1 == object2) {
                    continue;
                }

                if (object1 == null) {
                    return 1;
                }

                if (object2 == null) {
                    return -1;
                }

                int compare = 0;
                if (object1 instanceof Comparable && object2 instanceof Comparable) {
                    compare = ((Comparable<Object>) object1).compareTo(object2);
                } else {
                    compare = object1.toString().compareTo(object2.toString());
                }

                if (compare != 0) {
                    return compare;
                }
            }

            return 0;
        }
    }

    public int findMaxColumnIndex(Object[] targetColumns, List<Object> columns) {
        int maxColumnIndex = Integer.MIN_VALUE;

        for (Object targetColumn : targetColumns) {
            int columnIndex = findColumnIndex(targetColumn, columns);
            if (maxColumnIndex < columnIndex) {
                maxColumnIndex = columnIndex;
            }
        }

        return maxColumnIndex;
    }

    public static Map<Object, Integer> findColumnIndexMap(List<Object> targetColumns, List<Object> columns) {
        Map<Object, Integer> columnIndexMap = new HashMap<>();

        for (Object targetColumn : targetColumns) {
            int columnIndex = findColumnIndex(targetColumn, columns);
            columnIndexMap.put(targetColumn, columnIndex);
        }
        return columnIndexMap;
    }

    public static int[] findColumnIndexes(Object[] targetColumns, List<Object> columns) {
        int[] idxes = new int[targetColumns.length];

        for (int i = 0, n = idxes.length; i < n; i++) {
            idxes[i] = findColumnIndex(targetColumns[i], columns);
        }
        return idxes;
    }

    public static int findColumnIndex(Object targetColumn, List<Object> columns) {
        if (targetColumn == null) {
            return -1;
        }

        for (int i = 0, n = columns.size(); i < n; i++) {
            if (targetColumn.equals(columns.get(i))) {
                return i;
            }
        }
        return -1;
    }

    @SuppressWarnings("unchecked")
	public static Map<String, Object> getServiceResult(boolean success, String code, String message, Map<String, Object> data) {
        Map<String, Object> info = (Map<String, Object>) data.get(ServiceConstants.PARAMETER_KEY_INFO);
        if (info == null) {
            info = new HashMap<String, Object>();
            data.put(ServiceConstants.PARAMETER_KEY_INFO, info);
        }

        info.put(ServiceConstants.PARAMETER_KEY_RESULT_SUCCESS, success);
        info.put(ServiceConstants.PARAMETER_KEY_RESULT_CODE, code);
        info.put(ServiceConstants.PARAMETER_KEY_RESULT_MESSAGE, message);

        if (!info.containsKey(ServiceConstants.PARAMETER_KEY_RESULT_TYPE)) {
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_TYPE, ServiceConstants.RESULT_TYPE_I);
        }

        Map<String, Object> serviceResult = new HashMap<String, Object>();
        serviceResult.putAll(data);
		return serviceResult;
    }

}
