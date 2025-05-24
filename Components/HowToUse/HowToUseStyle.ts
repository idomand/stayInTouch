import styled from "styled-components";
import { LinkPrototype } from "../Common/StyledLinks";

export const HowToUseLink = styled(LinkPrototype)`
  text-align: center;
  font-size: ${({ theme }) => theme.typeScale.header2};
  padding: 5px;
  width: 40px;
  height: 40px;
  margin: 10px;
  margin-right: 60px;
  background-color: ${({ theme }) => theme.white};
  border: solid 1px ${({ theme }) => theme.black};
  color: ${({ theme }) => theme.black};
  border-radius: 20px;
  &:hover,
  &:focus {
    color: ${({ theme }) => theme.black};
    background-color: ${({ theme }) => theme.green3};
    &:after {
      content: "How to Use";
      font-size: ${({ theme }) => theme.typeScale.p_small};
      display: flex;
      border-style: solid;
      border-color: red transparent;
      z-index: 5;
      position: absolute;
      right: 110px;
      top: 18px;
    }
  }
  @media (${({ theme }) => theme.devices.break1}) {
    margin-right: 5px;
    &:hover,
    &:focus {
      &:after {
        content: "";
        display: none;
      }
    }
  }
`;
