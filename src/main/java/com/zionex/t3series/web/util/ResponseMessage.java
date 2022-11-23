package com.zionex.t3series.web.util;

import lombok.Data;

@Data
public class ResponseMessage {

    private final int status;
    private final String message;

    public ResponseMessage(int status, String message) {
        this.status = status;
        this.message = message;
    }

}
