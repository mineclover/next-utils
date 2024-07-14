export type NullableString = string | boolean | undefined;

// styleX를 쓸 땐 새로 뽑아야함, styleX는 여러 객체를 생성하기 때문

/**
 * css class 합성 코드
 *
 * @param classNames
 * @returns
 */
export const classComposer = (...classNames: NullableString[]) => {
  return classNames
    .filter((text): text is string => typeof text === "string")
    .map((txt) => txt.trim())
    .join(" ");
};

export const isServer = typeof window === "undefined";
export const isClient = !(typeof window === "undefined");

/** 서버 전용 */
export const SERVER_PUBLIC_URL = isServer
  ? "http://localhost:" + process.env.PORT
  : "";
/** 클라 전용 */
export const CLIENT_PUBLIC_URL = isClient ? window.location.origin : "";

/** 겸용
 *  주의: 서버가 클라의 도메인 주소를 알아야할 때는 적용되지 않음
 */
export const PUBLIC_URL =
  CLIENT_PUBLIC_URL !== "" ? CLIENT_PUBLIC_URL : SERVER_PUBLIC_URL;
