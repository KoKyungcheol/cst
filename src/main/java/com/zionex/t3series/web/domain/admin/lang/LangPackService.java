package com.zionex.t3series.web.domain.admin.lang;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.zionex.t3series.web.ApplicationProperties;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@Service
@RequiredArgsConstructor
public class LangPackService {

    private final LangPackRepository langpackRepository;
    private final LangPackQueryRepository langPackQueryRepository;

    private final ApplicationProperties applicationProperties;

    private String version = "0000-00-00 00:00:00.000";

    private Set<String> languages = new HashSet<>();

    private String cachedLanguageCode = "en";

    private Map<String, Map<String, String>> cachedData = new HashMap<>();

    public String getLangPackVersion() {
        return version;
    }

    private void changedVersion() {
        this.version = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
    }

    public String getCachedLanguageCode() {
        return cachedLanguageCode;
    }

    public void setCachedLanguageCode(String cachedLanguageCode) {
        this.cachedLanguageCode = cachedLanguageCode;
    }

    private void saveCachedLangPacks(List<LangPack> langPacks) {
        langPacks.forEach(langPack -> {
            String langCd = langPack.getLangCd();

            Map<String, String> langData = cachedData.get(langCd);
            if (langData == null) {
                langData = new HashMap<>();
                cachedData.put(langCd, langData);
            }

            langData.put(langPack.getLangKey(), langPack.getLangValue());
        });

        changedVersion();
    }

    private void deleteCachedLangPacks(List<LangPack> langPacks) {
        langPacks.forEach(langPack -> {
            String langCd = langPack.getLangCd();

            Map<String, String> langData = cachedData.get(langCd);
            if (langData != null) {
                cachedData.remove(langPack.getLangKey());
            }
       });

       changedVersion();
    }

    public Map<String, Map<String, String>> getReloadLangPacks(String langCd) {
        Map<String, Map<String, String>> resultLangPack = new HashMap<>();

        if (langCd.equals("all")) {
            List<String> languages = applicationProperties.getLanguages();
            if (languages != null) {
                for (String language : languages) {
                    cachedData.remove(language.substring(0, 2));
                    resultLangPack.putAll(getCachedLangPacks(language.substring(0, 2)));
                }
            }
        } else {
            cachedData.remove(langCd);
            resultLangPack = getCachedLangPacks(langCd);
        }
        
        return resultLangPack;
    }

    public Map<String, Map<String, String>> getCachedLangPacks(String langCd) {
        setCachedLanguageCode(langCd);
        languages.add(langCd);

        if (!cachedData.containsKey(langCd)) {
            log.info("Initializes the language pack... (language code: " + langCd + ")");
            
            Map<String, Map<String, String>> langPackData = getLangPacks(langCd);
            if (langPackData.isEmpty()) {
                cachedData.putAll(new HashMap<>());
            } else {
                cachedData.putAll(langPackData);
                changedVersion();
            }
        }

        Map<String, Map<String, String>> resultLangPack = new HashMap<>();
        resultLangPack.put(langCd, cachedData.get(langCd));

        return resultLangPack;
    }

    public String getCachedLangPacks(String langCd, String langKey) {
        Map<String, Map<String, String>> resultLangPack = getCachedLangPacks(langCd);

        Map<String, String> langPack = resultLangPack.get(langCd);
        if (langPack != null) {
            return langPack.get(langKey);
        }

        return null;
    }

    public Map<String, Map<String, String>> getLangPacks(String langCd) {
        Map<String, Map<String, String>> langPackData = new HashMap<>();

        List<LangPack> langPacks = langpackRepository.findByLangCd(langCd);
        langPackData.put(langCd, langPacks.stream().collect(HashMap::new, (m,v)->m.put(v.getLangKey(), v.getLangValue()), HashMap::putAll));

        return langPackData;
    }

    public void deleteLangPacks(List<LangPack> langPacks) {
        langpackRepository.deleteAll(langPacks);
        deleteCachedLangPacks(langPacks);
    }

    public void saveLangPacks(List<LangPack> langPacks) {
        langpackRepository.saveAll(langPacks);
        saveCachedLangPacks(langPacks);
    }

    public List<Map<String, String>> getLangCodes(Boolean includeAll) {
        List<Map<String, String>> result = new ArrayList<>();

        if (includeAll != null && includeAll) {
            Map<String, String> all = new HashMap<>();
            all.put("langCd", "all");
            all.put("langNm", "ALL");
            result.add(all);
        }
        
        languages.forEach(languageCode -> {
            Map<String, String> row = new HashMap<>();
            row.put("langCd", languageCode);
            row.put("langNm", languageCode);
            result.add(row);
        });

        return result;
    }

    public LangPack getLangPack(String langCd, String langKey) {
        return langpackRepository.findByLangCdAndLangKey(langCd, langKey);
    }

    public List<LangPack> getLangPacks(String langCd, String langKey, String langValue) {
        return langPackQueryRepository.getLangPacks(langCd, langKey, langValue);
    }

    public String getLanguageValue(String langKey) {
        Map<String, String> langData = cachedData.get(cachedLanguageCode);
        if (langData == null) {
            LangPack langPack = getLangPack(cachedLanguageCode, langKey);
            return langPack == null ? langKey : langPack.getLangValue();
        } else {
            String langValue = langData.get(langKey);
            return langValue == null ? langKey : langValue;
        }
    }

}
