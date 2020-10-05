import { createGlobalStyle } from "styled-components";

import JalnanFontTtf from "../assets/fonts/jalnan.ttf";

import NotoSansLightFontEot from "../assets/fonts/NotoSans-Light.eot";
import NotoSansLightFontOtf from "../assets/fonts/NotoSans-Light.otf";
import NotoSansLightFontWoff from "../assets/fonts/NotoSans-Light.woff";
import NotoSansLightFontWoff2 from "../assets/fonts/NotoSans-Light.woff2";

import NotoSansRegularFontEot from "../assets/fonts/NotoSans-Regular.eot";
import NotoSansRegularFontOtf from "../assets/fonts/NotoSans-Regular.otf";
import NotoSansRegularFontWoff from "../assets/fonts/NotoSans-Regular.woff";
import NotoSansRegularFontWoff2 from "../assets/fonts/NotoSans-Regular.woff2";

import NotoSansMediumFontEot from "../assets/fonts/NotoSans-Medium.eot";
import NotoSansMediumFontOtf from "../assets/fonts/NotoSans-Medium.otf";
import NotoSansMediumFontWoff from "../assets/fonts/NotoSans-Medium.woff";
import NotoSansMediumFontWoff2 from "../assets/fonts/NotoSans-Medium.woff2";

import NotoSansBlackFontEot from "../assets/fonts/NotoSans-Black.eot";
import NotoSansBlackFontOtf from "../assets/fonts/NotoSans-Black.otf";
import NotoSansBlackFontWoff from "../assets/fonts/NotoSans-Black.woff";
import NotoSansBlackFontWoff2 from "../assets/fonts/NotoSans-Black.woff2";

// reset css 설정
export const GlobalStyle = createGlobalStyle`
  @font-face {
      font-family: "yg-jalnan";
      src: url(${JalnanFontTtf}) format("truetype");
      font-weight: normal;
      font-style: normal;
  }

  @font-face {
    font-family: "Noto Sans Korean";
    font-weight: 300;
    font-style: normal;
    src: url(${NotoSansLightFontEot}) format("eot"),
    url(${NotoSansLightFontOtf}) format("opentype"),
    url(${NotoSansLightFontWoff}) format("woff"),
    url(${NotoSansLightFontWoff2}) format("woff2");
  }

  @font-face {
    font-family: "Noto Sans Korean";
    font-weight: 400;
    font-style: normal;
    src: url(${NotoSansRegularFontEot}) format("eot"),
    url(${NotoSansRegularFontOtf}) format("opentype"),
    url(${NotoSansRegularFontWoff}) format("woff"),
    url(${NotoSansRegularFontWoff2}) format("woff2");
  }

  @font-face {
  font-family: "Noto Sans Korean";
  font-weight: 500;
  font-style: normal;
  src:url(${NotoSansMediumFontEot}) format("eot"),
  url(${NotoSansMediumFontOtf}) format("opentype"),
  url(${NotoSansMediumFontWoff}) format("woff"),
  url(${NotoSansMediumFontWoff2}) format("woff2");
  }

  @font-face {
    font-family: "Noto Sans Korean";
    font-weight: 700;
    font-style: normal;
    src: url(${NotoSansBlackFontEot}) format("eot"),
    url(${NotoSansBlackFontOtf}) format("opentype"),
    url(${NotoSansBlackFontWoff}) format("woff"),
    url(${NotoSansBlackFontWoff2}) format("woff2");
  }


  *{
    box-sizing:border-box;
  }
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed, 
  figure, figcaption, footer, header, hgroup, 
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure, 
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  body {
    font-family: "Noto Sans Korean", Arial, Helvetica, sans-serif;
  }
  a{
    text-decoration: none;
    color:inherit;
  }
  ol, ul {
    list-style: none;
  }
  blockquote, q {
    quotes: none;
  }
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }
  
  html, body{
    width:100%;
    min-height:100%;
  }
`;
