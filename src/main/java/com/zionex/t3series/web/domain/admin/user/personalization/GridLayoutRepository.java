package com.zionex.t3series.web.domain.admin.user.personalization;

import java.util.Set;

import org.springframework.data.repository.CrudRepository;

public interface GridLayoutRepository extends CrudRepository<GridLayout, GridLayoutPK> {

	Set<GridLayout> findByUsernameAndMenuCodeAndGridCodeAndLayoutType(String username, String menuCode, String gridCode, String layoutType);

	Set<GridLayout> findByMenuCodeAndGridCodeAndLayoutTypeAndAllUser(String menuCode, String gridCode, String layoutType, String allUser);

	GridLayout findOneByMenuCodeAndGridCodeAndLayoutTypeAndLayoutNameAndAllUser(String menuCode, String gridCode, String layoutType, String layoutName, String allUser);

}
