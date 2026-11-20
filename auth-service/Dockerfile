# Anh chay: chi chua JRE + jar da build. Build jar bang:
#   mvn -q -DskipTests package  (trong thu muc service)
FROM eclipse-temurin:21-jre

# curl de Docker healthcheck goi /actuator/health; user khong phai root.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app app

WORKDIR /app
COPY --chown=app:app target/auth-service-0.0.1-SNAPSHOT.jar app.jar

USER app
EXPOSE 8085
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
