package com.zionex.t3series.web.view.v1_2;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class Publish implements Configurable {

    private final boolean open;
    private final int seq;

    private String parent;
    private String icon;

    public Publish(boolean open, int seq) {
        this.open = open;
        this.seq = seq;
    }

    public boolean isOpen() {
        return open;
    }

    public int getSeq() {
        return seq;
    }

    public String getParent() {
        return parent;
    }

    public void setParent(String parent) {
        this.parent = parent;
    }

    public String getIcon(String icon) {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    @Override
    public Element toElement() {
        Element publish = new Element("publish");

        if (parent != null) {
            publish.setAttribute("parent", parent);
        }

        if (icon != null) {
            publish.setAttribute("icon", icon);
        }

        publish.setAttribute("open", Boolean.valueOf(open).toString());
        publish.setAttribute("seq", Integer.valueOf(seq).toString());

        return publish;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (parent != null) {
            builder.append("\"parent\":").append('"').append(parent).append('"');
        }

        if (icon != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"icon\":").append('"').append(icon).append('"');
        }

        if (builder.length() > 1) {
            builder.append(',');
        }
        builder.append("\"open\":").append(open);

        builder.append(',').append("\"seq\":").append(seq);
        builder.append('}');

        return builder.toString();
    }

}
