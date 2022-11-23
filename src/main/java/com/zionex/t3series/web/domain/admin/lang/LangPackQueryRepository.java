package com.zionex.t3series.web.domain.admin.lang;

import static com.zionex.t3series.web.domain.admin.lang.QLangPack.langPack;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Repository;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.StringPath;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class LangPackQueryRepository {

    private final JPAQueryFactory jpaQueryFactory;

    public List<LangPack> getLangPacks(String langCd, String langKey, String langValue) {
        return jpaQueryFactory
                .select(Projections.fields(LangPack.class,
                        langPack.langCd,
                        langPack.langKey,
                        langPack.langValue))
                .from(langPack)
                .where(containsParam(langPack.langCd, langCd), containsParam(langPack.langKey, langKey), containsParam(langPack.langValue, langValue))
                .fetch();
    }

    private BooleanExpression containsParam(StringPath stringPath, String param) {
        if (StringUtils.isEmpty(param)) {
            return null;
        }
        return stringPath.toUpperCase().contains(param.toUpperCase());
    }

}
