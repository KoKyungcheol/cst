package com.zionex.t3series.web.view.replacement;

import java.util.HashMap;
import java.util.Map;

public class ScriptReplacer {

    private final Map<String, String> replacementMap;

    public ScriptReplacer() {
        replacementMap = new HashMap<>();
        replacementMap.put("content\\s*\\.\\s*getCreateComponentCompleteFlag\\(\\)\\s*\\.\\s*done", "co.componentCreated().then");
        replacementMap.put("gSessionInfo\\s*\\.\\s*getUserId\\(\\)", "authentication.getUsername()");
        replacementMap.put("gSessionInfo\\s*\\.\\s*getUserName\\(\\)", "authentication.getDisplayName()");
        replacementMap.put("BASE_URL", "baseURI()");
        replacementMap.put("trans\\(", "transLangKey(");
        replacementMap.put("gI18n.tc\\(", "transLangKey(");
    }

    public String replace(String script) {
        for (String regex : replacementMap.keySet()) {
            script = script.replaceAll(regex, replacementMap.get(regex));
        }
        return script;
    }

    public static void main(String... args) {
        System.out.println(new ScriptReplacer().replace("mWindowTitle: gI18n.tc('NB_IMAGE_UPLOAD')"));
    }

}
