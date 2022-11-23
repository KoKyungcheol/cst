package com.zionex.t3series.web.domain.admin.lang;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zionex.t3series.web.util.interceptor.ExecPermission;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LangPackController {

    private final LangPackService langPackService;

    @GetMapping("/system/lang-packs/{lang-cd}/reload")
    public Map<String, Map<String, String>> getReloadLangPacks(@PathVariable("lang-cd") String langCd) {
        return langPackService.getReloadLangPacks(langCd);
    }

    @GetMapping("/system/lang-packs/{lang-cd}/cached")
    public Map<String, Map<String, String>> getCachedLangPacks(@PathVariable("lang-cd") String langCd) {
        return langPackService.getCachedLangPacks(langCd);
    }

    @ExecPermission(menuId = "UI_AD_07", type = "READ")
    @GetMapping("/system/lang-packs")
    public List<LangPack> getLangPacks(@RequestParam(value = "lang-cd", required = false) String langCd, @RequestParam(value = "lang-key", required = false) String langKey,
                                       @RequestParam(value = "lang-value", required = false) String langValue) throws UnsupportedEncodingException {
        if (langCd.equals("all")) {
            langCd = null;
        }

        if (langValue != null) {
            langValue = URLDecoder.decode(langValue, "UTF-8");
        }

        return langPackService.getLangPacks(langCd, langKey, langValue);
    }

    @PostMapping("/system/lang-packs")
    public void saveLangPacks(@RequestBody List<LangPack> langPacks) {
        langPackService.saveLangPacks(langPacks);
    }

    @PostMapping("/system/lang-packs/delete")
    public void deleteLangPacks(@RequestBody List<LangPack> langPacks) {
        langPackService.deleteLangPacks(langPacks);
    }

    @GetMapping("/system/lang-packs/language-codes")
    public List<Map<String, String>> getLangCodes(@RequestParam(value = "include-all", required = false) Boolean includeAll) {
        return langPackService.getLangCodes(includeAll);
    }

}
