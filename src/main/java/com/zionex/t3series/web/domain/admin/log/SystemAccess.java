package com.zionex.t3series.web.domain.admin.log;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.zionex.t3series.web.domain.admin.user.User;

import lombok.Data;

@Data
@Entity
@Table(name = "TB_AD_SYSTEM_ACCESS_LOG")
@JsonSerialize(using = SystemAccessSerializer.class)
public class SystemAccess {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Column(name = "ACCESS_IP")
    String accessIp;

    @Column(name = "ACCESS_DTTM")
    LocalDateTime accessDttm;

    @Column(name = "LOGOUT_DTTM")
    LocalDateTime logoutDttm;

}
