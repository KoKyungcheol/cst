package com.zionex.t3series.web.domain.admin.user.delegation;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.GenericGenerator;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zionex.t3series.web.util.audit.BaseEntity;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_DELEGATION")
@JsonDeserialize(using = DelegationDeserializer.class)
public class Delegation extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "USER_ID")
    private String userId;

    @Transient
    private String displayName;

    @Column(name = "DELEGATION_USER_ID")
    private String delegationUserId;

    @Transient
    private String delegationDisplayName;

    @Column(name = "APPLY_START_DTTM")
    private LocalDateTime applyStartDttm;

    @Column(name = "APPLY_END_DTTM")
    private LocalDateTime applyEndDttm;

    public boolean checkValidation(LocalDateTime now) {
        if (applyStartDttm != null) {
            LocalDateTime from = applyStartDttm.truncatedTo(ChronoUnit.HOURS);
            if (now.isBefore(from)) {
                return false;
            }
        }

        if (applyEndDttm != null) {
            LocalDateTime to = LocalDateTime.of(applyEndDttm.toLocalDate(), LocalTime.MAX);
            if (now.isAfter(to)) {
                return false;
            }
        }

        return true;
    }

}
