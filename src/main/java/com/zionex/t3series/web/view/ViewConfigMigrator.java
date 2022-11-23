package com.zionex.t3series.web.view;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import com.zionex.t3series.web.view.migration.MigrationEntryTub;
import com.zionex.t3series.web.view.migration.MigrationForColumnEditable;
import com.zionex.t3series.web.view.migration.MigrationForHyphenCase;
import com.zionex.t3series.web.view.migration.MigrationForLangDefaultTrue;
import com.zionex.t3series.web.view.migration.MigrationForOperationType;
import com.zionex.t3series.web.view.migration.MigrationForPermissionType;
import com.zionex.t3series.web.view.migration.MigrationForProps;
import com.zionex.t3series.web.view.migration.MigrationForSplitPosition;
import com.zionex.t3series.web.view.migration.MigrationForSuggestDescriptionId;
import com.zionex.t3series.web.view.migration.MigrationForTabPosition;
import com.zionex.t3series.web.view.migration.MigrationForUIOperation;
import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.ViewCreator;

import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.Format;
import org.jdom2.output.XMLOutputter;

import lombok.extern.java.Log;

@Log
public class ViewConfigMigrator extends ViewConfigIO {

    private final List<String> configPaths = new ArrayList<>();
    private final MigrationEntryTub entryTub = new MigrationEntryTub();
    private final DateFormat df = new SimpleDateFormat("yyyyMMdd");

    private boolean enable = true;
    private boolean backup = true;
    private String filter = "";
    private String indent = "    ";

    public ViewConfigMigrator(String configPath) {
        this.configPaths.add(configPath);

        // Used when migrating from 1.0 to 1.2.
        this.entryTub.addMigration(new MigrationForUIOperation());
        this.entryTub.addMigration(new MigrationForLangDefaultTrue());
        this.entryTub.addMigration(new MigrationForSuggestDescriptionId());
        this.entryTub.addMigration(new MigrationForHyphenCase());
        this.entryTub.addMigration(new MigrationForColumnEditable());
        this.entryTub.addMigration(new MigrationForSplitPosition());
        this.entryTub.addMigration(new MigrationForTabPosition());
        this.entryTub.addMigration(new MigrationForOperationType());

        // Used when migrating from 1.2 to 2.0.
        this.entryTub.addMigration(new MigrationForProps());
        this.entryTub.addMigration(new MigrationForPermissionType());
    }

    public void addConfigPath(String configPath) {
        if (!configPaths.contains(configPath)) {
            configPaths.add(configPath);
        }
    }

    public void setEnable(boolean enable) {
        this.enable = enable;
    }

    public void setBackup(boolean backup) {
        this.backup = backup;
    }

    public void setFilter(String filter) {
        this.filter = filter;
    }

    public void setIndent(String indent) {
        this.indent = indent;
    }

    public String createBackupDirectory() {
        try {
            Path path = Files.createTempDirectory("t3wingui-" + df.format(System.currentTimeMillis()) + "-");
            deleteFiles(path.toFile());

            log.info(String.format("Backing up view configuration files. (backup path: %s)", path));

            return path.toString();
        } catch (IOException e) {
            log.severe("Failed to create backup directory.");
        }

        return "";
    }

    public void migrate() {
        if (!enable || filter.isEmpty()) {
            return;
        }

        String backupDir = "";
        if (backup) {
            backupDir = createBackupDirectory();
        }

        for (String configPath : configPaths) {
            File sourceDir = new File(configPath);

            SAXBuilder builder = new SAXBuilder();

            List<File> sourceFiles = listFiles(sourceDir, file -> file.getAbsolutePath().matches(filter));
            for (File sourceFile : sourceFiles) {
                String sourceFilePath = sourceFile.getAbsolutePath();

                if (!backupDir.isEmpty()) {
                    try {
                        int index = sourceFilePath.indexOf("views");
                        String targetFilePath = index == -1 ? sourceFile.getName() : sourceFilePath.substring(index);

                        backupFile(sourceFilePath, backupDir + "/" + targetFilePath);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                try (StringReader xml = new StringReader(replaceXml(readFile(sourceFilePath)))) {
                    Document doc = builder.build(xml);

                    Element root = doc.getRootElement();
                    Element newRoot = null;
                    if (root.getName().equals("views")) {
                        newRoot = new Element("views");

                        List<Element> views = root.getChildren("view");
                        if (views.isEmpty()) {
                            continue;
                        }

                        for (Element view : views) {
                            Element newView = migrate(view);
                            if (views.size() == 1) {
                                newRoot = newView;
                            } else {
                                newRoot.addContent(newView);
                            }
                        }
                    } else if (root.getName().equals("view")) {
                        newRoot = migrate(root);
                    } else {
                        continue;
                    }

                    doc.setRootElement(newRoot);

                    Format format = Format.getPrettyFormat();
                    format.setIndent(indent);

                    XMLOutputter xmlOutputter = new XMLOutputter(format);
                    xmlOutputter.output(doc, new FileOutputStream(sourceFilePath));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public Element migrate(Element view) throws Exception {
        String version = view.getAttributeValue("version");
        if (version == null || version.isEmpty()) {
            version = "1.0";
        }

        String viewId = view.getAttributeValue("id");

        log.info(String.format("Migrates from version %s to version 2.0... (view id: %s)", version, viewId));

        String oldVersion = version;

        Element oldView = view;
        Element newView = null;

        for (String newVersion : nextVersions(oldVersion)) {
            newView = newViewElement(oldView, oldVersion, newVersion);
            oldView = newView;
            oldVersion = newVersion;
        }

        if (newView != null) {
            return newView;
        }

        log.warning("No migration was applied, only formatting was applied.");

        return view.clone();
    }

    private String[] nextVersions(String version) {
        if ("1.0".equals(version)) {
            return new String[] { "1.2", "2.0" };
        } else if ("1.2".equals(version)) {
            return new String[] { "1.2", "2.0" };
        } else if ("2.0".equals(version)) {
            return new String[] { "2.0" };
        } else {
            return new String[] {};
        }
    }

    private Element newViewElement(Element view, String oldVersion, String newVersion) {
        ViewCreator oldViewCreator = getViewCreator(oldVersion);
        ViewCreator newViewCreator = getViewCreator(newVersion);

        assert oldViewCreator != null;
        Configurable oldView = oldViewCreator.create(view);
        assert newViewCreator != null;
        Configurable newView = newViewCreator.create(entryTub.migrate(oldView, newVersion));

        return newView.toElement();
    }

    private ViewCreator getViewCreator(String version) {
        if ("1.0".equals(version)) {
            return com.zionex.t3series.web.view.v1_0.ViewFactory.getViewFactory();
        } else if ("1.2".equals(version)) {
            return com.zionex.t3series.web.view.v1_2.ViewFactory.getViewFactory();
        } else if ("2.0".equals(version)) {
            return com.zionex.t3series.web.view.v2_0.ViewFactory.getViewFactory();
        } else {
            return null;
        }
    }

}
