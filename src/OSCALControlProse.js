import React from "react";
import { styled, withTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Badge from "@material-ui/core/Badge";
import StyledTooltip from "./OSCALStyledTooltip";
import { getStatementByComponent } from "./oscal-utils/OSCALControlResolver";

const prosePlaceholderRegexpString = "{{ insert: param, ([0-9a-zA-B-_.]*) }}";

const ParamLabel = styled(withTheme(Typography))((props) => ({
  backgroundColor: props.theme.palette.warning.light,
  padding: "0.2em 0.5em",
  "border-radius": "5px",
  opacity: 0.5,
}));

const ParamValue = styled(withTheme(Typography))((props) => ({
  backgroundColor: props.theme.palette.info.light,
  color: "white",
  padding: "0.2em 0.5em",
  "border-radius": "5px",
}));

/**
 * Gets the label for the given parameter ID from the given parameters
 * @param {Array} parameters
 * @param {String} parameterId
 * @returns the parameter label
 */
const getParameterLabel = (parameters, parameterId) => {
  const parameter = parameters.find(
    (parameter) => parameter.id === parameterId
  );

  if (!parameter) {
    return {};
  }
  if (parameter.label) {
    return `< ${parameter.label} >`;
  }
  if (parameter.select && parameter.select.choice) {
    return `< ${parameter.select.choice.join(" | ")} >`;
  }
  return `< ${parameterId} >`;
};

/**
 * Finds a parameter setting in a component statement
 * @param {Object} statementByComponent
 * @param {String} parameterId
 * @returns the parameter label
 */
function getParameterValue(statementByComponent, parameterId) {
  // Locate matching parameter to parameterId
  const foundParameterSetting = statementByComponent["set-parameters"].find(
    (parameterSetting) => parameterSetting["param-id"] === parameterId
  );

  // Error checking: Exit function when parameter setting or it's values are not found
  if (!foundParameterSetting || !foundParameterSetting.values) {
    return {};
  }

  // TODO parse select parameters
  return foundParameterSetting.values.toString();
}

function getConstraintsDisplay(modifications, parameterId) {
  if (!modifications || !modifications["set-parameters"] || !parameterId) {
    return "";
  }
  const foundParameterSetting = modifications["set-parameters"].find(
    (parameterSetting) => parameterSetting["param-id"] === parameterId
  );
  if (!foundParameterSetting || !foundParameterSetting.constraints) {
    return "";
  }
  const constraintDescriptions = [];
  foundParameterSetting.constraints.forEach((constraint) => {
    constraintDescriptions.push(constraint.description);
  });
  return constraintDescriptions.join("\n");
}

/**
 * Builds the display of a segment of non-placeholder text within prose
 * @param {String} text
 * @returns the text segment component
 */
const getTextSegment = (text) => {
  if (!text || text.length === "") {
    return {};
  }
  return <Typography component="span">{text}</Typography>;
};

function SegmentTooltipWrapper(props) {
  return (
    <StyledTooltip title={props.constraintsDisplay} placement="top-end">
      <Badge color="secondary" variant="dot">
        {props.children}
      </Badge>
    </StyledTooltip>
  );
}

/**
 * Builds the display of a segment of placeholder label text within prose
 * @param {Array} parameters
 * @param {String} parameterId
 * @returns the parameter label segment component
 */
const getParameterLabelSegment = (parameters, parameterId, modifications) => {
  const parameterLabel = getParameterLabel(parameters, parameterId);
  const constraintsDisplay = getConstraintsDisplay(modifications, parameterId);
  if (constraintsDisplay.length === 0) {
    return <ParamLabel component="span">{parameterLabel}</ParamLabel>;
  }
  return (
    <SegmentTooltipWrapper constraintsDisplay={constraintsDisplay}>
      <ParamLabel component="span">{parameterLabel}</ParamLabel>
    </SegmentTooltipWrapper>
  );
};

/**
 * Builds the display of a segment of placeholder value text within prose
 * @param {Object} statementByComponent
 * @param {String} parameterId
 * @returns the parameter value segment component
 */
const getParameterValueSegment = (
  statementByComponent,
  parameterId,
  modifications
) => {
  const parameterValue = getParameterValue(statementByComponent, parameterId);
  const constraintsDisplay = getConstraintsDisplay(modifications, parameterId);
  if (constraintsDisplay.length === 0) {
    return <ParamValue component="span">{parameterValue}</ParamValue>;
  }
  return (
    <SegmentTooltipWrapper constraintsDisplay={constraintsDisplay}>
      <ParamValue component="span">{parameterValue}</ParamValue>
    </SegmentTooltipWrapper>
  );
};

/**
 * Replaces the parameter placeholders in the given prose with the given label
 *
 * TODO - This is probably 800-53 specific?
 * TODO - Add support for select param
 * BUG - If there is more then one parameter in the prose, this script will not work
 */
export function OSCALReplacedProseWithParameterLabel(props) {
  if (!props.prose) {
    return null;
  }

  if (!props.parameters) {
    return (
      <Typography className={props.className}>
        {props.label}
        {props.prose}
        {props.modificationDisplay}
      </Typography>
    );
  }

  return (
    <Typography className={props.className}>
      {props.label}
      {props.prose
        .split(RegExp(prosePlaceholderRegexpString, "g"))
        .map((segment, index) => {
          if (index % 2 === 0) {
            return getTextSegment(segment);
          }
          return getParameterLabelSegment(
            props.parameters,
            segment,
            props.modifications
          );
        })}
      {props.modificationDisplay}
    </Typography>
  );
}

/**
 * Replaces the parameter placeholders in the given prose with the values
 * from the 'by-component' within the given statementId that matches the given componentId
 * from the given implReqStatements
 *
 * TODO - This is probably 800-53 specific?
 */
export function OSCALReplacedProseWithByComponentParameterValue(props) {
  if (!props.prose) {
    return {};
  }

  const statementByComponent = getStatementByComponent(
    props.implReqStatements,
    props.statementId,
    props.componentId
  );
  if (!statementByComponent) {
    return (
      <OSCALReplacedProseWithParameterLabel
        label={props.label}
        prose={props.prose}
        parameters={props.parameters}
        modificationDisplay={props.modificationDisplay}
      />
    );
  }

  const { description } = statementByComponent;
  return (
    <Typography>
      <StyledTooltip title={description}>
        <Link href="#{props.label}">{props.label}</Link>
      </StyledTooltip>
      {props.prose
        .split(RegExp(prosePlaceholderRegexpString, "g"))
        .map((segment, index) => {
          if (index % 2 === 0) {
            return getTextSegment(segment);
          }
          return getParameterValueSegment(
            statementByComponent,
            segment,
            props.modifications
          );
        })}
      {props.modificationDisplay}
    </Typography>
  );
}
