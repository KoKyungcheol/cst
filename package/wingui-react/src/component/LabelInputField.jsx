import React, { useState } from "react";
import { Controller, useController } from "react-hook-form";
import { FormControl, MenuItem, Select, Autocomplete, TextField, Chip, Box, Checkbox, RadioGroup, Radio, ListItemIcon, ListItemText, FormControlLabel, InputLabel } from "@mui/material";
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { Cancel } from "@mui/icons-material";
import { ko, enGB, ja, zhCN } from "date-fns/locale";
import { useContentStore } from '@zionex/store/contentStore'
import PropTypes from 'prop-types';
import PickersDay from "@mui/lab/PickersDay";
import { styled } from "@mui/material/styles";
import { ZDateTimeRange } from '@zionex/component/ZDateTimeRange'
import { ZDateTimePicker } from '@zionex/component/ZDateTimePicker'
import { createUniqueKey } from '@zionex//utils/common'
import PopoverInput from "@zionex/component/PopoverInput";
import { useInputStyles } from "./CommonStyle";
const localeMap = {
  en: enGB,
  ko: ko,
  jp: ja,
  cn: zhCN,
};

export function LabelInputField(props) {
  //이 컴포넌트 ID
  const [uid, setUid] = useState((props.name ? props.name : createUniqueKey()) + '_');
  const [checked, setChecked] = useState([]);
  const [inputValue, setInputValue] = React.useState('');

  const languageCode = useContentStore(state => state.languageCode);
  const classes = useInputStyles();

  const getViews = (dateformat) => {
    let dateformatLowwer = dateformat.toLowerCase();
    let views = [];
    if (dateformatLowwer.indexOf("yyyy") > -1) {
      views.push("year")
    }
    if (dateformatLowwer.indexOf("mm") > -1) {
      views.push("month")
    }
    if (dateformatLowwer.indexOf("dd") > -1) {
      views.push("day")
    }
    if (dateformatLowwer.indexOf("hh") > -1) {
      views.push("hours")
    }
    if (dateformatLowwer.indexOf(":mm") > -1) {
      views.push("minutes")
    }
    if (dateformatLowwer.indexOf("ss") > -1) {
      views.push("seconds")
    }
    return views;
  };

  function getInputClass() {

    switch (props.type) {
      case 'autocomplete':
        return classes.inputAutoCompelte
      case 'select':
        return classes.inputSelect
      case 'multiSelect':
        return classes.inputMultiSelect
      case 'check':
        return classes.inputCheck
      case 'radio':
        return classes.inputRadio
      case 'datetime':
        return classes.inputDatetime
      case 'dateRange':
        return classes.inputRange
      case 'textarea':
        return classes.inputTextarea
      default:
        return classes.inputDiv
    }
  }

  const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== "selected"
  })(({ theme, selected }) => ({
    ...(selected && {
      backgroundColor: "#ffb2b2",
      color: theme.palette.common.white,
      "&:hover, &:focus": {
        backgroundColor: theme.palette.primary.dark
      },
      borderTopLeftRadius: "50%",
      borderBottomLeftRadius: "50%",
      borderTopRightRadius: "50%",
      borderBottomRightRadius: "50%"
    })
  }));

  function setInputField() {
    //let editable = {backgroundColor: 'yellow'}
    //let readOnley = {backgroundColor: '#efefef'}
    //let editStyle= props.readonly || props.disabled ? readOnley : editable;

    const inputStyle = { ...props.inputStyle }
    let otherProps = {}

    switch (props.type) {
      //임의의 control을 추가할 수 있다.
      case 'custom':
        return (props.customControl)

      case 'autocomplete':
        return (
          <FormControl
            size={"small"}
            fullWidth
            disabled={props.disabled ? true : false}
          >
            <Controller
              rules={props.rules}
              defaultValue={props.defaultValue || props.value}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  inputProps={{
                    className: (props.readonly) ? 'Mui-disabled' : undefined,
                  }}
                  style={inputStyle}
                  autoHighlight
                  onChange={(event, newValue) => {
                    onChange(newValue ? newValue.value : '')
                  }}
                  value={(props.options && value) ? props.options.find((v) => v.value === value) : ''}
                  inputValue={inputValue}
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  options={props.options}
                  getOptionLabel={(option) => `${option.label ? transLangKey(option.label) : ''}`}
                  renderInput={(params) => <TextField {...params} label={props.label} />}
                  readOnly={props.readonly ? props.readonly : false}

                >
                </Autocomplete>
              )}
              control={props.control}
              name={props.name}
            />
          </FormControl>
        )
      case 'select':
        return (
          <FormControl
            size={"small"}
            fullWidth
            disabled={props.disabled ? props.disabled : false}
          >
            <InputLabel></InputLabel>
            <Controller
              defaultValue={props.defaultValue || props.value}
              rules={props.rules}
              render={({ field: { onChange, value } }) => (
                <Select
                  style={inputStyle}
                  displayEmpty
                  onChange={onChange}
                  value={value || ''}
                  defaultValue={''}
                  inputProps={{ 'aria-label': 'Without label' }} //native=true일때 적용됨
                  className={(props.readonly) ? 'Mui-disabled' : undefined}
                  variant="outlined"
                  readOnly={props.readonly ? props.readonly : false}
                  MenuProps={{
                    style: {
                      maxHeight: 480,
                    },
                  }}
                >
                  {props.options && props.options.length > 0 && (props.options).map((option) => {
                    return (
                      <MenuItem key={uid + option.value} value={option.value} className={option.class}>
                        {option.label}
                      </MenuItem>
                    );
                  })}

                </Select>
              )}
              control={props.control}
              name={props.name}
            />
          </FormControl>
        )
      case 'multiSelect':

        const isChecked = (value, name) => {
          value = value ? value : [];
          return value.indexOf(name) > -1
        }
        const handleToggle = (onChange, value, name) => {
          value = value ? value : [];
          if (isChecked(value, name)) {
            onChange(value.filter(i => i !== name));
          } else {
            onChange([...value, name])
          }
        }
        const handleAllToggle = () => {
          document.getElementById('check-all').click();
        }

        return (
          <FormControl
            size={"small"}
            fullWidth
            disabled={props.disabled ? props.disabled : false}
          >
            {/* <InputLabel>{props.label}</InputLabel> */}
            <Controller
              control={props.control}
              name={props.name}
              defaultValue={props.defaultValue || props.value}
              rules={props.rules}
              render={({ field: { onChange, value } }) => (
                <Select
                  style={inputStyle}
                  displayEmpty
                  multiple
                  readOnly={props.readonly ? props.readonly : false}
                  className={(props.readonly) ? 'Mui-disabled' : undefined}
                  value={value ? value : []}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "center"
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "center"
                    },
                  }}
                  renderValue={(selected) => (
                    <Box key={uid + 'sel'} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected && selected.map((val, index) => (
                        <Chip
                          clickable
                          size="small"
                          key={uid + 'chip_' + index}
                          label={props.options && props.options[props.options.findIndex(v => v.value === val)].label}
                          onDelete={(e) => onChange(value.filter((v) => v !== val))}
                          deleteIcon={
                            <Cancel key={uid + 'cancel_' + index} onMouseDown={(event) => event.stopPropagation()}
                            />
                          }
                        />
                      ))}
                    </Box>
                  )}>
                  <MenuItem key={uid + 'all'} value="ALL">
                    <ListItemIcon>
                      <Checkbox
                        id="check-all"
                        checked={value && value.length > 0 && value.length === props.options.length ? true : false}
                        indeterminate={value && value.length > 0 && value.length === props.options.length ? true : false}
                        onChange={(event, checked) => {
                          if (checked) {
                            $.map(props.options, function (option) {
                              if (typeof value === 'undefined') {
                                value = [];
                              }
                              if (value && !value.includes(option.value)) {
                                if (option.value !== '') {
                                  value.push(option.value);
                                }
                              }
                            });
                          } else {
                            value.splice(0);
                          }
                          onChange(value);
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      key={uid + 'alltext'}
                      onClick={(e) => handleAllToggle()}
                      primary={transLangKey("ALL")}
                      primaryTypographyProps={{
                        fontWeight: "bold",
                      }}
                    />
                  </MenuItem>
                  {(props.options).map((option, index) => {
                    return (
                      <MenuItem key={uid + option.value} value={option.value} onClick={(e) => handleToggle(onChange, value, option.value)}>
                        <ListItemIcon>
                          <Checkbox
                            key={uid + 'check_' + option.value}
                            label={option.value}
                            /* checked={isChecked(option.value)} */
                            checked={value && value.indexOf(option.value) > -1 ? true : false}
                            onChange={(event, checked) => {
                              if (checked) {
                                onChange([
                                  ...value,
                                  option.value
                                ]);
                              } else {
                                onChange(
                                  value.filter(
                                    (value) => value !== option.value
                                  )
                                );
                              }
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText key={uid + 'text_' + option.value} primary={option.label} />
                      </MenuItem>
                    );
                  })}
                </Select>
              )}
            />
          </FormControl>
        )
      case 'check':
        return (
          <FormControl
            fullWidth
            size={"small"}
            variant={"outlined"}
            style={{ display: 'flex', flexDirection: 'row' }}
            disabled={props.disabled ? props.disabled : false}
            className={classes.checkboxInput}
          >
            {/* <FormLabel component="legend">{props.label}</FormLabel> */}
            <Box>
              {props.options.map((option, index) => {
                return (
                  <FormControlLabel
                    key={uid + option.value}
                    label={option.label}

                    control={
                      <Controller
                        name={props.name}
                        defaultValue={props.defaultValue || props.value}
                        rules={props.rules}
                        render={({ field: { onChange, value }, }) => {
                          return (
                            <Checkbox
                              readOnly={props.readonly ? props.readonly : false}
                              disabled={props.disabled ? props.disabled : false}
                              className={(props.readonly) ? 'Mui-disabled' : undefined}
                              style={inputStyle}
                              sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                              checked={value && value.includes(option.value) ? true : false}
                              value={option.value}
                              onChange={(event, checked) => {

                                if (event.target.readOnly) {
                                  return false;
                                } else {
                                  if (checked) {
                                    let prevValue = value ? value : []
                                    onChange([
                                      ...prevValue,
                                      event.target.value
                                    ]);
                                  } else {
                                    onChange(
                                      value.filter(
                                        (value) => value !== event.target.value
                                      )
                                    );
                                  }
                                }
                              }}
                            />
                          );
                        }}
                        control={props.control}
                      />
                    }
                  />
                );
              })}
            </Box>
          </FormControl>
        )
      case 'radio':
        return (
          <Controller
            name={props.name}
            control={props.control}
            rules={props.rules}
            defaultValue={props.defaultValue || props.value}
            render={({
              field: { onChange, value },
              fieldState: { error },
            }) => (
              <FormControl
                component="fieldset"
                error={error}
                disabled={props.disabled ? props.disabled : false}
              >
                <RadioGroup
                  value={value || ''}
                  onChange={onChange}
                  style={{ display: 'flex', flexDirection: 'row', ...inputStyle }}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      fontSize: 20,
                    },
                  }}>
                  {(props.options).map((option, index) => {
                    return (
                      <FormControlLabel
                        key={uid + index}
                        value={option.value}
                        label={option.label}
                        control={<Radio />}
                        disabled={(props.readonly && option.value != value) ? true : false}
                      />
                    );
                  })}
                </RadioGroup>
              </FormControl>
            )}
          />
        )
      case 'datetime':
        return (
          <Controller
            name={props.name}
            defaultValue={props.defaultValue || props.value}
            control={props.control}
            render={({ field: { onChange, value, ...params } }) => (
              <ZDateTimePicker {...params} {...props} value={value} onChange={onChange} locale={localeMap[languageCode]} />
            )}
          />
        )
      case 'dateRange2':
        otherProps = {}
        if (props.openTo)
          otherProps.openTo = props.openTo

        return (
          <Controller
            name={props.name}
            control={props.control}
            defaultValue={props.defaultValue || props.value}
            render={({ field: { onChange, value, params } }) => (
              <ZDateTimeRange {...props} value={value} onChange={onChange} locale={localeMap[languageCode]} />
            )}
          />
        )
      case 'ZDatePicker':

        return (
          <Controller
            name={props.name}
            defaultValue={props.defaultValue || props.value}
            control={props.control}
            render={({ field: { onChange, value, ...params } }) => (
              <ZDateTimePicker {...params} {...props} value={value} onChange={onChange} locale={localeMap[languageCode]} />
            )}
          />
        )
      case 'dateRange':
        otherProps = {}
        if (props.openTo)
          otherProps.openTo = props.openTo

        return (
          <Controller
            name={props.name}
            control={props.control}
            defaultValue={props.defaultValue || props.value}
            render={({ field: { onChange, value, params } }) => (
              <ZDateTimeRange {...props} value={value} onChange={onChange} locale={localeMap[languageCode]} />
            )}
          />
        )

      case 'customInput':
        return (
          <Controller
            name={props.name}
            control={props.control}
            defaultValue={props.defaultValue || props.value}
            render={({ field: { onChange, value, params } }) => (
              <PopoverInput {...props}
                value={value}
                onChange={onChange} locale={localeMap[languageCode]} />
            )}
          />
        )
      case 'textarea':
        return (
          <Controller
            name={props.name}
            defaultValue={props.defaultValue || props.value}
            control={props.control}
            rules={props.rules}
            render={({
              field: { onChange, value },
              fieldState: { error },
              formState,
            }) => (
              <TextareaAutosize
                maxRows={props.maxRows || 2}
                minRows={props.minRows || 2}
                style={{ width: "inherit", height: "inherit", ...inputStyle }}
                readOnly={props.readonly ? props.readonly : false}
                disabled={props.disabled ? props.disabled : false}
                className={(props.readonly) ? 'Mui-disabled' : undefined}
                onChange={onChange}
                defaultValue={value}
                onKeyPress={props.onKeyPress}
              />
            )}
          />
        )
      default:
        return (
          <Controller
            name={props.name}
            defaultValue={props.defaultValue || props.value}
            control={props.control}
            rules={props.rules}
            render={({
              field: { onChange, value },
              fieldState: { error },
              formState,
            }) => (
              <TextField
                fullWidth
                hiddenLabel={true}
                inputProps={{
                  readOnly: props.readonly ? props.readonly : false,
                }}
                InputProps={{
                  className: (props.readonly) ? 'Mui-disabled' : undefined,
                }}
                disabled={props.disabled ? props.disabled : false}
                size="small"
                error={!!error}
                onChange={onChange}
                type={props.type === 'number' ? 'number' : 'text'}
                value={value || ''}
                onKeyPress={props.onKeyPress}
                style={{ width: "inherit", ...inputStyle }}
              /* label={props.label} */
              />
            )}
          />
        )
    }
  }
  const getWrapBoxClass = () => {
    return props.displaySize === 'small' ? classes.smallWrapBox : classes.wrapBox;
  }
  const getLabelClass = () => {
    return props.displaySize === 'small' ? classes.smallLabel : classes.label
  }
  let lastProps = props.lastitem === 'Y' ? { flex: 'auto', width: props.width } : {};
  let wrapStyle = { ...props.wrapStyle, ...lastProps }
  let wrapBoxClass = getWrapBoxClass();
  let labelClass = getLabelClass();

  let label = '';
  if (props.label && props.useLabel !== false) {
    label = label = props.label;
    if (label && label.indexOf('\n') > -1) {
      label = label.split('\n').map(line => {
        return (<>{line}<br /></>)
      })
    } else {
      label = transLangKey(label)
    }
  }

  return (
    <>
      {
        (props.label && props.useLabel !== false) ? (
          <Box data-role='wrapInputBox' className={`${wrapBoxClass} ${props.rules && props.rules.required ? classes.required : ''} ${props.className}`} style={wrapStyle}>
            <Box data-role='labelBox' className={labelClass} style={props.labelStyle}>{label}</Box>
            <Box data-role='inputBox' className={getInputClass()} style={props.style}>
              {
                setInputField()
              }
            </Box>
            {
              props.button && (<Box style={{ display: "inline-flex" }}>{props.button}</Box>)
            }
          </Box>
        ) : (
          <>
            <Box data-role='inputBox' className={`${getInputClass()} ${props.className ? props.className : ''}`} style={props.style ? props.style : {}}>
              {
                setInputField()
              }
            </Box>
            {
              props.button && (<Box style={{ display: "inline-flex" }}>{props.button}</Box>)
            }
          </>
        )
      }
    </>
  );
}

LabelInputField.propTypes = {
  type: PropTypes.oneOf(['custom', 'text', 'select', 'multiSelect', 'check', 'radio', 'datetime', 'dateRange', 'textarea', 'autocomplete', 'number', 'dateRange2', 'ZDatePicker', 'customInput']),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  useLabel: PropTypes.bool,
  readonly: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  disabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
  rules: PropTypes.object,
  wrapStyle: PropTypes.any,
  labelStyle: PropTypes.any,
  inputBoxStyle: PropTypes.any,
  inputStyle: PropTypes.any,
  inputStyle2: PropTypes.any,

};

LabelInputField.displayName = 'LabelInputField'