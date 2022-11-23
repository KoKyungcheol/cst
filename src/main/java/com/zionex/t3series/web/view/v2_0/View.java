package com.zionex.t3series.web.view.v2_0;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.v2_0.component.Component;

import org.jdom2.Element;

public class View implements Configurable {

    private final String id;
    private final String template;
    private final String copyfrom;
    private final String include;
    private final String version = "2.0";

    private Publish publish;

    private final List<ServiceTargetAlias> aliases = new ArrayList<>();
    private final List<Component> components = new ArrayList<>();

    public View(String id, String template, String copyfrom, String include, Publish publish) {
        if (template == null) {
            template = "";
        }

        if (copyfrom == null) {
            copyfrom = "";
        }

        if (include == null) {
            include = "";
        }

        this.id = id.trim();
        this.template = template.trim();
        this.copyfrom = copyfrom.trim();
        this.include = include.trim();
        this.publish = publish;
    }

    public String getId() {
        return id;
    }

    public String getTemplate() {
        return template;
    }

    public String getCopyfrom() {
        return copyfrom;
    }

    public String getVersion() {
        return version;
    }

    public Publish getPublish() {
        return publish;
    }

    public List<ServiceTargetAlias> getServiceTargetAliases() {
        return Collections.unmodifiableList(aliases);
    }

    public void addServiceTargetAlias(ServiceTargetAlias alias) {
        aliases.add(alias);
    }

    public void addComponent(Component component) {
        components.add(component);
    }

    public List<Component> getComponents() {
        return components;
    }

    @Override
    public Element toElement() {
        Element view = new Element("view");

        if (id != null) {
            view.setAttribute("id", id);
        }

        if (template != null) {
            if (publish != null || !template.isEmpty()) {
                view.setAttribute("template", template);
            }
        }

        if (copyfrom != null && !copyfrom.isEmpty()) {
            view.setAttribute("copyfrom", copyfrom);
        }

        if (include != null && !include.isEmpty()) {
            view.setAttribute("include", include);
        }

        view.setAttribute("version", version);

        if (publish != null) {
            view.addContent(publish.toElement());
        }

        if (!aliases.isEmpty()) {
            Element aliasesElement = new Element("service-target-alias");
            for (ServiceTargetAlias alias : aliases) {
                aliasesElement.addContent(alias.toElement());
            }
            view.addContent(aliasesElement);
        }

        for (Component component : components) {
            view.addContent(component.toElement());
        }

        return view;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (id != null) {
            builder.append("\"id\":").append('"').append(id).append('"');
        }

        if ("vue".equals(include)) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"includeVue\":true");
        }

        if (builder.length() > 1) {
            builder.append(',');
        }
        builder.append("\"version\":").append('"').append(version).append('"');

        if (publish != null) builder.append(',').append("\"publish\":").append(publish.toJson());

        if (!aliases.isEmpty()) {
            builder.append(",\"serviceTargetAliases\":").append('{');
            for (int i = 0; i < aliases.size(); i++) {
                if (i > 0) {
                    builder.append(',');
                }

                ServiceTargetAlias alias = aliases.get(i);
                builder.append('"').append(alias.getFrom()).append("\":\"").append(alias.getTo()).append('"');
            }
            builder.append('}');
        }

        if (!components.isEmpty()) {
            int count = 0;

            StringBuilder initWindowComponentBuilder = new StringBuilder();

            StringBuilder componentBuilder = new StringBuilder();
            componentBuilder.append(",\"components\":");
            componentBuilder.append('{');
            for (Component component : components) {
                String json = component.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                if (count > 0) {
                    componentBuilder.append(',');
                }

                String componentJson = component.toJson();

                componentBuilder.append('"').append(component.getId()).append("\":").append(componentJson);
                count++;

                String copy = component.getCopy();
                if (!copy.isEmpty()) {
                    for (String copyId : copy.split(",")) {
                        copyId = copyId.trim();
                        if (copyId.isEmpty()) {
                            continue;
                        }

                        componentBuilder.append(",\"").append(copyId).append("\":").append(componentJson);
                        count++;
                    }
                }

                if ("WINDOW".equals(component.getType())) {
                    Object initRender = component.getProp("init-render");
                    if (initRender != null && "true".equals(initRender.toString())) {
                        if (initWindowComponentBuilder.length() > 0) {
                            initWindowComponentBuilder.append(',');
                        }
                        initWindowComponentBuilder.append('"').append(component.getId()).append('"');
                    }
                }
            }
            componentBuilder.append('}');

            if (initWindowComponentBuilder.length() > 0) {
                builder.append(",\"initWindowComponentIds\":").append('[').append(initWindowComponentBuilder.toString()).append(']');
            }
            builder.append(componentBuilder.toString());
        }

        builder.append('}');
        return builder.toString();
    }

}
