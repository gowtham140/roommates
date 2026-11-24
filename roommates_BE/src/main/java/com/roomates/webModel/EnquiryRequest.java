package com.roomates.webModel;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;

public class EnquiryRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    private String message;

    public EnquiryRequest() {
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
