package com.roomates.serviceImp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.HtmlUtils;

import com.roomates.model.Enquiry;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.service.NotificationMailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class NotificationMailServiceImp implements NotificationMailService {

    private static final Logger log = LoggerFactory.getLogger(NotificationMailServiceImp.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public NotificationMailServiceImp(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEnquiryNotification(Enquiry enquiry) {
        Room room = enquiry.getRoom();
        User owner = room == null ? null : room.getOwner();
        if (owner == null || !StringUtils.hasText(owner.getMailID())) {
            return;
        }
        if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(mailPassword)) {
            log.debug("Skipping enquiry notification email because mail is not configured");
            return;
        }

        String from = StringUtils.hasText(mailFrom) ? mailFrom : mailUsername;
        String roomTitle = value(room.getTitle());
        String ownerName = value(owner.getName());
        String seekerName = value(enquiry.getSeeker() == null ? null : enquiry.getSeeker().getName());
        String seekerEmail = value(enquiry.getSeeker() == null ? null : enquiry.getSeeker().getMailID());
        String seekerPhone = value(enquiry.getSeeker() == null ? null : enquiry.getSeeker().getPhone_no());
        String location = value(room.getLocation());
        String message = value(enquiry.getMessage());
        String dashboardUrl = frontendUrl.replaceAll("/+$", "") + "/enquiries";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(owner.getMailID());
            helper.setSubject("New enquiry for " + roomTitle + " - RoomMate Finder");
            helper.setText(plainText(ownerName, seekerName, roomTitle, location, seekerEmail, seekerPhone, message),
                    html(ownerName, seekerName, roomTitle, location, seekerEmail, seekerPhone, message, dashboardUrl));
            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException ex) {
            log.warn("Failed to send enquiry notification email to {}", owner.getMailID(), ex);
        }
    }

    private String plainText(String ownerName, String seekerName, String roomTitle, String location,
            String seekerEmail, String seekerPhone, String message) {
        return "Hi " + ownerName + ",\n\n"
                + "You have a new enquiry for your room listing.\n\n"
                + "Room: " + roomTitle + "\n"
                + "Location: " + location + "\n"
                + "Enquired by: " + seekerName + "\n"
                + "Email: " + seekerEmail + "\n"
                + "Phone: " + seekerPhone + "\n"
                + "Message: " + message + "\n\n"
                + "View your enquiries: " + frontendUrl + "/enquiries\n\n"
                + "RoomMate Finder Team";
    }

    private String html(String ownerName, String seekerName, String roomTitle, String location,
            String seekerEmail, String seekerPhone, String message, String dashboardUrl) {
        return String.join("\n",
                "<!doctype html>",
                "<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"></head>",
                "<body style=\"margin:0;padding:24px 12px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;\">",
                "  <div style=\"max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,0.08);\">",
                "    <div style=\"background:linear-gradient(135deg,#1d4ed8,#4338ca);padding:28px;color:#ffffff;\">",
                "      <div style=\"font-size:22px;font-weight:700;letter-spacing:0.3px;\">RoomMate Finder</div>",
                "      <div style=\"margin-top:6px;font-size:14px;opacity:0.9;\">New enquiry received</div>",
                "    </div>",
                "    <div style=\"padding:28px;\">",
                "      <p style=\"margin:0 0 18px;font-size:16px;\">Hi " + escape(ownerName) + ",</p>",
                "      <p style=\"margin:0 0 22px;font-size:15px;line-height:1.6;color:#4b5563;\">Someone is interested in your room listing. Here are the enquiry details.</p>",
                "      <div style=\"border:1px solid #e5e7eb;border-radius:12px;padding:20px;background:#f9fafb;\">",
                "        <p style=\"margin:0 0 12px;font-size:18px;font-weight:700;color:#111827;\">" + escape(roomTitle) + "</p>",
                row("Room", roomTitle),
                row("Location", location),
                row("Enquired by", seekerName),
                row("Email", seekerEmail),
                row("Phone", seekerPhone),
                "        <div style=\"margin-top:16px;padding-top:16px;border-top:1px solid #e5e7eb;\">",
                "          <div style=\"font-size:12px;font-weight:700;letter-spacing:0.6px;color:#6b7280;text-transform:uppercase;\">Message</div>",
                "          <div style=\"margin-top:8px;font-size:15px;line-height:1.6;color:#374151;white-space:pre-wrap;\">" + escape(message) + "</div>",
                "        </div>",
                "      </div>",
                "      <div style=\"margin-top:24px;text-align:center;\">",
                "        <a href=\"" + escape(dashboardUrl) + "\" style=\"display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:15px;font-weight:700;\">View my enquiries</a>",
                "      </div>",
                "      <p style=\"margin:22px 0 0;font-size:13px;line-height:1.5;color:#9ca3af;text-align:center;\">Reply to this enquiry from your dashboard. Please do not share sensitive information by email.</p>",
                "    </div>",
                "    <div style=\"padding:18px;background:#f9fafb;text-align:center;font-size:12px;color:#9ca3af;\">RoomMate Finder &middot; Enquiry notification</div>",
                "  </div>",
                "</body></html>");
    }

    private String row(String label, String value) {
        return "<p style=\"margin:0 0 10px;font-size:14px;\"><span style=\"display:inline-block;min-width:100px;color:#6b7280;\">"
                + escape(label) + ":</span> <span style=\"color:#111827;\">" + escape(value) + "</span></p>";
    }

    private String escape(String value) {
        return HtmlUtils.htmlEscape(value(value));
    }

    private String value(String value) {
        return StringUtils.hasText(value) ? value.trim() : "-";
    }
}
