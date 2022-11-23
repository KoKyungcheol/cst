
package com.zionex.t3series.web.domain.util.bulkinsert;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ImportSchema {

    @JsonProperty("COMMON")
    List<String> common;

    @JsonProperty("TABLE")
    List<SchemaItem> table;

    @Data
    public static class SchemaItem {

        String module;

        String table;

        int level;

        int step;

        String multiple;

        String essential;

        String importable;

        String lowLevelDeleteInclude;
    }

}

