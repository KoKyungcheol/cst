package com.zionex.t3series.web.security.redis.server;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;

import com.google.common.io.Files;
import com.zionex.t3series.web.util.JarUtil;
import com.zionex.t3series.web.util.OSUtil;
import com.zionex.t3series.web.util.OSUtil.OS;

public class RedisServerBuilder {

    private static final String LINE_SEPARATOR = System.getProperty("line.separator");
    private static final String CONF_FILENAME = "redis-server";

    private String bind = "127.0.0.1";
    private int port = 6379;

    private File executable;
    private String redisConfig;
    private StringBuilder redisConfigBuilder;

    public RedisServerBuilder bind(String bind) {
        this.bind = bind;
        return this;
    }

    public RedisServerBuilder port(int port) {
        this.port = port;
        return this;
    }

    public RedisServerBuilder setting(String configLine) {
        if (redisConfigBuilder == null) {
            redisConfigBuilder = new StringBuilder();
        }

        redisConfigBuilder.append(configLine);
        redisConfigBuilder.append(LINE_SEPARATOR);
        return this;
    }

    public RedisServer build() {
        setting("bind " + bind);
        init();
        return new RedisServer(executable, port, redisConfig);
    }

    private void init() {
        if (redisConfigBuilder != null) {
            try {
                File redisConfigFile = File.createTempFile(CONF_FILENAME + ".", "." + port + ".conf");
                redisConfigFile.deleteOnExit();
                Files.write(redisConfigBuilder.toString(), redisConfigFile, Charset.forName("UTF-8"));
                redisConfig = redisConfigFile.getAbsolutePath();
            } catch (IOException e) {
                throw new RedisBuildingException("Could not build server instance", e);
            }
        }

        try {
            String executablePath;

            OS os = OSUtil.getOS();
            switch (os) {
                case UNIX:
                    executablePath = "redis-server-6.0.9";
                    break;
                case WINDOWS:
                    executablePath = "redis-server-5.0.9.exe";
                    break;
                case MAC:
                    executablePath = "redis-server-2.8.19.app";
                    break;
                default:
                    executablePath = "redis-server-6.0.9";
            }

            executable = new File(executablePath);
            if (!executable.exists()) {
                executable = JarUtil.extractExecutableFromJar(executablePath);
            }
        } catch (Exception e) {
            throw new RedisBuildingException("Failed to resolve executable", e);
        }
    }

}
