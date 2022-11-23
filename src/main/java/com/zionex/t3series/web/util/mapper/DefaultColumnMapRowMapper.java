package com.zionex.t3series.web.util.mapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Map;

import org.springframework.jdbc.core.ColumnMapRowMapper;
import org.springframework.jdbc.support.JdbcUtils;

public class DefaultColumnMapRowMapper extends ColumnMapRowMapper {

    @Override
    public Map<String, Object> mapRow(ResultSet rs, int rowNum) throws SQLException {
        ResultSetMetaData rsmd = rs.getMetaData();
        int columnCount = rsmd.getColumnCount();
        Map<String, Object> mapOfColumnValues = createColumnMap(columnCount);
        for (int i = 1; i <= columnCount; i++) {
            String column = JdbcUtils.lookupColumnName(rsmd, i);
            Object value = getColumnValue(rs, i);

            int type = rsmd.getColumnType(i);
            int precision = rsmd.getPrecision(i);
            if (type == Types.CHAR && precision == 1) {
                value = "Y".equals(value);
            }

            mapOfColumnValues.putIfAbsent(getColumnKey(column), value);
        }
        return mapOfColumnValues;
    }

}
