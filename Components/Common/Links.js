import styled from "styled-components";
import Link from "next/link";

//*============================================================================================================
//?============================================================================================================

export const LinkPrototype = ({ as, children, className, href, target }) => (
  <Link href={href} as={as}>
    <a target={target} className={className}>
      {children}
    </a>
  </Link>
);

export const BasicLink = styled(LinkPrototype).attrs(() => {
  return {
    target: "_blank",
  };
})`
  transition: all 0.3s;

  color: ${({ theme }) => theme.blue4};
  text-decoration: underline;
  /* border-bottom: 2px solid transparent; */

  &:hover,
  &:focus {
    border-bottom: 2px solid ${({ theme }) => theme.blue4};
  }
`;

export const NavLink = styled(LinkPrototype)`
  background-color: ${({ theme, isActive }) =>
    isActive ? theme.white : theme.white};
  color: ${({ theme }) => theme.black};
  border: 2px solid ${({ theme }) => theme.black};
  border-radius: 10px;
  font-size: ${({ theme }) => theme.typeScale.header4};
  align-items: center;
  padding: 10px 20px;
  margin: 5px;
  min-width: 70px;
  max-width: 120px;
  text-decoration: none;
  transition: all 0.3s ease-in-out;
  text-decoration: ${({ isActive }) => (isActive ? "underline" : "none")};

  &:hover,
  &:focus {
    background-color: ${({ theme }) => theme.blue4};
    border: 2px solid ${({ theme }) => theme.white};
    color: ${({ theme }) => theme.white};
  }
  @media (${({ theme }) => theme.devices.break1}) {
    padding: 6px 12px;
  }
`;
