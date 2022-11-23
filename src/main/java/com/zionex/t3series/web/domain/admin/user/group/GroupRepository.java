package com.zionex.t3series.web.domain.admin.user.group;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, String> {

    Optional<Group> findByGrpCd(String grpCd);

    List<Group> findByGrpNmIgnoreCaseContaining(String grpNm);

}
