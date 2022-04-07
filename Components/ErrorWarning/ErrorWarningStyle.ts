import styled, { keyframes } from "styled-components";
import { H5 } from "../Common/StyledText";

export const slide = keyframes`
  from {
    transform: translateY(0);
    opacity: 0
  }
  to {
    transform: translateY(40px);
    opacity: 1
  }
`;

export const ErrorWrapper = styled.div`
  border: solid ${({ theme }) => theme.red1};
  background-color: ${({ theme }) => theme.red2};
  box-shadow: 0px 4px 28px rgba(0, 0, 0, 0.25);
  border-radius: 13px;
  padding: 15px 20px;
  position: absolute;
  animation: ${slide} 300ms forwards;
`;

export const ErrorLogo = styled.img`
  margin-right: 10px;
`;

export const ErrorText = styled(H5)`
  color: ${({ theme }) => theme.red1};
  display: flex;
  align-items: center;
  text-transform: capitalize;
`;
