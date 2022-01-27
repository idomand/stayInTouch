import styled from "styled-components";
import Link from "next/link";

//*============================================================================================================
//?============================================================================================================

const LinkPrototype = ({ as, children, className, href }) => (
  <Link href={href} as={as}>
    <a className={className}>{children}</a>
  </Link>
);

export const NavLink = styled(LinkPrototype)`
  border: 2px solid ${({ theme }) => theme.primaryHoverColor};
  border-radius: 10px;
  font-size: ${({ theme }) => theme.typeScale.header4};
  color: ${({ theme }) => theme.boldRed};
  align-items: center;
  padding: 10px 20px;
  margin: 5px;
  min-width: 70px;
  max-width: 120px;
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  text-decoration: ${({ isActive }) => (isActive ? "underline" : "none")};
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.lightGreen : theme.boldGreen};

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.buttonHoverColor};
    border: 2px solid ${({ theme }) => theme.lightGreen};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    padding: 6px 12px;
  }
`;
