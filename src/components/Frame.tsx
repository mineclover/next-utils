import { isClient } from "@/utils";

import React, { ComponentProps, JSX, useEffect } from "react";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type TestProps = {
  hello: 0;
  check: "hello";
  children?: React.ReactNode | string;
};

const PPP = (props: TestProps) => {
  return <div>PPP</div>;
};

// JSX.IntrinsicElements type
const tagMap = {
  a: "a",
  abbr: "abbr",
  address: "address",
  area: "area",
  article: "article",
  aside: "aside",
  audio: "audio",
  b: "b",
  base: "base",
  bdi: "bdi",
  bdo: "bdo",
  big: "big",
  blockquote: "blockquote",
  body: "body",
  br: "br",
  button: "button",
  canvas: "canvas",
  caption: "caption",
  center: "center",
  cite: "cite",
  code: "code",
  col: "col",
  colgroup: "colgroup",
  data: "data",
  datalist: "datalist",
  dd: "dd",
  del: "del",
  details: "details",
  dfn: "dfn",
  dialog: "dialog",
  div: "div",
  dl: "dl",
  dt: "dt",
  em: "em",
  embed: "embed",
  fieldset: "fieldset",
  figcaption: "figcaption",
  figure: "figure",
  footer: "footer",
  form: "form",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  head: "head",
  header: "header",
  hgroup: "hgroup",
  hr: "hr",
  html: "html",
  i: "i",
  iframe: "iframe",
  img: "img",
  input: "input",
  ins: "ins",
  kbd: "kbd",
  keygen: "keygen",
  label: "label",
  legend: "legend",
  li: "li",
  link: "link",
  main: "main",
  map: "map",
  mark: "mark",
  menu: "menu",
  menuitem: "menuitem",
  meta: "meta",
  meter: "meter",
  nav: "nav",
  noindex: "noindex",
  noscript: "noscript",
  object: "object",
  ol: "ol",
  optgroup: "optgroup",
  option: "option",
  output: "output",
  p: "p",
  param: "param",
  picture: "picture",
  pre: "pre",
  progress: "progress",
  q: "q",
  rp: "rp",
  rt: "rt",
  ruby: "ruby",
  s: "s",
  samp: "samp",
  search: "search",
  slot: "slot",
  script: "script",
  section: "section",
  select: "select",
  small: "small",
  source: "source",
  span: "span",
  strong: "strong",
  style: "style",
  sub: "sub",
  summary: "summary",
  sup: "sup",
  table: "table",
  template: "template",
  tbody: "tbody",
  td: "td",
  textarea: "textarea",
  tfoot: "tfoot",
  th: "th",
  thead: "thead",
  time: "time",
  title: "title",
  tr: "tr",
  track: "track",
  u: "u",
  ul: "ul",
  // prettier-ignore
  "var": 'var',
  video: "video",
  wbr: "wbr",
  webview: "webview",

  // SVG
  svg: "svg",
  animate: "animate",
  animateMotion: "animateMotion",
  animateTransform: "animateTransform",
  circle: "circle",
  clipPath: "clipPath",
  defs: "defs",
  desc: "desc",
  ellipse: "ellipse",
  feBlend: "feBlend",
  feColorMatrix: "feColorMatrix",
  feComponentTransfer: "feComponentTransfer",
  feComposite: "feComposite",
  feConvolveMatrix: "feConvolveMatrix",
  feDiffuseLighting: "feDiffuseLighting",
  feDisplacementMap: "feDisplacementMap",
  feDistantLight: "feDistantLight",
  feDropShadow: "feDropShadow",
  feFlood: "feFlood",
  feFuncA: "feFuncA",
  feFuncB: "feFuncB",
  feFuncG: "feFuncG",
  feFuncR: "feFuncR",
  feGaussianBlur: "feGaussianBlur",
  feImage: "feImage",
  feMerge: "feMerge",
  feMergeNode: "feMergeNode",
  feMorphology: "feMorphology",
  feOffset: "feOffset",
  fePointLight: "fePointLight",
  feSpecularLighting: "feSpecularLighting",
  feSpotLight: "feSpotLight",
  feTile: "feTile",
  feTurbulence: "feTurbulence",
  filter: "filter",
  foreignObject: "foreignObject",
  g: "g",
  image: "image",
  line: "line",
  linearGradient: "linearGradient",
  marker: "marker",
  mask: "mask",
  metadata: "metadata",
  mpath: "mpath",
  path: "path",
  pattern: "pattern",
  polygon: "polygon",
  polyline: "polyline",
  radialGradient: "radialGradient",
  rect: "rect",
  set: "set",
  stop: "stop",
  switch: "switch",
  symbol: "symbol",
  text: "text",
  textPath: "textPath",
  tspan: "tspan",
  use: "use",
  view: "view",
} as const;

// 여기에 확장할 코드 작성
const extendsComponent = {
  test: PPP,
} as const;

const obj = { ...tagMap, ...extendsComponent };

type TagList = Prettify<keyof JSX.IntrinsicElements>;
type ExtendsList = keyof typeof extendsComponent;
type Tags = keyof (typeof tagMap & typeof extendsComponent);

// 함수의 첫 번째 매개변수 타입을 추출하는 유틸리티 타입
type FirstParameter<T extends (...args: any) => any> = T extends (
  first: infer P,
  ...args: any
) => any
  ? P
  : never;

type ExtractProps<T, K extends keyof T> = T[K] extends (props: infer P) => any
  ? P
  : never;

// 사용 예시
type TestPropsType = FirstParameter<(typeof obj)["test"]>;

// 기본적인 html 키는 원래 쓰이던대로 사용하고 확장된 컴포넌트는 해당 컴포넌트에서
type ConditionalType<T extends Tags> = T extends TagList
  ? JSX.IntrinsicElements[T]
  : T extends ExtendsList
  ? ExtractProps<typeof extendsComponent, T>
  : never;

type Props<T extends Tags> = ConditionalType<T> & {
  tagName: T;
};

/**
 * tagName 으로 객체 제어
 * @param param0
 * @returns
 */
const Frame = <T extends Tags>({ tagName, children, ...props }: Props<T>) => {
  const Tag = obj[tagName];

  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.count("frame debug");
    console.log(isClient && window.location.toString(), tagName, props);
  }

  return <Tag {...(props as any)}>{children}</Tag>;
};

export default Frame;
