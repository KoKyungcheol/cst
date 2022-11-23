package com.zionex.t3series.web.domain.admin.auth;

import javax.servlet.http.HttpServletRequest;

import com.zionex.t3series.web.security.redis.session.RedisSession;
import com.zionex.t3series.web.security.redis.session.RedisSessionManager;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SessionController {

    private final RedisSessionManager redisSessionManager;

    @GetMapping("/session-info")
    public RedisSession getSessionInfo(HttpServletRequest request) {
        return redisSessionManager.getRedisSession(request);
    }

}
