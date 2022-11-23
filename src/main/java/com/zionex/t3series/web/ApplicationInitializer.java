package com.zionex.t3series.web;

import static com.zionex.t3series.web.constant.ApplicationConstants.PATH_VIEW;

import java.util.List;

import com.zionex.t3series.web.ApplicationProperties.Authentication;
import com.zionex.t3series.web.ApplicationProperties.Authentication.Account;
import com.zionex.t3series.web.ApplicationProperties.ViewConfig;
import com.zionex.t3series.web.ApplicationProperties.ViewConfig.Migration;
import com.zionex.t3series.web.ApplicationProperties.ViewConfig.Publish;
import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.lang.LangPackService;
import com.zionex.t3series.web.domain.admin.user.password.PasswordPolicy;
import com.zionex.t3series.web.security.authentication.LoginPolicy;
import com.zionex.t3series.web.view.ViewConfigManager;
import com.zionex.t3series.web.view.ViewConfigMigrator;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ApplicationInitializer implements ApplicationRunner {

    private final ApplicationProperties applicationProperties;
    private final AccountManager accountManager;

    private final PasswordPolicy passwordPolicy;
    private final LoginPolicy loginPolicy;

    private final LangPackService langPackService;

    @Override
    public void run(ApplicationArguments args) {
        makePlatformConfiguration();
        accountManager.init(applicationProperties.getAuthentication());
    }

    public void makePlatformConfiguration() {
        ViewConfigManager viewConfigManager = ViewConfigManager.getViewConfigManager();

        viewConfigManager.init(applicationProperties.getContextRealPath());

        List<String> languages = applicationProperties.getLanguages();
        if (languages != null) {
            for (String language : languages) {
                langPackService.getCachedLangPacks(language.substring(0, 2));
            }
        }

        Authentication authentication = applicationProperties.getAuthentication();
        if (authentication != null) {
            Authentication.PasswordPolicy password = authentication.getPasswordPolicy();
            if (password != null) {
                passwordPolicy.setPolicy(password);
            }

            Authentication.LoginPolicy login = authentication.getLoginPolicy();
            if (login != null) {
                loginPolicy.setPolicy(login);
            }

            Account account = authentication.getAccount();
            if (account != null) {
                account.getSystemAdmins().forEach(sa -> accountManager.addSystemAdmin(sa));
            }
        }

        ViewConfig viewConfig = applicationProperties.getViewConfig();
        if (viewConfig != null) {
            Migration migration = viewConfig.getMigration();
            if (migration != null) {
                ViewConfigMigrator migrator = new ViewConfigMigrator(applicationProperties.getContextRealPath(PATH_VIEW));

                migrator.setEnable(migration.isEnable());
                migrator.setBackup(migration.isBackup());

                String filter = migration.getFilter();
                if (filter != null && !filter.isEmpty()) {
                    migrator.setFilter(migration.getFilter());
                }

                int indent = migration.getIndent();
                if (indent > 0) {
                    StringBuilder builder = new StringBuilder();
                    for (int i = 0; i < indent; i++) {
                        builder.append(" ");
                    }
                    migrator.setIndent(builder.toString());
                }

                migrator.migrate();
            }

            Publish publish = viewConfig.getPublish();
            if (publish != null) {
                viewConfigManager.convertAllXmlToJson(publish.isEnableWatchService());
            }
        }
    }

}
