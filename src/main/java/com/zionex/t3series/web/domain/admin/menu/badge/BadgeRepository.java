package com.zionex.t3series.web.domain.admin.menu.badge;

import java.time.LocalDateTime;
import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, String> {
    
    List<Badge> findByExpiredDttmAfter(LocalDateTime expiredDttm);

    @Transactional
    void deleteByMenuIdIn(List<String> menuIds);

}
