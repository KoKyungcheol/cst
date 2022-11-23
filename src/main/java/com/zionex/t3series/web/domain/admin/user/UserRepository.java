package com.zionex.t3series.web.domain.admin.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, String> {

    @Override
    List<User> findAll();

    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\'")
    List<User> findAllByUsername(String username);

    @Query("SELECT u FROM User u WHERE UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\'")
    List<User> findByDisplayName(String displayName);

    @Query("SELECT u FROM User u WHERE UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\'")
    List<User> findByUniqueValue(String uniqueValue);

    @Query("SELECT u FROM User u WHERE UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByDepartment(String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\'")
    List<User> findByUsernameAndDisplayName(String username, String displayName);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\'")
    List<User> findByUsernameAndUniqueValue(String username, String uniqueValue);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByUsernameAndDepartment(String username, String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\'")
    List<User> findByDisplayNameAndUniqueValue(String displayName, String uniqueValue);

    @Query("SELECT u FROM User u WHERE UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByDisplayNameAndDepartment(String displayName, String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByUniqueValueAndDepartment(String uniqueValue, String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\'")
    List<User> findByUsernameAndDisplayNameAndUniqueValue(String username, String displayName, String uniqueValue);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByUsernameAndDisplayNameAndDepartment(String username, String displayName, String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByUsernameAndUniqueValueAndDepartment(String username, String uniqueValue, String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByDisplayNameAndUniqueValueAndDepartment(String displayName, String uniqueValue, String department);

    @Query("SELECT u FROM User u WHERE UPPER(u.username) LIKE UPPER(:username) ESCAPE '\\' AND UPPER(u.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND UPPER(u.uniqueValue) LIKE UPPER(:uniqueValue) ESCAPE '\\' AND UPPER(u.department) LIKE UPPER(:department) ESCAPE '\\'")
    List<User> findByUsernameAndDisplayNameAndUniqueValueAndDepartment(String username, String displayName, String uniqueValue, String department);

}
