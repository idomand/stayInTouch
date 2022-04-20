import styled from "styled-components";
import { H1 } from "../Common/StyledText";

export const MainFormWrapper = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

export const MainHeader = styled(H1)`
  margin: auto;
  padding-top: 10px;
  justify-self: center;
`;

export const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;
