package com.zionex.t3series.web.domain.education.sample1;

import com.zionex.t3series.web.domain.education.sample1.Co062Result_03;
import com.zionex.t3series.web.domain.education.sample1.Co062Result_01;
import com.zionex.t3series.web.domain.education.sample1.Co062Result_02;
import com.zionex.t3series.web.domain.education.sample1.CoPlant;
import lombok.AllArgsConstructor;
import com.zionex.t3series.web.domain.education.sample1.ProcedureService;
import org.springframework.stereotype.Service;
import com.zionex.t3series.web.domain.education.sample1.CoPlantRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CO062Service {

    @Autowired
    CoPlantRepository mCoPlantRepository;

    private final ProcedureService mProcedureService;


    @SuppressWarnings("unchecked")
    public List<Co062Result_01> getComnCd(String grpCd, String attr01Val) {
        List<Object> params = new ArrayList<>(Arrays.asList(grpCd, attr01Val));
        List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class, String.class));
        return (List<Co062Result_01>) mProcedureService.getExecDataMultiClass("SP_LS_CO_062_Q1", Co062Result_01.class,
                params, classList);
    }

    @SuppressWarnings("unchecked")
    public List<Co062Result_01> getMatType(String grpCd) {
        List<Object> params = new ArrayList<>(Arrays.asList(grpCd));
        List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class));
        return (List<Co062Result_01>) mProcedureService.getExecDataMultiClass("SP_LS_CO_062_Q4", Co062Result_01.class,
                params, classList);
    }

    @SuppressWarnings("unchecked")
    public List<Co062Result_02> getmainDataLoad(String mtrlType, String mtrlCd, String mtrlGrpLrg, String plantYn) {
        List<Object> params = new ArrayList<>(Arrays.asList(mtrlType, mtrlCd, mtrlGrpLrg, plantYn));
        List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class, String.class, String.class, String.class));
        return (List<Co062Result_02>) mProcedureService.getExecDataMultiClass("SP_LS_CO_062_Q2", Co062Result_02.class,
                params, classList);
    }

    @SuppressWarnings("unchecked")
    public List<Co062Result_03> getsubDataLoad(String mtrlCd) {

        List<Object> params = new ArrayList<>(Arrays.asList(mtrlCd));
        List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class));

        return (List<Co062Result_03>) mProcedureService.getExecDataMultiClass("SP_LS_CO_062_Q3", Co062Result_03.class,
                params, classList);
    }

    public List<CoPlant> getPlant() {
        return mCoPlantRepository.findByUseYn("Y").stream().sorted(Comparator.comparing(CoPlant::getPlantCd))
                .collect(Collectors.toList());
    }

    public void saveGrid1(List<Co062Result_02> changes) {
        String SP_LS_CO_062_S1 = "SP_LS_CO_062_S1";
        for (Co062Result_02 one : changes) {
            List<Object> params = new ArrayList<>(
                    Arrays.asList(one.getMtrlCd(), one.getMtrlGrpLrg(), one.getConvtPriority(), one.getRefinePriority(),
                            one.getBadRat(), one.getModifyId(), one.getRemark()));
            List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class, String.class, String.class,
                    String.class, String.class, String.class, String.class));
            mProcedureService.execProcedureMultiClass(SP_LS_CO_062_S1, params, classList);
        }
    }

    public void saveGrid2(List<Co062Result_03> changes) {
        String SP_LS_CO_062_S2 = "SP_LS_CO_062_S2";
        for (Co062Result_03 one : changes) {
            List<Object> params = new ArrayList<>(Arrays.asList(one.getMtrlCd(), one.getPlantCd(), one.getMtrlGrp(),
                    one.getThputPriority(), one.getWgTy(), one.getMinWgt(), one.getOptWgt(), one.getMaxWgt(),
                    one.getThputType(), one.getUseYn(), one.getAttr01Val(), one.getAttr02Val(), one.getAttr03Val(),
                    one.getAttr04Val(), one.getAttr05Val(), one.getModifyId()));
            List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class, String.class, String.class,
                    String.class, String.class, String.class, String.class, String.class, String.class, String.class,
                    String.class, String.class, String.class, String.class, String.class, String.class));
            mProcedureService.execProcedureMultiClass(SP_LS_CO_062_S2, params, classList);
        }
    }

    public void deleteGrid2(List<Co062Result_03> deleteList) {
        String SP_LS_CO_062_S3 = "SP_LS_CO_062_S3";
        for (Co062Result_03 one : deleteList) {
            List<Object> params = new ArrayList<>(Arrays.asList(one.getMtrlCd(), one.getPlantCd()));
            List<Class<?>> classList = new ArrayList<>(Arrays.asList(String.class, String.class));
            mProcedureService.execProcedureMultiClass(SP_LS_CO_062_S3, params, classList);
        }
    }

    /*
     * public ResponseSingleMessage saveData(List<CoComp> changeList) {
     * 
     * ResponseSingleMessage result =
     * ResponseSingleMessage.builder().success(true).build(); List<CoComp> saveList
     * = new ArrayList<>();
     * 
     * Timestamp currentDtm = new Timestamp((new Date()).getTime());
     * 
     * for (CoComp cocomp : changeList) { if (cocomp.getModifyId() != null) {
     * cocomp.setModifyDtm(new Timestamp(new Date().getTime())); } else { if
     * (mCoCompRepository.existsByCompCd(cocomp.getCompCd())) {
     * 
     * result.setSuccess(false); return result; } else {
     * cocomp.setCreationDtm(currentDtm); cocomp.setModifyDtm(currentDtm); } }
     * saveList.add(cocomp); }
     * 
     * if (!saveList.isEmpty()) { mCoCompRepository.saveAll(saveList); } return
     * result; }
     * 
     * public void deleteData(List<CoComp> deleteList) {
     * mCoCompRepository.deleteAll(deleteList); }
     */
}
