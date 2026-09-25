package com.roomates.security;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CorsFilter implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
	}

	@Override
	public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)
			throws IOException, ServletException {

		HttpServletRequest request = (HttpServletRequest) servletRequest;

		HttpServletResponse response = (HttpServletResponse) servletResponse;

		System.err.println("Request: " + request.getMethod() + " " + request.getRequestURI());

		// Allow all origins
		response.setHeader("Access-Control-Allow-Origin", "*");

		response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

		response.setHeader("Access-Control-Allow-Headers", "*");

		response.setHeader("Access-Control-Max-Age", "180");

		// Handle preflight request
		if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
			response.setStatus(HttpServletResponse.SC_OK);
			return;
		}

		filterChain.doFilter(servletRequest, servletResponse);
	}

	@Override
	public void destroy() {
	}
}