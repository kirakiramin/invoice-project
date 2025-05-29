/**
 * HeaderDetailClient 컴포넌트
 *
 * 클라이언트 측에서 URL 쿼리 파라미터를 통해 거래처 정보를 받아
 * HeaderDetail 컴포넌트에 전달하는 래퍼 컴포넌트
 *
 * - URL 쿼리에서 거래처 이름(name)과 ID(id)를 추출
 * - HeaderDetail에 props로 넘겨주어 동적으로 헤더를 구성함
 */

"use client";
import {useSearchParams} from "next/navigation";
import HeaderDetail from "@/components/header/HeaderDetail";


const HeaderDetailClient = () => {
  const searchParams = useSearchParams();

  // 쿼리에서 name과 clientId 값 추출
  const clientName = searchParams.get("name") || ""; //거래처명
  const clientId = Number(searchParams.get("clientId") || 1); //거래처 ID

  return <HeaderDetail clientName={clientName} clientId={clientId}/>;
};

export default HeaderDetailClient;