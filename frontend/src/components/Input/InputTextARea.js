import React from "react";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "black",
      fontWeight: "bold",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#fc930c",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#fc930c",
      },
      "&:hover fieldset": {
        borderColor: "#fc930c",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#fc930c",
      },
    },
  },
})(TextField);

const TextArea = ({ rows, rowsMax, placeholder, onChange, value, id, label, variant, multilinerows, disabled }) => {
  return (
    <CssTextField
      multiline
      onChange={onChange}
      value={value}
      rows={rows}
      multilinerows={multilinerows}
      rowsMax={rowsMax}
      placeholder={placeholder}
      id={id}
      label={label}
      variant={variant}
      autoComplete="off"
      disabled={disabled}
    />
  );
};
export default TextArea;
