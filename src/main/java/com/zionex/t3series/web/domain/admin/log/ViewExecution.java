package com.zionex.t3series.web.domain.admin.log;

import java.time.Duration;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.zionex.t3series.web.domain.admin.user.User;

import lombok.Data;

@Data
@Entity
@Table(name = "TB_AD_VIEW_EXECUTION_LOG")
@IdClass(ViewExecutionPK.class)
public class ViewExecution {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "USER_ID")
    private User user;

    @Transient
    private String username;

    @Column(name = "USER_IP")
    private String userIp;

    @Column(name = "USER_BROWSER")
    private String userBrowser;

    @Id
    private String viewCd;

    @Transient
    private String viewNm;

    @Column(name = "EXECUTION_DTTM")
    private LocalDateTime executionDttm;

    @Column(name = "MODIFY_DTTM")
    private LocalDateTime modifyDttm;

    @Transient
    private Float runningTime;

    public Float getRunningTime() {
        if (modifyDttm != null) {
            Duration duration = Duration.between(executionDttm, modifyDttm);
            return runningTime = duration.getSeconds() / 60.0f;
        } else {
            return null;
        }
    }

}
