package com.zionex.t3series.web.domain.admin.user.preference;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import com.zionex.t3series.web.util.audit.BaseEntity;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_USER_PREF_OPT")
public class PreferenceOption extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "USER_PREF_MST_ID")
    private String userPrefMstId;

    @Column(name = "OPT_TP")
    private String optTp;

    @Column(name = "OPT_VALUE")
    private String optValue;

}
