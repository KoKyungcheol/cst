package com.zionex.t3series.web.domain.admin.auth;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class LoginController {

    @RequestMapping(value = "/login", method = { RequestMethod.GET, RequestMethod.POST })
    public String login(HttpServletRequest request, Model model) {
        Object errorMessage = request.getAttribute("errorMsg");
        model.addAttribute("errorMsg", errorMessage != null ? errorMessage.toString() : "");

        return "login";
    }

}
