package com.zionex.t3series.web.domain.admin.user;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_USER")
@JsonSerialize(using = UserSerializer.class)
@JsonDeserialize(using = UserDeserializer.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "DISPLAY_NAME")
    private String displayName;

    @Column(name = "ENABLED")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean enabled = true;

    @Column(name = "PASSWORD_EXPIRED")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean passwordExpired = false;

    @Column(name = "LOGIN_FAIL_COUNT")
    private Integer loginFailCount;

    @Column(name = "DEPARTMENT")
    private String department;

    @Column(name = "BUSINESS_VALUE")
    private String businessValue;

    @Column(name = "UNIQUE_VALUE")
    private String uniqueValue;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "PHONE")
    private String phone;

    @Column(name = "ADDRESS")
    private String address;

    @Column(name = "ETC")
    private String etc;

    @Transient
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean adminYn;

    @Column(name = "PASSWORD_MODIFY_DTTM")
    private LocalDateTime passwordModifyDttm;

}
