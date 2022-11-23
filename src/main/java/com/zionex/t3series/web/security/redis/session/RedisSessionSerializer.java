package com.zionex.t3series.web.security.redis.session;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

public class RedisSessionSerializer extends StdSerializer<RedisSession> {

    private static final long serialVersionUID = -6164356345589062516L;

    public RedisSessionSerializer() {
        this(null);
    }

    public RedisSessionSerializer(Class<RedisSession> t) {
        super(t);
    }

    @Override
    public void serialize(RedisSession redisSession, JsonGenerator generator, SerializerProvider provider) throws IOException {
        generator.writeStartObject();
        generator.writeStringField("username", redisSession.getUsername());
        generator.writeStringField("displayName", redisSession.getDisplayName());
        generator.writeBooleanField("systemAdmin", redisSession.isSystemAdmin());
        generator.writeEndObject();
    }

}
