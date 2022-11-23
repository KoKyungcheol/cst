package com.zionex.t3series.web.domain.admin.log;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.zionex.t3series.web.domain.admin.user.User;

public class SystemAccessSerializer extends StdSerializer<SystemAccess> {

    private static final long serialVersionUID = -3347095001802293368L;

    public SystemAccessSerializer() {
        this(null);
    }

    public SystemAccessSerializer(Class<SystemAccess> t) {
        super(t);
    }

    @Override
    public void serialize(SystemAccess systemAccess, JsonGenerator generator, SerializerProvider provider) throws IOException {
        User user = systemAccess.getUser();

        generator.writeStartObject();
        generator.writeStringField("username", user.getUsername());
        String displayName = user.getDisplayName();
        if (displayName != null) {
            generator.writeStringField("displayName", displayName);
        } else {
            generator.writeNullField("displayName");
        }
        generator.writeStringField("accessIp", systemAccess.getAccessIp());
        generator.writeStringField("accessDttm", systemAccess.getAccessDttm().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        LocalDateTime logoutDttm = systemAccess.getLogoutDttm();
        if (logoutDttm != null) {
            generator.writeStringField("logoutDttm", logoutDttm.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        } else {
            generator.writeNullField("logoutDttm");
        }
        generator.writeEndObject();
    }

}
