FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY backend/spendwise-api/pom.xml .
COPY backend/spendwise-api/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/spendwise-api-1.0.0.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=render
CMD ["java", "-jar", "app.jar"]
