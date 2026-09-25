package com.roomates.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.roomates.service.AuthService;
import com.roomates.webModel.RequestModel;
import com.roomates.webModel.Response;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	
	final AuthService authService;

	AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/test")
	public String test() {
		return "Hello world";
	}
	
	@PostMapping("/createUser")
	public ResponseEntity<Response> createUser(@RequestBody RequestModel webmodel) {

		return ResponseEntity.ok(authService.createUser(webmodel));

	}
}
