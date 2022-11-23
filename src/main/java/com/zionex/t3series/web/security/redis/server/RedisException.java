package com.zionex.t3series.web.security.redis.server;

public class RedisException extends RuntimeException {

    private static final long serialVersionUID = 8238042724937330301L;

    public RedisException(String message, Throwable cause) {
        super(message, cause);
    }

    public RedisException(String message) {
        super(message);
    }

}
