/**
 * HeaderHome 컴포넌트
 *
 * URL 경로에 따라 동적으로 타이틀을 출력하는 공통 헤더 컴포넌트
 * - 경로별 타이틀 매핑 객체 기반으로 유연하게 처리 가능
 * - 매칭되지 않으면 기본값: "현황 페이지"
 */

"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoins,
  faHouse,
  faWallet,
  faWonSign,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const HeaderHome = () => {
  const pathname = usePathname();

  // 경로별 타이틀 매핑
  const titleMap: { [key: string]: string } = {
    "/balance": "거래처 잔금 현황 🐝",
    "/sales-monthly": "한달 기준 판매 현황",
    "/client-monthly": "한달 기준 매출 현황 🌷",
    "/clients": "거래처 숨김 관리",
  };

  // 가장 먼저 일치하는 경로 키 찾기
  const matchedPath = Object.keys(titleMap).find((key) =>
    pathname.startsWith(key),
  );

  // 매칭된 타이틀 없으면 기본값
  const title = matchedPath ? titleMap[matchedPath] : "현황 페이지";

  return (
    <header>
      <div className="container">
        <div className="header_wrapper">
          <h1>{title}</h1>
          <div className="btn-area">
            <Link href="/main" className="primary default">
              <FontAwesomeIcon icon={faHouse} className="icon" />
              홈으로
            </Link>
            <Link href="/balance" className="default">
              <FontAwesomeIcon icon={faWonSign} className="icon" />
              잔금 확인
            </Link>
            <Link href="/client-monthly" className="default">
              <FontAwesomeIcon icon={faWallet} className="icon" />
              매출 현황
            </Link>
            <Link href="/sales-monthly" className="default">
              <FontAwesomeIcon icon={faCoins} className="icon" />
              판매 현황
            </Link>
            <Link href="/clients" className="default">
              <FontAwesomeIcon icon={faUser} className="icon" />
              거래처 관리
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderHome;
