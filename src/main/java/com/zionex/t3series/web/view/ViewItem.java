package com.zionex.t3series.web.view;

import java.util.Set;
import java.util.TreeSet;

public class ViewItem implements Comparable<ViewItem> {

    private final String id;
    private final String parentId;
    private final String icon;
    private final int sequence;
    private final boolean initExpand;
    private boolean isBookmarked;
    private final Set<ViewItem> children = new TreeSet<>();

    private int level;

    public ViewItem(String id, String parentId, int sequence, String icon, boolean initExpand, boolean isBookmarked) {
        this.id = id;
        this.parentId = parentId;
        this.sequence = sequence;
        this.icon = icon;
        this.initExpand = initExpand;
        this.isBookmarked = isBookmarked;
    }

    public String getId() {
        return id;
    }

    public String getParentId() {
        if (parentId == null) {
            return "";
        }
        return parentId;
    }

    public int getSequence() {
        return sequence;
    }

    public int getLevel() {
        return level;
    }

    public boolean hasChild() {
        return !this.children.isEmpty();
    }

    public ViewItem getChild(String id) {
        for (ViewItem child : this.children) {
            if (child.id.equals(id)) {
                return child;
            }
        }
        return null;
    }

    public void addChild(ViewItem child) {
        if (!this.children.contains(child)) {
            this.children.add(child);
            child.level = level + 1;
        }
    }

    public void setBookmarked(boolean isBookmarked) {
        this.isBookmarked = isBookmarked;
    }

    @Override
    public ViewItem clone() {
        return new ViewItem(id, parentId, sequence, icon, initExpand, isBookmarked);
    }

    public String toJsonString() {
        StringBuilder jsonBuilder = new StringBuilder();

        jsonBuilder.append("{\"id\":\"").append(id);
        jsonBuilder.append("\",\"text\":\"").append(id);
        jsonBuilder.append("\",\"level\":\"").append(level);
        jsonBuilder.append("\",\"icon\":\"").append(icon);
        jsonBuilder.append("\",\"seq\":\"").append(sequence);
        jsonBuilder.append("\",\"init-expand\":\"").append(initExpand);
        jsonBuilder.append("\",\"isbookmarked\":\"").append(isBookmarked);
        jsonBuilder.append("\",\"items\":[");

        for (ViewItem item : children) {
            jsonBuilder.append(item.toJsonString()).append(",");
        }

        if (children.size() > 0) {
            jsonBuilder.deleteCharAt(jsonBuilder.length() - 1);
        }

        jsonBuilder.append("]}");

        return jsonBuilder.toString();
    }

    @Override
    public String toString() {
        return id;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }

        if (obj == null) {
            return false;
        }

        if (getClass() != obj.getClass()) {
            return false;
        }

        ViewItem other = (ViewItem) obj;
        if (id == null) {
            return other.id == null;
        } else {
            return id.equals(other.id);
        }
    }

    @Override
    public int compareTo(ViewItem o) {
        if (this.equals(o)) {
            return 0;
        }

        int compare = Integer.compare(this.sequence, o.sequence);
        if (compare != 0) {
            return compare;
        }

        compare = Integer.compare(this.level, o.level);
        if (compare != 0) {
            return compare;
        }
        return this.id.compareTo(o.id);
    }

}
