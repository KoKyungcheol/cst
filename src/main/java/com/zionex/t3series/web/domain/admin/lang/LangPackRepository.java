package com.zionex.t3series.web.domain.admin.lang;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LangPackRepository extends JpaRepository<LangPack, LangPackPK> {

    LangPack findByLangCdAndLangKey(String langCd, String langKey);

    List<LangPack> findByLangCd(String langCd);

    @Query("SELECT l FROM LangPack l WHERE UPPER(l.langKey) LIKE UPPER(:langKey) ESCAPE '\\'")
    List<LangPack> findByLangKeyContaining(String langKey);

    @Query("SELECT l FROM LangPack l WHERE UPPER(l.langValue) LIKE UPPER(:langValue) ESCAPE '\\'")
    List<LangPack> findByLangValueContaining(String langValue);

    @Query("SELECT l FROM LangPack l WHERE l.langCd = :langCd AND UPPER(l.langKey) LIKE UPPER(:langKey) ESCAPE '\\'")
    List<LangPack> findByLangCdAndLangKeyContaining(String langCd, String langKey);

    @Query("SELECT l FROM LangPack l WHERE l.langCd = :langCd AND UPPER(l.langValue) LIKE UPPER(:langValue) ESCAPE '\\'")
    List<LangPack> findByLangCdAndLangValueContaining(String langCd, String langValue);

    @Query("SELECT l FROM LangPack l WHERE UPPER(l.langKey) LIKE UPPER(:langKey) ESCAPE '\\' AND UPPER(l.langValue) LIKE UPPER(:langValue) ESCAPE '\\'")
    List<LangPack> findByLangKeyContainingAndLangValueContaining(String langKey, String langValue);

    @Query("SELECT l FROM LangPack l WHERE l.langCd = :langCd AND UPPER(l.langKey) LIKE UPPER(:langKey) ESCAPE '\\' AND UPPER(l.langValue) LIKE UPPER(:langValue) ESCAPE '\\'")
    List<LangPack> findByLangCdAndLangKeyContainingAndLangValueContaining(String langCd, String langKey, String langValue);

}
