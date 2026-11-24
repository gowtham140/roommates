package com.roomates.webModel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    private String phone;

    private String gender;

    private Integer age;

    @Size(max = 500)
    private String workingDetails;

    @Size(max = 500)
    private String hobbyPreferences;

    private Boolean seekingClosed;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getWorkingDetails() {
        return workingDetails;
    }

    public void setWorkingDetails(String workingDetails) {
        this.workingDetails = workingDetails;
    }

    public String getHobbyPreferences() {
        return hobbyPreferences;
    }

    public void setHobbyPreferences(String hobbyPreferences) {
        this.hobbyPreferences = hobbyPreferences;
    }

    public Boolean getSeekingClosed() {
        return seekingClosed;
    }

    public void setSeekingClosed(Boolean seekingClosed) {
        this.seekingClosed = seekingClosed;
    }
}
