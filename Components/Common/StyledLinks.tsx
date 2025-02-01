import styled from "styled-components";
import Link from "next/link";
import React from "react";

interface LinkPrototypeProps {
  as?: any;
  children?: React.ReactNode;
  className?: string;
  href: string; // Made required
  target?: string;
}

export const LinkPrototype = ({
  as,
  children,
  className,
  href,
  target,
}: LinkPrototypeProps) => (
  <Link href={href} as={as} legacyBehavior>
    <a target={target} className={className}>
      {children}
    </a>
  </Link>
);

export const BasicLink = styled(LinkPrototype).attrs(() => ({
  target: "_blank",
}))`
  font-weight: 600;
  text-decoration: underline;
  color: ${({ theme }) => theme.blue2};
  border-bottom: solid 2px transparent;
  transition: all 0.3s;
  
  &:hover,
  &:focus {
    border-bottom: solid 2px ${({ theme }) => theme.blue1};
  }
`;

type NavLinkProps = {
  isActive: boolean;
};

export const NavLink = styled(LinkPrototype)<NavLinkProps>`
  align-items: center;
  transition: all 0.3s;
  font-weight: 500;
  font-size: ${({ theme }) => theme.typeScale.p_large};
  margin: 10px;
  text-decoration: ${({ isActive }) => (isActive ? "underline" : "none")};

  &:hover,
  &:focus {
    color: ${({ theme }) => theme.blue2};
  }
  
  @media (${({ theme }) => theme.devices.break1}) {
    /* Responsive styles */
  }
`;