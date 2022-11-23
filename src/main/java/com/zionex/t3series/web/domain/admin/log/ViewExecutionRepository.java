package com.zionex.t3series.web.domain.admin.log;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewExecutionRepository extends CrudRepository<ViewExecution, ViewExecutionPK> {
    
}
