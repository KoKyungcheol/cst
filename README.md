# WingUI Platform with SpringBoot

[![java-maven](https://github.com/zionex/t3series-wingui/actions/workflows/maven.yml/badge.svg)](https://github.com/zionex/t3series-wingui/actions)
[![DeepSource](https://deepsource.io/gh/zionex/t3series-wingui.svg/?label=active+issues&show_trend=true&token=LVcHybosyFGhWq_Gaiooty7j)](https://deepsource.io/gh/zionex/t3series-wingui/?ref=repository-badge)+

## Reference Guide

* [SpringBoot Reference Guide](https://spring.io/projects/spring-boot#learn)
* [IntelliJ Setup](https://github.com/zionex/t3series-maven/blob/master/intellij-setup.md)

## Getting Started

>**Must install**

* [Java JDK 8](https://github.com/ojdkbuild/ojdkbuild)

>**Recommend install**
* [VS Code](https://code.visualstudio.com)
  - This project has no any dependency on develop IDE.
  - You also free to use others what you want.
  - For example IntelliJ, Eclipse, Atom, etc...

## Build

1. open TERMINAL
2. input *maven command*
   ```
   .\mvnw clean package
   ```

## Deployment

  * WAR deploy into WAS **_/target/{name}-{version}.war.original_** (remove {.original})
  * **Caution** 
    - Extends Webapp Location is optional

## Run Single executable file

>**Windows**
  1. open TERMINAL
  2. *java command* to run
     ```
     java -jar {name}-{version}.war
     ```
  3. *Crtl + C* or *Close console* to stop

>**Linux**
  1. open TERMINAL
  2. *java command* to run
     ```
     nohup java -jar {name}-{version}.war &
     ```

## License

ZIONEX [LICENSE](http://zionex.com/)