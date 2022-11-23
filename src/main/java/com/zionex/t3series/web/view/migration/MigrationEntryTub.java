package com.zionex.t3series.web.view.migration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class MigrationEntryTub {

    private final Map<String, List<Migration>> migrationMap = new HashMap<>();

    public MigrationEntryTub() {
    }

    public void addMigration(Migration migration) {
        String version = migration.getVersion();

        List<Migration> migrations = migrationMap.computeIfAbsent(version, k -> new ArrayList<>());
        migrations.add(migration);
    }

    public Element migrate(Configurable configurable, String version) {
        Element view = configurable.toElement();

        List<Migration> migrations = migrationMap.get(version);
        if (migrations == null) {
            return view;
        }

        for (Migration migration : migrations) {
            migration.migrate(view);
        }
        return view;
    }

}
