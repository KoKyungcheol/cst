package com.zionex.t3series.web.domain.admin.code;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupCodeRepository extends JpaRepository<GroupCode, String> {
    
    GroupCode findByGrpCdAndUseYn(String grpCd, Boolean useYn);

    GroupCode findByGrpCd(String grcCd);

    List<GroupCode> findByGrpCdContainingAndGrpNmContainingOrderByGrpCd(String grpCd, String grpNm);

    @Transactional
    void deleteByIdIn(List<String> ids);

}
