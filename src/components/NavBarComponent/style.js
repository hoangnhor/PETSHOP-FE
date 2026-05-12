import styled from "styled-components";

export const WrapperLableText = styled.h3`
  font-size: 34px;
  font-weight: 700;
  margin: 0 0 14px;
  color:#1A1A1A;
`;

export const WrapperContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const WrapperTextValue = styled.div`
  padding: 12px 14px;
  cursor: pointer;
  background-color: ${(props) => (props.$isSelected ? "rgba(231,215,190,.78)" : "rgba(255,255,255,.72)")};
  color: ${(props) => (props.$isSelected ? "#1A1A1A" : "#555")};
  border:1px solid ${(props) => (props.$isSelected ? "rgba(198,169,105,.44)" : "rgba(198,169,105,.22)")};
  border-radius: 12px;
  transition: all 0.25s ease;
  font-weight:600;

  &:hover {
    background-color: rgba(255,255,255,.95);
    color:#1A1A1A;
    border-color:#C6A969;
  }
`;

export const ContentSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;

  h4 {
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: bold;
  }

  ul {
    list-style-type: disc;
    padding-left: 20px;
  }

  li {
    margin-bottom: 5px;
  }
`;
