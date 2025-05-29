/**
 * ClientAmountSection 컴포넌트
 *
 * 거래처별 월별 매출 데이터를 표와 요약 형식으로 보여주는 클라이언트 컴포넌트
 * - 초기 데이터는 SSR로 전달되며, 월 변경 시 실시간으로 데이터를 fetch하여 갱신
 * - 선택된 월에 따라 총 매출 합계 및 거래처별 매출 데이터를 보여줌
 * - 프린트 기능, 월 변경, 선택 월 목록 관리 기능을 포함
 * - 내부적으로 ClientAmountTable, AmountSummary 컴포넌트를 사용
 */

"use client";
import React, {useRef, useState, useEffect} from "react";
import ClientAmountTable from "@/components/common/ClientAmountTable";
import AmountSummary from "@/components/common/AmountSummary";
import {getClientSales} from "@/utils/api";

// API로부터 받아오는 원본 데이터 형태
interface ClientSales {
  clientId: number;
  name: string;
  phone?: string;
  latestDate: string;
  totalSales: number | string;
}

// 내부에서 사용하는 변환된 데이터 타입
interface ClientRow {
  clientId: number;
  name: string;
  phone?: string;
  latestDate: string;
  amount: number;
}

// 부모 컴포넌트로부터 전달받는 props 타입 정의
interface ClientAmountProps {
  data: ClientRow[];              // 초기 데이터 (SSR로 전달됨)
  initTotalAmount: number;        // 초기 총액
  label: string;                  // 지표명 (예: "매출")
  months: string[];               // 선택 가능한 월 목록
  initialMonth?: string;          // 초기 선택 월
}


const ClientAmountSection = ({
                               data,
                               initTotalAmount,
                               label,
                               months,
                               initialMonth,
                             }: ClientAmountProps) => {
  const printRef = useRef<HTMLDivElement>(null); // 프린트 대상 영역 참조
  const [selectedMonth, setSelectedMonth] = useState(initialMonth ?? "");
  const [clientData, setClientData] = useState<ClientRow[]>(data);
  const [totalAmount, setTotalAmount] = useState(initTotalAmount);
  const [availableMonths, setAvailableMonths] = useState<string[]>(months);

  // 선택된 월이 목록에 없으면 추가 (월 변경으로 인해 새로 조회된 경우)
  useEffect(() => {
    if (!availableMonths.includes(selectedMonth)) {
      setAvailableMonths((prev) => [...prev, selectedMonth]);
    }
  }, [selectedMonth, availableMonths]);


  // 월 변경 시 새로운 데이터 fetch + 상태 갱신
  const handleMonthChange = async (month: string) => {
    setSelectedMonth(month);

    try {
      const res = await getClientSales(month);
      const newData = res.map((item: ClientSales) => ({
        clientId: item.clientId,
        name: item.name,
        phone: item.phone,
        latestDate: item.latestDate,
        amount: Number(item.totalSales),
      }));

      const newTotal = newData.reduce((sum: number, cur: ClientRow) => sum + cur.amount, 0);

      setClientData(newData);
      setTotalAmount(newTotal);

      // 월 목록 업데이트 (중복 방지)
      if (!availableMonths.includes(month)) {
        setAvailableMonths((prev) => [...prev, month]);
      }
    } catch (e) {
      console.error("월별 매출 데이터 불러오기 실패:", e);
    }
  };

  // "2025-04" → "4월" 형태로 변환
  const formatMonthOnly = (month?: string) => {
    if (!month) return "";
    const [, m] = month.split("-");
    return `${parseInt(m, 10)}월`;
  };

  // 선택된 월을 포함한 동적 라벨 생성
  const dynamicLabel = selectedMonth ? `${formatMonthOnly(selectedMonth)} ${label}` : label;

  // 프린트 기능 처리
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
    <>
      <div className="main-wrapper">
        <div className="amount-wrapper">
          {/* 프린트 대상 영역 */}
          <div ref={printRef} className="amount-list">
            <ClientAmountTable data={clientData} amountLabel={dynamicLabel}/>
          </div>

          {/* 요약 및 컨트롤 */}
          <AmountSummary
            total={totalAmount}
            label={label}
            months={availableMonths}
            onPrintClick={handlePrint}
            onMonthChange={handleMonthChange}
            selectedMonth={availableMonths.length > 0 ? selectedMonth : undefined}
          />
        </div>
      </div>
    </>

  );
};

export default ClientAmountSection;
