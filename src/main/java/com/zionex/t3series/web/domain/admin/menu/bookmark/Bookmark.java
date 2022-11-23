package com.zionex.t3series.web.domain.admin.menu.bookmark;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;

@Data
@Entity
@Table(name = "TB_AD_MENU_BOOKMARK")
@Convert(converter = BooleanToYNConverter.class, attributeName = "bookmark")
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonDeserialize(using = BookmarkDeserializer.class)
public class Bookmark {

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

    @Column(name = "BOOKMARK")
    private Boolean bookmark;

}
