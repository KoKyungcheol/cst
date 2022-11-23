package com.zionex.t3series.web.util;

public class OSUtil {

    public enum OS {
        WINDOWS, UNIX, MAC
    }

    public static OS getOS() throws Exception {
        String osName = System.getProperty("os.name").toLowerCase();

        if (osName.contains("win")) {
            return OS.WINDOWS;
        } else if (osName.contains("nix") || osName.contains("nux") || osName.contains("aix")) {
            return OS.UNIX;
        } else if ("Mac OS X".equalsIgnoreCase(osName)) {
            return OS.MAC;
        } else {
            throw new Exception("Unrecognized OS: " + osName);
        }
    }

}
