package com.roomates.webModel;

public class UserDto {

    private Integer id;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private Integer age;
    private String userType;
    private String workingDetails;
    private String hobbyPreferences;
    private Boolean seekingClosed;

    public UserDto() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
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
