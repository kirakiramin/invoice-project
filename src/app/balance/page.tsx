import React from "react";
import HeaderHome from "@/components/header/HeaderHome";
import {getClientBalance} from "@/utils/api";
import ClientAmountSection from "@/components/common/ClientAmountSection";

// API로부터 수신하는 잔금 데이터 타입 정의
interface ClientBalance {
  clientId: number;
  name: string;
  phone?: string;
  latestInvoiceDate: string;
  balance: number;
}

const BalancePage = async () => {
  const rawData: ClientBalance[] = await getClientBalance().catch((error) => {
    console.error("잔금 데이터 불러오기 실패:", error);
    return []; // fallback to empty array
  });

  // 잔액이 0원 초과인 고객만 필터링 후, 화면에 표시할 구조로 가공
  const tableData = rawData
    .filter(client => client.balance > 0)
    .map(client => ({
      clientId: client.clientId,
      name: client.name,
      phone: client.phone,
      latestDate: client.latestInvoiceDate,
      amount: client.balance,
    }));

  // 초기 총 잔금 합계 계산
  const initTotalAmount = tableData.reduce((sum, client) => sum + client.amount, 0);

  return (
    <>
      <HeaderHome/>
      <main className="site-content">
        <div className="container">
          <ClientAmountSection
            data={tableData}
            initTotalAmount={initTotalAmount}
            label="잔금"
            months={[]}
          />
        </div>
      </main>
    </>
  );
};

export default BalancePage;
