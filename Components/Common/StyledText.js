import styled from "styled-components";

export const H1 = styled.h1`
  margin: 0;
  padding: 0;
  font-size: ${({ theme }) => theme.typeScale.header1};
  font-weight: 700;
`;

export const H2 = styled.h2`
  margin: 0;
  padding: 0;
  font-size: ${({ theme }) => theme.typeScale.header2};
  font-weight: 600;
`;

export const H3 = styled.h3`
  margin: 0;
  padding: 0;
  font-size: ${({ theme }) => theme.typeScale.header3};
  font-weight: 500;
`;
export const H4 = styled.h4`
  margin: 0;
  padding: 0;
  font-size: ${({ theme }) => theme.typeScale.header4};
  font-weight: 500;
`;

export const H5 = styled.h5`
  font-weight: 400;
  margin: 0;
  padding: 0;
  font-size: ${({ theme }) => theme.typeScale.header5};
`;

export const P1 = styled.p`
  margin: 0;
  padding: 0;
  font-weight: 500;
  font-size: ${({ theme }) => theme.typeScale.p_large};
`;
export const P2 = styled.p`
  margin: 0;
  padding: 0;
  font-weight: 400;
  font-size: ${({ theme }) => theme.typeScale.p_normal};
`;
export const P3 = styled.p`
  font-family: Inter;
  margin: 0;
  padding: 0;
  font-weight: 500;
  line-height: 22px;
  text-transform: capitalize;
  color: ${({ theme }) => theme.black};
  font-size: ${({ theme }) => theme.typeScale.p_normal};
`;

export const P = styled.p`
  margin: 0;
  padding: 0;
`;
