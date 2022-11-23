package com.zionex.t3series.web.view.migration;

import org.jdom2.Element;

public interface Migration {

    String getVersion();

    void migrate(Element view);

}
