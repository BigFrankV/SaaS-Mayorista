FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml dependency:go-offline
COPY backend backend
RUN mvn -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/backend/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
