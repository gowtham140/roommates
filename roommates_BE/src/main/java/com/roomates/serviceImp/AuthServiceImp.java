package com.roomates.serviceImp;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.roomates.model.User;
import com.roomates.repository.UserRepository;
import com.roomates.service.AuthService;
import com.roomates.webModel.RequestModel;
import com.roomates.webModel.Response;

@Service
public class AuthServiceImp implements AuthService {

	@Autowired
	UserRepository userRepository;

	@Override
	public Response createUser(RequestModel webmodel) {

		try {
			if (userRepository.existsByMailID(webmodel.getEmail())) {

				return new Response(-1, "Failed", "Mail Already Exists");

			} else {

				User user = new User();

				user.setName(webmodel.getName());
				user.setCpassword(webmodel.getCpassword());
				user.setMailID(webmodel.getEmail());
				user.setUserType("2");
				user.setIsDelete(false);
				user.setPhone_no(webmodel.getPhone());
				user.setStatus(true);
				user.setPassword(webmodel.getPassword());
				user.setGender(webmodel.getGender());
				user.setCreatedDate(new Date());
				user.setUpdatedDate(new Date());

				userRepository.save(user);

				return new Response(1, "Success", "");

			}
		} catch (Exception e) {

			return new Response(-2, "Failed", e.getMessage());
		}

	}

}
