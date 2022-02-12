import styled from "styled-components";
import { BasicButton } from "../Components/Common/StyledButton";

export const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const SignInButton = styled(BasicButton)`
  display: flex;
  justify-content: space-around;
  &:hover,
  &:focus {
  }
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;

export const GoogleLogo = styled.img``;
