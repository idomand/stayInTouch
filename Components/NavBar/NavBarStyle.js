import styled from "styled-components";
import { H1 } from "../Common/StyledText.js";
import { NavLink } from "../Common/StyledLinks";

export const LogoImg = styled.img`
  margin: 5px 0 5px 20px;
  height: 40px;
`;

export const NavBarWrapper = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme }) => theme.white};
  position: sticky;
  z-index: 2;
  top: 0;
  width: 100%;
  height: 60px;

  box-shadow: 0px 1px 0px #e5e9f2;

  @media (${({ theme }) => theme.devices.break1}) {
  }
`;
//!!!
export const NavbarText = styled(H1)`
  margin-left: 80px;
`;
export const ButtonWrapper = styled.div``;

export const LoginButton = styled(NavLink)`
  background: ${({ theme }) => theme.blueButtonBackground};
  color: ${({ theme }) => theme.white};
`;

export const LogoutButton = styled(NavLink)`
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.black};
  cursor: pointer;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.brown1};
    color: ${({ theme }) => theme.black};
    border: solid 2px ${({ theme }) => theme.black};
  }
`;
