package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferenceInfoRepository extends JpaRepository<PreferenceInfo, String> {

    int countByUserIdAndUserPrefMstIdAndGrpId(String userId, String userPrefMstId, String groupId);

    List<PreferenceInfo> findUserIdDistinctByUserPrefMstIdAndGrpId(String userPrefMstId, String groupId);

    List<PreferenceInfo> findByUserPrefMstIdAndGrpIdAndUserIdOrderByDimMeasureTpAscFldSeqAsc(String userPrefMstId, String groupId, String userId);

    List<PreferenceInfo> findByUserPrefMstIdAndGrpIdAndUserIdAndCrosstabItemCdNotNullOrderByUserPrefMstIdAscCrosstabItemCdAscFldSeqAsc(String userPrefMstId, String groupId, String userId);

    PreferenceInfo findByUserPrefMstIdAndGrpIdAndUserIdAndFldCdOrderByFldSeqAsc(String userPrefMstId, String groupId, String userId, String fieldCd);

    @Transactional
    void deleteByUserPrefMstId(String userPrefMstId);

    @Transactional
    void deleteByUserPrefMstIdAndGrpIdAndUserId(String userPrefMstId, String groupId, String userId);

    @Transactional
    void deleteByUserIdIn(List<String> userIds);

    @Transactional
    void deleteByUserPrefMstIdAndGrpIdAndFldCd(String userPrefMstId, String groupId, String fieldCd);

    @Transactional
    void deleteByGrpIdIn(List<String> groupIds);

}
