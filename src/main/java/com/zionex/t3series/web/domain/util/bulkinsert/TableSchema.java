package com.zionex.t3series.web.domain.util.bulkinsert;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import javax.sql.DataSource;

import org.apache.commons.io.FileUtils;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Builder;
import lombok.Data;
import lombok.extern.java.Log;

@Data
@Builder
@Log
public class TableSchema {
    
    private static final String FILE_PATH = "structure/";
    private static final String FILTER_FILE_NAME = "FILTERS.json";
    
    private static final String MSSQL = "MSSQL";
    private static final String ORACLE = "ORACLE";
    
    private static final String TYPE_ID = "ID";
    private static final String TYPE_NOW = "NOW";
    private static final String TYPE_USER_ID = "USER_ID";
    
    public static final String TYPE_NUMBER = "NUMBER";
    public static final String TYPE_STIRNG = "STRING";
    public static final String TYPE_DATE = "DATE";
    public static final String TYPE_DATETIME = "DATE_TIME";

    private static final String REPLACES_STRING = "#REPLACE_COLUMN_NAME#";
    private static final String JOIN_INNER = " INNER JOIN ";
    private static final String JOIN_OUTER = " LEFT OUTER JOIN ";
    private static final String JOIN_FROM = " FROM ";

    DataSource dataSource;
    Connection connection;

    String idSQL;
    String nowSQL;
    String userId;

    String databaseType;

    String workType;
    String moduleName;
    String tableName;

    boolean useDefaultSchema;

    String tableJSONFileName;
    String tableJSONString;
    JSONObject tableJSONObject;

    List<Column> columns;

    String filterJSONFileName;
    String filterJSONString;
    JSONObject filterJSONObject;

    List<Filter> filters;

    List<String> csvHeaders;
    List<String> jsonHeaders;

    Map<String, Integer> csvMap;

    Map<Integer, ImportColumnType> importMap;
    Map<String, ExportColumnType> exportMap;

    List<OFConstraints> ofConstraints;
    boolean isUseOfConstraints;

    Map<Integer, String> procedures;
    boolean isUseProcedure;

    String prepareQuery;
    String exportQuery;

    Map<String, String> columnSchema;

    public TableSchema initParser() {
        if (workType.equals("") || moduleName.equals("") || tableName.equals("") || databaseType.equals("")) {
            throw new BulkImportException(BulkImportException.PARSER_INIT_ERROR);
            
        } else {
            try {
                tableJSONFileName = FILE_PATH + getTableName().toUpperCase() + ".json";

                File file = new ClassPathResource(tableJSONFileName).getFile();
                tableJSONString = FileUtils.readFileToString(file, StandardCharsets.UTF_8);
                
                tableJSONObject = new JSONObject(tableJSONString);
                if (tableJSONObject.get("useDefaultSchema") != null && tableJSONObject.get("useDefaultSchema").equals("N")) {
                    useDefaultSchema = false;
                } else {
                    useDefaultSchema = true;
                }

            } catch (Exception e) {
                throw new BulkImportException(BulkImportException.PARSER_TABLE_JSON_OBJECT_ERROR);
            }

            try {
                filterJSONFileName = FILE_PATH + FILTER_FILE_NAME;
                File file = new ClassPathResource(filterJSONFileName).getFile();
                filterJSONString = FileUtils.readFileToString(file, StandardCharsets.UTF_8);
                filterJSONObject = new JSONObject(filterJSONString);
            } catch (Exception e) {
                throw new BulkImportException(BulkImportException.PARSER_FILTER_JSON_OBJECT_ERROR);
            }

            if (databaseType.equals(MSSQL)) {
                idSQL = "(REPLACE(NEWID(),'-',''))";
                nowSQL = "(GETDATE())";
            } else if (databaseType.equals(ORACLE)) {
                idSQL = "(TO_SINGLE_BYTE(SYS_GUID()))";
                nowSQL = "(SYSDATE)";
            } else {
                throw new BulkImportException(BulkImportException.PARSER_DBTYPE_ERROR);
            }

            userId = "'" + userId + "'";

            if (useDefaultSchema) {
                ResultSet rs = null;
                DatabaseMetaData meta = null;
                
                if (connection == null) {
                    try {
                        connection = dataSource.getConnection();
                    } catch (final SQLException e) {
                        throw new BulkImportException(BulkImportException.DB_CONNECTION_ERROR);
                    }
                }

                try {
                    String schema = null;
                    meta = connection.getMetaData();

                    if (databaseType.equals(ORACLE)) {
                        schema = meta.getUserName();
                    }

                    rs = meta.getColumns(null, schema, tableName, null);

                    while (rs.next()) {
                        if (columnSchema == null) {
                            columnSchema = new TreeMap<String, String>();
                            columnSchema.clear();
                        }
                        columnSchema.put(rs.getString("COLUMN_NAME"), rs.getString("TYPE_NAME"));
                    }

                    if (columnSchema == null || columnSchema.size() == 0) {
                        throw new BulkImportException("Failed get Column Info");    
                    }
                }
                catch (Exception e) {
                    throw new BulkImportException("Failed get Column Info");
                } finally {
                    if (rs != null) {
                        try { rs.close(); } catch (Exception e) {e.printStackTrace();}
                    }

                    if (connection != null) {
                        try { connection.close(); } catch (Exception e) {e.printStackTrace();}
                    }
                }
            }

            isUseOfConstraints = false;

            try {
            	if (tableJSONObject.has("of")) {
            		JSONArray of = (JSONArray) (tableJSONObject.get("of"));
            		makeOfGroups(of);
            	}
            } catch (Exception e) {
                e.printStackTrace();
                //throw new BulkImportException("Failed get of Object JSON");
            }

            isUseProcedure = false;

            try {
            	if (tableJSONObject.has("procedure")) {
            		JSONArray procedure = (JSONArray) (tableJSONObject.get("procedure"));
            		makeProcedure(procedure);
            	}
            } catch (Exception e) {
                e.printStackTrace();
                //throw new BulkImportException("Failed get procedure Object JSON");
            }
        }

        return this;
    }

    private void makeProcedure(JSONArray procedure) {
        assert procedure != null;

        try {
            for (int i = 0; i < procedure.length(); i++) {
                int key = Integer.parseInt(((JSONObject) procedure.get(i)).get("sequence").toString());
                String value = ((JSONObject) procedure.get(i)).get("method").toString();

                if (procedures == null) {
                    procedures = new TreeMap<Integer, String>();
                }

                procedures.put(key, value);
                isUseProcedure = true;
            }
        } catch (Exception e) {
            procedures = null;
            isUseProcedure = false;
        }
    }
    
    private void makeOfGroups(JSONArray of) {
        assert of != null;

        try {
            for (int i = 0; i < of.length(); i++) {
                JSONArray groups = (JSONArray) (((JSONObject) of.get(i)).get("groups"));

                assert groups != null;

                OFConstraints ofObject = OFConstraints.builder()
                        .name("GROUP_" + i)
                        .build();

                isUseOfConstraints = true;

                for (int j = 0; j < groups.length(); j++) {
                    JSONObject json = (JSONObject) groups.get(j);

                    String name = (String)json.get("column");
                    String priority = (String)json.get("priority");
                    int nPriority = 0;

                    if (priority != null && !priority.equals("0")) {
                        try {
                            nPriority = Integer.parseInt(priority);
                        } catch (Exception ex) {
                            nPriority = 0;
                        }
                    }

                    OFConstraints.Column column = OFConstraints.Column.builder()
                        .name(name)
                        .pariority(nPriority)
                        .checkHeaders(false)
                        .headers(new ArrayList<String>())
                        .build();
                    
                    if (ofObject.columns == null) {
                        ofObject.columns = new ArrayList<OFConstraints.Column>();
                    }

                    ofObject.columns.add(column);
                }

                if (ofConstraints == null) {
                    ofConstraints = new ArrayList<OFConstraints>();
                }

                ofConstraints.add(ofObject);
            }
        } catch (Exception e) {
            ofConstraints = null;
        }
    }

    public void doParsing() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            columns = objectMapper.readValue(tableJSONObject.getString("columns"), new TypeReference<List<Column>>() {});
            filters = objectMapper.readValue(filterJSONObject.getString("FILTERS"), new TypeReference<List<Filter>>() {});
            makeImportMap();

            if (workType.equals(BulkImportService.MODE_EXPORT_DATA)) {
                makeExportMap();
            }
        } catch (BulkImportException bulk) {
            throw bulk;
        } catch (Exception e) {
            throw new BulkImportException(BulkImportException.PARSER_JSON_OBJECT_MAPPING_ERROR);
        }
    }
    
    private void makeExportMap() {
        if (exportMap == null) {
            exportMap = new TreeMap<String, ExportColumnType>();
        }

        try {
            char alias = 66; //B
            String mainAlias = "A";
            String mainColumns = "";
            String mainSelect = "SELECT ";
            int headerCount = 0;
            boolean useHidden = false;

            for (Column c : columns) {
                if (useDefaultSchema) {
                    columnSchema.remove(c.name);
                }

                if (c.hidden != null && c.hidden.equals("Y")) {
                    useHidden = true;
                } else {
                    useHidden = false;
                }

                if (c.filter != null) {
                    ExportColumnType columnType = makeExportColumnUseFilter(c.name, Character.toString(alias++), c.filter, c.outer, useHidden);
                    exportMap.put(columnType.alias, columnType);

                } else if (c.importTable != null) {
                    ExportColumnType columnType = makeExportColumnUseColumnJSON(Character.toString(alias++), c);
                    exportMap.put(columnType.alias, columnType);

                } else if (c.header != null && !useHidden) {
                    if (headerCount > 0) {
                        mainColumns = mainColumns + ", " + mainAlias + "." + c.header;
                        mainSelect = mainSelect + ", " + c.header;
                    } else {
                        mainColumns = mainColumns + mainAlias + "." + c.header;
                        mainSelect = mainSelect + c.header;
                    }
                    
                    headerCount++;
                }
            }

            if (useDefaultSchema) {
                for (String key : columnSchema.keySet()) {
                    if (headerCount > 0) {
                        mainColumns = mainColumns + ", " + mainAlias + "." + key;
                        mainSelect = mainSelect + ", " + key;
                    } else {
                        mainColumns = mainColumns + mainAlias + "." + key;
                        mainSelect = mainSelect + key;
                    }
                    
                    headerCount++;
                }
            }            


            String query = "SELECT * ";
            query = query + " FROM " + tableName;
            query = "(" + query + ")";

            ExportColumnType columnType = ExportColumnType.builder()
                    .alias(mainAlias)
                    .columns(mainColumns)
                    .subQuery(query)
                    .useExport(true)
                    .on("")
                    .join(JOIN_FROM)
                    .build();

            exportMap.put(mainAlias, columnType);

        } catch (Exception e) {
            throw new BulkImportException("Error - Make Export Map");
        }
    }

    private ExportColumnType makeExportColumnUseColumnJSON(String alias, Column c) {
        ExportColumnType columnType = ExportColumnType.builder()
                .alias(alias)
                .columns("")
                .subQuery("")
                .build();

        String subQuery = "";
        String subQueryWhere = "";
        String selectColumns = "";
        String columns = "";
        String on = "";

        int i = 0;
        boolean useExport = false;
        boolean columnHidden = false;
        
        if (c.hidden != null && c.hidden.equals("Y")) {
            columnHidden = true;
        }

        //Todo: Export시 일부 Header만 Hidden 처리 필요 (현재는 컬럼 단위로 Hidden 처리)
        for (Column.Export export : c.exports) {
            boolean hidden = false;

            if (export.hidden != null) {
                if (export.hidden.equals("Y")) {
                    hidden = true;
                } else {
                    hidden = false;
                }
            } else {
                hidden = columnHidden;
            }

            if (hidden) {
                continue;
            }

            if (i > 0) {
                selectColumns = selectColumns + ", " + export.column + " AS " + export.header;
                columns = columns + ", " + alias + "." + export.header;
            } else {
                selectColumns = selectColumns + export.column + " AS " + export.header;
                columns = columns + alias + "." + export.header;
            }
            
            i++;
        }

        if (i >= 1) {
            useExport = true;
        }

        if (c.and != null) { 
            for (Column.AND constant : c.and) {
                subQueryWhere = subQueryWhere + " AND " + constant.column + " = " + constant.value;
            }
        }

        if (c.or != null) {
            for (Column.OR or : c.or) {
                int orCnt = 0;

                String orString = "";
                for (Column.OR.Group group : or.group) {
                    if (orCnt == 0) {
                        orString = "(" + orString + group.column + " = " + group.value;
                    } else {
                        orString = orString + " OR " + group.column + " = " + group.value;
                    }
                    
                    orCnt++;
                }

                orString = orString + ")";
                subQueryWhere = subQueryWhere + " AND " + orString;
            }
        }

        if (i > 0) {
            selectColumns = selectColumns + ", " + c.importColumn;
        } else {
            selectColumns = selectColumns + c.importColumn;
        }

        subQuery = "SELECT " + selectColumns;
        subQuery = subQuery + " FROM " + c.importTable + " WHERE 1=1 ";
        subQuery = subQuery + subQueryWhere;
        subQuery = "(" + subQuery + ")";

        on = "A." + c.name + " = " + alias + "." + c.importColumn;
        on = " ON (" + on + ") ";

        String join = "";
        if (c.outer != null && c.outer.equals("Y")) {
            join = JOIN_OUTER;
        } else {
            join = JOIN_INNER;
        }

        columnType.alias = alias;
        columnType.columns = columns;
        columnType.subQuery = subQuery;
        columnType.on = on;
        columnType.join = join;
        columnType.useExport = useExport;

        return columnType;
    }

    private ExportColumnType makeExportColumnUseFilter(String columnName, String alias, String filterName, String outer, boolean columnHidden) {
        ExportColumnType columnType = ExportColumnType.builder()
                .alias(alias)
                .columns("")
                .subQuery("")
                .useExport(false)
                .build();
        
        try {
            for (Filter filter : filters) {
                if (filter.name.equals(filterName)) {
                    String subQuery = "";
                    String selectColumns = "";
                    String columns = "";

                    int nFind = 0;
                    for (Filter.Query query : filter.querys) {
                        if (query.type.equals("common")) {
                            subQuery = query.query;
                            nFind++;
                        }
                    }

                    if (nFind == 0) {
                        for (Filter.Query query : filter.querys) {
                            if (query.type.toUpperCase().equals(databaseType)) {
                                subQuery = query.query;
                                nFind++;
                            }
                        }
                    }

                    if (nFind == 0) {
                        throw new BulkImportException(BulkImportException.PARSER_SUBQUERY_FILTER_PARSING_ERROR);
                    } else {
                        assert filter.exports != null;

                        if (filter.exports.size() == 0) {
                            throw new BulkImportException(BulkImportException.PARSER_SUBQUERY_FILTER_PARSING_ERROR);
                        } else {
                            int i = 0;

                            for (Filter.Export export : filter.exports) {
                                boolean exportHidden = false;

                                if (export.hidden != null) {
                                    if (export.hidden.equals("Y")) {
                                        exportHidden = true;
                                    } else {
                                        exportHidden = false;
                                    }
                                } else {
                                    exportHidden = columnHidden;
                                }

                                if (exportHidden) {
                                    continue;
                                }

                                if (i > 0) {
                                    columns = columns + ", " + alias + "." + export.header;
                                    selectColumns = selectColumns + ", " + export.column + " AS " + export.header;
                                } else {
                                    columns = columns + alias + "." + export.header;
                                    selectColumns = selectColumns + export.column + " AS " + export.header;
                                }
                                
                                i++;
                            }

                            if (i > 0) {
                                selectColumns = selectColumns + ", " + filter.importColumn + " AS " + filter.importColumnAlias;
                                subQuery = subQuery.replace(REPLACES_STRING, selectColumns);
                                subQuery = "(" + subQuery + ")";

                                String on = " ON (A." + columnName + " = " + alias + "." + filter.importColumnAlias + ") ";
                                
                                String join = "";
                                if (outer != null && outer.equals("Y")) {
                                    join = JOIN_OUTER;
                                } else {
                                    join = JOIN_INNER;
                                }

                                columnType.alias = alias;
                                columnType.subQuery = subQuery;
                                columnType.on = on;
                                columnType.columns = columns;
                                columnType.join = join;
                                columnType.useExport = true;
                            }
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            throw new BulkImportException("Error - Make Export Column using Filter");
        }

        return columnType;
    }

    private void makeImportMap() {
        if (importMap == null) {
            importMap = new TreeMap<>();
        }

        if (jsonHeaders == null) {
            jsonHeaders = new ArrayList<String>();
        }

        try {
            for (Column c : columns) {
                if (useDefaultSchema) {
                    columnSchema.remove(c.name);
                }

                boolean unique = (c.unique != null && c.unique.equals("Y") ? true : false);
                boolean update = false;
                boolean notNull = (c.notNull != null && c.notNull.equals("Y") ? true : false);

                boolean connected = false;

                boolean hidden = (c.hidden != null && c.hidden.equals("Y") ? true : false);

                //find Connected 
                if (isUseOfConstraints) {
                    assert ofConstraints != null;

                    for (OFConstraints groups : ofConstraints) {
                        assert groups != null;

                        for (OFConstraints.Column column : groups.columns) {
                            assert column != null;
                            if (c.name.equals(column.name)) {
                                connected = true;
                                break;
                            }
                        }

                        if (connected) {
                            break;
                        }
                    }
                }

                if (!notNull && unique && !connected) {
                    notNull = true;
                }

                String defaultValue = (c.defaultValue != null ? c.defaultValue : "");

                if (!unique) {
                    update = (c.update == null || c.update.equals("Y") ? true : false);
                }

                ImportColumnType columnType = ImportColumnType.builder().build();

                if (c.filter != null) {
                    columnType = makeImportColumnUseFilter(c.name, c.type, c.filter, notNull, hidden, defaultValue);
                    
                } else if (c.importTable != null) {
                    columnType = makeImportColumnUseColumnJSON(c, notNull, hidden, defaultValue);
                    
                } else if (c.header != null) {
                    columnType.column = c.name;
                    columnType.useParam = true;
                    columnType.subQuery = "?";
                    columnType.params = new ArrayList<ImportColumnType.Param>();
                    columnType.params.add(ImportColumnType.Param.builder()
                                            .header(c.header)
                                            .type(c.type)
                                            .isNotNull(notNull)
                                            .isHidden(hidden)
                                            .defaultValue(defaultValue)
                                            .valueIndex(0)
                                            .build());
                } else {
                    columnType = makeColumnNameType(c.name, c.type);
                }

                columnType.unique = unique;
                columnType.update = update;
                columnType.connected = connected;
                importMap.put(importMap.size(), columnType);

                List<String> headers = new ArrayList<String>();
                if (columnType != null) {
                    if (columnType.params != null && columnType.params.size() > 0) {
                        for (ImportColumnType.Param param : columnType.params) {
                            if (!param.isHidden) {
                                jsonHeaders.add(param.header);
                            }

                            headers.add(param.header);
                        }
                    }
                }

                if (isUseOfConstraints) {
                    assert ofConstraints != null;
                    for (OFConstraints groups : ofConstraints) {
                        assert groups != null;

                        for (OFConstraints.Column column : groups.columns) {
                            if (c.name.equals(column.name)) {
                                column.headers = headers;
                            }
                        }
                    }
                }
            }

            if (useDefaultSchema) {
                for (String key : columnSchema.keySet()) {
                    ImportColumnType schemaColumnType = ImportColumnType.builder()
                            .column(key)
                            .useParam(true)
                            .subQuery("?")
                            .unique(false)
                            .update(true)
                            .connected(false)
                            .params(new ArrayList<ImportColumnType.Param>())
                            .build();

                    schemaColumnType.params.add(ImportColumnType.Param.builder()
                                            .header(key)
                                            .type(convertType(columnSchema.get(key)))
                                            .isNotNull(false)
                                            .isHidden(false)
                                            .defaultValue("")
                                            .valueIndex(0)
                                            .build());
                    importMap.put(importMap.size(), schemaColumnType);
                    jsonHeaders.add(key);
                    
                    List<String> headers = new ArrayList<String>();
                    headers.add(key);

                    if (isUseOfConstraints) {
                        assert ofConstraints != null;
                        for (OFConstraints groups : ofConstraints) {
                            assert groups != null;

                            for (OFConstraints.Column column : groups.columns) {
                                if (schemaColumnType.column.equals(column.name)) {
                                    column.headers = headers;
                                }
                            }
                        }
                    }
                }
            }
            
        } catch (BulkImportException bulk) {
            throw bulk;
        } catch (Exception e) {
            throw new BulkImportException(BulkImportException.PARSER_IMPORT_MAP_ERROR);
        }
    }

    private String convertType(String type) {
        type = type.toUpperCase();
        String convertType = "";

        if (databaseType.equals(ORACLE)) {
              switch (type) {
              case "CHAR" :
              case "VARCHAR2":
              case "LONG" : //CLOB, NCLOB
                convertType = TYPE_STIRNG;
                      break;
              case "NUMBER":
              case "FLOAT":
              case "DOUBLE":
                  convertType = TYPE_NUMBER;
                  break;
              case "DATE":
                  convertType = TYPE_DATE;
                  break;
              case "TIMESTAMP":
                  convertType = TYPE_DATETIME;
                  break;
              default:    //BLOB, BFILE
                  throw new BulkImportException("DATABASE TYPE ERROR");  
            }
        } else if (databaseType.equals(MSSQL)) {
            switch (type) {
                case "CHAR" :
                case "TEXT" :
                case "VARCHAR":
                case "NVARCHAR":
                  convertType = TYPE_STIRNG;
                break;
                case "NUMERIC":
                case "DECIMAL":
                case "FLOAT":
                case "INT":
                case "REAL":
                    convertType = TYPE_NUMBER;
                    break;
                case "DATE":
                    convertType = TYPE_DATE;
                    break;
                case "TIMESTAMP":
                    convertType = TYPE_DATETIME;
                    break;
                default:
                    throw new BulkImportException("DATABASE TYPE ERROR");  
                }
          } else {
              throw new BulkImportException("DATABASE TYPE ERROR");
          }

        return convertType;
    }

    private ImportColumnType makeImportColumnUseFilter(String name, String type, String filterName, 
            boolean notNull, boolean hidden, String defaultValue) {
        
        ImportColumnType columnType = ImportColumnType.builder()
                .column(name)
                .type(type)
                .useParam(true)
                .params(new ArrayList<ImportColumnType.Param>())
                .build();

        boolean findeFilter = false;

        try {
            for (Filter filter : filters) {
                if (filter.name.equals(filterName)) {
                    findeFilter = true;

                    String subQuery = "";
                    String paramters = "";

                    int nFind = 0;
                    for (Filter.Query query : filter.querys) {
                        if (query.type.equals("common")) {
                            subQuery = query.query;
                            nFind++;
                        }   
                    }

                    if (nFind == 0) {
                        for (Filter.Query query : filter.querys) {
                            if (query.type.toUpperCase().equals(databaseType)) {
                                subQuery = query.query;
                                nFind++;
                            }
                        }
                    }

                    if (nFind == 0) {
                        throw new BulkImportException(BulkImportException.PARSER_SUBQUERY_FILTER_PARSING_ERROR);
                    } else {
                        assert filter.exports != null;
                        
                        if (filter.exports.size() == 0) {
                            throw new BulkImportException(BulkImportException.PARSER_SUBQUERY_FILTER_PARSING_ERROR);
                        } else {
                            int i = 0;
                            for (Filter.Export export : filter.exports) {
                                boolean filterNotNull = false;
                                boolean filterHidden = false;

                                String filterDefaultValue = "";

                                if (export.notNull == null) {
                                    filterNotNull = notNull;
                                } else if (export.notNull.equals("Y")) {
                                    filterNotNull = true;
                                } else {
                                    filterNotNull = false;
                                }

                                if (export.hidden == null) {
                                    filterHidden = hidden;
                                } else if (export.hidden.equals("Y")) {
                                    filterHidden = true;
                                } else {
                                    filterHidden = false;
                                }

                                if (export.defaultValue == null) {
                                    filterDefaultValue = defaultValue;
                                } else {
                                    filterDefaultValue = export.defaultValue;
                                }
                                
                                if (filterHidden && (filterDefaultValue == null || filterDefaultValue.equals(""))) {
                                    throw new BulkImportException("Hidden Field (" + export.header + ") is required Default Value");
                                }
                                
                                ImportColumnType.Param param = ImportColumnType.Param.builder()
                                        .header(export.header)
                                        .isNotNull(filterNotNull)
                                        .isHidden(filterHidden)
                                        .defaultValue(filterDefaultValue)
                                        .type(export.type)
                                        .valueIndex(i++)
                                        .build();

                                columnType.params.add(param);
                                paramters = paramters + " AND " + export.column + " = ? ";
                            }

                            String column = filter.importColumn + " AS " + filter.importColumnAlias;
                            subQuery = "(" + subQuery.replace(REPLACES_STRING, column) + paramters + ")";
                            columnType.subQuery = subQuery;
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            throw new BulkImportException(BulkImportException.PARSER_SUBQUERY_FILTER_PARSING_ERROR);
        }

        if (!findeFilter) {
            throw new BulkImportException(BulkImportException.PARSER_SUBQUERY_FILTER_PARSING_ERROR);
        }
        
        return columnType;
    }

    private ImportColumnType makeImportColumnUseColumnJSON(Column c, boolean notNull, boolean hidden, String defaultValue) {
        ImportColumnType columnType = ImportColumnType.builder()
                .column(c.name)
                .type(c.type)
                .useParam(true)
                .params(new ArrayList<ImportColumnType.Param>())
                .build();

        String subQuery = "";
        String select = "SELECT " + c.importColumn;
        String table = " FROM " + c.importTable;
        String where = " WHERE 1=1 ";

        int i = 0;
        for (Column.Export export : c.exports) {
            where = where + " AND " + export.column + " = ? ";

            boolean exportNotNull = false;
            boolean exportHidden = false;
            String exportDefaultValue = "";

            if (export.notNull == null) {
                exportNotNull = notNull;
            } else if (export.notNull.equals("Y")) {
                exportNotNull = true;
            } else {
                exportNotNull = false;
            }

            if (export.hidden == null) {
                exportHidden = hidden;
            } else if (export.hidden.equals("Y")) {
                exportHidden = true;
            } else {
                exportHidden = false;
            }

            if (export.defaultValue == null) {
                exportDefaultValue = defaultValue;
            } else {
                exportDefaultValue = export.defaultValue;
            }

            if (export.type == null) {
                export.type = c.type;
            }

            if (exportHidden && 
                    (exportDefaultValue == null || exportDefaultValue.equals(""))) {
                throw new BulkImportException("Hidden Field (" + export.header + ") is required Default Value");
            }

            ImportColumnType.Param param = ImportColumnType.Param.builder()
                    .header(export.header)
                    .isNotNull(exportNotNull)
                    .isHidden(exportHidden)
                    .defaultValue(exportDefaultValue)
                    .type(export.type)
                    .valueIndex(i++)
                    .build();

            columnType.params.add(param);
        }

        if (c.and != null) {
            for (Column.AND and : c.and) {
                where = where + " AND " + and.column + " = " + and.value;
            }
        }

        if (c.or != null) {
            for (Column.OR or : c.or) {
                int orCnt = 0;
                String orString = "";
                
                for (Column.OR.Group group : or.group) {
                    if (orCnt == 0) {
                        orString = "(" + orString + group.column + " = " + group.value;
                    } else {
                        orString = orString + " OR " + group.column + " = " + group.value;
                    }
                    orCnt++;
                }
                
                orString = orString + ")";
                where = where + " AND " + orString;
            }
        }

        subQuery = "(" + select + table + where + ")";
        columnType.subQuery = subQuery;

        return columnType;
    }

    private ImportColumnType makeColumnNameType(String name, String type) {
        ImportColumnType columnType = ImportColumnType.builder()
                .column(name)
                .type(type)
                .useParam(false)
                .build();

        switch (type) {
        case TYPE_ID:
            columnType.subQuery = idSQL;
            break;
        case TYPE_NOW:
            columnType.subQuery = nowSQL;
            break;
        case TYPE_USER_ID:
            columnType.subQuery = userId;
            break;
        default:
            break;
        }

        return columnType;
    }

        
    public void makeQuery() {
        switch (workType) {
        case BulkImportService.MODE_INSERT:
            makeInsertQuery();
            break;
        case BulkImportService.MODE_UPDATE:
            makeUpdateQuery();
            break;
        case BulkImportService.MODE_ADD:
            makeMergeIntoQuery();
            break;
        case BulkImportService.MODE_EXPORT_DATA:
            makeExportQuery();
            break;
        case BulkImportService.MODE_EXPORT_HEADER:
            break;

        default:
            throw new BulkImportException("Not Match JOB");
        }
    }

    private void makeInsertQuery() {
        try {
            StringBuilder select = new StringBuilder();
            StringBuilder values = new StringBuilder();

            select.append("INSERT INTO ");
            select.append(tableName + " (");
            values.append("VALUES (");

            int paramCount = 0;
            for (int key : importMap.keySet()) {
                ImportColumnType columnType = importMap.get(key);
                select.append(columnType.column + ", ");
                values.append(columnType.subQuery + ", ");

                if (columnType.useParam) {
                    for (ImportColumnType.Param param : columnType.params) {
                        paramCount++;
                        paramCount = paramCount + param.valueIndex;
                        param.valueIndex = paramCount;
                    }
                }
            }

            select.deleteCharAt(select.lastIndexOf(", "));
            select.append(") ");

            values.deleteCharAt(values.lastIndexOf(", "));
            values.append(")");

            prepareQuery = select.toString() + values.toString();

            log.info("INSERT Query : \n" + getPrepareQuery());

        } catch (Exception e) {
            throw new BulkImportException(BulkImportException.PARSER_MAKE_INSERT_QUERY_ERROR);
        }
    }

    private void makeUpdateQuery() {
        try {
            String update = "";
            String set = "";
            String where = "";

            update = "UPDATE " + tableName + " ";
            set = " SET ";
            where = " WHERE ";

            int setCount = 0;
            int setParamCount = 0;

            int whereCount = 0;
            int whereParamCount = 0;

            for (int key : importMap.keySet()) {
                ImportColumnType columnType = importMap.get(key);

                if (columnType.update) { //Update 대상
                    if (setCount > 0) {
                        set = set + ", " + columnType.column + " = " + columnType.subQuery;
                    } else {
                        set = set + columnType.column + " = " + columnType.subQuery;
                    }

                    if (columnType.useParam) {
                        for (ImportColumnType.Param param : columnType.params) {
                            setParamCount++;
                            setParamCount = setParamCount + param.valueIndex;
                            param.valueIndex = setParamCount;
                        }
                    }

                    setCount++;
                    
                } else if (columnType.unique) {
                    if (columnType.connected) {
                        if (whereCount > 0) {
                            where = where + " AND COALESCE(" + columnType.column + ", '') = CASE WHEN COALESCE(" + columnType.column + ", '') = '' THEN '' ELSE " + columnType.subQuery + " END ";
                        } else {
                            where = where + " COALESCE(" + columnType.column + ", '') = CASE WHEN COALESCE(" + columnType.column + ", '') = '' THEN '' ELSE " + columnType.subQuery + " END ";
                        }
                        
                    } else {
                        if (whereCount > 0) {
                            where = where + " AND " + columnType.column + " = " + columnType.subQuery;
                        } else {
                            where = where + columnType.column + " = " + columnType.subQuery;
                        }                       
                    }

                    if (columnType.useParam) {
                        for (ImportColumnType.Param param : columnType.params) {
                            whereParamCount++;
                            whereParamCount = whereParamCount + param.valueIndex;
                            param.valueIndex = whereParamCount;
                        }
                    }

                    whereCount++;
                    
                } else {
                    if (columnType.useParam) {  //update 아니고 unique도 아닌데 parameter를 사용하는경우
                        columnType.useParam = false;
                    }
                }
            }

            prepareQuery = update;

            if (setCount > 0) {
                prepareQuery = prepareQuery + set;
            } else {
                prepareQuery = "";
                throw new BulkImportException("Don't have SET Clause");
            }

            if (whereCount > 0) {
                prepareQuery = prepareQuery + where;
            } else {
                prepareQuery = "";
                throw new BulkImportException("Don't have WHERE Clause");
            }
            
            log.info("UPDATE Query : \n" + prepareQuery);

            //Where Parameter Index Change
            for (int key : importMap.keySet()) {
                ImportColumnType columnType = importMap.get(key);

                if (columnType.unique) {
                    for (ImportColumnType.Param param : columnType.params) {
                        param.valueIndex =  param.valueIndex + setParamCount;
                    }
                }
            }
            
        } catch (Exception e) {
            throw new BulkImportException(BulkImportException.PARSER_MAKE_UPDATE_QUERY_ERROR);
        }
    }

    private void makeMergeIntoQuery() {
        try {
            String merge;
            String using;
            String on;
            String matched;
            String notMatched;

            String update;
            String insert;
            String values;

            merge = "MERGE INTO " + tableName + " A ";
            using = " USING (SELECT ";
            on = " ON (";
            matched = " WHEN MATCHED THEN ";
            notMatched = " WHEN NOT MATCHED THEN ";

            update = "UPDATE SET ";
            insert = "INSERT (";
            values = "VALUES (";

            int paramCount = 0;
            int usingCount = 0;
            int uniqueCount = 0;
            int updateCount = 0;

            for (int key : importMap.keySet()) {
                ImportColumnType columnType = importMap.get(key);
                String column = columnType.column;

                if (usingCount > 0) {
                    using = using + ", " + columnType.subQuery + " AS "+ column;
                    insert = insert + ", " + column;
                    values = values + ", " + "B." + column;
                } else {
                    using = using + columnType.subQuery + " AS "+ column;
                    insert = insert + column;
                    values = values + "B." + column;
                }

                usingCount++;

                if (columnType.update) {
                    if (updateCount > 0) {
                        update = update + ", " + "A." + column + " = " + "B." + column;
                    } else {
                        update = update + "A." + column + " = " + "B." + column;
                    }

                    updateCount++;
                    
                } else if (columnType.unique) {
                    if (columnType.connected) {
                        if (uniqueCount > 0) {
                            on = on + " AND COALESCE(" + "A." + column + ", '') = CASE WHEN COALESCE(A." + column + ", '') = '' THEN '' ELSE " + "B." + column + " END ";
                        } else {
                            on = on + " COALESCE(" + "A." + column + ", '') = CASE WHEN COALESCE(A." + column + ", '') = '' THEN '' ELSE " + "B." + column + " END ";
                        }
                    } else {
                        if (uniqueCount > 0) {
                            on = on + " AND " + "A." + column + " = " + "B." + column;
                        } else {
                            on = on + "A." + column + " = " + "B." + column;
                        }
                    }

                    uniqueCount++;
                }

                if (columnType.useParam) {
                    for (ImportColumnType.Param param : columnType.params) {
                        paramCount++;
                        paramCount = paramCount + param.valueIndex;
                        param.valueIndex = paramCount;
                    }
                }
            }

            if (usingCount == 0 || uniqueCount == 0 || updateCount == 0) {
                prepareQuery = "";
                throw new BulkImportException(BulkImportException.PARSER_MAKE_MERGE_INTO_QUERY_ERROR);
            } else {
                prepareQuery = "";
                prepareQuery = prepareQuery + merge;
                prepareQuery = prepareQuery + using;

                if (databaseType.equals(ORACLE)) {
                    prepareQuery = prepareQuery + " FROM DUAL ";
                }

                prepareQuery = prepareQuery + ") B ";
                prepareQuery = prepareQuery + on + ")";
                prepareQuery = prepareQuery + matched;
                prepareQuery = prepareQuery + update + " ";
                prepareQuery = prepareQuery + notMatched;
                prepareQuery = prepareQuery + insert + ") ";
                prepareQuery = prepareQuery + values + ")";

                if (databaseType.equals(MSSQL)) {
                    prepareQuery = prepareQuery + ";";
                }

                log.info("MERGE INTO Query : \n" + prepareQuery);
            }

        } catch (Exception e) {
            throw e;
        }
    }

    private void makeExportQuery() {
        try {
            String select = "SELECT ";
            String table = "";
            
            int i = 0;
            for (String key : exportMap.keySet()) {
                ExportColumnType columnType = exportMap.get(key);

                if (!columnType.useExport) {
                    continue;
                }

                if (i > 0) {
                    select = select + ", " + columnType.columns;
                } else {
                    select = select + columnType.columns;
                }

                table = table + columnType.join + columnType.subQuery + " " + columnType.alias;

                if (!columnType.on.equals("")) {
                    table = table + columnType.on;
                }

                if (!columnType.columns.equals("")) {
                    i++;
                }
            }

            exportQuery = "";
            exportQuery = select + " " + table;

            log.info("Export SELECT Query : \n" + exportQuery);
        }
        catch (Exception e) {
            throw e;
        }
    }
    
    public boolean checkHeaders() {
        boolean bReturn = true;

        for (int i = 0; i < csvHeaders.size(); i++) {
            csvHeaders.set(i, replaceQuot(csvHeaders.get(i)));
        }

        for (String header : jsonHeaders) {
            if (!(csvHeaders.contains(header))) {
                bReturn = false;
                break;
            }
        }

        if (bReturn) {
            if (csvMap == null) {
                csvMap = new TreeMap<String, Integer>();
            }
            
            csvMap.clear();

            for (String header : csvHeaders) {
                csvMap.put(header, csvMap.size());
            }
        }

        return bReturn;
    }

    protected String replaceQuot(String line) {
        boolean openedString = false;

        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c > 127) {
                continue;
            }

            if (c == '"') {
                openedString = !openedString;
            }

            if (!openedString && c == '\'') {
                builder.append('"');
            } else {
                builder.append(c);
            }
        }
        
        return builder.toString();
    }
    
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Column {
        @JsonInclude(Include.NON_NULL)
        String name;

        @JsonInclude(Include.NON_NULL)
        String type;

        @JsonInclude(Include.NON_NULL)
        String header;

        @JsonInclude(Include.NON_NULL)
        String hidden;

        @JsonInclude(Include.NON_NULL)
        @JsonProperty("default")
        String defaultValue;

        @JsonInclude(Include.NON_NULL)
        @JsonProperty("not_null")
        String notNull;

        @JsonInclude(Include.NON_NULL)
        @JsonProperty("import_column")
        String importColumn;

        @JsonInclude(Include.NON_NULL)
        @JsonProperty("import_table")
        String importTable;

        @JsonInclude(Include.NON_NULL)
        String outer;

        @JsonInclude(Include.NON_NULL)
        String filter;

        @JsonInclude(Include.NON_NULL)
        String update;

        @JsonInclude(Include.NON_NULL)
        String unique;

        @JsonInclude(Include.NON_NULL)
        List<Export> exports;

        @JsonInclude(Include.NON_NULL)
        List<AND> and;

        @JsonInclude(Include.NON_NULL)
        List<OR> or;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        private static class Export {
            String header;

            @JsonInclude(Include.NON_NULL)
            String type;
            
            String column;

            @JsonInclude(Include.NON_NULL)
            String hidden;

            @JsonInclude(Include.NON_NULL)
            @JsonProperty("default")
            String defaultValue;

            @JsonInclude(Include.NON_NULL)
            @JsonProperty("not_null")
            String notNull;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        private static class AND {
            String column;
            String value;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        private static class OR {
            @JsonInclude(Include.NON_NULL)
            List<Group> group;

            @Data
            @JsonIgnoreProperties(ignoreUnknown = true)
            private static class Group {
                String column;
                String value;
            }
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class Filter {
        String name;
        List<Query> querys;

        @JsonInclude(Include.NON_NULL)
        @JsonProperty("import_column")
        String importColumn;

        @JsonInclude(Include.NON_NULL)
        @JsonProperty("import_column_alias")
        String importColumnAlias;

        List<Export> exports;

        @Data
        private static class Query {
            String type;
            String query;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        private static class Export {
            String header;
            String type;
            String column;

            @JsonInclude(Include.NON_NULL)
            String hidden;

            @JsonInclude(Include.NON_NULL)
            @JsonProperty("default")
            String defaultValue;

            @JsonInclude(Include.NON_NULL)
            @JsonProperty("not_null")
            String notNull;
        }
    }

    @Data
    @Builder
    public static class ImportColumnType {
        String column;
        boolean useParam;
        String subQuery;
        String type;

        boolean update;
        boolean unique;
        boolean connected;

        List<Param> params;
        @Data
        @Builder
        public static class Param {
            String header;
            String type;
            int valueIndex;
            boolean isNotNull;
            String defaultValue;
            boolean isHidden;

            // key : header, value : priority
            Map<String, Integer> connectedHeader;
        }
    }

    @Data
    @Builder
    public static class OFConstraints {
        String name;
        List<Column> columns;

        @Data
        @Builder
        public static class Column {
            String name;
            int pariority;
            boolean checkHeaders;
            List<String> headers;
        }
    }

    @Data
    @Builder
    public static class ExportColumnType {
        String columns;
        String subQuery;
        String alias;
        String on;
        String join;

        boolean useExport;
    }

}
