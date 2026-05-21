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

export const WrapperGroupTitle = styled.div`
  margin-top: 12px;
  font-weight: 700;
  color: #1a1a1a;
  font-size: 15px;
`;

export const WrapperSubText = styled.div`
  font-size: 12px;
  color: #666;
  line-height: 1.45;
  margin-top: 6px;
`;

export const WrapperPurposeList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

export const WrapperPurposeChip = styled.button`
  border: 1px solid ${(props) => (props.$isSelected ? "#c6a969" : "rgba(198,169,105,.35)")};
  background: ${(props) => (props.$isSelected ? "rgba(231,215,190,.85)" : "rgba(255,255,255,.85)")};
  color: #2a2a2a;
  border-radius: 999px;
  font-size: 11px;
  padding: 3px 9px;
  cursor: pointer;
`;

export const WrapperSectionTitle = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid ${(props) => (props.$isActive ? "rgba(198,169,105,.44)" : "rgba(198,169,105,.22)")};
  background: ${(props) => (props.$isActive ? "rgba(231,215,190,.78)" : "rgba(255,255,255,.72)")};
  color: #1a1a1a;
  border-radius: 12px;
  padding: 11px 14px;
  font-weight: 600;
  cursor: pointer;
`;

export const WrapperSectionBlock = styled.div`
  padding: 0;
  border: 0;
  background: transparent;
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
