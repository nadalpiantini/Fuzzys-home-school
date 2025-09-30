// Mock for styled-jsx to prevent React context issues during SSR and static generation
// This prevents the "Cannot read properties of null (reading 'useContext')" error

// Create a no-op component that doesn't use any React hooks
const JSXStyle = () => null;

// StyleRegistry should pass through children without using React context
const StyleRegistry = ({ children }) => {
  // Return children directly without any React context usage
  return children || null;
};

// StyleSheetRegistry is a no-op
const StyleSheetRegistry = () => null;

// Export everything that styled-jsx might export
module.exports = JSXStyle;
module.exports.default = JSXStyle;
module.exports.StyleRegistry = StyleRegistry;
module.exports.StyleSheetRegistry = StyleSheetRegistry;
module.exports.flush = () => [];
module.exports.css = String.raw;
module.exports.global = String.raw;
module.exports.resolve = () => ({ className: '', styles: '' });