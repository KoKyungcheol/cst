package com.zionex.t3series.web.domain.util.calendar;

import java.time.LocalDate;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.zionex.t3series.web.util.audit.BaseEntity;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_UT_CALENDAR")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Calendar extends BaseEntity {
    
    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "START_DATE")
    LocalDate startDate;

    @Column(name = "END_DATE")
    LocalDate endDate;

    @Column(name = "CONTENT")
    private String content;

}