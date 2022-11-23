package com.zionex.t3series.web.util.crosstab;

import java.text.DateFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

import org.apache.commons.lang3.ArrayUtils;

import com.zionex.t3series.util.time.TimeStamp;
import com.zionex.t3series.web.constant.ServiceConstants;

import lombok.Builder;
import lombok.extern.java.Log;

@Log
@Builder
public class CrosstabBuilderType1 extends CrosstabBuilder {

    private final String[] columnGroups;
    private final String keyColumn;
    private final String valueColumn;

    private final String summaryType;

    private final boolean usePrefixKeyColumn;
    private final DateFormat dateFormat;
    private final NumberFormat numberFormat;

    @SuppressWarnings("unchecked")
    public Map<String, Object> convert(Map<String, Object> data) {
        List<Object> columns = (List<Object>) data.get(RESULT_COLUMNS_1);
        if (columns == null) {
            String message = String.format("Required data does not exist. (required data: %s)", RESULT_COLUMNS_1);
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        List<List<Object>> orgData = (List<List<Object>>) data.get(RESULT_DATA);
        if (orgData == null) {
            String message = String.format("Required data does not exist. (required data: %s)", RESULT_DATA);
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        if (columnGroups == null || columnGroups.length == 0) {
            String message = "The column group is not defined.";
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        int keyColumnIdx = findColumnIndex(keyColumn, columns);
        int valueColumnIdx = findColumnIndex(valueColumn, columns);

        if (keyColumnIdx < 0 || valueColumnIdx < 0) {
            String message = "The key column or value column does not exist.";
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        List<Object> newColumnGroups = new ArrayList<>();

        int[] columnGroupIdxes = new int[columnGroups.length];
        for (int i = 0, n = columnGroups.length; i < n; i++) {
            columnGroupIdxes[i] = findColumnIndex(columnGroups[i], columns);
            if (columnGroupIdxes[i] < 0) {
                String message = String.format("The column group does not exist. (column group: %s)", columnGroups[i]);
                log.warning(message);
                return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
            }
            newColumnGroups.add(columnGroups[i]);
        }

        List<Object> keyColumns = getKeyColumns(keyColumnIdx, orgData);

        newColumnGroups.addAll(keyColumns);

        Map<List<Object>, List<Object>> newData = new LinkedHashMap<>();
        for (List<Object> row : orgData) {
            List<Object> columnGroupKey = new ArrayList<>();
            for (int i = 0, n = columnGroupIdxes.length; i < n; i++) {
                Object item = row.get(columnGroupIdxes[i]);
                columnGroupKey.add(item);
            }

            List<Object> newRow = newData.get(columnGroupKey);
            if (newRow == null) {
                newRow = new ArrayList<>();
                newRow.addAll(columnGroupKey);
                for (int i = 0, n = keyColumns.size(); i < n; i++) {
                    if (summaryType == null) {
                        newRow.add(null);
                    } else {
                        newRow.add(new CrosstabSummaryData(valueColumn, summaryType));
                    }
                }
                newData.put(columnGroupKey, newRow);
            }

            Object crosstabKeyObj = row.get(keyColumnIdx);
            Object crosstabValueObj = row.get(valueColumnIdx);

            if (crosstabKeyObj != null && crosstabValueObj != null) {
                int idx = findColumnIndex(crosstabKeyObj, newColumnGroups);
                Object object = newRow.get(idx);
                if (object instanceof CrosstabSummaryData) {
                    ((CrosstabSummaryData) object).append(crosstabValueObj);
                } else {
                    newRow.set(idx, crosstabValueObj);
                }
            }
        }

        if (summaryType != null) {
            List<List<Object>> resultData = new ArrayList<>();

            newData.values().stream().parallel().forEach(row -> {
                List<Object> newRow = row.stream().map(value -> {
                    if (value instanceof CrosstabSummaryData) {
                        return ((CrosstabSummaryData) value).getSummary();
                    }
                    return value;
                }).collect(Collectors.toList());

                resultData.add(newRow);
            });

            data.put(RESULT_DATA, resultData);
        } else {
            List<List<Object>> resultData = new ArrayList<>(newData.values());
            data.put(RESULT_DATA, resultData);
        }
        
        DateFormat stdDateFormat = new SimpleDateFormat(DATE_FORMAT_PATTERN);

        List<Object> resultColumns = new ArrayList<>();
        for (int i = 0, n = newColumnGroups.size(); i < n; i++) {
            Object newColumnGroup = newColumnGroups.get(i);
            if (i >= columnGroups.length) {
            	if (newColumnGroup instanceof String) {
                	String newColumnGroupStr = (String) newColumnGroup;
                	if (newColumnGroupStr.matches(DATE_FORMAT_REGEX)) {                		
                		try {
							newColumnGroup = stdDateFormat.parse(newColumnGroupStr);
						} catch (Exception e) {
							log.warning(e.getMessage());
						}
                	}
                }
            	
                if (dateFormat != null && newColumnGroup instanceof Date) {
                    newColumnGroup = dateFormat.format((Date) newColumnGroup);
                } else if (dateFormat != null && newColumnGroup instanceof TimeStamp) {
                    newColumnGroup = dateFormat.format(((TimeStamp) newColumnGroup).toDate());
                } else if (numberFormat != null && newColumnGroup instanceof Number) {
                    newColumnGroup = numberFormat.format(newColumnGroup);
                }

                if (usePrefixKeyColumn) {
                    newColumnGroup = keyColumn + "_" + newColumnGroup;
                }
            }

            resultColumns.add(newColumnGroup);
        }

        data.put(RESULT_COLUMNS_1, resultColumns);

        Map<String, Object> info = (Map<String, Object>) data.get(PARAMETER_KEY_INFO);
        if (info != null) {
            info.put(GROUP_KEY, keyColumn);
            info.put(GROUP_VALUE, valueColumn);
        }

        return data;
    }

    public List<Map<String, Object>> reverse(List<Object> columns, List<List<Object>> data) {
        List<Object> reverseColumns = getReverseColumns(columns);
        List<Object> skipColumns = getSkipColumns(columns);

        String[] newColumnGroups = Arrays.asList(columnGroups).stream().filter(c -> columns.contains(c)).toArray(String[]::new);

        List<Object> newColumns = new ArrayList<>();

        int[] columnGroupIdxes = new int[newColumnGroups.length];
        for (int i = 0, n = newColumnGroups.length; i < n; i++) {
            columnGroupIdxes[i] = findColumnIndex(newColumnGroups[i], columns);
            if (columnGroupIdxes[i] < 0) {
                String message = String.format("The column group does not exist. (column group: %s)", newColumnGroups[i]);
                log.warning(message);
                throw new CrosstabException(message);
            }

            newColumns.add(newColumnGroups[i]);
        }

        newColumns.add(keyColumn);
        newColumns.add(valueColumn);

        List<List<Object>> newData = new ArrayList<>();

        for (List<Object> row : data) {
            List<Object> columnGroupRow = new ArrayList<>();
            for (int i = 0, n = columnGroupIdxes.length; i < n; i++) {
                Object value = row.get(columnGroupIdxes[i]);
                columnGroupRow.add(value);
            }

            for (int i = 0, n = row.size(); i < n; i++) {
                Object value = row.get(i);
                if (value != null && !ArrayUtils.contains(columnGroupIdxes, i)) {
                    Object keyColumnValue = reverseColumns.get(i);
                    if (skipColumns.contains(keyColumnValue)) {
                        continue;
                    }

                    List<Object> dataRow = new ArrayList<>();
                    dataRow.addAll(columnGroupRow);
                    dataRow.add(keyColumnValue);
                    dataRow.add(value);

                    newData.add(dataRow);
                }
            }
        }

        return Crosstab.convertListOfMap(newColumns, newData);
    }

    private List<Object> getReverseColumns(List<Object> columns) {
        if (!usePrefixKeyColumn) {
            return columns;
        }

        List<Object> reverseColumns = new ArrayList<>();
        for (Object column : columns) {
            if (ArrayUtils.contains(columnGroups, column)) {
                reverseColumns.add(column);
            } else {
                if (column != null) {
                    if (column.toString().startsWith(keyColumn + "_")) {
                        reverseColumns.add(column.toString().substring(keyColumn.length() + 1));
                    } else {
                        reverseColumns.add(column);
                    }
                }
            }
        }

        return reverseColumns;
    }

    private List<Object> getSkipColumns(List<Object> columns) {
        if (!usePrefixKeyColumn) {
            return columns;
        }

        List<Object> skipColumns = new ArrayList<>();
        for (Object column : columns) {
            if (ArrayUtils.contains(columnGroups, column)) {
                continue;
            }

            if (column != null && !column.toString().startsWith(keyColumn + "_")) {
                skipColumns.add(column);
            }
        }

        return skipColumns;
    }

    private List<Object> getKeyColumns(int keyColumnIndex, List<List<Object>> data) {
        Set<Object> keyColumns = new TreeSet<>();
        for (List<Object> row : data) {
            Object keyColumn = row.get(keyColumnIndex);
            if (keyColumn instanceof Comparable) {
                keyColumns.add(keyColumn);
            }
        }
        return new ArrayList<>(keyColumns);
    }

}
