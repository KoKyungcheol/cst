package com.zionex.t3series.web.domain.common;

import java.util.concurrent.Future;

import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

@Service
public class AsyncService {

    @Async("LogAsyncExecutor")
    public Future<Long> runAsync(Runnable runnable) throws InterruptedException {
        long beforeTime = System.currentTimeMillis();
        runnable.run();
        long afterTime = System.currentTimeMillis();
        long secDiffTime = afterTime - beforeTime;

        return new AsyncResult<Long>(secDiffTime);
    }

}
