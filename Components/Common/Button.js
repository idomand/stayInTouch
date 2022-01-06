import styled from "styled-components";

export const BasicButton = styled.button.attrs((props) => {
  target: "_self";
})`
  border: 2px solid ${({ theme }) => theme.primaryHoverColor};
  border-radius: 10px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.buttonBackgroundColor};
  font-size: ${({ theme }) => theme.typeScale.header4};
  color: ${({ theme }) => theme.secondaryColor};
  text-decoration: none;
  align-items: center;
  padding: 12px 24px;
  min-width: 70px;
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    background-color: ${({ theme }) => theme.buttonHoverColor};
    border: 3px solid ${({ theme }) => theme.buttonBackgroundColor};
  }
  @media (max-width: 480px) {
    padding: 4px 10px;
    min-width: 60px;
    margin: 5px;
    font-size: ${({ theme }) => theme.typeScale.paragraph};
  }
`;
