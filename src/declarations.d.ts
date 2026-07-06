// HTML partials are imported as raw strings (webpack asset/source).
declare module '*.html' {
  const content: string;
  export default content;
}
