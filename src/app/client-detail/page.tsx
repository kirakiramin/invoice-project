import {Suspense} from "react";
import ClientDetail from "@/components/clientDetail/ClientDetail";

// dynamic rendering을 강제로 활성화 (SSR이 항상 실행되도록 설정)
export const dynamic = 'force-dynamic';

const ClientDetailPage = () => {
  return (
    <>
      {/* 거래처 인보이스 입력 & 미리보기 컴포넌트 */}
      <Suspense fallback={<p>로딩 중</p>}>
        <ClientDetail/>
      </Suspense>
    </>
  );
};

export default ClientDetailPage;
