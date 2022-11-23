package com.zionex.t3series.web.security.redis.server;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.google.common.base.Strings;

import lombok.extern.java.Log;

@Log
public class RedisServer {

    private static final String REDIS_READY_PATTERN = ".*(R|r)eady to accept connections.*";

    private final int port;
    private final List<String> args;
    private final ExecutorService executor;

    private volatile boolean active = false;
    private Process redisProcess;

    public RedisServer(File executable, int port, String redisConfig) {
        this.port = port;

        if (!Strings.isNullOrEmpty(redisConfig)) {
            this.args = Arrays.asList(executable.getAbsolutePath(), redisConfig, "--port", Integer.toString(this.port));
        } else {
            this.args = Arrays.asList(executable.getAbsolutePath(), "--port", Integer.toString(this.port));
        }

        this.executor = Executors.newSingleThreadExecutor();
    }

    public synchronized void start() throws RedisException {
        if (active) {
            throw new RedisException("This redis server instance is already running...");
        }
        try {
            File executable = new File(args.get(0));

            ProcessBuilder processBuilder = new ProcessBuilder(args);
            processBuilder.redirectOutput(ProcessBuilder.Redirect.INHERIT);
            processBuilder.redirectError(ProcessBuilder.Redirect.INHERIT);
            processBuilder.redirectInput(ProcessBuilder.Redirect.INHERIT);
            processBuilder.directory(executable.getParentFile());

            redisProcess = processBuilder.start();

            Runtime.getRuntime().addShutdownHook(new Thread(this::stop, "RedisInstanceCleaner"));

            executor.submit(() -> {
                try {
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(redisProcess.getErrorStream()))) {
                        String line;
                        while ((line = reader.readLine()) != null) {
                            System.out.println(line);
                        }
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });

            executor.submit(() -> {
                try {
                    try (BufferedReader reader = new BufferedReader(
                            new InputStreamReader(redisProcess.getInputStream()))) {
                        StringBuffer outputStringBuffer = new StringBuffer();
                        String outputLine;
                        do {
                            outputLine = reader.readLine();
                            if (outputLine == null) {
                                throw new RuntimeException(
                                        "Can't start redis server. Check logs for details. Redis process log: "
                                                + outputStringBuffer.toString());
                            } else {
                                outputStringBuffer.append("\n");
                                outputStringBuffer.append(outputLine);
                            }
                        } while (!outputLine.matches(REDIS_READY_PATTERN));
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });

            active = true;
        } catch (IOException e) {
            throw new RedisException("Failed to start Redis instance", e);
        }
    }

    public synchronized void stop() throws RedisException {
        if (active) {
            log.info("Stopping redis server...");

            if (executor != null && !executor.isShutdown()) {
                executor.shutdown();
            }

            redisProcess.destroy();
            try {
                redisProcess.waitFor();
            } catch (InterruptedException e) {
                throw new RedisException("Failed to stop redis instance", e);
            }

            log.info("Redis exited");
            active = false;
        }
    }

    public static RedisServerBuilder builder() {
        return new RedisServerBuilder();
    }

}
