import styled from "styled-components";
import { BasicButton } from "../Common/StyledButton";

export const ScrollButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.brown1};
  transition: all 0.3s;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 3;
`;
export const ScrollButtonWrapper = styled.div``;
