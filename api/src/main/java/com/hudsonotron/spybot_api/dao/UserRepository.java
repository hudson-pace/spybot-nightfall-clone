package com.hudsonotron.spybot_api.dao;

import com.hudsonotron.spybot_api.model.User;

import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Integer> {
  
}
