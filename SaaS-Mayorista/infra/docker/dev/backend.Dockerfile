FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /workspace/backend

EXPOSE 8080

CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.profiles=dev"]
