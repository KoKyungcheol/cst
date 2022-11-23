package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.repository.CrudRepository;

public interface PermissionRepository extends CrudRepository<Permission, String> {

    Permission findByUserIdAndMenuIdAndPermissionTp(String userId, String menuId, String permissionTp);

    List<Permission> findAll();

    List<Permission> findByUserId(String userId);

    List<Permission> findByUserIdAndMenuId(String userId, String menuId);

    List<Permission> findByUserIdAndPermissionTpAndUsabilityTrue(String userId, String permissionTp);

    List<Permission> findByMenuIdAndUserIdIn(String menuId, List<String> userIds);

    @Transactional
    void deleteByUserIdIn(List<String> userIds);

    @Transactional
    void deleteByUserId(String userId);

}
