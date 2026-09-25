package com.roomates.model;


import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users_tb")
@JsonIgnoreProperties
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private Integer id;

	@Column(name = "mailID")
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

	@Column(name = "cpassword")
	private String cpassword;

	@Column(name = "status")
	private Boolean status;
	
	private String gender;

	@Column(name = "createdDate", updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
	private Date createdDate;

	@Column(name = "updatedDate", updatable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
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

	public String getCpassword() {
		return cpassword;
	}

	public void setCpassword(String cpassword) {
		this.cpassword = cpassword;
	}

	public Boolean getStatus() {
		return status;
	}

	public void setStatus(Boolean status) {
		this.status = status;
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
	
	

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	@Override
	public String toString() {
		return "User [id=" + id + ", mailID=" + mailID + ", userType=" + userType + ", phone_no=" + phone_no + ", name="
				+ name + ", isDelete=" + isDelete + ", password=" + password + ", cpassword=" + cpassword + ", status="
				+ status + ", createdDate=" + createdDate + ", updatedDate=" + updatedDate + "]";
	}
	
	

}
