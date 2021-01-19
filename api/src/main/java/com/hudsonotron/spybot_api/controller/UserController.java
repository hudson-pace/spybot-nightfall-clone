package com.hudsonotron.spybot_api.controller;

import com.hudsonotron.spybot_api.dao.UserRepository;
import com.hudsonotron.spybot_api.model.User;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path="/users")
public class UserController {
  @Autowired
  private UserRepository userRepository;

  @GetMapping("/all")
  public Iterable<User> getAllUsers() {
    return userRepository.findAll();
  }

  @GetMapping("/unprotected")
  public Iterable<User> getAlltUsers() {
    return userRepository.findAll();
  }
}
