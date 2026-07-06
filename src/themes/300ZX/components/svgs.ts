/**
 * SVG markup for the 300ZX theme, for shapes that components build from or
 * that will be used as masks. One-off icons that appear in the dash layout
 * live directly in the .html partials under ../layout/ instead.
 */

export const turnArrowLeft = `
  <svg class="signal" viewBox="0 0 48 48">
    <path d="M46.8,17h-10v-7.5S2.2,23.9,2.2,23.9l34.6,14.6v-7.5s10,0,10,0v-14.1Z"/>
    <path d="M37.3,39.3L.9,23.9l36.4-15.2v7.8s10,0,10,0v15.1h-10v7.8ZM3.5,24l32.8,13.8v-7.2s10,0,10,0v-13.1h-10v-7.2S3.5,24,3.5,24Z"/>
  </svg>`;

export const turnArrowRight = `
  <svg class="signal" viewBox="0 0 48 48">
    <path d="M1.3,16.8v14.1h10v7.5l34.6-14.6L11.3,9.4v7.5H1.3Z"/>
    <path d="M10.8,39.4v-7.8H.8v-15.1h10v-7.8l36.4,15.2-36.4,15.4h0ZM11.8,10.2v7.2H1.8v13.1h10v7.2l32.8-13.8L11.8,10.2Z"/>
  </svg>`;

export const tachBorder = `
  <svg viewBox="0 0 745 283">
    <polygon class="st0" points="743 26.1 743 28.2 743 170.7 743 281 2 281 2 170.7 2 143.4 2 141.3 .8 141.5 0 141.6 0 283 745 283 745 25.8 743 26.1"/>
  </svg>`;

export const tachBorderTop = `
  <svg viewBox="0 0 745 283">
    <path d="M54.3,147c-39.7,0-53.4-3.4-53.6-3.5l.5-1.9c.3,0,33.3,8.3,146.7-1,51.4-7.2,113.2-34.7,178.6-63.9C411,38.9,498.4,0,574,0s169.5,25.8,170.3,26l-.6,1.9c-.8-.3-84.8-26-169.7-26s-162.4,38.9-246.7,76.4c-65.5,29.2-127.5,56.8-179.2,64.1-41,3.4-71.5,4.5-93.8,4.5Z"/>
  </svg>`;
