import styled from "styled-components";
import Link from "next/link";

const LinkPrototype = ({ as, children, className, href }) => (
  <Link href={href} as={as}>
    <a className={className}>{children}</a>
  </Link>
);

export const NavLink = styled(LinkPrototype)`
  border: 2px solid ${({ theme }) => theme.primaryHoverColor};
  border-radius: 10px;
  background-color: ${({ theme }) => theme.buttonBackgroundColor};
  font-size: ${({ theme }) => theme.typeScale.header4};
  color: ${({ theme }) => theme.secondaryColor};
  align-items: center;
  padding: 12px 24px;
  min-width: 70px;

  text-decoration: none;
  transition: all 0.3s ease-in-out;

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.buttonHoverColor};
    border: 3px solid ${({ theme }) => theme.buttonBackgroundColor};
  }
`;
