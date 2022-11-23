package com.zionex.t3series.web.domain.util.bulkinsert;

public abstract class ValueContext {
    
    String value;

    public ValueContext(String value) {
        this.value = value;
    }

    public abstract void run();

}
