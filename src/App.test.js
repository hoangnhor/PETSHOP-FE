import { getItem, isJsonString } from './utils';

test('detects valid json string', () => {
  expect(isJsonString('{"ok":true}')).toBe(true);
  expect(isJsonString('not-json')).toBe(false);
});

test('creates menu item config', () => {
  expect(getItem('Sản phẩm', 'product')).toEqual({
    key: 'product',
    icon: undefined,
    children: undefined,
    label: 'Sản phẩm',
    type: undefined,
  });
});
