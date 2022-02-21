import styled from "styled-components";
import { H2 } from "../Common/StyledText.js";

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

export const NavbarText = styled(H2)`
  margin-left: 40px;
`;

export const LoginButton = styled.button`
  font-size: ${({ theme }) => theme.typeScale.p_small};
  font-weight: 500;
  background: ${({ theme }) => theme.blue1};
  color: ${({ theme }) => theme.white};
  padding: 8px 16px;
  border-radius: 6px;
  border: 1.3px solid ${({ theme }) => theme.white};
  transition: 0.3s all;
  margin: 10px;
  &:hover,
  &:focus {
    background: ${({ theme }) => theme.blue3};

    border: 1.3px solid ${({ theme }) => theme.blue1};
    color: ${({ theme }) => theme.blue1};
  }
`;

export const LogoutButton = styled.button`
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: 0.3s all;
  background-color: transparent;
  border: none;
  font-size: ${({ theme }) => theme.typeScale.p_small};
  font-weight: 500;
  color: ${({ theme }) => theme.blue1};
  margin: 10px;
  border-radius: 10px;
  padding: 3px 5px;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.black};
    background: ${({ theme }) => theme.blue3};
  }
`;

export const LogoutLogo = styled.img`
  margin-left: 5px;
`;

export const PageLinksWrapper = styled.div`
  font-size: 20px;
`;
