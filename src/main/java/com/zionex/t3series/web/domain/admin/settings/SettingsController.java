package com.zionex.t3series.web.domain.admin.settings;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.ApplicationProperties.Layout;
import com.zionex.t3series.web.ApplicationProperties.Service;
import com.zionex.t3series.web.domain.admin.lang.LangPackService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SettingsController {

    private final ApplicationProperties applicationProperties;
    private final LangPackService langPackService;

    @GetMapping("/system/settings")
    public SettingsData getSettings() {
        Map<String, String> authentication = new HashMap<>();
        authentication.put("loginUrl", applicationProperties.getAuthentication().getLoginUrl());
        authentication.put("defaultUrl", applicationProperties.getAuthentication().getDefaultUrl());

        Map<String, String> fontFaces = new HashMap<>();
        boolean gridCustomSkin = applicationProperties.getStyle().isGridCustomSkin();

        Map<String, Object> style = new HashMap<>();
        style.put("fontFaces", fontFaces);
        style.put("gridCustomSkin", gridCustomSkin);

        applicationProperties.getStyle().getFontFaces().forEach(fontFace -> {
            String[] splitedValues = fontFace.split("=>");
            if (splitedValues.length == 2) {
                fontFaces.put(splitedValues[0].trim(), splitedValues[1].trim());
            }
        });

        return SettingsData.builder()
            .langpackVersion(langPackService.getLangPackVersion())
            .languages(applicationProperties.getLanguages())
            .authentication(authentication)
            .service(applicationProperties.getService())
            .style(style)
            .layout(applicationProperties.getLayout())
            .build();
    }

}

@Data
@Builder
class SettingsData {

    private String langpackVersion;
    private List<String> languages;
    private Map<String, String> authentication;

    private Service service;
    private Map<String, Object> style;
    private Layout layout;

}
