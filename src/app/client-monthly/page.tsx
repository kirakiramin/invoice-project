import HeaderHome from "@/components/header/HeaderHome";
import ClientAmountSection from "@/components/common/ClientAmountSection";
import { getClientSales } from "@/utils/api";
import { getMonthsSince } from "@/utils/getMonthsSince";

// 클라이언트 매출 정보를 정의하는 인터페이스
interface ClientSales {
  clientId: number;
  name: string;
  phone?: string;
  latestDate: string;
  totalSales: number | string;
}

// 오늘 날짜 기준으로 "YYYY-MM" 형식의 문자열을 생성하는 함수
const getTodayMonth = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const ClientMonthlyPage = async () => {
  // 현재 월과 기준월("2025-06")부터의 누적 월 목록 계산
  const currentMonth = getTodayMonth();
  const months = getMonthsSince("2025-06");

  let clients: ClientSales[] = [];

  try {
    // 현재 월 기준 매출 데이터 fetch
    clients = await getClientSales(currentMonth);
  } catch (error) {
    // fetch 실패 시 콘솔 출력만 하고 빈 배열 유지
    console.error("초기 매출 데이터 불러오기 실패:", error);
  }

  // UI에서 사용할 형태로 가공
  const tableData = clients.map((item) => ({
    clientId: item.clientId,
    name: item.name,
    phone: item.phone,
    latestDate: item.latestDate,
    amount: Number(item.totalSales),
  }));

  // 총 매출 합계 계산
  const totalSalesSum = tableData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <HeaderHome />
      <main className="site-content">
        <div className="container">
          <ClientAmountSection
            data={tableData}
            label="매출"
            initTotalAmount={totalSalesSum}
            initialMonth={currentMonth}
            months={months}
          />
        </div>
      </main>
    </>
  );
};

export default ClientMonthlyPage;
