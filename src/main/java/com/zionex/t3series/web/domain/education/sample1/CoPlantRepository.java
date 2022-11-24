package com.zionex.t3series.web.domain.education.sample1;

import java.util.List;

import com.zionex.t3series.web.domain.education.sample1.CoPlant;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * CoPlantRepository
 */
public interface CoPlantRepository extends JpaRepository<CoPlant, String> {

    List<CoPlant> findByPlantCdContainingAndUseYn(String plantCd, String useYn);

    List<CoPlant> findByPlantCdContaining(String plantCd);

    List<CoPlant> findByUseYn(String useYn);

    List<CoPlant> findByPlantGrpAndUseYn(String plantGrp, String useYn);

    CoPlant findByPlantCdAndUseYn(String plantCd, String uesYn);

}