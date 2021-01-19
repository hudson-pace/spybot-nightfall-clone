package com.hudsonotron.spybot_api;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;



@Component
public class AuthorizationInterceptor implements HandlerInterceptor {
  private static final Logger logger = LoggerFactory.getLogger(AuthorizationInterceptor.class);

  @Value("${hudsonotron.spybot_api.jwtSecret}")
  private String jwtSecret;

  @Override
  public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
    String jwt = parseJwt(req);
    if (jwt != null) {
      String username = getUsernameFromJwt(jwt);
      if (username != null) {
        return true;
      }
    }
    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    res.setHeader("Content-Type", "application/json");
    res.getWriter().write("{\"error\":\"Invalid or missing token.\"}");

    return false;
  }

  private String parseJwt(HttpServletRequest req) {
    String headerAuth = req.getHeader("Authorization");
    if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
      return headerAuth.substring(7, headerAuth.length());
    }
    return null;
  }

  private String getUsernameFromJwt(String jwt) {
    try {
      Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
      JWTVerifier verifier = JWT.require(algorithm)
        .build();
			return verifier.verify(jwt).getClaim("username").asString();
    } catch (JWTVerificationException e) {
      logger.error("Jwt verification error: " + e.getMessage());
    }
		return null;
  }
}
