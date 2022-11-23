package com.zionex.t3series.web.domain.admin.user;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

public class UserDeserializer extends StdDeserializer<User> {

    private static final long serialVersionUID = 3849601185722038343L;

    public UserDeserializer() {
        this(null);
    }

    public UserDeserializer(Class<User> vc) {
        super(vc);
    }

    @Override
    public User deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException {
        JsonNode node = jp.getCodec().readTree(jp);

        User user = new User();

        JsonNode username = node.get("username");
        JsonNode displayName = node.get("displayName");
        JsonNode department = node.get("department");
        JsonNode businessValue = node.get("businessValue");
        JsonNode uniqueValue = node.get("uniqueValue");
        JsonNode email = node.get("email");
        JsonNode phone = node.get("phone");
        JsonNode address = node.get("address");
        JsonNode etc = node.get("etc");
        JsonNode adminYn = node.get("adminYn");

        if (username != null && username.isTextual()) user.setUsername(username.asText());
        if (displayName != null && displayName.isTextual()) user.setDisplayName(displayName.asText());
        if (department != null && department.isTextual()) user.setDepartment(department.asText());
        if (businessValue != null && businessValue.isTextual()) user.setBusinessValue(businessValue.asText());
        if (uniqueValue != null && uniqueValue.isTextual()) user.setUniqueValue(uniqueValue.asText());
        if (email != null && email.isTextual()) user.setEmail(email.asText());
        if (phone != null && phone.isTextual()) user.setPhone(phone.asText());
        if (address != null && address.isTextual()) user.setAddress(address.asText());
        if (etc != null && etc.isTextual()) user.setEtc(etc.asText());
        if (adminYn != null && adminYn.isBoolean()) user.setAdminYn(adminYn.asBoolean());

        return user;
    }

}
