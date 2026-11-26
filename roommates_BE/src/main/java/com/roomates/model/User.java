package com.roomates.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "users_tb", uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "mailID"))
@JsonIgnoreProperties({ "password" })
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Integer id;

	@Column(name = "mailID", nullable = false)
	private String mailID;

	@Column(name = "userType")
	private String userType;

	@Column(name = "phone_no")
	private String phone_no;

	@Column(name = "name")
	private String name;

	@Column(name = "isDelete")
	private Boolean isDelete;

	@Column(name = "password")
	private String password;

	@Column(name = "status")
	private Boolean status;

	@Column(name = "gender")
	private String gender;

	@Column(name = "age")
	private Integer age;

	@Column(name = "working_details", columnDefinition = "TEXT")
	private String workingDetails;

	@Column(name = "hobby_preferences", columnDefinition = "TEXT")
	private String hobbyPreferences;

	@Column(name = "seeking_closed")
	private Boolean seekingClosed = false;

	@Column(name = "createdDate", updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
	private Date createdDate;

	@Column(name = "updatedDate", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
	private Date updatedDate;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getMailID() {
		return mailID;
	}

	public void setMailID(String mailID) {
		this.mailID = mailID;
	}

	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	public String getPhone_no() {
		return phone_no;
	}

	public void setPhone_no(String phone_no) {
		this.phone_no = phone_no;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Boolean getIsDelete() {
		return isDelete;
	}

	public void setIsDelete(Boolean isDelete) {
		this.isDelete = isDelete;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Boolean getStatus() {
		return status;
	}

	public void setStatus(Boolean status) {
		this.status = status;
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

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Date getUpdatedDate() {
		return updatedDate;
	}

	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}

	@Override
	public String toString() {
		return "User [id=" + id + ", mailID=" + mailID + ", userType=" + userType + ", phone_no=" + phone_no
				+ ", name=" + name + ", isDelete=" + isDelete + ", status=" + status + ", gender=" + gender
				+ ", age=" + age + ", seekingClosed=" + seekingClosed + ", createdDate=" + createdDate
				+ ", updatedDate=" + updatedDate + "]";
	}
}
