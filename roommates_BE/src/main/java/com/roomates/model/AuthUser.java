package com.roomates.model;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class AuthUser extends User{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private Integer userId;
	private String displayName;
	private String loginType;
	
	public AuthUser(com.roomates.model.User pUser,
			Collection<? extends GrantedAuthority> authorities) {
		this(pUser.getMailID(), pUser.getPassword(), true, true, true, true, authorities);
		this.userId = pUser.getId();
		this.setLoginTYpe(pUser.getUserType());
	}
	
	public AuthUser(String username, String password, boolean enabled, boolean accountNonExpired,
			boolean credentialsNonExpired, boolean accountNonLocked,
			Collection<? extends GrantedAuthority> authorities) {
		super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
		// TODO Auto-generated constructor stub
	}

	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public String getLoginType() {
		return loginType;
	}

	public void setLoginTYpe(String loginType) {
		this.loginType = loginType;
	}
	
	

}
