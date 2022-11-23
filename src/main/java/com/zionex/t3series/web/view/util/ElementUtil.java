package com.zionex.t3series.web.view.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.jdom2.Element;
import org.jsoup.internal.StringUtil;

public class ElementUtil {

    public static List<Element> findElements(Element element, String... elementNames) {
        if (elementNames.length == 0) {
            return Collections.emptyList();
        }

        if (elementNames.length == 1) {
            List<Element> elements = element.getChildren(elementNames[0]);
            return elements == null ? Collections.emptyList() : elements;
        }

        Element nextElement = element.getChild(elementNames[0]);
        String[] nextElementNames = Arrays.copyOfRange(elementNames, 1, elementNames.length);

        return nextElement == null ? Collections.emptyList() : findElements(nextElement, nextElementNames);
    }

    public static Element findElement(Element element, String... elementNames) {
        if (elementNames.length == 0) {
            return null;
        }

        if (elementNames.length == 1) {
            return element.getChild(elementNames[0]);
        }

        Element nextElement = element.getChild(elementNames[0]);
        String[] nextElementNames = Arrays.copyOfRange(elementNames, 1, elementNames.length);

        return nextElement == null ? null : findElement(nextElement, nextElementNames);
    }

    public static boolean removeParent(Element element) {
        return element.getParent().removeContent(element);
    }

    public static boolean removeElement(Element element, String... elementNames) {
        Element foundElement = findElement(element, elementNames);
        if (foundElement != null) {
            return foundElement.getParent().removeContent(foundElement);
        }
        return false;
    }

    public static Element findAndNewElement(Element element, String... elementNames) {
        if (elementNames.length == 0) {
            return null;
        }

        if (elementNames.length == 1) {
            Element child = element.getChild(elementNames[0]);
            if (child == null) {
                child = new Element(elementNames[0]);
                element.addContent(child);
            }
            return child;
        }

        Element nextElement = element.getChild(elementNames[0]);
        if (nextElement == null) {
            nextElement = new Element(elementNames[0]);
            element.addContent(nextElement);
        }

        String[] nextElementNames = Arrays.copyOfRange(elementNames, 1, elementNames.length);

        return nextElement == null ? null : findAndNewElement(nextElement, nextElementNames);
    }

    public static List<Element> findRecursiveElements(Element parentElement, String elementName) {
        List<Element> targetElements = new ArrayList<>();
        for (Element childElement : parentElement.getChildren()) {
            if (elementName.equals(childElement.getName())) {
                targetElements.add(childElement);
            }
            targetElements.addAll(findRecursiveElements(childElement, elementName));
        }
        return targetElements;
    }

    public static Element findRecursiveElement(Element parentElement, String elementName, String elementId) {
        for (Element childElement : parentElement.getChildren()) {
            if (elementName.equals(childElement.getName())) {
                String targetElementId = childElement.getAttributeValue("id");
                if (elementId.equals(targetElementId)) {
                    return childElement;
                }
            } else {
                Element targetElement = findRecursiveElement(childElement, elementName, elementId);
                if (targetElement != null) {
                    String targetElementId = targetElement.getAttributeValue("id");
                    if (elementId.equals(targetElementId)) {
                        return targetElement;
                    }
                }
            }
        }
        return null;
    }

    public static void moveChildren(Element fromElement, Element toElement) {
        for (Element fromChild : new ArrayList<>(fromElement.getChildren())) {
            removeParent(fromChild);

            Element toChild = toElement.getChild(fromChild.getName());
            if (toChild != null) {
                moveChildren(fromChild, toChild);
            } else {
                toElement.addContent(fromChild);
            }
        }
    }

    public static String findString(Element element, String... elementNames) {
        if (elementNames.length == 0) {
            return null;
        }

        if (elementNames.length == 1) {
            String elementName = elementNames[0];

            int index = elementName.lastIndexOf(".");
            if (index != -1) {
                String lastElementName = elementName.substring(0, index);

                Element lastElement = lastElementName.isEmpty() ? element : element.getChild(lastElementName);
                if (lastElement == null) {
                    return null;
                }

                return lastElement.getAttributeValue(elementName.substring(index+1));
            }
            return element.getChildText(elementName);
        }

        Element nextElement = element.getChild(elementNames[0]);
        String[] nextElementNames = Arrays.copyOfRange(elementNames, 1, elementNames.length);

        return nextElement == null ? null : findString(nextElement, nextElementNames);
    }

    public static Boolean findBoolean(Element element, String... elementNames) {
        String elementText = findString(element, elementNames);
        return elementText == null ? null : Boolean.valueOf(elementText);
    }

    public static Integer findInteger(Element element, String... elementNames) {
        String elementText = findString(element, elementNames);
        if (!StringUtil.isNumeric(elementText)) {
            return null;
        }
        return elementText == null ? null : Integer.valueOf(elementText);
    }

}
