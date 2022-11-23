package com.zionex.t3series.web.domain.admin.user.password;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.zionex.t3series.web.ApplicationProperties.Authentication;
import com.zionex.t3series.web.domain.admin.lang.LangPackService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public final class PasswordPolicy {

    private Authentication.PasswordPolicy policy;

    @Autowired
    private LangPackService langPackService;

    private String message = "";

    public PasswordPolicy() {
    }

    public void setPolicy(Authentication.PasswordPolicy policy) {
        this.policy = policy;
    }

    public String getMessage() {
        return message;
    }

    public boolean checkPassword(String username, String password) {
        String langValue;

        if (policy == null) {
            return true;
        }

        if (!policy.isUsableUsername() && password.contains(username)) {
            message = langPackService.getLanguageValue("PW_ERROR_MSG_0004");
            return false;
        }

        if (password.length() < policy.getMinLength()) {
            langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0005");
            message = String.format(langValue, policy.getMinLength());
            return false;
        }

        int maxRepeat = policy.getMaxRepeat();
        if (maxRepeat > 0) {
            Pattern pattern = Pattern.compile(String.format("(\\p{Alnum})\\1{%d,}", maxRepeat - 1));
            if (pattern.matcher(password).find()) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0006");
                message = String.format(langValue, maxRepeat);
                return false;
            }
        }

        int lcredit = policy.getLcredit();
        if (lcredit > 0) {
            if (isSatisfiedPatternCount(password, "\\p{Lower}", lcredit)) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0007");
                message = String.format(langValue, lcredit);
                return false;
            }
        }

        int ucredit = policy.getUcredit();
        if (ucredit > 0) {
            if (isSatisfiedPatternCount(password, "\\p{Upper}", ucredit)) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0008");
                message = String.format(langValue, ucredit);
                return false;
            }
        }

        int dcredit = policy.getDcredit();
        if (dcredit > 0) {
            if (isSatisfiedPatternCount(password, "\\p{Digit}", dcredit)) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0009");
                message = String.format(langValue, dcredit);
                return false;
            }
        }

        int ocredit = policy.getOcredit();
        if (ocredit > 0) {
            if (isSatisfiedPatternCount(password, "\\p{Punct}", ocredit)) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0010");
                message = String.format(langValue, ocredit);
                return false;
            }
        }

        if (password.contains("<") || password.contains(">")) {
            message = langPackService.getLanguageValue("PW_ERROR_MSG_0011");
            return false;
        }

        return true;
    }

    private boolean isSatisfiedPatternCount(CharSequence input, String regex, int patternCount) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(input);

        int count = 0;
        while (matcher.find()) {
            count++;
        }

        return count < patternCount;
    }

}
