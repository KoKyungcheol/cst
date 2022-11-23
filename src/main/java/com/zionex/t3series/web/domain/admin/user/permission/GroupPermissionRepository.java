package com.zionex.t3series.web.domain.admin.user.permission;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupPermissionRepository extends JpaRepository<GroupPermission, String> {

    GroupPermission findByGrpIdAndMenuIdAndPermissionTp(String grpId, String menuId, String permissionTp);

    List<GroupPermission> findByGrpIdAndUsability(String grpId, Boolean usability);

    List<GroupPermission> findByGrpIdInAndMenuId(List<String> grpIds, String menuId);

    List<GroupPermission> findByGrpIdInAndPermissionTpAndUsabilityTrue(List<String> grpIds, String permissionTp);

    List<GroupPermission> findByGrpId(String grpId);
    
    @Transactional
    void deleteByGrpIdIn(List<String> grpIds);
  
}
