package com.zionex.t3series.web.domain.admin.user.permission;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_PERMISSION_GROUP")
public class GroupPermission extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "GRP_ID")
    private String grpId;

    @Column(name = "MENU_ID")
    private String menuId;

    @Column(name = "PERMISSION_TP")
    private String permissionTp;

    @Column(name = "USABILITY")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean usability;

}
