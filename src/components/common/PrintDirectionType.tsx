/**
 * PrintDirection 컴포넌트
 *
 * 프린트 시 적용할 레이아웃 방향에 따라 전용 CSS 파일을 동적으로 `<head>`에 삽입하는 컴포넌트
 * - 클라이언트 컴포넌트로 선언되며, `useEffect`를 통해 한 번만 DOM에 스타일시트를 삽입
 * - `type`이 "landscape" 또는 "portrait"일 경우, 해당하는 프린트 전용 CSS를 삽입
 * - 같은 id의 `<link>`가 이미 존재할 경우 중복 삽입을 방지
 * - 언마운트 시 삽입된 `<link>`를 제거하여 메모리 누수도 방지
 */

"use client";
import {useEffect} from "react";

type PrintDirectionType = "landscape" | "portrait";

interface Props {
  type?: PrintDirectionType; // 기본값은 portrait
}


const PrintDirection = ({type = "portrait"}: Props) => {
  useEffect(() => {
    const id = `print-css-${type}`;
    const href = `/styles/${type}-print.css`;

    // 이미 삽입된 경우 중복 삽입 방지
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    link.media = "print";
    document.head.appendChild(link);

    return () => {
      const el = document.getElementById(id);
      if (el) {
        document.head.removeChild(el);
      }
    };
  }, [type]);

  return null;
};

export default PrintDirection;
