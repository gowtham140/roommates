package com.roomates.model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.roomates.security.UserTypes;

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
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

        String userType = user.getUserType();
        if (UserTypes.ADMIN.equals(userType)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else if (UserTypes.OWNER.equals(userType)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_OWNER"));
        } else if (UserTypes.SEEKER.equals(userType)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SEEKER"));
        }

        return new AuthUser(user, authorities);
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
