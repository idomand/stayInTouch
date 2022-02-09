import styled from "styled-components";
import { BasicButton } from "../../Components/Common/StyledButton";

export const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 90%;
    margin: auto;
  }
`;

export const SignInButton = styled(BasicButton)`
  display: flex;
  margin-top: 15px;
  padding: 10px;
  font-size: ${({ theme }) => theme.typeScale.header1};
  background-color: ${({ theme }) => theme.white};
  color: ${({ theme }) => theme.black};
  width: 15%;
  justify-content: space-around;
  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue4};
    color: ${({ theme }) => theme.white};
    border: solid 1.5px ${({ theme }) => theme.black};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    width: 50%;
  }
`;

export const GoogleLogo = styled.img`
  height: 40px;
`;
