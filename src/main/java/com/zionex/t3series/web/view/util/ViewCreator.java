package com.zionex.t3series.web.view.util;

import org.jdom2.Element;

public interface ViewCreator {

    Configurable create(Element root);

}
