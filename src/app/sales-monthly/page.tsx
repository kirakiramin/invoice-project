import React from 'react';
import HeaderHome from "@/components/header/HeaderHome";
import ProductAmountSection from "@/components/common/ProductAmountSection";
import {getMonthlySales} from "@/utils/api";
import {getMonthsSince} from "@/utils/getMonthsSince";

interface ItemSales {
  name: string;
  spec?: string;
  quantity: number;
  amount: number;
}

// 오늘 날짜 기준으로 YYYY-MM 문자열 생성
const getTodayMonth = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const SalesMonthlyPage = async () => {
  const currentMonth = getTodayMonth();
  const months = getMonthsSince("2025-06"); // 누적 월 자동 생성
  let salesData = [];

  try {
    // API 호출로 월별 매출 데이터 조회
    salesData = await getMonthlySales(currentMonth);
  } catch (error) {
    console.error("초기 판매 데이터 불러오기 실패:", error);
  }

// 테이블에 전달할 형태로 변환
  const tableData = salesData.map((item: ItemSales, index: number) => ({
    itemId: index + 1,
    name: item.name,
    spec: item.spec,
    quantity: item.quantity,
    amount: item.amount,
  }));


  return (
    <>
      <HeaderHome/>
      <main className="site-content">
        <div className="container">
          <ProductAmountSection
            data={tableData}
            months={months}
            initialMonth={currentMonth}
            label="판매"/>
        </div>
      </main>
    </>
  );
};

export default SalesMonthlyPage;
