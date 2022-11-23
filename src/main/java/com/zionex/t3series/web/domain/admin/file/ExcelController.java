package com.zionex.t3series.web.domain.admin.file;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Base64;
import java.util.Base64.Decoder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.util.ResponseData;
import com.zionex.t3series.web.util.excel.ExcelConverter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.java.Log;

@Log
@RestController
public class ExcelController extends ResponseData {

    private final ApplicationProperties.Service.File fileProps;

    @Autowired
    public ExcelController(ApplicationProperties applicationProperties) {
        this.fileProps = applicationProperties.getService().getFile();
    }

    @RequestMapping(value = "/excel-import", method = { RequestMethod.POST, RequestMethod.GET })
    public void importExcel(@RequestParam("file") MultipartFile file, HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String externalPath = fileProps.getExternalPath();
            String uploadPath = externalPath + fileProps.getName() + "/" + fileProps.getCategory().getExcel();
    
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String fileName = file.getOriginalFilename();
            int index = fileName.replaceAll("\\\\", "/").lastIndexOf("/");
            fileName = fileName.substring(index + 1);

            String location = uploadPath + File.separator + fileName;
            File excel = new File(location);

            byte[] data = file.getBytes();
            FileOutputStream out = new FileOutputStream(location);
            out.write(data);
            out.close();

            String json = new ExcelConverter().toJson(excel);

            if (json.length() > 2) {
                responseResult(response, json);
            } else if (json.isEmpty()) {
                responseError(response, "Not suppported file type.");
            } else {
                responseError(response, "No data imported.");
            }

            excel.delete();
        } catch (Exception e) {
            e.printStackTrace();
            log.warning(e.getMessage());
            responseError(response, e.getMessage());
        }
    }

    @PostMapping("/excel-export")
    protected void exportExcel(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String fileName = request.getParameter("fileName");
        String data = request.getParameter("data");
        Decoder decoder = Base64.getDecoder();
        log.warning(fileName);

        if (data.length() > 0) {
            // Decode
            byte[] filedata = decoder.decode(data);

            // Response Header
            fileName = StringUtils.cleanPath(fileName.replaceAll("\r", "").replaceAll("\n", "")).replaceAll("../", "");
            response.addHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
            response.addHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.addHeader("Pragma", "no-cache");

            // Write
            OutputStream os = response.getOutputStream();
            os.write(filedata);
            os.flush();
        }
    }

}
