package com.zionex.t3series.web.domain.admin.user;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.zionex.t3series.web.domain.admin.user.authority.AuthorityService;

import org.springframework.beans.factory.annotation.Autowired;

public class UserSerializer extends StdSerializer<User> {

    private static final long serialVersionUID = 3303703835726550681L;
    
    @Autowired
    private AuthorityService authorityService;

    public UserSerializer() {
        this(null);
    }

    public UserSerializer(Class<User> t) {
        super(t);
    }

    @Override
    public void serialize(User user, JsonGenerator generator, SerializerProvider provider) throws IOException {
        generator.writeStartObject();
        generator.writeStringField("id", user.getId());
        generator.writeStringField("username", user.getUsername());

        String displayName = user.getDisplayName();
        if (displayName != null) {
            generator.writeStringField("displayName", displayName);
        } else {
            generator.writeNullField("displayName");
        }

        Boolean enabled = user.getEnabled();
        if (enabled != null) {
            generator.writeBooleanField("enabled", enabled);
        } else {
            generator.writeNullField("enabled");
        }

        Boolean passwordExpired = user.getPasswordExpired();
        if (passwordExpired != null) {
            generator.writeBooleanField("passwordExpired", passwordExpired);
        } else {
            generator.writeNullField("passwordExpired");
        }

        Integer loginFailCount = user.getLoginFailCount();
        if (loginFailCount != null) {
            generator.writeNumberField("loginFailCount", loginFailCount);
        } else {
            generator.writeNullField("loginFailCount");
        }

        String department = user.getDepartment();
        if (department != null) {
            generator.writeStringField("department", department);
        } else {
            generator.writeNullField("department");
        }

        String businessValue = user.getBusinessValue();
        if (businessValue != null) {
            generator.writeStringField("businessValue", businessValue);
        } else {
            generator.writeNullField("businessValue");
        }

        String uniqueValue = user.getUniqueValue();
        if (uniqueValue != null) {
            generator.writeStringField("uniqueValue", uniqueValue);
        } else {
            generator.writeNullField("uniqueValue");
        }

        String email = user.getEmail();
        if (email != null) {
            generator.writeStringField("email", email);
        } else {
            generator.writeNullField("email");
        }

        String phone = user.getPhone();
        if (phone != null) {
            generator.writeStringField("phone", phone);
        } else {
            generator.writeNullField("phone");
        }

        String address = user.getAddress();
        if (address != null) {
            generator.writeStringField("address", address);
        } else {
            generator.writeNullField("address");
        }

        String etc = user.getEtc();
        if (etc != null) {
            generator.writeStringField("etc", etc);
        } else {
            generator.writeNullField("etc");
        }

        boolean existAdmin = authorityService.existsAuthority(user.getId(), "ADMIN");
        generator.writeBooleanField("adminYn", existAdmin);

        generator.writeEndObject();
    }

}
