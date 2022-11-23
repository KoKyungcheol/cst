package com.zionex.t3series.web.view;

import static com.zionex.t3series.web.constant.ApplicationConstants.ICON_DEFAULT;
import static com.zionex.t3series.web.constant.ApplicationConstants.PATH_TEMPLATE;
import static com.zionex.t3series.web.constant.ApplicationConstants.PATH_VIEW;
import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_DELETE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;
import static java.nio.file.StandardWatchEventKinds.OVERFLOW;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.WatchEvent;
import java.nio.file.WatchEvent.Kind;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import lombok.extern.java.Log;

@Log
public class ViewConfigManager {

    private static final ViewConfigManager viewConfigManager = new ViewConfigManager();

    private final ViewConfigConvertor convertor;

    private final Map<String, ViewItem> viewGroupItemMap = new HashMap<>();
    private final Map<String, ViewItem> viewItemMap = new HashMap<>();

    private final Set<String> openedViewIds = new HashSet<>();
    private final Map<String, String> viewMap = new HashMap<>();

    private final Map<String, String> templateMap = new HashMap<>();
    private final Map<String, List<String>> templateViewIdMap = new HashMap<>();
    private final Map<String, List<String>> includeTemplateMap = new HashMap<>();

    private final Map<String, String> viewIdMap = new HashMap<>();
    private final Map<String, List<String>> viewPathMap = new HashMap<>();
    private final Map<String, List<String>> copyFromUseMap = new HashMap<>();

    private final List<String> permissionTypes = Arrays.asList("CREATE", "READ", "UPDATE", "DELETE", "IMPORT");

    private String rootPath;

    private ViewConfigManager() {
        convertor = new ViewConfigConvertor(this);
    }

    public static ViewConfigManager getViewConfigManager() {
        return viewConfigManager;
    }

    public void init(String rootPath) {
        if (rootPath.charAt(rootPath.length() - 1) == '/') {
            rootPath = rootPath.substring(0, rootPath.length() - 1);
        }

        convertor.init(rootPath);
        this.rootPath = rootPath;
    }

    public List<String> getPermissionTypes() {
        return permissionTypes;
    }


    public void convertAllXmlToJson(boolean enableWatchService) {
        convertor.convertAllXmlToJson();

        for (String viewGroupId : viewGroupItemMap.keySet()) {
            ViewItem viewGroupItem = viewGroupItemMap.get(viewGroupId);

            String parentId = viewGroupItem.getParentId();
            if (viewGroupItemMap.containsKey(parentId)) {
                viewGroupItemMap.get(parentId).addChild(viewGroupItem);
            }
        }

        for (String viewId : viewItemMap.keySet()) {
            ViewItem viewItem = viewItemMap.get(viewId);

            String parentId = viewItem.getParentId();
            if (viewGroupItemMap.containsKey(parentId)) {
                viewGroupItemMap.get(parentId).addChild(viewItem);
            }
        }

        log.info("The entire view config file has been published.");

        if (enableWatchService) {
            try {
                startWatchService();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void startWatchService() throws Exception {
        final WatchService watchService = FileSystems.getDefault().newWatchService();

        List<File> viewDirs = collectDirs(new File(rootPath + PATH_VIEW));
        viewDirs.forEach(dir -> {
            Path path = Paths.get(dir.getAbsolutePath());

            try {
                path.register(watchService, ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY, OVERFLOW);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        List<File> templateDirs = collectDirs(new File(rootPath + PATH_TEMPLATE));
        templateDirs.forEach(dir -> {
            Path path = Paths.get(dir.getAbsolutePath());

            try {
                path.register(watchService, ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY, OVERFLOW);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });

        new Thread(() -> {
            try {
                log.info("View config watch service starting...");

                while (true) {
                    WatchKey watchKey = watchService.take();
                    Path dir = (Path) watchKey.watchable();

                    List<WatchEvent<?>> events = watchKey.pollEvents();
                    for (WatchEvent<?> event : events) {
                        Kind<?> kind = event.kind();
                        if (kind.equals(ENTRY_CREATE) || kind.equals(ENTRY_DELETE) || kind.equals(ENTRY_MODIFY) || kind.equals(OVERFLOW)) {
                            Path eventPath = (Path) event.context();
                            String fullPath = dir.resolve(eventPath).toString();

                            fullPath = fullPath.replace("\\", "/");

                            if (fullPath.endsWith(".html")) {
                                String templatePath = fullPath.replace(rootPath + PATH_TEMPLATE + "/", "").replace(".html", "");

                                if (includeTemplateMap.containsKey(templatePath)) {
                                    List<String> includeTemplates = new ArrayList<>(includeTemplateMap.get(templatePath));

                                    includeTemplates.forEach(this::modifiedTemplateFile);
                                }

                                if (templateViewIdMap.containsKey(templatePath)) {
                                    modifiedTemplateFile(templatePath);
                                }

                                continue;
                            }

                            if (convertor.convertXmlToJson(fullPath)) {
                                List<String> viewIds = viewPathMap.get(fullPath);
                                if (viewIds != null) {
                                    viewIds = new ArrayList<>(viewIds);
                                    viewIds.forEach(viewId -> {
                                        List<String> targetViewIds = copyFromUseMap.get(viewId);
                                        if (targetViewIds != null) {
                                            for (String targetViewId : targetViewIds) {
                                                String targetPath = viewIdMap.get(targetViewId);
                                                if (targetPath != null) {
                                                    convertor.convertXmlToJson(targetPath);
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }

                    if (!watchKey.reset()) {
                        log.severe("View config watch service has closed.");
                        break;
                    }
                }

                watchService.close();
            } catch (Exception e) {
                try {
                    watchService.close();
                } catch (IOException ignored) {
                }

                log.severe("View config watch service has closed.");
                e.printStackTrace();
            }
        }).start();
    }

    private void modifiedTemplateFile(String templatePath) {
        List<String> templateViewIds = new ArrayList<>(templateViewIdMap.get(templatePath));
        templateViewIds.forEach(templateViewId -> {
            String viewPath = viewIdMap.get(templateViewId);
            if (viewPath != null && convertor.convertXmlToJson(viewPath)) {
                List<String> viewIds = viewPathMap.get(viewPath);
                if (viewIds != null) {
                    viewIds = new ArrayList<>(viewIds);
                    viewIds.forEach(viewId -> {
                        List<String> targetViewIds = copyFromUseMap.get(viewId);
                        if (targetViewIds != null) {
                            for (String targetViewId : targetViewIds) {
                                String targetPath = viewIdMap.get(targetViewId);
                                if (targetPath != null) {
                                    convertor.convertXmlToJson(targetPath);
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    private List<File> collectDirs(File dir) {
        if (dir == null || !dir.exists()) {
            return Collections.emptyList();
        }

        List<File> dirs = new ArrayList<>();
        if (dir.isDirectory()) {
            dirs.add(dir);
        }

        for (File file : Objects.requireNonNull(dir.listFiles())) {
            if (!file.isDirectory()) {
                continue;
            }
            dirs.addAll(collectDirs(file));
        }

        return dirs;
    }

    public void addOpenedViewId(String viewId) {
        openedViewIds.add(viewId);
    }

    public Set<String> getOpenedMenus() {
        return viewGroupItemMap.keySet();
    }

    public ViewItem getViewItem(String viewItemId, boolean isMenu) {
        if (isMenu) {
            return viewGroupItemMap.get(viewItemId);
        } else {
            return viewItemMap.get(viewItemId);
        }
    }

    public Set<String> getPublishedViews() {
        return Collections.unmodifiableSet(openedViewIds);
    }

    public ViewItem getPublishedViewItem(Map<String, Boolean> menusByUser, Map<String, Boolean> bookMarkedByUser) {
        ViewItem rootGroupItem = new ViewItem("", "", 0, ICON_DEFAULT, true, false);

        Map<String, ViewItem> appendedGroupItemMap = new HashMap<>();

        for (String viewId : viewItemMap.keySet()) {
            ViewItem viewItem = viewItemMap.get(viewId);

            if (!openedViewIds.contains(viewItem.getId())) {
                continue;
            }

            if (!menusByUser.containsKey(viewItem.getId())) {
                continue;
            }

            boolean acceptable = menusByUser.get(viewItem.getId());
            if (acceptable) {
                if (!viewItem.getParentId().isEmpty()) {
                    ViewItem newViewItem = viewItem.clone();
                    if (bookMarkedByUser != null && bookMarkedByUser.containsKey(newViewItem.getId())) {
                        newViewItem.setBookmarked(bookMarkedByUser.get(newViewItem.getId()));
                    }

                    appendViewItem(newViewItem, rootGroupItem, appendedGroupItemMap);
                }
            }
        }

        return rootGroupItem;
    }

    private void appendViewItem(ViewItem viewItem, ViewItem rootGroupItem, Map<String, ViewItem> appendedGroupItemMap) {
        String parentId = viewItem.getParentId();
        if (parentId.equals(rootGroupItem.getId())) {
            rootGroupItem.addChild(viewItem);
            return;
        }

        if (viewGroupItemMap.containsKey(parentId)) {
            if (!appendedGroupItemMap.containsKey(parentId)) {
                appendedGroupItemMap.put(parentId, viewGroupItemMap.get(parentId).clone());
            }

            ViewItem viewGroupItem = appendedGroupItemMap.get(parentId);
            viewGroupItem.addChild(viewItem);

            appendViewItem(viewGroupItem, rootGroupItem, appendedGroupItemMap);
        }
    }

    void putViewGroupItem(String viewGroupId, ViewItem viewItem) {
        viewGroupItemMap.put(viewGroupId, viewItem);
    }

    void putViewItem(String viewId, ViewItem viewItem) {
        viewItemMap.put(viewId, viewItem);
    }

    ViewItem getViewItem(String viewId) {
        return viewItemMap.get(viewId);
    }

    public String getViewConfig(String viewId) {
        return viewMap.get(viewId);
    }

    void putViewConfig(String viewId, String viewConfig) {
        viewMap.put(viewId, viewConfig);
    }

    void addViewIdAndPath(String viewId, String path) {
        viewIdMap.put(viewId, path);

        if (!viewPathMap.containsKey(path)) {
            viewPathMap.put(path, new ArrayList<>());
        }
        viewPathMap.get(path).add(viewId);
    }

    void addCopyFromUse(String copyFromViewId, String usedViewId) {
        if (!copyFromUseMap.containsKey(copyFromViewId)) {
            copyFromUseMap.put(copyFromViewId, new ArrayList<>());
        }

        List<String> usedViewIds = copyFromUseMap.get(copyFromViewId);
        if (!usedViewIds.contains(usedViewId)) {
            usedViewIds.add(usedViewId);
        }
    }

    public String getTemplate(String viewId) {
        return templateMap.get(viewId);
    }

    void putTemplate(String viewId, String template) {
        templateMap.put(viewId, template);
    }

    void addTemplateViewId(String templatePath, String viewId) {
        if (!templateViewIdMap.containsKey(templatePath)) {
            templateViewIdMap.put(templatePath, new ArrayList<>());
        }
        templateViewIdMap.get(templatePath).add(viewId);
    }

    void addIncludeTemplate(String includeTemplatePath, String templatePath) {
        if (!includeTemplateMap.containsKey(includeTemplatePath)) {
            includeTemplateMap.put(includeTemplatePath, new ArrayList<>());
        }
        includeTemplateMap.get(includeTemplatePath).add(templatePath);
    }

}
