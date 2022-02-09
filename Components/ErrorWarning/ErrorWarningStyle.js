import styled from "styled-components";
import { H1 } from "../Common/StyledText";

export const ErrorWrapper = styled.div`
  color: ${({ theme }) => theme.red1};
  background-color: ${({ theme }) => theme.red2};
  margin: 15px;
  border-radius: 15px;
`;

export const ErrorText = styled(H1)`
  padding: 10px;
  color: ${({ theme }) => theme.red1};
`;
