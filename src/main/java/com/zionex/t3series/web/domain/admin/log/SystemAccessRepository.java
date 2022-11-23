package com.zionex.t3series.web.domain.admin.log;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SystemAccessRepository extends JpaRepository<SystemAccess, String> {

    @Query(value = "SELECT s FROM SystemAccess s JOIN FETCH s.user WHERE UPPER(s.user.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND s.accessDttm >= :accessDttmFrom AND (s.logoutDttm <= :accessDttmTo OR s.logoutDttm IS NULL) ORDER BY s.accessDttm DESC",
           countQuery = "SELECT count(s) FROM SystemAccess s JOIN s.user WHERE UPPER(s.user.displayName) LIKE UPPER(:displayName) ESCAPE '\\' AND s.accessDttm >= :accessDttmFrom AND (s.logoutDttm <= :accessDttmTo OR s.logoutDttm IS NULL)")
    Page<SystemAccess> findSystemAccessLog(@Param("displayName") String displayName, @Param("accessDttmFrom") LocalDateTime accessDttmFrom, @Param("accessDttmTo") LocalDateTime accessDttmTo, Pageable pageable);

    @Query(value = "SELECT s FROM SystemAccess s JOIN FETCH s.user WHERE UPPER(s.user.id) LIKE UPPER(:userId) ESCAPE '\\' ORDER BY s.accessDttm DESC")
    List<SystemAccess> findLatestSystemAccessLog(@Param("userId") String userId);

}
