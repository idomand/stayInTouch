import React from "react";
import Select from "react-select";
import styled from "styled-components";

const options = [
  { value: null, label: "Select" },
  { value: "Coworker", label: "Coworker" },
  { value: "Friend", label: "Friend" },
  { value: "Family", label: "Family" },
  { value: "Other", label: "Other" },
];

const StyledSelect = styled(Select)`
  .Select__control {
    cursor: pointer;
    height: 30px;
    min-height: 25px;
    border: 1px solid ${({ theme }) => theme.grey2};
    border-radius: 8px;
    background-color: ${({ theme }) => theme.grey1};
    font-size: ${({ theme }) => theme.p_normal};
    padding: 0;
    margin: 0;
  }

  .Select__control:hover {
    border-color: #a1a1a1;
  }

  .Select__control--is-focused {
    box-shadow: 0 0 0 1px black;
    outline: none;
  }

  .Select__value-container {
    padding: 0;
  }
  .Select__dropdown-indicator {
    display: none;
    padding: 0;
  }

  .Select__indicator-separator {
    display: none;
    padding: 0;
  }

  .Select__menu {
    color: #3c3d3e;
  }
`;

export default function TagSelect({ tagValue, setTagValue }) {
  return (
    <>
      <StyledSelect
        classNamePrefix="Select"
        defaultValue={tagValue}
        onChange={setTagValue}
        options={options}
      />
    </>
  );
}
