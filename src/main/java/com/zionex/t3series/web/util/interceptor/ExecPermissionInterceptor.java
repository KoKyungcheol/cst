package com.zionex.t3series.web.util.interceptor;

import static com.zionex.t3series.web.constant.ApplicationConstants.CONTENT_TYPE_JSON;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zionex.t3series.web.domain.admin.lang.LangPackService;
import com.zionex.t3series.web.domain.admin.user.permission.PermissionService;
import com.zionex.t3series.web.security.redis.session.RedisSession;
import com.zionex.t3series.web.security.redis.session.RedisSessionManager;
import com.zionex.t3series.web.util.ResponseMessage;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ExecPermissionInterceptor implements HandlerInterceptor {

	@Autowired
	private PermissionService permissionService;

	private final RedisSessionManager redisSessionManager;
	private final LangPackService langPackService;

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		if (handler instanceof HandlerMethod == false) {
			return true;
		}
		
		ExecPermission execPermission = ((HandlerMethod) handler).getMethodAnnotation(ExecPermission.class);
		if (execPermission == null) {
			return true;
		}

		RedisSession session = redisSessionManager.getRedisSession(request);
		String userId = session.getUserId();

		boolean checkPermission = permissionService.checkPermission(userId, execPermission.menuId(), execPermission.type());
		if (checkPermission) {
			return true;
		}

		String message = String.format(langPackService.getLanguageValue("MSG_FAIL_PERMISSION_CHECK"), 
									   langPackService.getLanguageValue(execPermission.menuId()), execPermission.type());
		
		ObjectMapper mapper = new ObjectMapper();
		String result = mapper.writeValueAsString(new ResponseMessage(HttpStatus.FORBIDDEN.value(), message));
		
		response.setContentType(CONTENT_TYPE_JSON);
		
		PrintWriter out = response.getWriter();
		out.write(result);

		return false;
	}

}
