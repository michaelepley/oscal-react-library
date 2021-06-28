import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import { Tooltip, Typography } from "@material-ui/core";
import { getAbsoluteUrl } from "./oscal-utils/OSCALBackMatterUtils";

// TODO: Temporary fix for missing media type (https://github.com/GSA/fedramp-automation/issues/103)
// Uses file extension instead
const getURLMediaType = (url) => url.split(".").pop();

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
  },
  OSCALBackMatterInfo: {
    "text-transform": "capitalize",
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
  // TODO - This is hacky
  OSCALBackMatterHeader: {
    "& .MuiTypography-root": {
      "font-size": "0.875rem",
      color: "#0000008a",
    },
  },
}));

export default function OSCALBackMatter(props) {
  const classes = useStyles(props);

  const getMediaType = (rlink) =>
    rlink["media-type"] ||
    getURLMediaType(getAbsoluteUrl(rlink, props.parentUrl));

  const getColor = (rlink) => (rlink["media-type"] ? "default" : "secondary");

  // eslint-disable-next-line
  const backMatterDisplay = (resource) => {
    const title = resource.title || "No Title";
    const color = resource.title ? "initial" : "error";

    return (
      <CardContent key={resource.uuid}>
        <Grid>
          <Tooltip title={resource.description} placement="bottom-start">
            <Typography color={color} variant="subtitle1">
              {title}
            </Typography>
          </Tooltip>
        </Grid>
        <Grid>
          <Typography>
            {resource.rlinks.map((rlink) => (
              <Chip
                key={resource.uuid}
                label={getMediaType(rlink)}
                color={getColor(rlink)}
                component="a"
                href={getAbsoluteUrl(rlink, props.parentUrl)}
                variant="outlined"
                clickable
              />
            ))}
          </Typography>
        </Grid>
      </CardContent>
    );
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.OSCALBackMatterHeader}>
            <Typography>Back Matter</Typography>
          </Grid>
          <Grid item xs={7} className={classes.OSCALBackMatterInfo}>
            <Typography variant="h6">Resources</Typography>
          </Grid>
        </Grid>
        <Grid>
          {props.backMatter.resources.map((resource) =>
            backMatterDisplay(resource)
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}