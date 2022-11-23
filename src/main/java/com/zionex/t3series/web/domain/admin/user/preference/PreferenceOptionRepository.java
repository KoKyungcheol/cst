package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PreferenceOptionRepository extends JpaRepository<PreferenceOption, String> {

    List<PreferenceOption> findByUserPrefMstId(String userPrefMstId);

    List<PreferenceOption> findByUserPrefMstIdIn(List<String> userPrefMstIds);

}
