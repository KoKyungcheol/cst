package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PreferenceOptionService {

    private final PreferenceOptionRepository PreferenceOptionRepository;

    public List<PreferenceOption> getPreferenceOptions(String userPrefMstId) {
        return PreferenceOptionRepository.findByUserPrefMstId(userPrefMstId);
    }

    public List<PreferenceOption> getPreferenceOptions(List<String> userPrefMstIds) {
        return PreferenceOptionRepository.findByUserPrefMstIdIn(userPrefMstIds);
    }

    public void savePreferenceOptions(List<PreferenceOption> PreferenceOptions) {
        PreferenceOptionRepository.saveAll(PreferenceOptions);
    }

    public void deletePreferenceOptions(List<PreferenceOption> PreferenceOptions) {
        PreferenceOptionRepository.deleteAll(PreferenceOptions);
    }

}
