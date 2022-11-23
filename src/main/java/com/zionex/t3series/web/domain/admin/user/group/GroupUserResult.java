package com.zionex.t3series.web.domain.admin.user.group;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class GroupUserResult {

    private String userId;
    private String username;
    private String displayName;
    private String department;
    private String businessValue;
    private String grpCd;

}
