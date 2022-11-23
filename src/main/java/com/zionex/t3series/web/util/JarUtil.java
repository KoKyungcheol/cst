package com.zionex.t3series.web.util;

import java.io.File;
import java.io.IOException;

import com.google.common.io.Files;
import com.google.common.io.Resources;

import org.apache.commons.io.FileUtils;

public class JarUtil {

    public static File extractExecutableFromJar(String executable) throws IOException {
        File tmpDir = Files.createTempDir();
        tmpDir.deleteOnExit();

        File command = new File(tmpDir, executable);
        FileUtils.copyURLToFile(Resources.getResource(executable), command);
        command.deleteOnExit();
        command.setExecutable(true);

        return command;
    }

}
