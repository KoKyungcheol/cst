package com.zionex.t3series.web.domain.admin.code;

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
public class GroupCodeService {

    private final GroupCodeRepository groupCodeRepository;

    private final CodeService codeService;
    private final LangPackService langPackService;

    private final String COMN_GRP_DESCRIP_PREFIX = "COMN_GRP_DESCRIP";

    public List<GroupCode> getGroupCodes(String groupCd, String groupNm) {
        List<GroupCode> groupCodes= groupCodeRepository.findByGrpCdContainingAndGrpNmContainingOrderByGrpCd(groupCd, groupNm);
        String langCd = langPackService.getCachedLanguageCode();

        groupCodes.forEach(gc -> {
            String langValue = langPackService.getCachedLangPacks(langCd, gc.getDescrip());
            if (langValue == null) {
                langValue = langPackService.getLanguageValue(gc.getDescrip());
            }
            if (langValue != null) {
                gc.setDescripLangValue(langValue);
            }            
        });

        return groupCodes;
    }

    public void saveGroupCodes(List<GroupCode> groupCodes) {
        List<LangPack> langPacks = new ArrayList<LangPack>();
        String langCd = langPackService.getCachedLanguageCode();

        groupCodes.forEach(gc -> {
            String langKey = gc.getDescrip();
            if (StringUtils.isBlank(gc.getId())) {
                langKey = COMN_GRP_DESCRIP_PREFIX + "_" + gc.getGrpCd().trim().replace(" ", "_").toUpperCase();
                gc.setDescrip(langKey);
            } else {
                if (!gc.getUseYn()) {
                    codeService.updateCodeUseYnByGroupId(gc.getId(), false);
                }
            }

            LangPack langPack = new LangPack();
            langPack.setLangCd(langCd);
            langPack.setLangKey(langKey);
            langPack.setLangValue(gc.getDescripLangValue());

            langPacks.add(langPack);
        });

        if (!langPacks.isEmpty()) {
            langPackService.saveLangPacks(langPacks);
        }

        groupCodeRepository.saveAll(groupCodes);
    }
    
    public void deleteGroupCodes(List<GroupCode> groupCodes) {
        List<LangPack> langPacks = new ArrayList<LangPack>();
        groupCodes.forEach(gc -> {
            String langKey = gc.getDescrip();
            langPacks.addAll(langPackService.getLangPacks(null, langKey, null));
        });

        if (!langPacks.isEmpty()) {
            langPackService.deleteLangPacks(langPacks);
        }

        List<String> groupIds = groupCodes.stream().map(group -> group.getId()).collect(Collectors.toList());
        groupCodeRepository.deleteByIdIn(groupIds);
        codeService.deleteCodesByGroupIds(groupIds);
    }

}
