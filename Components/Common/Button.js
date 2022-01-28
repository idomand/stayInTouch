import styled from "styled-components";

//*============================================================================================================
//?============================================================================================================

export const BasicButton = styled.button.attrs((props) => {
  target: "_self";
})`
  background-color: ${({ theme }) => theme.white};
  border: 1.5px solid ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  border-radius: 10px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typeScale.header4};
  text-decoration: none;
  align-items: center;
  padding: 8px 16px;
  min-width: 40px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    color: ${({ theme }) => theme.white};
    background-color: ${({ theme }) => theme.blue4};
    border: 2px solid ${({ theme }) => theme.white};
  }
  @media (max-width: 480px) {
    padding: 4px 10px;
    margin: 5px;
    font-size: ${({ theme }) => theme.typeScale.paragraph};
  }
`;

export const NavbarButton = styled(BasicButton)`
  /* background-color: ${({ theme }) => theme.lightGreen}; ; */
  /* color: ${({ theme }) => theme.boldRed}; */
  /* border:solid 2px ${({ theme }) => theme.lightGreen} ; */
  margin: 3px;
`;
