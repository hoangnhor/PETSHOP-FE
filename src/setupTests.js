// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const matchMediaMock = jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
});

global.matchMedia = matchMediaMock;

const originalConsoleError = console.error;
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((...args) => {
        const firstArg = args[0];
        if (
            typeof firstArg === 'string' &&
            firstArg.includes('ReactDOMTestUtils.act is deprecated in favor of `React.act`')
        ) {
            return;
        }
        originalConsoleError(...args);
    });
});

afterAll(() => {
    if (console.error.mockRestore) {
        console.error.mockRestore();
    }
});
