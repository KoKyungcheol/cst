package com.zionex.t3series.web.domain.util.bulkinsert;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ResponseDataWithSingleMessage {

    // Service success status flag
    // ? success = true, failure = false
    private boolean success;

    // Service message
    private String message;

    // Service data
    private Object data;
    
}
