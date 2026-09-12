FROM eclipse-temurin:26-jdk AS build

WORKDIR /workspace

COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

RUN chmod +x mvnw && ./mvnw -B -ntp dependency:go-offline

COPY src/ src/

RUN ./mvnw -B -ntp package

FROM eclipse-temurin:26-jre

WORKDIR /app

COPY --from=build /workspace/target/api-0.0.1-SNAPSHOT.jar app.jar

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=40 -XX:InitialRAMPercentage=10 -XX:MaxMetaspaceSize=96m -XX:MaxDirectMemorySize=64m"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]