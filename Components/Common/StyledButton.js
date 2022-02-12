import styled from "styled-components";

export const BasicButton = styled.button.attrs((props) => {
  target: "_self";
})`
  cursor: pointer;
  align-items: center;
  transition: 0.3s;
  &:hover,
  &:focus {
  }
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const NavbarButton = styled(BasicButton)`
  /* margin: 3px; */
`;
