import styled from "styled-components";

//*============================================================================================================
//?============================================================================================================

export const H1 = styled.h1`
  font-size: ${({ theme }) => theme.typeScale.header1};
  color: ${({ theme }) => theme.primaryColorText};
  padding: 0;
  margin: 0;
`;

export const H2 = styled.h3`
  font-size: ${({ theme }) => theme.typeScale.header4};
  color: ${({ theme }) => theme.primaryColorText};
  padding: 0;
  margin: 0;
`;

export const P = styled.p`
  font-size: ${({ theme }) => theme.typeScale.paragraph};
  color: ${({ theme }) => theme.black};
  padding: 0;
  margin: 3px;
`;
