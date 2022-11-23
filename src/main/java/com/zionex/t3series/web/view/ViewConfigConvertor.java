package com.zionex.t3series.web.view;

import static com.zionex.t3series.web.constant.ApplicationConstants.ICON_DEFAULT;
import static com.zionex.t3series.web.constant.ApplicationConstants.PATH_TEMPLATE;
import static com.zionex.t3series.web.constant.ApplicationConstants.PATH_VIEW;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_COPYFROM;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_ICON;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_INIT_EXPAND;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_OPEN;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_PARENT;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_PARENT_VIEW_GROUP;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ATTRIBUTE_SEQ;
import static com.zionex.t3series.web.constant.ConfigurationConstants.ELELMENT_COMPONENT;

import java.io.File;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.zionex.t3series.web.view.replacement.ScriptReplacer;
import com.zionex.t3series.web.view.util.ElementUtil;
import com.zionex.t3series.web.view.util.ViewCreator;
import com.zionex.t3series.web.view.v2_0.ViewFactory;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jsoup.Jsoup;

import lombok.extern.java.Log;
import org.jsoup.nodes.Node;

@Log
public class ViewConfigConvertor extends ViewConfigIO {

    private final ScriptReplacer scriptReplacer;

    private final SAXBuilder builder;
    private final ViewCreator viewCreator;
    private final ViewConfigManager manager;

    private final Map<String, Element> viewMap = new HashMap<>();

    private String rootPath;
    private String sourcePath;

    public ViewConfigConvertor(ViewConfigManager manager) {
        this.scriptReplacer = new ScriptReplacer();
        this.builder = new SAXBuilder();
        this.viewCreator = ViewFactory.getViewFactory();
        this.manager = manager;
    }

    public void init(String rootPath) {
        this.rootPath = rootPath;
        this.sourcePath = rootPath + PATH_VIEW;
    }

    public void convertAllXmlToJson() {
        File sourceDir = new File(sourcePath);

        List<Element> viewGroups = new ArrayList<>();

        List<File> sourceFiles = listFiles(sourceDir, file -> file.getAbsolutePath().matches("^.*\\w+\\.xml$"));
        for (File sourceFile : sourceFiles) {
            String sourceFilePath = sourceFile.getAbsolutePath();

            try (StringReader xml = new StringReader(readFile(sourceFilePath))) {
                Document doc = builder.build(xml);

                Element root = doc.getRootElement();
                if (root.getName().equals("views")) {
                    viewGroups.addAll(root.getChildren("view-group"));

                    for (Element view : root.getChildren("view")) {
                        String viewId = view.getAttributeValue("id");
                        viewMap.put(viewId, view);
                        manager.addViewIdAndPath(viewId, sourceFilePath);
                    }
                } else if (root.getName().equals("view")) {
                    String viewId = root.getAttributeValue("id");
                    viewMap.put(viewId, root);
                    manager.addViewIdAndPath(viewId, sourceFilePath);
                }
            } catch (Exception e) {
                log.severe(String.format("An error occurred while publishing the view config file. (publishing file: %s)", sourceFilePath));
            }
        }

        for (Element viewGroup : viewGroups) {
            publishViewGroup(viewGroup);
        }

        for (String viewId : viewMap.keySet()) {
            publishViewConfig(viewMap.get(viewId));
        }
    }

    public boolean convertXmlToJson(String sourceFilePath) {
        List<Element> viewGroups = new ArrayList<>();
        List<Element> views = new ArrayList<>();

        try (StringReader xml = new StringReader(readFile(sourceFilePath))) {
            Document doc = builder.build(xml);

            Element root = doc.getRootElement();
            if (root.getName().equals("views")) {
                viewGroups.addAll(root.getChildren("view-group"));

                for (Element view : root.getChildren("view")) {
                    String viewId = view.getAttributeValue("id");
                    viewMap.put(viewId, view);
                    manager.addViewIdAndPath(viewId, sourceFilePath);

                    views.add(view);
                }
            } else if (root.getName().equals("view")) {
                String viewId = root.getAttributeValue("id");
                viewMap.put(viewId, root);
                manager.addViewIdAndPath(viewId, sourceFilePath);

                views.add(root);
            }
        } catch (Exception e) {
            return false;
        }

        for (Element viewGroup : viewGroups) {
            publishViewGroup(viewGroup);
        }

        for (Element view : views) {
            publishViewConfig(view);
        }

        return true;
    }

    private void publishViewGroup(Element viewGroup) {
        boolean open = Boolean.parseBoolean(viewGroup.getAttributeValue(ATTRIBUTE_OPEN, "true"));
        if (!open) {
            return;
        }

        String id = viewGroup.getAttributeValue("id");
        int seq = Integer.parseInt(viewGroup.getAttributeValue(ATTRIBUTE_SEQ, "0"));
        String icon = viewGroup.getAttributeValue(ATTRIBUTE_ICON, ICON_DEFAULT);
        boolean initExpand = Boolean.parseBoolean(viewGroup.getAttributeValue(ATTRIBUTE_INIT_EXPAND, "false"));
        String parentId = viewGroup.getAttributeValue(ATTRIBUTE_PARENT_VIEW_GROUP, "");

        manager.putViewGroupItem(id, new ViewItem(id, parentId, seq, icon, initExpand, false));
    }

    private void publishViewConfig(Element view) {
        Element publish = view.getChild("publish");
        if (publish == null) {
            return;
        }

        Map<String, Element> componentMap = new HashMap<>();
        for (Element component : view.getChildren(ELELMENT_COMPONENT)) {
            String componentId = component.getAttributeValue("id");
            componentMap.put(componentId, component);
        }

        String viewId = view.getAttributeValue("id");
        String prefixViewId = viewId + "-";

        String copyFrom = view.getAttributeValue(ATTRIBUTE_COPYFROM, "");
        for (String targetViewId : copyFrom.split(":")) {
            targetViewId = targetViewId.trim();
            if (targetViewId.isEmpty()) {
                continue;
            }

            Element targetView = viewMap.get(targetViewId);
            if (targetView == null) {
                continue;
            }

            manager.addCopyFromUse(targetViewId, viewId);

            List<Element> components = targetView.getChildren(ELELMENT_COMPONENT);
            for (Element component : new ArrayList<>(components)) {
                String componentId = component.getAttributeValue("id");
                if (componentMap.containsKey(componentId)) {
                    continue;
                }

                Element copyComponent = component.clone();
                componentMap.put(componentId, copyComponent);

                view.addContent(copyComponent);
            }
        }

        view.removeAttribute(ATTRIBUTE_COPYFROM);

        Map<String, String> checkComponentMap = new HashMap<>();
        List<String> containerComponents = new ArrayList<>();

        for (Element component : componentMap.values()) {
            String compId = component.getAttributeValue("id");
            String compType = component.getAttributeValue("type");

            checkComponentMap.put(compId, compType);
            if (isContainerComponent(compType)) {
                containerComponents.add(compId);
            }

            List<Element> referenceOperationCalls = ElementUtil.findRecursiveElements(component, "reference-operation-call");
            for (Element referenceOperationCall : new ArrayList<>(referenceOperationCalls)) {
                String referenceOperationCallId = referenceOperationCall.getAttributeValue("id");

                String[] splited = referenceOperationCallId.split(":");
                if (splited.length < 2) {
                    continue;
                }

                String componentId = splited[0];
                String operationCallId = splited[1];

                Element referenceComponent = componentMap.get(componentId);
                if (referenceComponent == null) {
                    Element parentElement = referenceOperationCall.getParentElement();
                    parentElement.removeContent(referenceOperationCall);
                    continue;
                }

                Element operationCall = ElementUtil.findRecursiveElement(referenceComponent, "operation-call", operationCallId);
                if (operationCall == null) {
                    continue;
                }

                String tag = referenceOperationCall.getAttributeValue("tag");
                if (tag != null && !tag.isEmpty()) {
                    String id = operationCall.getAttributeValue("id");
                    operationCall.setAttribute("id", id + "_" + tag);

                    List<Element> targetOperationCalls = ElementUtil.findRecursiveElements(operationCall, "operation-call");
                    for (Element targetOperationCall : targetOperationCalls) {
                        String targetId = targetOperationCall.getAttributeValue("id");
                        targetOperationCall.setAttribute("id", targetId + "_" + tag);
                    }
                }

                Element parentElement = referenceOperationCall.getParentElement();
                parentElement.removeContent(referenceOperationCall);

                Element newOperationCall = operationCall.clone();
                parentElement.addContent(newOperationCall);
            }
        }

        int seq = Integer.parseInt(publish.getAttributeValue(ATTRIBUTE_SEQ, "0"));
        String icon = publish.getAttributeValue(ATTRIBUTE_ICON, ICON_DEFAULT);
        String parentId = publish.getAttributeValue(ATTRIBUTE_PARENT, "");

        manager.putViewItem(viewId, new ViewItem(viewId, parentId, seq, icon, false, false));

        Set<String> templateComponents = new HashSet<>();
        String json;

        String template = view.getAttributeValue("template");
        if (template != null) {
            boolean includeVue = false;

            String include = view.getAttributeValue("include");
            if ("vue".equals(include)) {
                includeVue = true;
            }

            String containerJson = publishTemplate(viewId, template.split("\\s*:\\s*"), includeVue, componentMap, checkComponentMap, containerComponents, templateComponents);

            for (String componentId : checkComponentMap.keySet()) {
                if (!templateComponents.contains(componentId)) {
                    Element component = ElementUtil.findRecursiveElement(view, "component", componentId);
                    if (component != null) {
                        Element parentElement = component.getParentElement();
                        parentElement.removeContent(component);
                    }
                }
            }

            json = viewCreator.create(view).toJson();

            if (!containerJson.isEmpty()) {
                StringBuilder newJson = new StringBuilder();

                int index = json.indexOf(",\"components\":");
                if (index == -1) {
                    index = json.length() - 1;
                }

                newJson.append(json, 0, index);
                newJson.append(",\"containers\":{").append(containerJson).append('}');
                newJson.append(json.substring(index));

                json = newJson.toString();
            }
        } else {
            json = viewCreator.create(view).toJson();
        }

        boolean open = Boolean.parseBoolean(publish.getAttributeValue(ATTRIBUTE_OPEN, "true"));
        if (open && openedMenu(manager.getViewItem(viewId))) {
            manager.addOpenedViewId(viewId);
        }

        Set<String> componentSet = componentMap.keySet();
        for (String id : componentSet) {
            String replaceId = "\"" + prefixViewId + id;
            json = json.replace("\"" + id, replaceId);
        }
        
        Pattern pattern = Pattern.compile("\"title\":\"" + prefixViewId + "(.*?)[\"]");
        Matcher mather = pattern.matcher(json);

        while (mather.find()) {
            String title = mather.group(1).trim();
            if (title.isEmpty()) {
                continue;
            }
            json = json.replace("\"title\":\"" + prefixViewId + title + "\"", "\"title\":\"" + title + "\"");
        }

        manager.putViewConfig(viewId, json);
    }

    private boolean openedMenu(ViewItem viewItem) {
        if (viewItem == null || viewItem.getParentId().isEmpty()) {
            return true;
        }
        return openedMenu(manager.getViewItem(viewItem.getParentId()));
    }

    private String publishTemplate(String viewId, String[] templatePaths, boolean includeVue, Map<String, Element> componentMap, Map<String, String> checkComponentMap, List<String> containerComponents, Set<String> templateComponents) {
        StringBuilder containerBuilder = new StringBuilder();
        String prefixViewId = viewId + "-";

        try {
            StringBuilder templateBuilder = new StringBuilder();
            List<String> documentChildren = new ArrayList<>();

            List<org.jsoup.nodes.Element> scriptElements = new ArrayList<>();
            List<org.jsoup.nodes.Element> styleElements = new ArrayList<>();

            for (String templatePath : templatePaths) {
                File templateFile = new File(rootPath + PATH_TEMPLATE + "/" + templatePath + ".html");
                if (!templateFile.exists()) {
                    continue;
                }

                org.jsoup.nodes.Document doc = Jsoup.parse(templateFile, "UTF-8");

                removeComments(doc);
                includeTemplate(doc, templatePath);

                doc.select("div#contentsInner").forEach(node -> {
                    if (node.hasParent()) {
                        org.jsoup.nodes.Element parent = node.parent();
                        node.children().forEach(child -> {
                            if (child.classNames().contains("window_component")) {
                                parent.appendChild(child);
                            }
                        });
                    }

                    if (node.children().isEmpty()) {
                        node.remove();
                    }
                });

                doc.select("div#commonPopupGroup").forEach(node -> {
                    if (node.hasParent()) {
                        org.jsoup.nodes.Element parent = node.parent();
                        node.children().forEach(parent::appendChild);
                        node.remove();
                    }
                });

                doc.select("div.commonPopupGroup").forEach(node -> {
                    if (node.hasParent()) {
                        org.jsoup.nodes.Element parent = node.parent();
                        node.children().forEach(parent::appendChild);
                        node.remove();
                    }
                });

                if (!includeVue) {
                    removeEmptyElements(doc, checkComponentMap);
                }

                doc.select("[style]").forEach(node -> {
                    String style = node.attr("style").replaceAll("\\s+", "").replaceAll(":", ": ").replaceAll(";", "; ");

                    style = replaceCalcStyle(style);
                    if (style.endsWith("; ")) {
                        style = style.substring(0, style.length() - 1);
                    }

                    if (!style.endsWith(";")) {
                        style = style + ";";
                    }

                    node.attr("style", style);
                });

                doc.select(".component_ui").forEach(component -> {
                    String componentClass = component.attr("class");
                    if (componentClass.contains("window_component")) {
                        componentClass = componentClass.replaceAll("window_component", "");
                        componentClass = componentClass.replaceAll("\\s+", " ");
                        component.attr("class", componentClass.trim());
                    }

                    String componentId = component.attr("id");
                    if (!componentId.isEmpty()) {
                        templateComponents.add(componentId);
                    }
                });

                org.jsoup.nodes.Element body = doc.body();
                if (body != null) {
                    List<String> children = selectChildren(body, checkComponentMap, true);
                    documentChildren.addAll(
                        children.stream()
                                .filter(id -> {
                                    String type = checkComponentMap.get(id);
                                    return type != null && !type.equals("WINDOW");
                                }).collect(Collectors.toList())
                    );
                }

                containerComponents.forEach(componentId -> {
                    if (templateComponents.contains(componentId)) {
                        org.jsoup.nodes.Element component = doc.selectFirst("#" + componentId);
                        if (component != null) {
                            String componentType = checkComponentMap.get(componentId);

                            if (containerBuilder.length() > 0) {
                                containerBuilder.append(',');
                            }
                            containerBuilder.append('"').append(componentId).append("\":");

                            if (componentType.equals("WINDOW")) {
                                List<String> children = selectChildren(component, checkComponentMap, true);

                                String childrenJson = children.stream().map(child -> "\"" + child + "\"").collect(Collectors.joining(","));
                                containerBuilder.append('[').append(childrenJson).append(']');
                            } else {
                                Element element = componentMap.get(componentId);

                                List<Element> elementList = null;
                                if (componentType.equals("TAB")) {
                                    elementList = ElementUtil.findElements(element, "props", "tabs", "tab");
                                } else if (componentType.equals("CONTAINER")) {
                                    elementList = ElementUtil.findElements(element, "props", "containers", "container");
                                }

                                List<String> childIds;
                                if (elementList != null) {
                                    childIds = elementList.stream().map(el -> el.getAttributeValue("id")).collect(Collectors.toList());
                                } else {
                                    childIds = Collections.emptyList();
                                }

                                containerBuilder.append('{');

                                int divCount = 0;
                                for (int i = 0; i < component.children().size(); i++) {
                                    org.jsoup.nodes.Element div = component.children().get(i);
                                    if (!div.nodeName().equals("div")) {
                                        continue;
                                    }

                                    if (divCount > 0) {
                                        containerBuilder.append(',');
                                    }

                                    String childId = childIds.size() > i ? childIds.get(i) : "";
                                    containerBuilder.append('\"').append(childId).append("\":");

                                    List<String> children = selectChildren(div, checkComponentMap, true);
                                    String childrenJson = children.stream().map(child -> "\"" + child + "\"").collect(Collectors.joining(","));

                                    containerBuilder.append('[').append(childrenJson).append(']');
                                    divCount++;
                                }

                                containerBuilder.append('}');
                            }
                        }
                    }
                });

                for (org.jsoup.nodes.Element scriptElement : doc.select("script")) {
                    scriptElements.add(scriptElement);
                    scriptElement.remove();
                }

                for (org.jsoup.nodes.Element styleElement : doc.select("style")) {
                    styleElements.add(styleElement);
                    styleElement.remove();
                }

                org.jsoup.nodes.Element element = doc.body();
                element.getElementsByAttribute("id")
                    .stream()
                    .map(e -> e.attr("id", prefixViewId + e.attr("id") ))
                    .collect(Collectors.toList());

                String html = doc.body().html();
                html = html.replaceAll(">\\s+", ">").replaceAll("\\s+<", "<");
                html = html.replaceAll("</span><span", "</span> <span");
                html = html.replaceAll("</button><button", "</button> <button");
                html = html.replaceAll("</kendo-button><kendo-button", "</kendo-button> <kendo-button");
                templateBuilder.append(html);

                manager.addTemplateViewId(templatePath, viewId);
            }

            String childrenJson = documentChildren.stream().map(child -> "\"" + child + "\"").collect(Collectors.joining(","));

            if (containerBuilder.length() > 0) {
                containerBuilder.append(',');
            }
            containerBuilder.append("\"DOCUMENT\":[");
            containerBuilder.append(childrenJson).append(']');

            StringBuilder styleBuilder = new StringBuilder();
            for (org.jsoup.nodes.Element styleElement : styleElements) {
                String styleHtml = styleElement.html();
                styleHtml = styleHtml.replaceAll("/\\*[\\s\\S]*?\\*/", "");

                String attrRegexp = "([\\w\\-]+)\\s*:\\s*([\\w\\s\\-\"\\./!#%\\(\\)]+|'.*')";
                Pattern attrPattern = Pattern.compile(attrRegexp);

                int pos = 0;
                int start = styleHtml.indexOf("{", 0);
                int end = styleHtml.indexOf("}", start);
                while (start != -1 && end != -1) {
                    String selector = styleHtml.substring(pos, start).trim();
                    String attributes = styleHtml.substring(start + 1, end).trim();

                    selector = selector.replaceAll("\\s+", " ");
                    selector = selector.replaceAll("[ ]?,[ ]?", ", ");
                    selector = selector.replaceAll("[ ]?>[ ]?", " > ");

                    if (styleBuilder.length() > 0) {
                        styleBuilder.append(' ');
                    }
                    styleBuilder.append(selector).append(" { ");

                    Matcher attrMatcher = attrPattern.matcher(attributes);
                    while (attrMatcher.find()) {
                        String attributeName = attrMatcher.group(1).trim();
                        String attributeValue = attrMatcher.group(2).trim();

                        attributeValue = attributeValue.replaceAll("\\s+", " ");

                        styleBuilder.append(attributeName).append(": ").append(attributeValue).append(';');
                    }
                    styleBuilder.append(" }");

                    pos = end + 1;
                    start = styleHtml.indexOf("{", end);
                    end = styleHtml.indexOf("}", start);
                }
            }

            Set<String> componentSet = componentMap.keySet();
            if (styleBuilder.length() > 0) {
                String style = styleBuilder.toString();

                for (String id : componentSet) {
                    String replaceId = "#" + prefixViewId + id;
                    style = style.replace("#" + id, replaceId);
                }
                templateBuilder.append(String.format("<style>%s</style>", style));
            }

            StringBuilder scriptBuilder = new StringBuilder();
            for (org.jsoup.nodes.Element scriptElement : scriptElements) {
                if (scriptBuilder.length() > 0) {
                    scriptBuilder.append('\n');
                }
                scriptBuilder.append(scriptElement.html());
            }

            if (scriptBuilder.length() > 0) {
                String script = scriptReplacer.replace(scriptBuilder.toString());

                for (String id : componentSet) {
                    String replaceId = prefixViewId + id;
                    script = script.replace("\"" + id, "\"" + replaceId).replace("\'" + id, "\'" + replaceId);
                }
                String replaceName = ".get('" + viewId + "').";  
                script = script.replaceAll("cm\\s*\\.\\s*", "com".concat(replaceName))
                               .replaceAll("vo\\s*\\.\\s*", "vom".concat(replaceName))
                               .replaceAll("dm\\s*\\.\\s*", "vsm.get('" + viewId + "', 'dataManager').");

                Pattern pattern = Pattern.compile("function (.*?)[(]");
                Matcher mather = pattern.matcher(script);

                String prefixFuntionName = viewId.toLowerCase().replace("_", "") + "_";
                while (mather.find()) {
                    String functionName = mather.group(1).trim();
                    if (functionName.isEmpty()) {
                        continue;
                    }
                    script = script.replaceAll("\\b" + functionName + "\\b", prefixFuntionName + functionName);
                }
                templateBuilder.append(String.format("\n<script>\n%s\n</script>", script));
            }

            manager.putTemplate(viewId, templateBuilder.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return containerBuilder.toString();
    }

    private void includeTemplate(org.jsoup.nodes.Element parent, String templatePath) {
        parent.children().stream()
            .filter(child -> child.nodeName().equals("include")).collect(Collectors.toList())
            .forEach(child -> {
                org.jsoup.select.Elements includeElements = includeElements(child, templatePath);
                if (includeElements != null) {
                    for (org.jsoup.nodes.Element includeElement : includeElements) {
                        child.before(includeElement);
                    }
                }
                child.remove();
            });

        parent.children().forEach(child -> includeTemplate(child, templatePath));
    }

    private org.jsoup.select.Elements includeElements(org.jsoup.nodes.Element includeElement, String templatePath) {
        String src = includeElement.attr("src");

        File templateFile = new File(rootPath + PATH_TEMPLATE + "/" + src);
        if (!templateFile.exists()) {
            return null;
        }

        manager.addIncludeTemplate(src.replace(".html", ""), templatePath);

        try {
            org.jsoup.nodes.Document doc = Jsoup.parse(templateFile, "UTF-8");

            removeComments(doc);
            includeTemplate(doc, templatePath);

            return doc.body().children();
        } catch (Exception e) {
            e.printStackTrace();

            return null;
        }
    }

    private void removeComments(org.jsoup.nodes.Element parent) {
        parent.childNodes().stream()
            .filter(node -> node.nodeName().equals("#comment")).collect(Collectors.toList())
            .forEach(Node::remove);

        parent.children().forEach(this::removeComments);
    }

    private void removeEmptyElements(org.jsoup.nodes.Element parent, Map<String, String> checkComponentMap) {
        parent.children().forEach(child -> removeEmptyElements(child, checkComponentMap));
        if (!parent.nodeName().equals("div") && !parent.nodeName().equals("span")) {
            return;
        }

        String id = parent.attr("id");
        if (id.equals("empty")) {
            return;
        }

        if (parent.classNames().contains("component_ui") && checkComponentMap.containsKey(id)) {
            return;
        }

        if (parent.children().isEmpty()) {
            parent.remove();
        }
    }

    private List<String> selectChildren(org.jsoup.nodes.Element parent, Map<String, String> checkComponentMap, boolean isRoot) {
        List<String> children = new ArrayList<>();
        if (!isRoot) {
            if (parent.classNames().contains("component_ui")) {
                String id = parent.attr("id");

                String type = checkComponentMap.get(id);
                if (type != null) {
                    children.add(id);
                }

                if (isContainerComponent(type)) {
                    return children;
                }
            }
        }

        parent.children().forEach(child -> children.addAll(selectChildren(child, checkComponentMap, false)));

        return children;
    }

    private boolean isContainerComponent(String componentType) {
        if ("WINDOW".equals(componentType)) {
            return true;
        } else if ("TAB".equals(componentType)) {
            return true;
        } else if ("CONTAINER".equals(componentType)) {
            return true;
        }
        return false;
    }

    private String replaceCalcStyle(String style) {
        String regexp = "calc\\((.*)\\)";
        Pattern pattern = Pattern.compile(regexp);
        Matcher matcher = pattern.matcher(style);

        int pos = 0;

        StringBuilder builder = new StringBuilder();
        while (matcher.find()) {
            String expression = matcher.group(1).trim();
            expression = expression.replaceAll("\\+", " + ");
            expression = expression.replaceAll("-", " - ");
            expression = expression.replaceAll("\\*", " * ");
            expression = expression.replaceAll("/", " / ");

            builder.append(style.substring(pos, matcher.start()));
            builder.append("calc(").append(expression).append(")");

            pos = matcher.end();
        }
        builder.append(style.substring(pos));

        return builder.toString();
    }

}
