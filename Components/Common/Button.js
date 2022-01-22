import styled from "styled-components";

export const BasicButton = styled.button.attrs((props) => {
  target: "_self";
})`
  border: 2px solid ${({ theme }) => theme.primaryHoverColor};
  border-radius: 10px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.lightGreen};
  font-size: ${({ theme }) => theme.typeScale.header4};
  color: ${({ theme }) => theme.boldRed};
  text-decoration: none;
  align-items: center;
  padding: 8px 16px;
  min-width: 40px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: ${({ theme }) => theme.buttonHoverColor};
    border: 3px solid ${({ theme }) => theme.lightGreen};
  }
  @media (max-width: 480px) {
    padding: 4px 10px;
    margin: 5px;
    font-size: ${({ theme }) => theme.typeScale.paragraph};
  }
`;

export const NavbarButton = styled(BasicButton)`
  color: ${({ theme }) => theme.boldRed};
  margin: 3px;
  background-color: lightgreen;
`;
