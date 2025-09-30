// Mock for styled-jsx to prevent React context issues during SSR
const React = require('react');

const StyleSheetRegistry = () => null;

const StyleRegistry = ({ children }) => children;

const JSXStyle = () => null;

module.exports = JSXStyle;
module.exports.StyleRegistry = StyleRegistry;
module.exports.StyleSheetRegistry = StyleSheetRegistry;
module.exports.flush = () => [];
module.exports.default = JSXStyle;