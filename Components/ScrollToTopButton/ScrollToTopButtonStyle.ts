import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";

export const ScrollButton = styled(BasicButton)`
  transition: all 0.3s;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 3;
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 40px;
    bottom: 40px;
  }
`;
export const ScrollButtonWrapper = styled.div``;
