package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import com.roomates.serviceImp.ResendEmailSender;
import com.sun.net.httpserver.HttpServer;

class ResendEmailSenderHttpTest {

    private final AtomicReference<String> capturedBody = new AtomicReference<>();
    private final AtomicReference<String> capturedAuthorization = new AtomicReference<>();
    private HttpServer server;

    @AfterEach
    void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @Test
    void sendsTextEmailToResendApi() throws Exception {
        startServer(200, "{\"id\":\"test-id\"}");
        ResendEmailSender sender = new ResendEmailSender("re_test_key", serverUrl(), "no-reply@example.com");

        sender.sendText("user@example.com", "Verify your email", "Your code is 123456");

        assertEquals("Bearer re_test_key", capturedAuthorization.get());
        assertTrue(capturedBody.get().contains("\"from\":\"no-reply@example.com\""));
        assertTrue(capturedBody.get().contains("\"to\":[\"user@example.com\"]"));
        assertTrue(capturedBody.get().contains("\"subject\":\"Verify your email\""));
        assertTrue(capturedBody.get().contains("\"text\":\"Your code is 123456\""));
    }

    @Test
    void usesResendOnboardingSenderForFreeMailFromAddress() throws Exception {
        startServer(200, "{\"id\":\"test-id\"}");
        ResendEmailSender sender = new ResendEmailSender("re_test_key", serverUrl(),
                "RoomMate Finder <supportroomates@gmail.com>");

        sender.sendText("user@example.com", "Subject", "Body");

        assertTrue(capturedBody.get().contains("\"from\":\"onboarding@resend.dev\""));
    }

    @Test
    void surfacesResendProviderError() throws Exception {
        startServer(403,
                "{\"message\":\"You can only send testing emails to your own email address\",\"name\":\"validation_error\"}");
        ResendEmailSender sender = new ResendEmailSender("re_test_key", serverUrl(), "no-reply@example.com");

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> sender.sendText("user@example.com", "Subject", "Body"));

        assertTrue(exception.getMessage().contains("403"));
        assertTrue(exception.getMessage().contains("testing emails"));
    }

    private void startServer(int status, String responseBody) throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/emails", exchange -> {
            capturedBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            capturedAuthorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            byte[] response = responseBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        });
        server.start();
    }

    private String serverUrl() {
        return "http://127.0.0.1:" + server.getAddress().getPort() + "/emails";
    }
}
