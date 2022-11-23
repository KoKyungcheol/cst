package com.zionex.t3series.web.domain.admin.view;

import com.zionex.t3series.web.view.ViewConfigManager;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Servlet implementation class TemplateServlet
 */
@RestController
public class TemplateController {

    @GetMapping("/template/{template-id}")
    public String getTemplate(@PathVariable("template-id") String templateId) {
        return ViewConfigManager.getViewConfigManager().getTemplate(templateId);
    }

}
