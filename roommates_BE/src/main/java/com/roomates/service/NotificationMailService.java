package com.roomates.service;

import com.roomates.model.Enquiry;

public interface NotificationMailService {

    void sendEnquiryNotification(Enquiry enquiry);
}
