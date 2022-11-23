import { createTheme } from '@mui/material/styles';

const appTheme = createTheme({
  typography: {
    fontSize: 13,
    fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    caption: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    button: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    subtitle1: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    body2: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    overline: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    body1: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    subtitle2: {
      fontSize: 13,
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    h1: {
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    h2: {
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    h3: {
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    h4: {
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    h5: {
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },
    h6: {
      fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
    },

  },
  spacing: 2,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
          fontSize: 13,
          border: "1px solid gray",
          // borderRadius: "0px",
          height: "30px",
          minWidth: "60px",
          // padding: "5px",
          margin: "6px 0",
          "&:hover": {
            color: "#000000",
          },
          "&.Mui-disabled": {
          }
        },
        outlined: {
          backgroundColor: "#fff",
          border: "1px solid #6c757d",
          color: "#000000",
        }
      }
    },
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          // display: "-webkit-inline-box"
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          margin: '3.5px 3.5px',
          fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
          fontSize: 13
        },
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          margin: 'dense',
          
          fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
          fontSize: 13,
        },
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
          fontSize: 13,
          margin: "9px 0px",
          "&.Mui-disabled": {
          }
        }
      },
    }
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        margin: 'dense',
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
        padding: '1px 0px 4px 10px',
        height: '1em'
      },
      input: {
        padding: '18px 0px 0px 11px'
      }
    }
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',      },
    }
  },
  MuiFilledInput: {
    styleOverrides: {
      root: {
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13
      },
      input: {
        backgroundColor: "#fff",
      },
      legend: {
        display: 'none',
      }
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
      },
    }
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        dense: true,
        
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
      },
    }
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        margin: 'dense',
        
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
        height: 20
      },
    }
  },
  MuiFab: {
    styleOverrides: {
      root: {
        
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
      },
    }
  },
  MuiTable: {
    styleOverrides: {
      root: {
        
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
      },
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        margin: '3.5px 3.5px',
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
      },
    }
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        variant: 'dense',
        fontFamily: '"Noto Sans KR", "Helvetica", "Arial", sans-serif',
        fontSize: 13,
      },
    }
  }, // End 공통 콤포넌트
  //SideBar
  SideBar: {
    root: {
      width: "100%",
      maxWidth: 260,
      color: '#ebe9e9',
      /* paddingLeft: '16px', */
      '& span': {
        fontSize: 13,
        fontWeight: 400,
      }
    },
    item: {
      padding: '4px 0 4px 40px',
      margin: 0,
      background: '#284461',
      color: '#ebe9e9',
      fontWeight: 400,
    },
    selectedItem: {
      padding: '4px 0 4px 40px',
      margin: 0,
      background: '#284461',
      '& span': {
        color: '#ffc800',
        fontWeight: 'bold',
      }
    },
    span: {
      '& span::before': {
        content: "''",
        display: "block",
        position: "relative",
        left: "-17px",
        transition: "all .1s ease",
        transform: "translateX(0)",
        top: "0.9em",
        width: "4px",
        height: "4px",
        background: "#ebe9e9",
      }
    },
  },//End SideBar
  shadows: Array(25).fill('none')
});


export default appTheme;