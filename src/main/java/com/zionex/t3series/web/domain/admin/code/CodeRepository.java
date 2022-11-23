package com.zionex.t3series.web.domain.admin.code;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CodeRepository extends JpaRepository<Code, String> {

    List<Code> findBySrcIdAndUseYnAndDelYnNotAndComnCdNotNullOrderByDefaultValueYnDescSeqAscComnCdNmAsc(String srcId, Boolean useYn, Boolean delYn);

    Code findByComnCdAndComnCdNmAndDescrip(String comnCd, String comnCdNm, String descrip);
    
    List<Code> findBySrcIdOrderBySeq(String srcId);

    Code findBySrcIdAndComnCd(String srcId, String comnCd);

    @Transactional
    void deleteBySrcIdIn(List<String> srcIds);

    @Transactional
    void deleteByIdIn(List<String> ids);

    @Transactional
    void deleteBySrcId(String srcId);

}
