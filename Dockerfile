FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY roommates_BE/.mvn/ ./.mvn/
COPY roommates_BE/mvnw ./
COPY roommates_BE/pom.xml ./
COPY roommates_BE/src ./src
RUN chmod +x ./mvnw && ./mvnw -B -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/lib/roommates/uploads/rooms \
    && chown -R daemon:daemon /var/lib/roommates/uploads
COPY --from=build /build/target/*.war /app/app.war
USER daemon
ENV ROOM_UPLOAD_DIR=/var/lib/roommates/uploads \
    SERVER_PORT=8080
VOLUME ["/var/lib/roommates/uploads"]
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.war"]
