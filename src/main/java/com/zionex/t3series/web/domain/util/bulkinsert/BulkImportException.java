package com.zionex.t3series.web.domain.util.bulkinsert;

import org.springframework.stereotype.Component;

@Component
public class BulkImportException extends RuntimeException {
    
    private static final long serialVersionUID = -8097504747965867609L;

    public static final String CSV_HEADER_NOT_MATCH = "CSV File - CSV File Header Not Matched";
    public static final String CSV_FILE_READ_ERROR = "CSV File - Failed CSV File To List<String> or File Read";
    public static final String CSV_ERROR_FILE_ERROR = "CSV File - Failed Make Error CSV File";
    public static final String DB_CONNECTION_ERROR = "DB - Get DB Connection Fail";
    

    public static final String SQL_DELTE_ERROR = "SQL - Failed Excute DELETE Query";
    public static final String SQL_PROCEDURE_ERROR = "SQL - Failed Excute PROCEDURE Query";
    public static final String SQL_INSERT_ERROR = "SQL - Failed Excute INSERT Query";
    public static final String MAX_SQL_ERROR = "SQL - Errors to MAX";

    public static final String PARSER_INIT_ERROR = "PARSING - Failed Init Parameter";
    public static final String PARSER_DBTYPE_ERROR = "PARSING - Failed Init Database Type Parameter";
    public static final String PARSER_PARM_NOT_MATCH = "PARSING - Failed PreparedStatement Parameter Matching";
    public static final String PARSER_DATE_FORMAT_ERROR = "PARSING - Failed Change Date Format";
    public static final String PARSER_MAKE_INSERT_QUERY_ERROR = "PARSING - Failed Make INSERT PreparedStatement";
    public static final String PARSER_MAKE_UPDATE_QUERY_ERROR = "PARSING - Failed Make UPDATE PreparedStatement";
    public static final String PARSER_MAKE_MERGE_INTO_QUERY_ERROR = "PARSING - Failed Make MERGE INTO PreparedStatement";
    public static final String PARSER_TABLE_JSON_OBJECT_ERROR = "PARSING - Failed Make TABLE Json Obejct";
    public static final String PARSER_FILTER_JSON_OBJECT_ERROR = "PARSING - Failed Make FILTER Json Obejct";
    public static final String PARSER_JSON_OBJECT_MAPPING_ERROR = "PARSING - Failed JSON Object to ObjectMapping";
    public static final String PARSER_IMPORT_MAP_ERROR = "PARSING - Failed Make Import MAP";
    public static final String PARSER_SUBQUERY_FILTER_PARSING_ERROR = "PARSING - Failed Filter JSON Parsing";
    public static final String PARSER_SUBQUERY_FILTER_NOT_FOUND = "PARSING - Filter JSON Not Found";

    public String EXCEPTION;

    public BulkImportException() {
        super("BulkImportException");
    }

    public BulkImportException(String message) {
        super("BulkImportException : " + message);
    }

}
