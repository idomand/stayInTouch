import styled from "styled-components";
import Link from "next/link";

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
  font-weight: 600;
  text-decoration: underline;
  color: ${({ theme }) => theme.blue_2};
  border-bottom: solid 2px transparent;
  transition: all 0.3s;
  &:hover,
  &:focus {
    border-bottom: solid 2px ${({ theme }) => theme.blue_1};
  }
`;

export const NavLink = styled(LinkPrototype)`
  align-items: center;
  transition: all 0.3s;
  font-weight: 500;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  margin: 10px;
  text-decoration: ${({ isActive }) => (isActive ? "underline" : "none")};

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.blue_2};
  }
  @media (${({ theme }) => theme.devices.break1}) {
  }
`;
