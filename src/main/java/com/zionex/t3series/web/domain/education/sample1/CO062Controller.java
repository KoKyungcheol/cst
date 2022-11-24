package com.zionex.t3series.web.domain.education.sample1;

import com.zionex.t3series.web.domain.education.sample1.Co062Result_01;
import com.zionex.t3series.web.domain.education.sample1.Co062Result_02;
import com.zionex.t3series.web.domain.education.sample1.Co062Result_03;
import com.zionex.t3series.web.domain.education.sample1.CO062Service;
import com.zionex.t3series.web.domain.education.sample1.CoPlant;
import lombok.AllArgsConstructor;
//import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
public class CO062Controller {

    private final CO062Service mCo062Service;

    @GetMapping("/sample/winguiv2/uico062/getComnCd")
    public List<Co062Result_01> getComnCd(@RequestParam("GRP_CD") String grpCd,
            @RequestParam("ATTR_01_VAL") String attr01Val) {
        return mCo062Service.getComnCd(grpCd, attr01Val);
    }

    @GetMapping("/sample/winguiv2/uico062/getMatType")
    public List<Co062Result_01> getMatType(@RequestParam("GRP_CD") String grpCd) {
        return mCo062Service.getMatType(grpCd);
    }

    @GetMapping("/sample/winguiv2/uico062/mainDataload")
    public List<Co062Result_02> getmainDataload(@RequestParam("MTRL_TYPE") String mtrlType,
            @RequestParam("MTRL_CD") String mtrlCd, @RequestParam("MTRL_GRP_LRG") String mtrlGrpLrg,
            @RequestParam("PLANT_YN") String plantYn) {
        return mCo062Service.getmainDataLoad(mtrlType, mtrlCd, mtrlGrpLrg, plantYn);
    }

    @GetMapping("/sample/winguiv2/uico062/subDataload")
    public List<Co062Result_03> getsubDataload(@RequestParam("MTRL_CD") String mtrlCd) {
        return mCo062Service.getsubDataLoad(mtrlCd);
    }

    @GetMapping("/sample/winguiv2/uico062/plant")
    public List<CoPlant> getPlant() {
        return mCo062Service.getPlant();
    }

    // 그리드 1 저장
    @PostMapping("/sample/winguiv2/uico062/saveData1")
    public void saveGrid1(@RequestBody List<Co062Result_02> changes) {
        mCo062Service.saveGrid1(changes);
    }

    // 그리드 2 저장
    @PostMapping("/sample/winguiv2/uico062/saveData2")
    public void saveGrid2(@RequestBody List<Co062Result_03> changes) {
        mCo062Service.saveGrid2(changes);
    }

    // 그리드 2 삭제
    @DeleteMapping("/sample/winguiv2/uico062/deleteData2")
    public void deleteGrid2(@RequestBody List<Co062Result_03> deleteList) {
        mCo062Service.deleteGrid2(deleteList);
    }

}
