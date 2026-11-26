package com.roomates.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
public class S3StorageConfig {

    @Bean
    public S3Client s3Client(
            @Value("${storage.s3.endpoint}") String endpoint,
            @Value("${storage.s3.region}") String region,
            @Value("${storage.s3.access-key:}") String accessKey,
            @Value("${storage.s3.secret-key:}") String secretKey,
            @Value("${storage.s3.path-style-access:true}") boolean pathStyleAccess) {

        if (!StringUtils.hasText(endpoint)) {
            throw new IllegalStateException("STORAGE_ENDPOINT is required");
        }
        if (!StringUtils.hasText(accessKey) || !StringUtils.hasText(secretKey)) {
            throw new IllegalStateException("STORAGE_ACCESS_KEY and STORAGE_SECRET_KEY are required");
        }

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(pathStyleAccess)
                        .build())
                .build();
    }
}
