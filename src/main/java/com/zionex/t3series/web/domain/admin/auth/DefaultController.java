package com.zionex.t3series.web.domain.admin.auth;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class DefaultController {

    @RequestMapping("/")
    public String index(HttpServletRequest request, Model model) {
        HttpSession sesson = request.getSession();
        Object check = sesson.getAttribute("check");
        if (check != null) {
            model.addAttribute("check", check.toString());
            sesson.removeAttribute("check");
        }

        return "index";
    }

}
