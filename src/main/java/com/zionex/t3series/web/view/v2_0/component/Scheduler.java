package com.zionex.t3series.web.view.v2_0.component;

import org.jdom2.Element;

public class Scheduler extends Component {

    public Scheduler(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        return super.toElement();
    }

    @Override
    public String toJson(){
        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');
        builder.append('}');
        return builder.toString();
    }

}
