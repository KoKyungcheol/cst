package com.zionex.t3series.web.domain.admin.user.permission;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import org.hibernate.annotations.GenericGenerator;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_PERMISSION")
public class Permission extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "MENU_ID")
    private String menuId;

    @Transient
    private String menuCd;

    @Column(name = "PERMISSION_TP")
    private String permissionTp;

    @Column(name = "USABILITY")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean usability;

}
