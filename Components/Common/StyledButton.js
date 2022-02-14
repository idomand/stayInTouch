import styled from "styled-components";

export const BasicButton = styled.button.attrs((props) => {
  target: "_self";
})`
  cursor: pointer;
  align-items: center;
  transition: 0.3s;
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
  }
`;

export const NavbarButton = styled(BasicButton)`
  /* margin: 3px; */
`;
