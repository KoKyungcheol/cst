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
public class CodeService {

    private final CodeRepository codeRepository;
    private final GroupCodeRepository groupCodeRepository;
    
    private final LangPackService langPackService;

    private final String COMN_CODE_DESCRIP_PREFIX = "COMN_CODE_DESCRIP";

    public List<Code> getCodesByGroupCd(String grpCode) {
        GroupCode groupCode = groupCodeRepository.findByGrpCdAndUseYn(grpCode, true);
        List<Code> codes = new ArrayList<>();

        if (groupCode != null)
            codes = codeRepository.findBySrcIdAndUseYnAndDelYnNotAndComnCdNotNullOrderByDefaultValueYnDescSeqAscComnCdNmAsc(groupCode.getId(), true, true);

        return codes;
    }

    public List<Code> getCodesByGroupId(String groupId) {
        return codeRepository.findBySrcIdOrderBySeq(groupId);
    }

    public List<Code> getCodes(String srcId) {
        List<Code> codes = codeRepository.findBySrcIdOrderBySeq(srcId);
        String langCd = langPackService.getCachedLanguageCode();
        
        codes.forEach(code -> {
            String langValue = langPackService.getCachedLangPacks(langCd, code.getDescrip());
            if (langValue == null) {
                langValue = langPackService.getLanguageValue(code.getDescrip());
            }
            if (langValue != null) {
                code.setDescripLangValue(langValue);
            }            
        });

        return codes;
    }

    public void saveCodes(List<Code> codes) {
        List<LangPack> langPacks = new ArrayList<LangPack>();
        String langCd = langPackService.getCachedLanguageCode();

        codes.forEach(code -> {
            String langKey = code.getDescrip();
            if (StringUtils.isBlank(code.getId())) {
                langKey = COMN_CODE_DESCRIP_PREFIX + "_" + code.getGrpCd().trim().replace(" ", "_").toUpperCase() + "_"
                        + code.getComnCd().trim().replace(" ", "_").toUpperCase();
                code.setDescrip(langKey);
            }

            LangPack langPack = new LangPack();
            langPack.setLangCd(langCd);
            langPack.setLangKey(langKey);
            langPack.setLangValue(code.getDescripLangValue());

            langPacks.add(langPack);
        });

        if (!langPacks.isEmpty()) {
            langPackService.saveLangPacks(langPacks);
        }

        codeRepository.saveAll(codes);
    }

    public void deleteCodes(List<Code> codes) {
        List<LangPack> langPacks = new ArrayList<LangPack>();
        codes.forEach(code -> {
            String langKey = code.getDescrip();
            langPacks.addAll(langPackService.getLangPacks(null, langKey, null));
        });

        if (!langPacks.isEmpty()) {
            langPackService.deleteLangPacks(langPacks);
        }

        List<String> ids = codes.stream().map(code -> code.getId()).collect(Collectors.toList());
        codeRepository.deleteByIdIn(ids);
    }

    public void deleteCodesByGroupIds(List<String> groupIds) {
        List<LangPack> langPacks = new ArrayList<LangPack>();
        groupIds.forEach(id -> {
            List<Code> codes = getCodes(id);
            codes.forEach(code -> {
                String langKey = code.getDescrip();
                langPacks.addAll(langPackService.getLangPacks(null, langKey, null));
            });
        });

        if (!langPacks.isEmpty()) {
            langPackService.deleteLangPacks(langPacks);
        }

        codeRepository.deleteBySrcIdIn(groupIds);
    }

    public void updateCodeUseYnByGroupId(String groupId, boolean useYn) {
        List<Code> codes = getCodesByGroupId(groupId);
        codes.forEach(code -> code.setUseYn(useYn));

        codeRepository.saveAll(codes);
    }

}
