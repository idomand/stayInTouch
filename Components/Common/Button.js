import styled from "styled-components";

export const BasicButton = styled.button.attrs((props) => {
  target: "_self";
})`
  border: 3px solid ${({ theme }) => theme.primaryHoverColor};
  cursor: pointer;
  background-color: ${({ theme }) => theme.buttonBackgroundColor};
  font-size: ${({ theme }) => theme.typeScale.paragraph};
  color: ${({ theme }) => theme.primaryColorText};
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
    padding: 6px 12px;
    min-width: 20px;
  }
`;

// export const GlowButton = styled.button`
//   display: inline-block;
//   vertical-align: middle;
//   -webkit-transform: perspective(1px) translateZ(0);
//   transform: perspective(1px) translateZ(0);
//   box-shadow: 0 0 1px rgba(0, 0, 0, 0);
//   -webkit-transition-duration: 0.3s;
//   transition-duration: 0.3s;
//   -webkit-transition-property: background;
//   transition-property: background;
//   box-shadow: inset 0 0 0 4px #e1e1e1, 0 0 1px rgba(0, 0, 0, 0);
//   /* Hack to improve aliasing on mobile/tablet devices */
// }
// &:hover, &:focus, &:active {
//   background: blue;

// `;
