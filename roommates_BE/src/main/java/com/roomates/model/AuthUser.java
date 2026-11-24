package com.roomates.model;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

public class AuthUser extends User {

	private static final long serialVersionUID = 1L;

	private Integer userId;
	private String displayName;
	private String loginType;

	public AuthUser(com.roomates.model.User pUser, Collection<? extends GrantedAuthority> authorities) {
		this(
				pUser.getMailID(),
				pUser.getPassword() == null ? "N/A" : pUser.getPassword(),
				!Boolean.FALSE.equals(pUser.getStatus()) && !Boolean.TRUE.equals(pUser.getIsDelete()),
				true,
				true,
				true,
				authorities
		);
		this.userId = pUser.getId();
		this.displayName = pUser.getName();
		this.loginType = pUser.getUserType();
	}

	public AuthUser(String username, String password, boolean enabled, boolean accountNonExpired,
			boolean credentialsNonExpired, boolean accountNonLocked,
			Collection<? extends GrantedAuthority> authorities) {
		super(username, password, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked, authorities);
	}

	public static AuthUser from(com.roomates.model.User user) {
		String role = "1".equals(user.getUserType()) ? "ROLE_ADMIN" : "ROLE_USER";
		return new AuthUser(user, List.of(new SimpleGrantedAuthority(role)));
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

	public void setLoginType(String loginType) {
		this.loginType = loginType;
	}

	@Deprecated
	public void setLoginTYpe(String loginType) {
		setLoginType(loginType);
	}
}
