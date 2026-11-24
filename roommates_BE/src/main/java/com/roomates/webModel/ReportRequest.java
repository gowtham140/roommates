package com.roomates.webModel;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;

public class ReportRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String reason;

    private String details;

    public ReportRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
