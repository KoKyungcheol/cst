package com.zionex.t3series.web.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import lombok.Data;

public class ResponseEntityUtil {

    public static ResponseEntity<ResponseMessage> setResponseEntity(ResponseMessage responseMessage) {
        return new ResponseEntity<ResponseMessage>(responseMessage, HttpStatus.valueOf(responseMessage.getStatus()));
    }

    @Data
    public static class ResponseMessage {

        private final int status;
        private final String message;
        private Object data;

        public ResponseMessage(int status, String message) {
            this.status = status;
            if (message == null) {
                this.message = (status == 200) ? "Success" : "Fail";
            } else {
                this.message = message;
            }
        }

        public ResponseMessage(int status, String message, Object data) {
            this.status = status;
            if (message == null) {
                this.message = (status == 200) ? "Success" : "Fail";
            } else {
                this.message = message;
            }
            this.data = data;
        }

    }
    
}