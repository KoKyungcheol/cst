package com.zionex.t3series.web.security.redis;

import java.io.File;
import java.util.Optional;

import com.zionex.t3series.web.security.redis.server.RedisServer;
import com.zionex.t3series.web.security.redis.server.RedisServerBuilder;

import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import lombok.extern.java.Log;

@Log
@Configuration
public class RedisEmbeddedConfig {

    @Bean
    public RedisServerBean redisServer() {
        return new RedisServerBean();
    }

    class RedisServerBean implements InitializingBean, DisposableBean {

        @Value("${spring.redis.host}")
        private String redisHost;

        @Value("${spring.redis.port}")
        private int redisPort;

        @Value("${spring.redis.setting}")
        private String redisSetting;

        private RedisServer redisServer;

        public void afterPropertiesSet() throws Exception {
            ping();
            if (redisHost.equals("localhost")) {
                shutdown();
                RedisServerBuilder builder = RedisServer.builder();
                for (String configLine : redisSetting.split(",")) {
                    configLine = configLine.trim();
                    if (configLine.startsWith("logfile ")) {
                        String logFilePath = configLine.substring(8);

                        File logFileDir = new File(logFilePath.substring(0, logFilePath.lastIndexOf('/')));
                        if (!logFileDir.exists()) {
                            logFileDir.mkdirs();
                        }

                        File logFile = new File(logFilePath);
                        if (!logFile.exists()) {
                            logFile.createNewFile();
                        }
                    }
                    builder.setting(configLine);
                }

                redisServer = builder.port(redisPort).build();
                redisServer.start();
            }
        }

        public boolean ping() {
            RedisClient redisClient = RedisClient.create(String.format("redis://%s:%d", redisHost, redisPort));
            try {
                StatefulRedisConnection<String, String> connection = redisClient.connect();
                RedisCommands<String, String> syncCommands = connection.sync();
                syncCommands.ping();
                connection.close();
            } catch (Exception e) {
                if (!redisHost.equals("localhost")) {
                    log.info(String.format("No live Redis Server found in %s:%d. Consider restarting after setting spring.redis.host to 'localhost'.", redisHost, redisPort));
                }
                return false;
            }
            return true;
        }

        public void destroy() throws Exception {
            Optional.ofNullable(redisServer).ifPresent(RedisServer::stop);
        }

        private void shutdown() {
            RedisClient redisClient = RedisClient.create(String.format("redis://localhost:%d", redisPort));

            try {
                StatefulRedisConnection<String, String> connection = redisClient.connect();

                RedisCommands<String, String> syncCommands = connection.sync();
                syncCommands.shutdown(false);

                connection.close();
            } catch (Exception e) {
                log.info("Redis does not start, so there is no need to shutdown.");
            }

            redisClient.shutdown();
        }

    }

}
