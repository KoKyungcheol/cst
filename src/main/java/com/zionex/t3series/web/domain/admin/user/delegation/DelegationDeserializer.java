package com.zionex.t3series.web.domain.admin.user.delegation;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.zionex.t3series.web.domain.admin.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;

public class DelegationDeserializer extends StdDeserializer<Delegation> {

    private static final long serialVersionUID = 3055742127541926241L;

    @Autowired
    private UserService userService;

    public DelegationDeserializer() {
        this(null);
    }

    public DelegationDeserializer(Class<Delegation> vc) {
        super(vc);
    }

    @Override
    public Delegation deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException {
        JsonNode node = jp.getCodec().readTree(jp);

        Delegation delegation = new Delegation();
        delegation.setUserId(userService.getUser(node.get("userId").asText()).getId());
        delegation.setDelegationUserId(userService.getUser(node.get("delegationUserId").asText()).getId());

        JsonNode applyStartDttm = node.get("applyStartDttm");
        JsonNode applyEndDttm = node.get("applyEndDttm");

        if (applyStartDttm != null && applyStartDttm.isTextual()) {
            delegation.setApplyStartDttm(LocalDateTime.parse(applyStartDttm.asText(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        if (applyEndDttm != null && applyEndDttm.isTextual()) {
            delegation.setApplyEndDttm(LocalDateTime.parse(applyEndDttm.asText(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }

        return delegation;
    }

}
