package com.zionex.t3series.web.domain.admin.user.password;

import java.io.IOException;
import java.time.LocalDateTime;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.util.SecurityUtil;
import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.security.redis.session.RedisSession;
import com.zionex.t3series.web.security.redis.session.RedisSessionManager;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@Controller
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordPolicy passwordPolicy;
    
    private final RedisSessionManager redisSessionManager;
    private final UserService userService;

    @RequestMapping("/password-init")
    public String initPassword(HttpServletRequest request, HttpServletResponse response, Model model) throws IOException {
        RedisSession session = redisSessionManager.getRedisSession(request);
        if (session == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return "error";
        }

        User user = new User();
        user.setUsername(session.getUsername());
        model.addAttribute("user", user);

        return "password";
    }

    @RequestMapping("/password-save")
    public void savePassword(HttpServletRequest request, HttpServletResponse response, Model model) throws IOException {
        RedisSession session = redisSessionManager.getRedisSession(request);
        if (session == null) {
            log.warning("User session information does not exist.");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if (!passwordPolicy.checkPassword(username, password)) {
            try {
                RequestDispatcher dispatcher = request.getRequestDispatcher("/password-init");
                request.setAttribute("errorMsg", passwordPolicy.getMessage());
                dispatcher.forward(request, response);
            } catch (ServletException e) {
                log.severe("It is against the password policy.");
            }
            return;
        }

        User user = userService.getUser(username);
        user.setPassword(SecurityUtil.encryptPassword(password));
        user.setPasswordExpired(false);
        user.setPasswordModifyDttm(LocalDateTime.now());
        user.setLoginFailCount(0);
        user.setEnabled(true);
        userService.saveUser(user);

        request.setAttribute("username", username);
        request.setAttribute("password", password);

        try {
            RequestDispatcher dispatcher = request.getRequestDispatcher("/authentication");
            dispatcher.forward(request, response);
        } catch (ServletException e) {
            log.severe("Failed to move authentication page.");
        }
    }

}
