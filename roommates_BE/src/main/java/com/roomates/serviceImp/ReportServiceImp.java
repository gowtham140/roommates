package com.roomates.serviceImp;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Report;
import com.roomates.model.User;
import com.roomates.repository.ReportRepository;
import com.roomates.repository.UserRepository;
import com.roomates.service.ReportService;
import com.roomates.webModel.ReportRequest;

@Service
public class ReportServiceImp implements ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportServiceImp(ReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void submit(Integer reporterId, ReportRequest request) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(request.getReason());
        report.setDetails(request.getDetails());
        report.setStatus("OPEN");

        reportRepository.save(report);
    }
}
