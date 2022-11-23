import React, { useState, useEffect } from "react";
import { createStyles, makeStyles } from '@mui/styles';
import { Avatar } from "@mui/material";
import PropTypes from 'prop-types';
import { getAppSettings } from "@zionex/utils/common";

let component = getAppSettings('component');
export const useStyles = makeStyles(() => ({
  workArea: {
    height: 'calc(100vh - 145px)',
    margin: '0px 15px 0px 20px'
  },
  viewPath: {
    margin: '0px 15px 0px 20px',
  },
  common: {
    borderRadius: "6px",
  },
  expandButton: {
    width: "55px",
    minWidth: "55px",
    height: "20px",
    backgroundColor: "#f8f8fa",
    color: "#e37878",
    border: "1px solid #e4bebf",
    margin: "0"
  },
  viewPathButton: {
    backgroundColor: "#404040",
    // padding: "3px",
    fontSize: "13px",
    border: "1px double gray",
    color: "#FFFFFF",
    margin: "0 6px",
    height: "25px",
    borderRadius: "6px",
    '& :hover': {
      color: "#000000"
    }
  },
  searchAreaButton: {
    backgroundColor: "#404040",
    fontSize: "13px",
    border: "1px double gray",
    color: "#FFFFFF",
    margin: "10px 4px",
    height: "25px",
    borderRadius: "6px",
    '& :hover': {
      color: "#000000"
    }
  },
  viewPathIconButton: {
    borderRadius: "6px",
    width: "40px",
    height: "30px",
    border: "1px solid #bebec0",
    "& .Mui-disabled": {
      backgroundColor: "#f8f8fa",
      border: "1px solid #bebec0",
      borderRadius: "0"
    }
  },
  resizable: {
    position: "relative",
    "& .react-resizable-handle": {
      position: "absolute",
      width: "20px",
      height: "20px",
      bottom: "0",
      right: "0",
      background:
        "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
      "background-position": "bottom right",
      // padding: "0 3px 3px 0",
      "background-repeat": "no-repeat",
      "background-origin": "content-box",
      "box-sizing": "border-box",
      cursor: "se-resize"
    }
  },
  resultAreaBox: {
    margin: '3px 5px',
    height: '100%'
  },
  pageNavigator: {
    borderRadius: "2px",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    margin: "0",
    padding: "4px"
  }
}));

//Input 공통 스타일
const commonInputCss = {
  display: "inline-block",
  verticalAlign: "middle",
  width: "200px",
  maxWidth:"210px",
  margin: '6px 4px 0px 4px',
  '& legend': {
    display: 'none',
  },
  '& .MuiInputBase-root': {
    height: '24px',
    paddingLeft: '10px',
    paddingBottom: '0px',
    paddingTop: '0px'
  },
  '& .MuiInputBase-input': {
    paddingLeft: '0px',
    paddingBottom: '0px',
    paddingTop: '0px'
  },
  '& .MuiOutlinedInput-input': {
    paddingLeft: '0px',
    paddingBottom: '0px',
    paddingTop: '0px'
  },
  '& input': {
    backgroundColor: '#fff',
  },
  '& fieldset.MuiOutlinedInput-notchedOutline': {
    backgroundColor: 'rgb(255 255 255 / 26%)',
  },
  '& .Mui-disabled': {
    color: '#000!important',
    opacity: '0.7'
  },
  '& .Mui-disabled fieldset': {
    backgroundColor: 'rgb(136 136 136 / 26%)'
  },
};

const zDateTimePickerCssCommon = {
  color: 'rgba(0, 0, 0, 0.87)',
  fontSize: '13px',
  'font-family': '"Noto Sans KR","Helvetica","Arial",sans-serif',
  'font-weight': 400,
  'line-height': '24px',
  'letter-spacing': 'inherit',
  color: 'currentColor',
  border: '1px solid rgba(0, 0, 0, 0.87)',
  'box-sizing': 'content-box',
  background: 'none',
  height: '24px',
  margin: '0',
  '-webkit-tap-highlight-color': 'transparent',
  display: 'block',
  'min-width': '0',
  'align-items': 'center',
  position: 'relative',
  'border-radius': '4px',
  'padding-right': '14px',
  '& legend': {
    display: 'none',
  },
  '& label': {
    display: 'none',
  },
}

//Input 공통 스타일
export const useInputStyles = makeStyles((theme) =>
  (component.input === 'floating') ?
    createStyles({
      root: {
        width: '200px'
      },
      wrapBox: {
        display: 'inline-flex',
        flexDirection: "row",
        margin: "0px 20px 0px 0px",
        width: "364px",
        height: '40px',
        backgroundColor: "white",

      },
      label: {
        display: "inline-block",
        verticalAlign: "initial",
        width: "120px",
        maxWidth: "120px",
        padding: "8px 10px 0px 10px",
        wordBreak: "break-all",
        backgroundColor: "#f4f6fb",
        borderLeft: "1px solid #dde1ee"
      },
      inputDiv: {
        ...commonInputCss
      },
      textfield: {
        borderRadius: "10px",
        '& .MuiInputBase-input': {
          padding: '21px 0px 4px 12px',
        }
      },
      datetime: {
      },
      action: {
      },
      select: {
      },
      inputZDate: {
        borderRadius: "10px",
        marginLeft: '0px',
        '& .MuiInputBase-input': {
          padding: '21px 0px 4px 12px',
        }
      },
      inputZDateRange: {
        borderRadius: "10px",
        width: '120px',
        '& .MuiInputBase-input': {
          padding: '21px 0px 4px 12px',
        },
      },
      zDateTimePickerCss: {
        paddingLeft: '0px',
      },
      zDateTimePickerRangeCss: {
        width: '110px'
      },
      required: {
        '& fieldset': {
          borderColor: '#c00000',
        },
        '& fieldset span': {
          color: '#000',
        },
        '& > div': {
          color: '#c00000',
        },
      },
      div: {
        display: "inline-block",
        verticalAlign: "middle",
        minWidth: "200px",
        // maxWidth: "400px",
        margin: "2px 12px 2px 4px",
        '& legend': {
          display: 'none',
        },
        '& .MuiOutlinedInput-input': {
          // padding: '18px 0px 0px 11px',
        },
        '& .MuiFormControl-root': {
          marginTop: '3.5px',
          marginBottom: '3.5px',
        },
        '& .MuiTextField-root': {
          marginTop: '3.5px',
          marginBottom: '3.5px',
        },
        '& fieldset': {
          marginTop: "-2px",
        },
        '& fieldset.MuiOutlinedInput-notchedOutline': {
          backgroundColor: 'rgb(255 255 255 / 26%)',
        },
        '& .MuiFilledInput-root': {
          backgroundColor: '#fff',
          border: '1px solid #e2e2e1',
          borderRadius: '8px'
        },
        '& .MuiInputLabel-root': {
          // top: "-3px",
        },
      }
    }) :
    createStyles({
      wrapBox: {
        display: 'inline-flex',
        flexDirection: "row",
        margin: "0px 20px 0px 0px",
        width: "364px",
        height: '40px',
        backgroundColor: "white",

      },
      label: {
        display: "inline-block",
        verticalAlign: "initial",
        width: "120px",
        maxWidth: "120px",
        padding: "8px 10px 0px 10px",
        wordBreak: "break-all",
        backgroundColor: "#f4f6fb",
        borderLeft: "1px solid #dde1ee"
      },
      inputDiv: {
        ...commonInputCss
      },
      inputAutoCompelte: {
        ...commonInputCss,
        margin: "0px 4px 1px 4px",
        '& .MuiAutocomplete-root .MuiOutlinedInput-root.MuiInputBase-sizeSmall': {
          padding: '0px',
        },
      },
      inputSelect: {
        ...commonInputCss,
        margin: '7px 4px 0px 4px',
        //셀렉트 박스 높이 조정(textBOX랑 동일)
        '& .MuiFormControl-root': {
          margin: "7px 0px 3.1px 0px",
        },
        '& .MuiInputBase-input': {
          padding: '0px 0px 0px 10px',
          height: '27px'
        },
        '& .MuiOutlinedInput-input': {
          padding: '0px 0px 0px 10px',
          height: '27px'
        },
      },
      inputMultiSelect: {
        ...commonInputCss,
        //셀렉트 박스 높이 조정(textBOX랑 동일)
        '& .MuiFormControl-root': {
          margin: "7px 0px 3.1px 0px",
        },
        '& .MuiInputBase-input': {
          padding: '0px 0px 0px 10px',
          height: '27px'
        },
        '& .MuiOutlinedInput-input': {
          padding: '0px 0px 0px 10px',
          height: '27px'
        },
        '& .MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.MuiSelect-select': {
          padding: "0px 0px 0px 10px",
        },
      },
      inputCheck: {
        ...commonInputCss,
        margin: '6px 4px 0px 4px',
      },
      inputRadio: {
        ...commonInputCss,
        margin: '0px 4px 0px 4px',
        '& .MuiFormControl-root': {
          marginTop: '0px',
          marginBottom: '0px',
        },
      },
      inputDatetime: {
        ...commonInputCss,

        '& .MuiInputBase-input .MuiOutlinedInput-input': {
          padding: '0px 0px 0px 10px',
          height: '27px'
        },
        //datepicker button
        '& button.MuiIconButton-sizeSmall.MuiIconButton-edgeEnd': {
          margin: '0px -3px 5px 0px',
        },
        //날짜input밖 글자
        '& .MuiFormLabel-root .MuiInputLabel-root': {
          top: "-4px",
          display: 'none'
        },
      },
      inputRange: {
        ...commonInputCss,
        display: "inline-block",
        verticalAlign: "middle",
        width: "210px",
        '& legend': {
          display: 'none',
        },
        '& label': {
          display: 'none',
        },
        //dateRange 글자
        '& .MuiFormLabel-root .MuiInputLabel-root': {
          top: "-13px",
        },
      },
      inputTextarea: {
        ...commonInputCss
      },
      rangeInput: {
        display: "inline-block",
        verticalAlign: "middle",
        width: "210px",
        '& legend': {
          display: 'none',
        },
        '& label': {
          display: 'none',
        },
      },
      checkboxInput: {
        marginTop: "-4px!important",
      },
      inputZDate: {
        // ...commonInputCss,
        marginLeft: '0px',
        '& .MuiInputBase-root': {
          height: '24px',
          paddingLeft: '6px',
        },
        '& .MuiInputBase-input': {
          padding: '0px 0px 6px 0px',
        },
        '& .MuiInputAdornment-root': {
          marginLeft: '-10px',
        },
      },
      inputZDateRange: {
        ...commonInputCss,
        width: '120px',
        '& .MuiInputBase-root': {
          height: '24px',
          paddingLeft: '6px',
        },
        '& .MuiInputBase-input': {
          padding: '0px 0px 6px 0px',
        },
        '& .MuiInputAdornment-root': {
          marginLeft: '-10px',
        },
      },
      zDateTimePickerCss: {
        ...zDateTimePickerCssCommon,
        paddingLeft: '0px',
      },
      zDateTimePickerRangeCss: {
        ...zDateTimePickerCssCommon,
        width: '110px'
      },
      required: {
        '& fieldset': {
          borderColor: '#c00000',
        },
        '& fieldset span': {
          color: '#000',
        },
        '& > div': {
          color: '#c00000',
        },
      }
    })
)

/* 멘뉴 검색  콤포넌트 */
export const useSearchMenuStyles = makeStyles((theme) =>
  createStyles({
    root: {
      "& .MuiAutocomplete-listbox": {
        border: "1px solid #dee2e6",
        minHeight: 400,
        /* color: "green", */
        fontSize: 13,
        height: 10,
        "& :hover": {
        },
        "& li:hover": {
        }
      }
    },
    textfield: {
      "& .MuiInputBase-input.MuiAutocomplete-input": {
        fontSize: 12,
        marginTop: 12,
      },
    },
  })
);

export const useIconStyles = makeStyles(() => ({
  root: {
  },
  iconButton: {
  },
  FILE_SAVE: {
    color: "transparent",
    backgroundColor: "transparent",
    borderRadius: '2px'
  },
  gridIconButton: {
    margin: "2px 0",
  },
}));

export function CustomIcon(props) {
  const { type, size } = props;

  const [icon, setIcon] = useState(``);
  const classes = useIconStyles();

  useEffect(() => {
  });

  const styles = {
    img: {
      width: `${size}`,
      height: `${size}`,
    },
  };

  switch (type) {
    case 'FILE_SAVE':
      return <Avatar><Icon.FILE_SAVE /></Avatar >;
    default:
      return <Avatar><Icon.FILE_SAVE /></Avatar>;
  }
}

CustomIcon.propTypes = {
  type: PropTypes.string.isRequired,
  size: PropTypes.number,
};

CustomIcon.defaultProps = {
  size: 32
};
