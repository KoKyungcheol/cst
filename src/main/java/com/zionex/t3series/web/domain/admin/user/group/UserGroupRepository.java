package com.zionex.t3series.web.domain.admin.user.group;

import java.util.List;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserGroupRepository extends JpaRepository<UserGroup, String> {

    boolean existsByUserIdAndGrpId(String userId, String grpCd);

    boolean existsByGrpId(String grpId);

    List<UserGroup> findByUserId(String userId);

    List<UserGroup> findByUserIdAndGrpIdNot(String userId, String grpId);
    
    List<UserGroup> findByUserIdInAndGrpIdNot(List<String> userIds, String grpId);

    UserGroup findByUserIdAndGrpId(String userId, String grpId);

    UserGroup  findByUserIdAndPrefDefaultYn(String userId, Boolean prefDefaultYn);

    List<UserGroup> findByGrpId(String grpId);

    @Transactional
    void deleteByUserIdIn(List<String> userIds);

    @Transactional
    void deleteByGrpIdIn(List<String> grpIds);

}
