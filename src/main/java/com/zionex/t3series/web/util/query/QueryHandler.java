package com.zionex.t3series.web.util.query;

import java.math.BigDecimal;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.Query;
import javax.persistence.StoredProcedureQuery;

import org.apache.commons.collections4.map.CaseInsensitiveMap;
import org.hibernate.Session;
import org.hibernate.jdbc.AbstractReturningWork;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import oracle.jdbc.OracleCallableStatement;
import oracle.jdbc.OracleTypes;

@Log
@Service
@RequiredArgsConstructor
public class QueryHandler {

    private final EntityManager entityManager;
    private final QueryLogService queryLogService;

    private static final String ORACLE = "ORACLE";

    @Value("${spring.datasource.platform}")
    private String databaseType;

    /**
     * 1. Native Query
     */
    public List<?> getNativeQueryData(String sqlString) {
        return this.getNativeQueryData(sqlString, null);
    }

    public List<?> getNativeQueryData(String sqlString, Class<?> resultClass) {
        try {
           Query query;
            if(resultClass == null) {
                query = entityManager.createNativeQuery(sqlString);
            } else {
                query = entityManager.createNativeQuery(sqlString, resultClass);
            }

            return query.getResultList();
        } catch (Exception e) {
            log.warning(String.format("Exception occurs when query. (sql = %s) ", sqlString) + e.getMessage());
        }
        return new ArrayList<>();
    }

    public List<?> getNativeQueryData(String sqlString, Class<?> resultClass, Map<String, Object> params) {
    	try {
    		Query query;
    		if(resultClass == null) {
    			query = entityManager.createNativeQuery(sqlString);
    		} else {
    			query = entityManager.createNativeQuery(sqlString, resultClass);
    		}
    		
    		if (params != null) {
                params.forEach((parameterName, paramValue) -> {
                    query.setParameter(parameterName, paramValue);
                });
            }
    		
    		return query.getResultList();
    	} catch (Exception e) {
    		log.warning(String.format("Exception occurs when query. (sql = %s) ", sqlString) + e.getMessage());
    	}
    	return new ArrayList<>();
    }

    /**
     *  2. Procedure Call
     */
    public List<?> getProcedureData(String procedureName) {
        return this.getProcedureData(procedureName, null, null);
    }

    public List<?> getProcedureData(String procedureName, Class<?> resultClass) {
        return this.getProcedureData(procedureName, resultClass, null);
    }

    public List<?> getProcedureData(String procedureName, Class<?> resultClass, Map<String, Object> params) {
        try {
            StoredProcedureQuery spq;
            if (resultClass == null) {
                spq = entityManager.createStoredProcedureQuery(procedureName);
            } else {
                spq = entityManager.createStoredProcedureQuery(procedureName, resultClass);
            }

            List<String> outParamNames = new ArrayList<>();

            if (params != null) {
                params.forEach((parameterName, parameterInfo) -> {
                    Object[] info = (Object[])parameterInfo;
                    Object paramValue = info[0];
                    Class<?> paramType = (Class<?>)info[1];
                    ParameterMode paramMode = (ParameterMode)info[2];

                    spq.registerStoredProcedureParameter(parameterName, paramType, paramMode);

                    if (paramMode.equals(ParameterMode.IN)) {
                        spq.setParameter(parameterName, paramValue);
                    } else if (paramMode.equals(ParameterMode.OUT)) {
                        outParamNames.add(parameterName);
                    }
                });
            }

            spq.execute();

            if (!outParamNames.isEmpty()) {
                Map<String, Object> outResult = new HashMap<>();
                outParamNames.forEach(key -> outResult.put(key, spq.getOutputParameterValue(key)));
                return new ArrayList<>(Collections.singletonList(outResult));
            }

            return spq.getResultList();
        } catch (Exception e) {
            log.warning(String.format("Exception occurs when procedure. (procedureName = %s) ", procedureName) + e.getMessage());
        }
        return new ArrayList<>();
    }

    /**
     * Procedure 파라메터의 메타 정보를 리턴
     * 
     * @param procName
     * @return
     */
    public List<Map<String, Object>> selectProcParams(String procName) {
        final List<Map<String, Object>> result = new ArrayList<>();
        final List<Map<String, Object>> resultSet = new ArrayList<>();

        try {

            Session hibernateSession = entityManager.unwrap(Session.class);
            hibernateSession.doReturningWork(new AbstractReturningWork<Integer>() {

                public Integer execute(Connection connection) throws SQLException {
                    ResultSet rs = null;
                    try {
                        DatabaseMetaData dbmd = connection.getMetaData();
                        String schema = null;
                        if (databaseType.equalsIgnoreCase(ORACLE)){
                            schema = dbmd.getUserName();
                        }
                        rs = dbmd.getProcedureColumns(null, schema, procName, null);

                        boolean setNoCount = true;
                        String productName = dbmd.getDatabaseProductName();

                        while (rs.next()) {
                            Map<String, Object> param = new HashMap<>();
                            int ColType = rs.getInt("COLUMN_TYPE");

                            // SET NOCOUNT ON 처리
                            if (ColType == DatabaseMetaData.procedureColumnReturn && setNoCount) {
                                setNoCount = false;
                                continue;
                            }

                            String colName = rs.getString("COLUMN_NAME");
                            if (productName.contains("Microsoft")) {
                                colName = colName.replace("@", "");
                            }

                            param.put("COLUMN_NAME", colName);
                            param.put("PROCEDURE_SCHEM", rs.getString("PROCEDURE_SCHEM"));
                            param.put("PROCEDURE_NAME", rs.getString("PROCEDURE_NAME"));

                            param.put("COLUMN_TYPE", rs.getInt("COLUMN_TYPE"));
                            param.put("DATA_TYPE", rs.getInt("DATA_TYPE"));
                            param.put("TYPE_NAME", rs.getString("TYPE_NAME"));
                            param.put("PRECISION", rs.getInt("PRECISION"));
                            param.put("LENGTH", rs.getInt("LENGTH"));

                            param.put("SCALE", rs.getInt("SCALE"));
                            param.put("RADIX", rs.getShort("RADIX"));
                            param.put("NULLABLE", rs.getShort("NULLABLE"));
                            param.put("REMARKS", rs.getString("REMARKS"));
                            param.put("COLUMN_DEF", rs.getString("COLUMN_DEF"));
                            param.put("ORDINAL_POSITION", rs.getInt("ORDINAL_POSITION"));
                            param.put("IS_NULLABLE", rs.getString("IS_NULLABLE"));

                            if (ColType == DatabaseMetaData.procedureColumnIn || ColType == DatabaseMetaData.procedureColumnInOut || ColType == DatabaseMetaData.procedureColumnOut) {
                                if (!result.contains(param)) {
                                    result.add(param);
                                }
                            } else if (ColType == DatabaseMetaData.procedureColumnResult) {
                                resultSet.add(param);
                            }

                        }
                    } finally {
                        try {
                            if (rs != null) {
                                rs.close();
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                    return 0;
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    /* 
    이 함수의 목적은 프로시져 호출을 유연하게 하기 위한 것.
    파라메터 변경이나 결과값의 변경이 일어나더라도 backend 소스는 수정할 필요없이
    frontend와 DB 프로시져 수정만 하면 된다.
    
    JDBC를 직접 이용하는 방법.

    procParams Map 구조:
        "COLUMN_NAME" :
        "PARAM_VALUE" :
        "DATA_TYPE" : java.sql.Types.xxx
        "COLUMN_TYPE": DatabaseMetaData.procedureColumnOut/DatabaseMetaData.procedureColumnIn/
                       DatabaseMetaData.procedureColumnInOut
        오라클인 경우 프로시져 COLUMN_TYPE type이 procedureColumnInOut 이고 REF_CURSOR이면..
        DATA_TYPE: java.sql.Types.OTHER 로 넘어온다.
    */
    public List<Map<String, Object>> getList(String procName, Map<String, Object> inputParams) {
        CaseInsensitiveMap<String, Object> caseIgnoreInputParams = new CaseInsensitiveMap<>();
        if (inputParams != null) {
            caseIgnoreInputParams.putAll(inputParams);
        }
        
        // 파라메터 정보
        List<Map<String, Object>> procParams = selectProcParams(procName);
        queryLogService.traceQuery(procName, caseIgnoreInputParams, procParams);

        if (procParams != null) {
            for (Map<String, Object> procParam : procParams) {
                if (procParam != null) {
                    String parameterName = (String) procParam.get("COLUMN_NAME");
                    int columnType = (int) procParam.get("COLUMN_TYPE");

                    if (columnType == DatabaseMetaData.procedureColumnIn || columnType == DatabaseMetaData.procedureColumnInOut) {
                        Object paramValue = caseIgnoreInputParams.get(parameterName);
                        procParam.put("PARAM_VALUE", paramValue);
                    }
                }
            }
        }

        return getProcedureDataMapList(procName, procParams);
    }

    public List<Map<String, Object>> getProcedureDataMapList(String procedureName, List<Map<String, Object>> procParams) {
        final List<Map<String, Object>> result = new ArrayList<>();

        try {
            Session hibernateSession = entityManager.unwrap(Session.class);

            hibernateSession.doReturningWork(new AbstractReturningWork<Integer>() {

                public Integer execute(Connection connection) throws SQLException {
                    DatabaseMetaData dbmd = connection.getMetaData();
                    String productName = dbmd.getDatabaseProductName();

                    if (productName.contains("Microsoft")) {
                        getProcedureMapDataListMssql(connection, procedureName, procParams, result);
                    } else {
                        getProcedureMapDataListOracle(connection, procedureName, procParams, result);
                    }

                    return 0;
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
        return result;
    }

    public void getProcedureMapDataListMssql(Connection connection, String procedureName, List<Map<String, Object>> procParams, List<Map<String, Object>> result) throws SQLException {
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("{ call ");
        sqlBuilder.append(procedureName);
        if (procParams != null) {
            sqlBuilder.append("(");

            for (int i = 0; i < procParams.size(); i++) {
                if (i != 0) {
                    sqlBuilder.append(",");
                }
                sqlBuilder.append("?");
            }
            sqlBuilder.append(")");
        }
        sqlBuilder.append(" }");
        System.out.println(sqlBuilder);

        CallableStatement cstmt = null;
        try {
            cstmt = connection.prepareCall(sqlBuilder.toString());

            if (procParams != null) {
                for (Map<String, Object> procParam : procParams) {
                    String parameterName = (String) procParam.get("COLUMN_NAME");
                    Object paramValue = procParam.get("PARAM_VALUE");
                    int sqlDataType = (int) procParam.get("DATA_TYPE");
                    int columnType = (int) procParam.get("COLUMN_TYPE");

                    try {
                        if (columnType == DatabaseMetaData.procedureColumnOut) {
                            if (sqlDataType == java.sql.Types.OTHER) {
                                cstmt.registerOutParameter(parameterName, OracleTypes.CURSOR);
                            } else {
                                cstmt.registerOutParameter(parameterName, sqlDataType);
                            }
                        } else if (columnType == DatabaseMetaData.procedureColumnInOut || columnType == DatabaseMetaData.procedureColumnIn) {
                            switch (sqlDataType) {
                                case java.sql.Types.DECIMAL:
                                case java.sql.Types.NUMERIC:
                                    cstmt.setBigDecimal(parameterName, (BigDecimal) paramValue);
                                    break;
                                case java.sql.Types.BINARY:
                                case java.sql.Types.ARRAY:
                                case java.sql.Types.BLOB:
                                case java.sql.Types.VARBINARY:
                                    cstmt.setBytes(parameterName, (byte[]) paramValue);
                                    break;
                                case java.sql.Types.BIGINT:
                                    cstmt.setLong(parameterName, (long) paramValue);
                                    break;
                                case java.sql.Types.BOOLEAN:
                                    cstmt.setBoolean(parameterName, (boolean) paramValue);
                                    break;
                                case java.sql.Types.DATE:
                                    cstmt.setDate(parameterName, (java.sql.Date) paramValue);
                                    break;
                                case java.sql.Types.TIME:
                                case java.sql.Types.TIMESTAMP:
                                    cstmt.setTimestamp(parameterName, (java.sql.Timestamp) paramValue);
                                    break;
                                case java.sql.Types.REAL:
                                case java.sql.Types.DOUBLE:
                                    cstmt.setDouble(parameterName, (double) paramValue);
                                    break;
                                case java.sql.Types.INTEGER:
                                    cstmt.setInt(parameterName, (int) paramValue);
                                    break;
                                case java.sql.Types.FLOAT:
                                    cstmt.setFloat(parameterName, (float) paramValue);
                                    break;
                                case java.sql.Types.BIT:
                                case java.sql.Types.SMALLINT:
                                case java.sql.Types.TINYINT:
                                    cstmt.setShort(parameterName, (short) paramValue);
                                    break;
                                case java.sql.Types.NVARCHAR:
                                case java.sql.Types.CHAR:
                                case java.sql.Types.VARCHAR:
                                case java.sql.Types.NCHAR:
                                case java.sql.Types.CLOB:
                                case java.sql.Types.LONGNVARCHAR:
                                case java.sql.Types.LONGVARCHAR:
                                default:
                                    cstmt.setString(parameterName, (String) paramValue);
                                    break;
                            }
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            ResultSet rs = cstmt.executeQuery();

            ResultSetMetaData rsmd = rs.getMetaData();
            int colCnt = rsmd.getColumnCount();
            String[] aliases = new String[colCnt];

            for (int i = 1; i <= colCnt; i++) {
                aliases[i - 1] = rsmd.getColumnName(i);
            }

            while (rs.next()) {
                Map<String, Object> data = new HashMap<>();
                Arrays.asList(aliases).forEach(k -> {
                    try {
                        data.put(k, rs.getObject(k));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
                result.add(data);
            }

        } finally {
            if (cstmt != null)
                cstmt.close();
        }
    }

    public void getProcedureMapDataListOracle(Connection connection, String procedureName, List<Map<String, Object>> procParams, List<Map<String, Object>> result) throws SQLException {
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("{ call ");
        sqlBuilder.append(procedureName);
        if (procParams != null) {
            sqlBuilder.append("(");

            for (int i = 0; i < procParams.size(); i++) {
                if (i != 0){
                    sqlBuilder.append(",");
                }
                sqlBuilder.append("?");
            }
            sqlBuilder.append(")");
        }
        sqlBuilder.append(" }");
        System.out.println(sqlBuilder);

        CallableStatement cstmt = null;
        OracleCallableStatement ocstmt = null;
        try {
            cstmt = connection.prepareCall(sqlBuilder.toString());
            ocstmt = cstmt.unwrap(OracleCallableStatement.class);

            int cursoridx = -1;
            if (procParams != null) {
                for (Map<String, Object> procParam : procParams) {
                    Object paramValue = procParam.get("PARAM_VALUE");
                    int sqlDataType = (int) procParam.get("DATA_TYPE");
                    int columnType = (int) procParam.get("COLUMN_TYPE");
                    int columnPosition = (int) procParam.get("ORDINAL_POSITION");
                    columnPosition++;
                    try {
                        if (columnType == DatabaseMetaData.procedureColumnOut) {

                            if (sqlDataType == java.sql.Types.OTHER) {
                                ocstmt.registerOutParameter(columnPosition, OracleTypes.CURSOR);
                                cursoridx = columnPosition;
                            } else {
                                ocstmt.registerOutParameter(columnPosition, sqlDataType);
                            }
                        } else if (columnType == DatabaseMetaData.procedureColumnInOut || columnType == DatabaseMetaData.procedureColumnIn) {
                            switch (sqlDataType) {
                                case java.sql.Types.DECIMAL:
                                case java.sql.Types.NUMERIC:
                                    ocstmt.setBigDecimal(columnPosition, (BigDecimal) paramValue);
                                    break;
                                case java.sql.Types.BINARY:
                                case java.sql.Types.ARRAY:
                                case java.sql.Types.BLOB:
                                case java.sql.Types.VARBINARY:
                                    ocstmt.setBytes(columnPosition, (byte[]) paramValue);
                                    break;
                                case java.sql.Types.BIGINT:
                                    ocstmt.setLong(columnPosition, (long) paramValue);
                                    break;
                                case java.sql.Types.BOOLEAN:
                                    ocstmt.setBoolean(columnPosition, (boolean) paramValue);
                                    break;
                                case java.sql.Types.DATE:
                                    cstmt.setDate(columnPosition, (java.sql.Date) paramValue);
                                    break;
                                case java.sql.Types.TIME:
                                case java.sql.Types.TIMESTAMP:
                                    ocstmt.setTimestamp(columnPosition, (java.sql.Timestamp) paramValue);
                                    break;
                                case java.sql.Types.REAL:
                                case java.sql.Types.DOUBLE:
                                    ocstmt.setDouble(columnPosition, (double) paramValue);
                                    break;
                                case java.sql.Types.INTEGER:
                                    ocstmt.setInt(columnPosition, (int) paramValue);
                                    break;
                                case java.sql.Types.FLOAT:
                                    ocstmt.setFloat(columnPosition, (float) paramValue);
                                    break;
                                case java.sql.Types.BIT:
                                case java.sql.Types.SMALLINT:
                                case java.sql.Types.TINYINT:
                                    ocstmt.setShort(columnPosition, (short) paramValue);
                                    break;
                                case java.sql.Types.NVARCHAR:
                                case java.sql.Types.CHAR:
                                case java.sql.Types.VARCHAR:
                                case java.sql.Types.NCHAR:
                                case java.sql.Types.CLOB:
                                case java.sql.Types.LONGNVARCHAR:
                                case java.sql.Types.LONGVARCHAR:
                                default:
                                    ocstmt.setString(columnPosition, (String) paramValue);
                                    break;
                            }
                        }

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            ocstmt.execute();

            ResultSet rs = ocstmt.getCursor(cursoridx);
            if (rs != null) {
                ResultSetMetaData rsmd = rs.getMetaData();
                int colCnt = rsmd.getColumnCount();
                String[] aliases = new String[colCnt];

                for (int i = 1; i <= colCnt; i++) {
                    aliases[i - 1] = rsmd.getColumnName(i);
                }

                while (rs.next()) {
                    Map<String, Object> data = new HashMap<>();
                    Arrays.asList(aliases).forEach(k -> {
                        try {
                            data.put(k, rs.getObject(k));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    });
                    result.add(data);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();

        } finally {
            if (ocstmt != null)
                ocstmt.close();
            if (cstmt != null)
                cstmt.close();
        }
    }

}
