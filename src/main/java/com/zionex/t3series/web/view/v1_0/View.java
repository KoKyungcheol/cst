package com.zionex.t3series.web.view.v1_0;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.v1_0.component.Component;

import org.jdom2.Element;

public class View implements Configurable {

    private final String id;
    private final String template;
    private final String copyfrom;
    private final String description;
    private final String version = "1.0";

    private Publish publish;

    private final List<ServiceTargetAlias> aliases = new ArrayList<>();
    private final List<Component> components = new ArrayList<>();

    public View(String id, String template, String copyfrom, String description, Publish publish) {
        if (template == null) {
            template = "";
        }

        if (copyfrom == null) {
            copyfrom = "";
        }

        if (description == null) {
            description = "";
        }

        this.id = id.trim();
        this.template = template.trim();
        this.copyfrom = copyfrom.trim();
        this.description = description.trim();
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

    public String getDescription() {
        return description;
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

        if (description != null && !description.isEmpty()) {
            view.setAttribute("description", description);
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
        return "";
    }

}
