package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PreferenceInfoService {

    private final PreferenceInfoRepository preferenceRepository;

    public int getRowCount(final String userId, final String userPrefMstId, final String groupId) {
        return preferenceRepository.countByUserIdAndUserPrefMstIdAndGrpId(userId, userPrefMstId, groupId);
    }

    public List<PreferenceInfo> getPreferences(final String userPrefMstId, final String groupId, final String userId) {
        if (userId == null)
            return preferenceRepository.findUserIdDistinctByUserPrefMstIdAndGrpId(userPrefMstId, groupId);
        else
            return preferenceRepository.findByUserPrefMstIdAndGrpIdAndUserIdOrderByDimMeasureTpAscFldSeqAsc(userPrefMstId, groupId, userId);
    }

    public List<PreferenceInfo> getPreferencesForCrosstab(final String userPrefMstId, final String groupId, final String userId) {
        return preferenceRepository.findByUserPrefMstIdAndGrpIdAndUserIdAndCrosstabItemCdNotNullOrderByUserPrefMstIdAscCrosstabItemCdAscFldSeqAsc(userPrefMstId, groupId, userId);
    }

    public PreferenceInfo getPreference(final String userId, final String userPrefMstId, final String groupId, final String fieldCd) {
        return preferenceRepository.findByUserPrefMstIdAndGrpIdAndUserIdAndFldCdOrderByFldSeqAsc(userPrefMstId, groupId, userId, fieldCd);
    }

    public void savePreferences(final List<PreferenceInfo> preferences) {
        preferenceRepository.saveAll(preferences);
    }

    public void deletePreferences(final String userPrefMstId) {
        preferenceRepository.deleteByUserPrefMstId(userPrefMstId);
    }

    public void deletePreferences(final String userPrefMstId, final String groupId, final String userId) {
        preferenceRepository.deleteByUserPrefMstIdAndGrpIdAndUserId(userPrefMstId, groupId, userId);
    }

    public void deletePreferences(final List<PreferenceInfo> preferences) {
        preferences.forEach(prefer -> preferenceRepository.deleteByUserPrefMstIdAndGrpIdAndFldCd(prefer.getUserPrefMstId(), prefer.getGrpId(), prefer.getFldCd()));
    }

    public void deletePreferencesByUsers(final List<String> userIds) {
        preferenceRepository.deleteByUserIdIn(userIds);
    }

}
