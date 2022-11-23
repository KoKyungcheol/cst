package com.zionex.t3series.web.security.redis.session;

import org.springframework.data.repository.CrudRepository;

public interface RedisSessionRepository extends CrudRepository<RedisSession, String> {

    RedisSession findByTenantNameAndUsername(String tenantName, String username);

}
