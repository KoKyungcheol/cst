package com.zionex.t3series.web;

import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class ApplicationProperties {

    private List<String> languages;
    private Authentication authentication;
    private ViewConfig viewConfig;
    private Service service;
    private Server server;
    private Style style;
    private Layout layout;
    private Cache cache;
    private Session session;
    private Engine engine;

    @Autowired
    private Servlet servlet;

    public String getContextRealPath() {
        return servlet.getContextRealPath();
    }

    public String getContextRealPath(String path) {
        return servlet.getContextRealPath(path);
    }

    @Data
    @ConfigurationProperties(prefix = "authentication")
    public static class Authentication {

        private String defaultUrl;
        private String loginUrl;
        private List<String> corsAllowUrl;
        private PasswordPolicy passwordPolicy;
        private LoginPolicy loginPolicy;
        private Account account;
        private String initialPassword;

        @Data
        @ConfigurationProperties(prefix = "password-policy")
        public static class PasswordPolicy {

            private boolean usableUsername;
            private int minLength;
            private int maxRepeat;
            private int lcredit;
            private int ucredit;
            private int dcredit;
            private int ocredit;

        }

        @Data
        @ConfigurationProperties(prefix = "login-policy")
        public static class LoginPolicy {

            private int maxFailureCount;
            private int longTermUnvisitedDays;
            private int maxPasswordDays;

        }

        @Data
        @ConfigurationProperties(prefix = "account")
        public static class Account {

            private List<String> systemAdmins;

        }

    }

    @Data
    @ConfigurationProperties(prefix = "view-config")
    public static class ViewConfig {

        private Migration migration;
        private Publish publish;

        @Data
        @ConfigurationProperties(prefix = "migration")
        public static class Migration {

            private boolean enable;
            private boolean backup;
            private String filter;
            private int indent;

        }

        @Data
        @ConfigurationProperties(prefix = "publish")
        public static class Publish {

            private boolean enableWatchService;

        }

    }

    @Data
    @ConfigurationProperties(prefix = "service")
    public static class Service {

        private Badge badge;
        private File file;

        @Data
        @ConfigurationProperties(prefix = "badge")
        public static class Badge {

            private boolean enable;
            private int interval;

        }

        @Data
        @ConfigurationProperties(prefix = "file")
        public static class File {

            private String externalPath;
            private String name;
            private Category category;
    
            public List<String> getCategoryList() {
                return Arrays.asList(category.getSystem(), category.getNoticeboard(), category.getTemporary());
            }
    
            @Data
            @ConfigurationProperties(prefix = "category")
            public static class Category {
    
                private String system;
                private String noticeboard;
                private String temporary;
                private String excel;
    
            }

        }

    }

    @Data
    @ConfigurationProperties(prefix = "server")
    public static class Server {

        private Fp fp;

        @Data
        @ConfigurationProperties(prefix = "fp")
        public static class Fp {

            private String scheme;
            private String id;
            private String host;
            private int port;

            public String createUrl() {
                return scheme + "://" + host + ":" + port;
            }

        }

    }

    @Data
    @ConfigurationProperties(prefix = "style")
    public static class Style {

        private List<String> fontFaces;
        private boolean gridCustomSkin;

    }

    @Data
    @ConfigurationProperties(prefix = "layout")
    public static class Layout {

        private String currencyButton;
        private String settingButton;
        private NavigationBar navigationBar;

        @Data
        @ConfigurationProperties(prefix = "navigation-bar")
        public static class NavigationBar {

            private String position;
            private boolean minify;

        }

    }

    @Data
    @ConfigurationProperties(prefix = "cache")
    public static class Cache {

        private boolean enable;

    }

    @Data
    @ConfigurationProperties(prefix = "session")
    public static class Session {

        private int timeout;

    }

    @Data
    @ConfigurationProperties(prefix = "engine")
    public static class Engine {

        private List<RegistryEntry> registryEntries;

        @Data
        public static class RegistryEntry {

            private String serverType;
            private String serverName;
            private String serverIp;
            private String serverPort;

        }

    }

}

@Component
class Servlet {

    private String contextRealPath;

    @Autowired
    public Servlet(ServletContext servletContext,
            @Value("${server.servlet.context-real-path}") String contextRealPath) {
        if (contextRealPath != null && !contextRealPath.isEmpty()) {
            this.contextRealPath = contextRealPath;
        } else {
            this.contextRealPath = servletContext.getRealPath("/");
        }

        this.contextRealPath = this.contextRealPath.replace("\\", "/");
        if (!this.contextRealPath.endsWith("/")) {
            this.contextRealPath += "/";
        }
    }

    public String getContextRealPath() {
        return contextRealPath;
    }

    public String getContextRealPath(String path) {
        path = path.replace("\\", "/");
        if (path.startsWith("/")) {
            path = path.substring(1);
        }

        return getContextRealPath() + path;
    }

}
