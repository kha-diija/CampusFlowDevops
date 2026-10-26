FROM eclipse-temurin:21-jre

WORKDIR /app

# curl sert au healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# JAR produit par Jenkins (mvn package)
COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]