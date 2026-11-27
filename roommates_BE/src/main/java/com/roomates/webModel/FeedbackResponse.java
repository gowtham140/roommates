package com.roomates.webModel;

import java.io.Serializable;
import java.time.LocalDateTime;

public class FeedbackResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private String userName;
    private String email;
    private String userType;
    private String category;
    private String message;
    private LocalDateTime createdAt;

    public FeedbackResponse() {
    }

    public FeedbackResponse(Integer id, String userName, String email, String userType,
            String category, String message, LocalDateTime createdAt) {
        this.id = id;
        this.userName = userName;
        this.email = email;
        this.userType = userType;
        this.category = category;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
