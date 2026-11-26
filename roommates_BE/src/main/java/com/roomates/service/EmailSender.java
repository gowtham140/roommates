package com.roomates.service;

public interface EmailSender {

    boolean isConfigured();

    void sendText(String to, String subject, String text);

    void sendHtml(String to, String subject, String text, String html);
}
