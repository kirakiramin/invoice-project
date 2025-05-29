/**
 * ProductAmountSection 컴포넌트
 *
 * 상품별 월별 판매 데이터를 요약하고 표로 출력하는 클라이언트 컴포넌트
 * - 초기 SSR 데이터 기반으로 렌더링하고, 월 변경 시 실시간 fetch 및 정렬 적용
 * - 사용자는 품목명 / 수량 / 판매금액 기준으로 정렬할 수 있음
 * - 프린트 기능을 제공하며, 인쇄 시 프린트 영역만 추출하여 출력 가능
 * - 내부적으로 ProductAmountTable, AmountSummary 컴포넌트를 사용
 */

"use client";
import React, {useRef, useState, useEffect} from "react";
import ProductAmountTable from "@/components/common/ProductAmountTable";
import AmountSummary from "@/components/common/AmountSummary";
import {getMonthlySales} from "@/utils/api";

// 판매 데이터 타입 정의
interface ProductSalesRow {
  itemId: number;
  name: string;
  spec?: string;
  quantity: number;
  amount: number;
}

// props 타입 정의
interface ProductAmountProps {
  data: ProductSalesRow[];
  months: string[];
  label: string;
  initialMonth: string;
}


const ProductAmountSection = ({data, months, label, initialMonth}: ProductAmountProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [availableMonths, setAvailableMonths] = useState(months);
  const [sortKey, setSortKey] = useState<"name" | "quantity" | "amount">("quantity");
  const [productData, setProductData] = useState<ProductSalesRow[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // 정렬 로직 (정렬 키에 따라 분기)
  const sortByKey = (data: ProductSalesRow[], key: typeof sortKey) => {
    return [...data].sort((a, b) => {
      if (key === "name") return a.name.localeCompare(b.name); // 이름 기준 오름차순
      return b[key] - a[key]; // 수량/판매금액 내림차순
    });
  };

  // 정렬 + 총합 계산 후 상태 반영
  const applySort = (data: ProductSalesRow[], key: typeof sortKey) => {
    const sorted = sortByKey(data, key);
    setProductData(sorted);
    setTotalAmount(sorted.reduce((sum, item) => sum + item.amount, 0));
  };

  // 초기 렌더링 시 정렬 적용
  useEffect(() => {
    const initialData = data.map((item, idx) => ({...item, itemId: idx + 1}));
    applySort(initialData, sortKey);
  }, []);

  // 월 선택 시 데이터 fetch + 정렬 적용
  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);

    try {
      const res = await getMonthlySales(month);
      const newData: ProductSalesRow[] = res.map((item: Omit<ProductSalesRow, "itemId">, idx: number): ProductSalesRow => ({
        itemId: idx + 1,
        ...item,
      }));
      applySort(newData, sortKey);

      if (!availableMonths.includes(month)) {
        setAvailableMonths((prev) => [...prev, month]);
      }
    } catch (e) {
      console.error("월별 판매 데이터 불러오기 실패:", e);
    }
  };

  // 정렬 버튼 클릭 시
  const handleSortChange = (field: typeof sortKey) => {
    setSortKey(field);
    applySort(productData, field);
  };

  // "YYYY-MM" → "M월"
  const formatMonthOnly = (month?: string) => {
    if (!month) return "";
    const [, m] = month.split("-");
    return `${parseInt(m, 10)}월`;
  };

  // 라벨용 텍스트 생성
  const dynamicLabel = selectedMonth ? `${formatMonthOnly(selectedMonth)} ${label}` : label;

  // 인쇄 처리
  const handlePrint = () => {
    if (!printRef.current) return;

    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="main-wrapper">
      <div className="amount-wrapper">
        {/* 프린트 대상 영역 */}
        <div ref={printRef} className="amount-list">
          <ProductAmountTable data={productData} amountLabel={dynamicLabel}/>
        </div>

        {/* 요약 및 컨트롤 */}
        <AmountSummary
          total={totalAmount}
          label={label}
          months={availableMonths}
          selectedMonth={selectedMonth}
          sortKey={sortKey}
          onPrintClick={handlePrint}
          onMonthChange={handleMonthChange}
          onSortChange={handleSortChange}
        />
      </div>
    </div>
  );
};

export default ProductAmountSection;
