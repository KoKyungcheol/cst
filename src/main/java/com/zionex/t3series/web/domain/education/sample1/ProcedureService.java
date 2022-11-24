package com.zionex.t3series.web.domain.education.sample1;

import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.StoredProcedureQuery;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@Log
public class ProcedureService {

    @Autowired
    EntityManager mEntityManager;

    // parameter 가 없는 경우
    public List<?> getExecData(String procedureName) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName);
            spq.execute();

            return spq.getResultList();
        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    public List<?> getExecData(String procedureName, Class<?> returnClass) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName, returnClass);
            spq.execute();

            return spq.getResultList();
        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    // parameter 가 1개인 경우 + object
    public List<?> getExecDataParam(String procedureName, Object param, Class<?> paramClass) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName);

            spq.registerStoredProcedureParameter(0, paramClass, ParameterMode.IN);
            spq.setParameter(0, param);
            spq.execute();

            return spq.getResultList();

        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    public List<?> getExecDataParam(String procedureName, Class<?> returnClass, Object param, Class<?> paramClass) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName, returnClass);

            spq.registerStoredProcedureParameter(0, paramClass, ParameterMode.IN);
            spq.setParameter(0, param);
            spq.execute();

            return spq.getResultList();

        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    // parameter 가 여러개 인 경우 + 여러 type 인 경우
    public List<?> getExecDataMultiClass(String procedureName, Class<?> returnClass, List<Object> params,
            List<Class<?>> classList) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName, returnClass);

            int index = 0;
            for (Object param : params) {
                spq.registerStoredProcedureParameter(index, classList.get(index), ParameterMode.IN);
                spq.setParameter(index, param);
                index++;
            }

            spq.execute();

            return spq.getResultList();
        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    // parameter 가 1개 인 경우 + string
    public Boolean execProcedure1(String procedureName, String param) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName);

            spq.registerStoredProcedureParameter(0, String.class, ParameterMode.IN);
            spq.setParameter(0, param);
            spq.execute();

            return true;
        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // parameter 가 여러 개 + 여러 type 인 경우
    public Boolean execProcedureMultiClass(String procedureName, List<Object> params, List<Class<?>> classList) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName);

            int index = 0;
            for (Object param : params) {
                spq.registerStoredProcedureParameter(index, classList.get(index), ParameterMode.IN);
                spq.setParameter(index, param);
                index++;
            }

            spq.execute();
            return true;
        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // parameter 가 여러개 + 여러 type 인 경우 return 은 하나만 받을 때..
    public Object execProcedureReturnSingle(String procedureName, List<Object> params, List<Class<?>> classList) {
        try {
            StoredProcedureQuery spq = mEntityManager.createStoredProcedureQuery(procedureName);

            int index = 0;
            for (Object param : params) {
                spq.registerStoredProcedureParameter(index, classList.get(index), ParameterMode.IN);
                spq.setParameter(index, param);
                index++;
            }

            spq.execute();
            return spq.getSingleResult();
        } catch (Exception e) {
            log.warning(e.getMessage());
            e.printStackTrace();
        }

        return new Object();
    }
}
