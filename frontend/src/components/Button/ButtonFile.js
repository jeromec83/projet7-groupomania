import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: "none",
  },
}));

export default function UploadButtons({ onChange, theInputKey, type }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <input onChange={onChange} key={theInputKey || ""} className={classes.input} id="icon-button-file" type={type} />
      <label aria-label="upload picture" htmlFor="icon-button-file">
        <div style={{ display: "none" }}>Sélectionner une image :</div>
        <IconButton color="primary" aria-label="upload picture" component="span">
          <FontAwesomeIcon color="#fffff" icon={["fas", "camera-retro"]} />
        </IconButton>
      </label>
    </div>
  );
}
