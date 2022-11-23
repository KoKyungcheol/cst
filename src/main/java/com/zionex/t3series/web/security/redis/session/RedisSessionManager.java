package com.zionex.t3series.web.security.redis.session;

import java.time.LocalDateTime;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.log.SystemAccess;
import com.zionex.t3series.web.domain.admin.log.SystemAccessService;
import com.zionex.t3series.web.domain.admin.user.User;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RedisSessionManager {

    private final RedisSessionRepository redisSessionRepository;

    private final SystemAccessService systemAccessService;
    private final AccountManager accountManager;
    private final ApplicationProperties applicationProperties;

    @Value("${multitenancy.tenant-id:ZIONEX}")
    private String tenantName;

    public RedisSession getRedisSession(HttpServletRequest request) {
        return redisSessionRepository.findById(request.getSession().getId()).orElseGet(RedisSession::new);
    }

    public void sessionCreated(HttpServletRequest request, User user) {
        String userId = user.getId();
        String username = user.getUsername();
        String displayname = user.getDisplayName();

        if (displayname == null || displayname.isEmpty()) {
            displayname = username;
        }

        sessionDestroyed(request);
        HttpSession session = request.getSession();

        int timeout = applicationProperties.getSession().getTimeout();
        session.setMaxInactiveInterval(timeout);

        RedisSession redisSession = RedisSession.builder()
            .id(session.getId())
            .tenantName(tenantName)
            .userId(userId)
            .username(username)
            .displayName(displayname)
            .systemAdmin(accountManager.isSystemAdmin(username))
            .build();

        RedisSession otherSession = redisSessionRepository.findByTenantNameAndUsername(tenantName, username);
        if (otherSession != null) {
            redisSessionRepository.delete(otherSession);
        }

        redisSessionRepository.save(redisSession);

        SystemAccess systemAccessLog = new SystemAccess();
        systemAccessLog.setId(session.getId());
        systemAccessLog.setUser(user);
        systemAccessLog.setAccessIp(getAccessIP(request));
        systemAccessLog.setAccessDttm(LocalDateTime.now());

        systemAccessService.saveSystemAccessLog(systemAccessLog);
    }

    public void sessionDestroyed(HttpServletRequest request) {
        sessionDestroyed(request.getSession(false));
    }

    public void sessionDestroyed(HttpSession session) {
        if (session == null) {
            return;
        }

        Object sessionId = session.getId();
        if (sessionId != null && !sessionId.toString().isEmpty()) {
            redisSessionRepository.deleteById(sessionId.toString());
        }

        session.invalidate();
    }

    public void setDisplayName(String username, String userDisplayName) {
        RedisSession session = redisSessionRepository.findByTenantNameAndUsername(tenantName, username);
        if (session != null) {
            session.setDisplayName(userDisplayName);
            redisSessionRepository.save(session);
        }
    }

    private String getAccessIP(HttpServletRequest request) {
        String ip = request.getHeader("X-FORWARDED-FOR");
        if (StringUtils.isEmpty(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }

        if (StringUtils.isEmpty(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }

        if (StringUtils.isEmpty(ip)) {
            ip = request.getRemoteAddr();
        }

        return ip;
    }

}
