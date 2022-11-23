package com.zionex.t3series.web.domain.admin.view;

import com.zionex.t3series.web.view.ViewConfigManager;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ViewConfigController {

    @GetMapping("/view-config/{view-id}")
    public String getViewConfig(@PathVariable("view-id") String viewId) {
        return ViewConfigManager.getViewConfigManager().getViewConfig(viewId);
    }

    @GetMapping("/republish")
    public void publishAll() {
        ViewConfigManager.getViewConfigManager().convertAllXmlToJson(false);
    }

}
