import React from "react";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { useStyles } from "./CommonStyle";

const fileStyle = { width: 0, height: 0, padding: 0, overflow: "hidden", border: 0 }

function LargeExcelUpload(props) {
  const classes = useStyles();

  const onChange = async (e) => {
    e.preventDefault();

    if (e.target.files) {
      const uploadFile = e.target.files[0]
      const formData = new FormData()
      formData.append('file', uploadFile)

      await axios({
        method: 'post',
        url: baseURI() + 'large-excel-import/' + props.handler,
        data: formData,
        timeout: 1800000,
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
        },
      });
    }
  }

  return (
    <>
      <input type="file" id="excel-upload" multiple onChange={onChange} style={fileStyle} />
      <label htmlFor="excel-upload">
        <Button className={classes.customButton} component="span" size='small'
          startIcon={<UploadFileIcon />}>
          <Typography>{props.label}</Typography>
        </Button>
      </label>
    </>
  );
}

LargeExcelUpload.propTypes = {
  handler: PropTypes.string.isRequired,
  label: PropTypes.string,
};

LargeExcelUpload.displayName = 'LargeExcelUpload'

function LargeExcelDownload(props) {
  const classes = useStyles();

  const onClick = async (e) => {
    var params = {
      fileName: 'testExcel',
    };
    return axios({
      method: "post",
      url: baseURI() + 'large-excel-export/' + props.handler,
      headers: { "content-type": "application/json" },
      data: params,
      responseType: 'blob'
    }
    ).then(function (response) {
      if (response.status === gHttpStatus.SUCCESS) {
        let fileName = response.headers["content-disposition"].split("filename=")[1];
        if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE variant
          window.navigator.msSaveOrOpenBlob(new Blob([response.data],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          ),
            fileName
          );
        } else {
          const url = window.URL.createObjectURL(new Blob([response.data],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download',
            response.headers["content-disposition"].split("filename=")[1]);
          document.body.appendChild(link);
          link.click();
        }
      }
    }).catch(function (err) {
      console.log(err);
    });
  }

  return (
    <Button onClick={onClick} size='small' className={classes.customButton}
      startIcon={<FileDownloadIcon />}>
      <Typography>{props.label}</Typography>
    </Button>
  );
}

LargeExcelDownload.propTypes = {
  handler: PropTypes.string.isRequired,
  label: PropTypes.string,
}

LargeExcelDownload.displayName = 'LargeExcelDownload'

export { LargeExcelUpload, LargeExcelDownload }