package com.zionex.t3series.web.domain.admin.menu;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, String> {

    boolean existsByMenuCd(String menuCd);

    Optional<Menu> findByMenuCd(String menuCd);

    List<Menu> findByMenuCdIgnoreCaseContaining(String menuCd);

    List<Menu> findByUseYnTrue();

    @Transactional
    void deleteByMenuCdIn(List<String> menuCds);

}
