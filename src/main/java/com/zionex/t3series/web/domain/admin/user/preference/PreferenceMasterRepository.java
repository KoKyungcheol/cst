package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PreferenceMasterRepository extends JpaRepository<PreferenceMaster, String> {

    List<PreferenceMaster> findAllByOrderByViewCdAscGridCdAsc();

    List<PreferenceMaster> findByViewCd(String viewCd);

    List<PreferenceMaster> findByViewCdAndCrosstabTpNotNull(String viewCd);

    @Query("SELECT pm FROM PreferenceMaster pm WHERE UPPER(pm.viewCd) LIKE UPPER(:viewCd) ESCAPE '\\' ORDER BY pm.viewCd, pm.gridCd")
    List<PreferenceMaster> findByViewCdContaining(String viewCd);

}
