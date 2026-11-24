package com.roomates.webModel;

import java.io.Serializable;
import java.time.LocalDateTime;

public class EnquiryResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private Integer roomId;
    private String roomTitle;
    private Integer seekerId;
    private String seekerName;
    private String seekerPhone;
    private String ownerPhone;
    private String seekerWorkingDetails;
    private String seekerHobbyPreferences;
    private Boolean seekerSeekingClosed;
    private String message;
    private String status;
    private LocalDateTime createdAt;

    public EnquiryResponse() {
    }

    public EnquiryResponse(Integer id, Integer roomId, String roomTitle, Integer seekerId, String seekerName,
            String seekerPhone, String ownerPhone, String seekerWorkingDetails, String seekerHobbyPreferences,
            Boolean seekerSeekingClosed, String message, String status, LocalDateTime createdAt) {
        this.id = id;
        this.roomId = roomId;
        this.roomTitle = roomTitle;
        this.seekerId = seekerId;
        this.seekerName = seekerName;
        this.seekerPhone = seekerPhone;
        this.ownerPhone = ownerPhone;
        this.seekerWorkingDetails = seekerWorkingDetails;
        this.seekerHobbyPreferences = seekerHobbyPreferences;
        this.seekerSeekingClosed = seekerSeekingClosed;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public String getRoomTitle() {
        return roomTitle;
    }

    public void setRoomTitle(String roomTitle) {
        this.roomTitle = roomTitle;
    }

    public Integer getSeekerId() {
        return seekerId;
    }

    public void setSeekerId(Integer seekerId) {
        this.seekerId = seekerId;
    }

    public String getSeekerName() {
        return seekerName;
    }

    public void setSeekerName(String seekerName) {
        this.seekerName = seekerName;
    }

    public String getSeekerPhone() {
        return seekerPhone;
    }

    public void setSeekerPhone(String seekerPhone) {
        this.seekerPhone = seekerPhone;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public String getSeekerWorkingDetails() {
        return seekerWorkingDetails;
    }

    public void setSeekerWorkingDetails(String seekerWorkingDetails) {
        this.seekerWorkingDetails = seekerWorkingDetails;
    }

    public String getSeekerHobbyPreferences() {
        return seekerHobbyPreferences;
    }

    public void setSeekerHobbyPreferences(String seekerHobbyPreferences) {
        this.seekerHobbyPreferences = seekerHobbyPreferences;
    }

    public Boolean getSeekerSeekingClosed() {
        return seekerSeekingClosed;
    }

    public void setSeekerSeekingClosed(Boolean seekerSeekingClosed) {
        this.seekerSeekingClosed = seekerSeekingClosed;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
