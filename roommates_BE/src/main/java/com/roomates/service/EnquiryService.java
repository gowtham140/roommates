package com.roomates.service;

import java.util.List;

import com.roomates.webModel.EnquiryRequest;
import com.roomates.webModel.EnquiryResponse;

public interface EnquiryService {

    EnquiryResponse send(Integer roomId, Integer seekerId, EnquiryRequest request);

    List<EnquiryResponse> sent(Integer seekerId);

    List<EnquiryResponse> sent(Integer seekerId, int page, int size);

    List<EnquiryResponse> received(Integer ownerId);

    List<EnquiryResponse> received(Integer ownerId, int page, int size);

    long countNewReceived(Integer ownerId);

    void updateStatus(Integer ownerId, Integer id, String status);
}
