package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import com.roomates.config.MailConfig;

class MailConfigTest {

    @Test
    void stripsWhitespaceFromMailPassword() {
        JavaMailSenderImpl sender = (JavaMailSenderImpl) new MailConfig().javaMailSender(
                "smtp.gmail.com", 587, "account@gmail.com", " ab cd 12 ", true, true, true,
                5000, 5000, 5000);

        assertEquals("abcd12", sender.getPassword());
    }
}
