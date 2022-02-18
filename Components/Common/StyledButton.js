import styled from "styled-components";

const ButtonPrototype = styled.button`
  cursor: pointer;
  align-items: center;
  transition: 0.3s;
`;

export const MinimalButton = styled(ButtonPrototype)`
  cursor: pointer;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  border: none;
  background-color: transparent;
  padding: 0;
  border-bottom: solid;
  margin-bottom: 5px;
  transition: 0.3s all;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.blue2};
  }
`;

export const BasicButton = styled(ButtonPrototype).attrs((props) => {
  target: "_self";
})`
  background-color: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  border: 1.3px solid ${({ theme }) => theme.white};
  border-radius: 6px;
  font-size: ${({ theme }) => theme.typeScale.p_normal};
  font-weight: 500;
  padding: 5px 10px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};
    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: 100px;
    max-width: 100px;
    height: 40px;
  }
`;

export const NavbarButton = styled(BasicButton)`
  /* margin: 3px; */
`;
