import styled from "styled-components";

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownButton = styled.button`
  background-color: transparent;
  padding: 10px 20px;
  font-size: 16px;
  outline: 0;
  border: 0;
  cursor: pointer;
  &:hover,
  &:focus {
    background-color: transparent;
  }
`;

export const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background-color: ${({ theme }) => theme.white};
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  z-index: 1000;
  overflow: hidden;
`;

export const DropdownItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  color: ${({ theme }) => theme.black};
  font-size: 14px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.grey2};
  }

  &:active {
    background-color: ${({ theme }) => theme.grey3};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.grey2};
  }
`;
