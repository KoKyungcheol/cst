package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.lang.LangPack;
import com.zionex.t3series.web.domain.admin.lang.LangPackService;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PreferenceMasterService {

    private final PreferenceMasterRepository preferenceMasterRepository;
    private final PreferenceDetailRepository preferenceDetailRepository;

    private final LangPackService langPackService;

    public PreferenceMaster getPreferenceMaster(String id) {
        return preferenceMasterRepository.findById(id).orElse(null);
    }

    public List<PreferenceMaster> getPreferenceMasters(String viewCd) {
        return preferenceMasterRepository.findByViewCd(viewCd);
    }

    public List<PreferenceMaster> getPreferenceMastersByCrosstabTpNotNull(String viewCd) {
        return preferenceMasterRepository.findByViewCdAndCrosstabTpNotNull(viewCd);
    }

    public List<PreferenceMaster> getPreferenceMasters(String viewCd, String viewNm, String langCd) {
        List<PreferenceMaster>  preferenceMasters;
        if (viewCd == null) {
            preferenceMasters = preferenceMasterRepository.findAllByOrderByViewCdAscGridCdAsc();
        } else {
            preferenceMasters = preferenceMasterRepository.findByViewCdContaining("%" + viewCd + "%");
        }

        preferenceMasters.forEach(pm -> {
            String langValue = langPackService.getCachedLangPacks(langCd, pm.getGridDescrip());
            if (langValue == null) {
                langValue = langPackService.getLanguageValue(pm.getGridDescrip());
            }

            if (langValue != null) {
                pm.setGridDescripLangValue(langValue);
            }            
        });

        if (viewNm == null || langCd == null) {
            return preferenceMasters;
        }

        return preferenceMasters
            .stream()
            .filter(pm -> {
                LangPack langPack = langPackService.getLangPack(langCd, pm.getViewCd());
                if (langPack != null) {
                    String langValue = langPack.getLangValue();
                    return langValue.contains(viewNm.toUpperCase());
                }

                return false;
            })
            .collect(Collectors.toList());
    }

    public void savePreferenceMasters(List<PreferenceMaster> preferenceMasters) {
        List<LangPack> langPacks = new ArrayList<LangPack>();
        String langCd = langPackService.getCachedLanguageCode();

        preferenceMasters.forEach(pm -> {
            String langKey = pm.getGridDescrip();
            if (StringUtils.isBlank(pm.getId())) {
                langKey = pm.getViewCd().toUpperCase() + "_" + pm.getGridCd().toUpperCase();
                pm.setGridDescrip(langKey);
            }

            LangPack langPack = new LangPack();
            langPack.setLangCd(langCd);
            langPack.setLangKey(langKey);
            langPack.setLangValue(pm.getGridDescripLangValue());

            langPacks.add(langPack);
        });

        if (!langPacks.isEmpty()) {
            langPackService.saveLangPacks(langPacks);
        }

        preferenceMasterRepository.saveAll(preferenceMasters);
    }

    public void deletePreferenceMasters(List<PreferenceMaster> preferenceMasters) {
        List<LangPack> langPacks = new ArrayList<LangPack>();

        preferenceMasters.forEach(pm -> {
            String langKey = pm.getGridDescrip();
            langPacks.addAll(langPackService.getLangPacks(null, langKey, null));

            preferenceDetailRepository.deleteByUserPrefMstId(pm.getId());
        });
        
        if (!langPacks.isEmpty()) {
            langPackService.deleteLangPacks(langPacks);
        }

        preferenceMasterRepository.deleteAll(preferenceMasters);
    }

}
