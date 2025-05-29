import {Suspense} from "react";
import EditInvoiceClient from "@/components/clientDetail/EditInvoiceClient";

// dynamic rendering을 강제로 활성화 (SSR이 항상 실행되도록 설정)
export const dynamic = 'force-dynamic';

const EditInvoicePage = () => {
  return (
    <>
      {/* 거래처 인보이스 수정용 컴포넌트 */}
      <Suspense fallback={<p>로딩 중</p>}>
        <EditInvoiceClient/>
      </Suspense>
    </>
  );
};

export default EditInvoicePage;
