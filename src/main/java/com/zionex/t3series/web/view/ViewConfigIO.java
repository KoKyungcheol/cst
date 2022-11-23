package com.zionex.t3series.web.view;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileFilter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class ViewConfigIO {

    public ViewConfigIO() {
    }

    protected String readFile(String filePath) throws Exception {
        return readFile(new FileReader(new File(filePath)));
    }

    protected String readFile(InputStreamReader inputStreamReader) throws Exception {
        StringBuilder readBuilder = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(inputStreamReader)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = replaceQuot(line.trim());
                if (line.endsWith("\"")) {
                    line += " ";
                }

                if (line.isEmpty()) {
                    continue;
                }

                if (readBuilder.length() > 0) {
                    char beforeChar = readBuilder.charAt(readBuilder.length() - 1);
                    if (beforeChar != '>' && beforeChar != '=' && beforeChar != ':') {
                        char afterChar = line.charAt(0);
                        if (afterChar != '<' && afterChar != '=' && afterChar != ':' && afterChar != '"') {
                            readBuilder.append(' ');
                        }
                    }
                }
                readBuilder.append(line);
            }
        } catch (Exception e) {
            throw e;
        }

        return readBuilder.toString();
    }

    protected void writeFile(String filePath, String data) throws Exception {
        File dir = new File(filePath.substring(0, filePath.lastIndexOf('/')));
        if (!dir.exists()) {
            dir.mkdirs();
        }

        File file = new File(filePath);

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write(data);
        }
    }

    protected void backupFile(String srcFilePath, String dstFilePath) throws Exception {
        File dir = new File(dstFilePath.substring(0, dstFilePath.lastIndexOf('/')));
        if (!dir.exists()) {
            dir.mkdirs();
        }

        File srcFile = new File(srcFilePath);
        File dstFile = new File(dstFilePath);

        dstFile.getParentFile().mkdirs();

        try (BufferedReader reader = new BufferedReader(new FileReader(srcFile));
             BufferedWriter writer = new BufferedWriter(new FileWriter(dstFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                writer.write(line);
                writer.newLine();
            }
        }
    }

    protected String replaceQuot(String line) {
        boolean openedString = false;

        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c > 127) {
                continue;
            }

            if (c == '"') {
                openedString = !openedString;
            }

            if (!openedString && c == '\'') {
                builder.append('"');
            } else {
                builder.append(c);
            }
        }
        return builder.toString();
    }

    protected String replaceXml(String xml) {
        xml = xml.replaceAll("<!--[\\s\\S]*?-->", "");
        xml = xml.replaceAll("\t", " ");
        xml = xml.replaceAll("\\s{2,}", " ");
        xml = xml.replaceAll("(\\w+)\\s*=\\s*\"(\\w+)\"", "$1=\"$2\"");
        xml = xml.replaceAll("\\s+>", ">");
        xml = xml.replaceAll("\"\\s*/>", "\" />");

        int startIndex = 0;
        for (int i = 0; i < xml.length(); i++) {
            if (xml.charAt(i) == '<') {
                startIndex = i;
                break;
            }
        }

        if (startIndex > 0) {
            xml = xml.substring(startIndex);
        }
        return xml;
    }

    protected List<File> listFiles(File dir, FileFilter filter) {
        List<File> result = new ArrayList<>();

        if (dir == null || !dir.exists() || !dir.isDirectory()) {
            return result;
        }

        File[] files = dir.listFiles();
        assert files != null;
        for (File file : files) {
            if (file.isDirectory()) {
                result.addAll(listFiles(file, filter));
            } else {
                if (filter.accept(file)) {
                    result.add(file);
                }
            }
        }
        return result;
    }

    protected boolean deleteFiles(File dir) {
        if (dir == null || !dir.exists()) {
            return false;
        }

        if (!dir.isDirectory()) {
            return dir.delete();
        }

        File[] files = dir.listFiles();
        assert files != null;
        for (File file : files) {
            if (file.isDirectory()) {
                deleteFiles(file);
            } else {
                file.delete();
            }
        }

        return dir.delete();
    }

}
