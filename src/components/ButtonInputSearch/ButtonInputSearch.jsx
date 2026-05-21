import React, { useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import InputComponent from '../InputComponent/InputComponent';

const ButtonInputSearch = (props) => {
    const {
        size,
        placeholder,
        backgroundColorInput = 'rgba(255,255,255,0.84)',
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
                suffix={
                    <SearchOutlined
                        onClick={handleSearch}
                        style={{ color: '#A67C52', fontSize: 18, cursor: 'pointer' }}
                    />
                }
                style={{
                    backgroundColor: backgroundColorInput,
                    height: 46,
                    borderRadius: '14px',
                    borderColor: 'rgba(198, 169, 105, 0.26)',
                    fontSize: 15,
                    paddingRight: 12,
                }}
            />
        </div>
    );
};

export default ButtonInputSearch;
