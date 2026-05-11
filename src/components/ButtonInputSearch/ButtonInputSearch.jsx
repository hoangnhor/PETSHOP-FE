import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import InputComponent from '../InputComponent/InputComponent';
import ButtonComponent from '../ButtonComponent/ButtonComponent';

const ButtonInputSearch = (props) => {
    const {
        size,
        placeholder,
        textButton,
        bordered,
        backgroundColorInput = 'rgba(255,255,255,0.84)',
        backgroundColorButton = '#1A1A1A',
        colorButton = '#fff',
        onSearch,
    } = props;

    const [keyword, setKeyword] = useState('');

    const handleInputChange = (e) => {
        setKeyword(e.target.value);
    };

    const handleSearch = () => {
        if (keyword.trim() && onSearch) {
            onSearch(keyword);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && keyword.trim() && onSearch) {
            onSearch(keyword);
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <InputComponent
                size={size}
                placeholder={placeholder}
                value={keyword}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                style={{
                    backgroundColor: backgroundColorInput,
                    height: 46,
                    borderRadius: '14px 0 0 14px',
                    borderColor: 'rgba(198, 169, 105, 0.26)',
                    fontSize: 15
                }}
            />
            <ButtonComponent
                size={size}
                styleButton={{
                    background: backgroundColorButton,
                    border: !bordered && 'none',
                    height: 46,
                    minWidth: 118,
                    borderRadius: '0 14px 14px 0',
                    fontWeight: 600,
                    letterSpacing: '.02em'
                }}
                icon={<SearchOutlined style={{ color: colorButton }} />}
                textButton={textButton}
                styleTextButton={{ color: colorButton }}
                onClick={handleSearch}
            />
        </div>
    );
};

export default ButtonInputSearch;
