package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferenceDetailRepository extends JpaRepository<PreferenceDetail, String> {

    int countByUserPrefMstId(String userPrefMstId);

    boolean existsByUserPrefMstIdAndGrpIdAndFldCd(String userPrefMstId, String groupId, String fieldCd);

    List<PreferenceDetail> findByUserPrefMstId(String userPrefMstId);

    List<PreferenceDetail> findByUserPrefMstIdAndGrpIdOrderByFldSeqAscFldCdAsc(String userPrefMstId, String groupId);

    List<PreferenceDetail> findByUserPrefMstIdAndGrpIdAndCrosstabItemCdNotNullOrderByUserPrefMstIdAscCrosstabItemCdAscFldSeqAsc(String userPrefMstId, String groupId);

    @Transactional
    void deleteByUserPrefMstId(String userPrefMstId);

    @Transactional
    void deleteByGrpIdIn(List<String> groupIds);

}
