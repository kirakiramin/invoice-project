import {Suspense} from 'react';
import OrderHistoryClient from "@/components/history/OrderHistoryClient";


// dynamic rendering을 강제로 활성화 (SSR이 항상 실행되도록 설정)
export const dynamic = 'force-dynamic';

const OrderHistoryPage = () => {
  return (
    <>
      {/* 주문 내역 리스트를 보여주는 클라이언트 컴포넌트 */}
      <Suspense fallback={<p>로딩 중</p>}>
        <OrderHistoryClient/>
      </Suspense>
    </>
  );
};

export default OrderHistoryPage;
