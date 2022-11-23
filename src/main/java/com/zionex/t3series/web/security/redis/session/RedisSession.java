package com.zionex.t3series.web.security.redis.session;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@RedisHash("T3SESSIONID")
@JsonSerialize(using = RedisSessionSerializer.class)
@Getter
@Setter
@ToString
public class RedisSession implements Serializable {

    private static final long serialVersionUID = -4780659306405484034L;

    @Id
    private String id;

    @Indexed
    private String tenantName;

    @Indexed
    private String userId;

    @Indexed
    private String username;

    private String displayName;

    private boolean systemAdmin;

    private LocalDateTime sessionDttm;

    public RedisSession() {
        this("None", "None", "None", "None", "None", false);
    }

    @Builder
    public RedisSession(String id, String tenantName, String userId, String username, String displayName, boolean systemAdmin) {
        this.id = id;
        this.tenantName = tenantName;
        this.userId = userId;
        this.username = username;
        this.displayName = displayName;
        this.systemAdmin = systemAdmin;

        this.sessionDttm = LocalDateTime.now();
    }

}
