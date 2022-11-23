package com.zionex.t3series.web.security.listener;

import java.util.List;

import org.springframework.context.ApplicationListener;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.session.SessionDestroyedEvent;
import org.springframework.stereotype.Component;

import com.zionex.t3series.web.domain.admin.log.SystemAccessService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SessionDestroyListener implements ApplicationListener<SessionDestroyedEvent> {

    private final SystemAccessService systemAccessService;

    @Override
    public void onApplicationEvent(SessionDestroyedEvent event) {
        List<SecurityContext> securityContexts = event.getSecurityContexts();
        if (securityContexts != null) {
            String sessionId = event.getId();
            if (sessionId != null) {
                systemAccessService.logSystemLogout(event.getId());
            }
        }
    }

}
