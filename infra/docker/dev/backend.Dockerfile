FROM maven:3.9.9-eclipse-temurin-17

WORKDIR /workspace/backend

EXPOSE 8080

# The active Spring profile comes from the SPRING_PROFILES_ACTIVE env var
# (set in infra/docker/dev/docker-compose.yml) — single source of truth.
CMD ["mvn", "spring-boot:run", "-Dmaven.test.skip=true"]
