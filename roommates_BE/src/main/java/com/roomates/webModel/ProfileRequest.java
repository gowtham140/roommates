package com.roomates.webModel;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must contain 10 to 15 digits")
    private String phone;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(ANY|MALE|FEMALE|OTHER)$", message = "Invalid gender")
    private String gender;

    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 100, message = "Age must be at most 100")
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
