package com.zionex.t3series.web.util.converter;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.awt.Color;

@Converter
public class ColorConverter implements AttributeConverter<String, String> {

    public enum ChartColor {

        COLOR_01(255, 255, 150),
        COLOR_02(255, 200, 150),
        COLOR_03(255, 150, 200),
        COLOR_04(255, 150, 150),
        COLOR_05(255, 150, 100),
        COLOR_06(255, 100, 150),
        COLOR_07(200, 255, 150),
        COLOR_08(150, 255, 200),
        COLOR_09(150, 255, 150),
        COLOR_10(150, 200, 255),
        COLOR_11(150, 150, 255),
        COLOR_12(150, 150, 100),
        COLOR_13(100, 250, 150),
        COLOR_14(100, 150, 255),
        COLOR_15(100, 150, 150),
        COLOR_16(255, 255, 214),
        COLOR_17(199, 209, 255),
        COLOR_18(203, 255, 161),
        COLOR_19(255, 229, 237),
        COLOR_20(163, 255, 209),
        DEFAULT_COLOR(79, 129, 189);

        private final int r;
        private final int g;
        private final int b;

        private final Color color;

        ChartColor(int r, int g, int b) {
            this.r = r;
            this.g = g;
            this.b = b;

            this.color = new Color(r, g, b);
        }

        public Color getColor() {
            return this.color;
        }

        public static Color getColor(int index) {
            int ordinal = index % (ChartColor.values().length - 1);

            for (ChartColor chartColor : ChartColor.values()) {
                if (chartColor.ordinal() == ordinal) {
                    return chartColor.getColor();
                }
            }

            return ChartColor.DEFAULT_COLOR.getColor();
        }

        public static Color getColor(String code) {
            if (code == null || code.length() == 0) {
                return ChartColor.DEFAULT_COLOR.getColor();
            }

            int decimal = 0;
            try {
                code = code.toUpperCase();

                if (code.startsWith("#") || code.startsWith("0X")) {
                    int hex = Integer.decode(code);

                    return new Color(hex);
                }

                decimal = Float.valueOf(code).intValue();
            } catch (NumberFormatException ignored) {
            }

            return getColor(decimal);
        }

        public static String getColorString(String code) {
            Color color = getColor(code);
            return "#" + ("" + Integer.toHexString(color.getRGB())).substring(2);
        }

    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute;
    }

    @Override
    public String convertToEntityAttribute(String column) {
        Color color = ChartColor.getColor(column);
        String hexString = Integer.toHexString(color.getRGB());
        String colorString = "#" + hexString.substring(hexString.length() - 6);

        return colorString;
    }

}
