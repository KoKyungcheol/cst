package com.zionex.t3series.web.security.redis.server;

public class RedisBuildingException extends RuntimeException {

    private static final long serialVersionUID = -8058059177460412956L;

    public RedisBuildingException(String message, Throwable cause) {
        super(message, cause);
    }

    public RedisBuildingException(String message) {
        super(message);
    }

}
