package com.roomates.service;

import com.roomates.webModel.ReportRequest;

public interface ReportService {

    void submit(Integer reporterId, ReportRequest request);
}
