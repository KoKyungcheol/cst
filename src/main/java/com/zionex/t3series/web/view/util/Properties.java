package com.zionex.t3series.web.view.util;

import java.util.HashMap;
import java.util.Map;

public class Properties {

    private final Map<String, Object> props = new HashMap<>();

    public Properties() {
    }

    @SuppressWarnings("unchecked")
    public Object getProp(String... propertyNames) {
        Map<String, Object> current = props;

        for (int i = 0; i < propertyNames.length; i++) {
            String propertyName = propertyNames[i];

            Object propertyValue = current.get(propertyName);
            if (i == propertyNames.length - 1) {
                return current.get(propertyName);
            }

            if (propertyValue instanceof Map) {
                current = (Map<String, Object>) propertyValue;
            }
        }
        return null;
    }

    public boolean hasProp(String... propertyNames) {
        return getProp(propertyNames) != null;
    }

    public void setProp(String propertyName, Object propertyValue) {
        if (propertyValue != null) {
            props.put(propertyName, propertyValue);
        }
    }

    @SuppressWarnings("unchecked")
    public void setProp(String[] propertyNames, Object propertyValue) {
        if (propertyValue == null) {
            return;
        }

        Map<String, Object> current = props;

        for (int i = 0; i < propertyNames.length; i++) {
            String propertyName = propertyNames[i];
            if (i == propertyNames.length - 1) {
                current.put(propertyName, propertyValue);
            } else {
                Map<String, Object> child;
                if (current.containsKey(propertyName)) {
                    child = (Map<String, Object>) current.get(propertyName);
                } else {
                    child = new HashMap<>();
                }

                current.put(propertyName, child);
                current = child;
            }
        }
    }

}
