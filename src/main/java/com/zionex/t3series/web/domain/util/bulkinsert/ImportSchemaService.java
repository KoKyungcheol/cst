package com.zionex.t3series.web.domain.util.bulkinsert;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zionex.t3series.web.domain.util.exception.NoContentException;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import lombok.Builder;
import lombok.Data;

@Service
public class ImportSchemaService {

    private static final String SCHEMA_FILE_PATH = "structure/import_schema.json";

    @Autowired
    @Qualifier("dataSource")
    DataSource dataSource;

    @Autowired
    ImportJobRepository importJobRepository;

    /**
     * Get import schema from json file
     */
    public ImportSchema getImportSchema() throws IOException {
        return readFromJsonFile();
    }

    /**
     * Get table data from import schema
     *
     * @param module Module name
     */
    public Collection<List<ResultTableItem>> getImportTables(String module) throws IOException {
        ImportSchema schema = readFromJsonFile();
        ImportSchemaService.DBQuery dbQuery = getDbQueryHandle().active();

        if (!preCheckCommonCondition(dbQuery, schema)) {
            dbQuery.finish();
            throw new NoContentException();
        }

        Collection<List<ResultTableItem>> result = schema.getTable().stream()
                .filter(it -> it.getModule().equals(module))
                .map(it -> {
                    return ResultTableItem.builder()
                            .table(it.getTable())
                            .level(it.getLevel())
                            .step(it.getStep())
                            .multiple(it.getMultiple().equals("Y"))
                            .essential(it.getEssential().equals("Y"))
                            .imported(dbQuery.select(Collections.singletonList(it.getTable())))
                            .enable(preCheckLevelCondition(dbQuery, schema, it))
                            .importable(it.getImportable().equals("Y"))
                            .lowLevelDeleteInclude(it.getLowLevelDeleteInclude().equals("Y"))
                            .dataCount(dbQuery.count(it.getTable()))
                            .build();
                })
                .collect(Collectors.groupingBy(ResultTableItem::getLevel, TreeMap::new, Collectors.toList())).values();

        dbQuery.finish();
        
        if (result.size() == 0) {
            throw new NoContentException();
        }
        
        return result;
    }

    /**
     * Get module data from import schema
     */
    public List<String> getImportModules() throws IOException {
        ImportSchema schema = readFromJsonFile();

        assert schema != null;
        List<String> result = schema.getTable().stream()
                .map(ImportSchema.SchemaItem::getModule)
                .distinct()
                .collect(Collectors.toList());
        
        if (result.size() == 0) {
            throw new NoContentException();
        }
        
        return result;
    }

    /**
     * Get table status data
     *
     * @param table Table name
     */
    public ResultTableStatus getTableStatus(String table) {
        ImportSchemaService.DBQuery dbQuery = getDbQueryHandle().active();

        ResultTableStatus result = ResultTableStatus.builder()
                .count(dbQuery.count(table))
                .enable(preCheckTableJobStatus(table))
                .build();

        dbQuery.finish();
        
        return result;
    }

    /**
     * Get lower-level table data from import schema
     *
     * @param module Module name
     * @param table  Table name
     */
    public List<String> getLowerLevelTables(String module, String table) throws IOException {
        ImportSchema schema = readFromJsonFile();

        // The SchemaItem
        ImportSchema.SchemaItem schemaItem = Optional.ofNullable(
                schema.getTable().parallelStream()
                    .filter(it -> it.getModule().equals(module) && it.getTable().equals(table))
                    .findFirst()
                    .orElseThrow(NoContentException::new))
                    .orElse(null);

        // Lower-level tables
        List<String> result = schema.getTable().parallelStream()
                .filter(it -> it.getModule().equals(schemaItem.getModule()) &&
                        it.getLevel() > schemaItem.getLevel() &&
                        it.getLowLevelDeleteInclude().equals("Y")
                )
                .map(ImportSchema.SchemaItem::getTable)
                .collect(Collectors.toList());
        
        if (result.size() == 0) {
            throw new NoContentException();
        }
        
        return result;
    }

    /* Read schema from json file */
    private ImportSchema readFromJsonFile() throws IOException {
        File file = new ClassPathResource(SCHEMA_FILE_PATH).getFile();
        String jsonData = FileUtils.readFileToString(file, StandardCharsets.UTF_8);

        return convertJsonToObject(jsonData);
    }

    /* Convert json to object */
    private ImportSchema convertJsonToObject(String jsonData) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            return objectMapper.readValue(jsonData, new TypeReference<ImportSchema>() {});
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    /* Get database query handle */
    private ImportSchemaService.DBQuery getDbQueryHandle() {
        return ImportSchemaService.DBQuery.builder().iDataSource(dataSource).build();
    }

    /* Pre check common table condition */
    private boolean preCheckCommonCondition(ImportSchemaService.DBQuery dbQuery, ImportSchema schema) {
        return dbQuery.select(schema.getCommon().parallelStream()
                .collect(Collectors.toList()));
    }

    /* Pre check parent level table condition */
    private boolean preCheckLevelCondition(ImportSchemaService.DBQuery dbQuery, ImportSchema schema, ImportSchema.SchemaItem schemaItem) {
        // Upper level tables
        List<String> upLevelTables = schema.getTable().parallelStream()
                .filter(it -> it.getModule().equals(schemaItem.getModule()) && 
                                it.getEssential().equals("Y") &&
                                it.getLevel() < schemaItem.getLevel()
                )
                .map(ImportSchema.SchemaItem::getTable)
                .collect(Collectors.toList());
        
        if (upLevelTables.size() > 0) {
            return dbQuery.select(upLevelTables) && preCheckTableJobStatus(upLevelTables);
        }
        
        return true;
    }

    /* Pre check table import job status */
    private boolean preCheckTableJobStatus(String table) {
        return importJobRepository.findAllByJobTableAndCompleteYn(table, "N").size() <= 0;
    }

    /* Pre check table import job status */
    private boolean preCheckTableJobStatus(List<String> tables) {
        AtomicBoolean result = new AtomicBoolean(true);
        tables.forEach(it -> {
                if (importJobRepository.findAllByJobTableAndCompleteYn(it, "N").size() > 0) {
                    result.set(false);
                }
            });

        return result.get();
    }

    /**
     * Database query handle
     */
    @Builder
    @Data
    public static class DBQuery {
        DataSource iDataSource;
        Connection iConnection;

        public boolean select(List<String> tables) {
            Statement statement = null;
            ResultSet resultSet = null;

            try {
                for (String table : tables) {
                    statement = iConnection.createStatement();
                    resultSet = statement.executeQuery(makeSelectStatement(table));
                    resultSet.next();

                    int count = resultSet.getInt("count");
                    if (count == 0) return false;
                }
            } catch (SQLException e) {
                throw new BulkImportException(e.getMessage());
            } finally {
                try {
                    if (statement != null) statement.close();
                    if (resultSet != null) resultSet.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }

            return true;
        }

        public int count(String table) {
            Statement statement = null;
            ResultSet resultSet = null;

            try {
                statement = iConnection.createStatement();
                resultSet = statement.executeQuery(makeSelectStatement(StringUtils.replace(table, "'", "''")));
                resultSet.next();
                return resultSet.getInt("count");
                
            } catch (SQLException e) {
                throw new NoContentException();
            } finally {
                try {
                    if (statement != null) statement.close();
                    if (resultSet != null) resultSet.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }

        public void insert() {
        }

        public void update() {
        }

        public void delete() {
        }

        public ImportSchemaService.DBQuery active() {
            if (iConnection == null) {
                try {
                    iConnection = iDataSource.getConnection();
                } catch (SQLException e) {
                    throw new NoContentException();
                }
            }

            return this;
        }

        public void finish() {
            try {
                iConnection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        private String makeSelectStatement(String table) {
            return "select count(*) as count from " + table;
        }
    }

    @Builder
    @Data
    public static class ResultTableItem {
        String table;
        int level;
        int step;
        boolean multiple;
        boolean essential;
        boolean imported;
        boolean enable;
        boolean importable;
        boolean lowLevelDeleteInclude;
        int dataCount;
    }

    @Builder
    @Data
    public static class ResultTableStatus {
        int count;
        boolean enable;
    }

}
