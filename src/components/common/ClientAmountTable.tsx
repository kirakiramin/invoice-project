/**
 * ClientAmountTable 컴포넌트
 *
 * 거래처별 금액(잔금 또는 매출) 현황을 표 형태로 출력하는 재사용 가능한 컴포넌트
 * - props로 전달된 거래처 리스트를 금액 기준으로 내림차순 정렬하여 표시
 * - 최근 거래 날짜, 거래처명, 연락처, 금액(amount)을 테이블 형태로 구성
 * - 날짜는 formatDate, 연락처는 formatPhone 유틸 함수로 포맷 처리
 * - 금액 열의 라벨과 강조 색상은 props로 동적으로 제어
 */

import React from 'react';
import {formatDate} from "@/utils/date";
import {formatPhone} from "@/utils/format";

// 공통 타입 정의
interface ClientRow {
  clientId: number;
  name: string;
  phone?: string;
  latestDate: string;
  amount: number; // 잔금 or 매출 공통으로 사용
}

interface AmountTableProps {
  data: ClientRow[];
  amountLabel: string; // 마지막 열 라벨: '잔금' 또는 '매출'
}


const ClientAmountTable = ({data, amountLabel}: AmountTableProps) => {
  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <div className="table-container">
      {/* 테이블 */}
      <table className="amount-table">
        <thead>
        <tr>
          <th>No</th>
          <th>최근 거래 날짜</th>
          <th>거래처 명</th>
          <th>연락처</th>
          <th>{amountLabel}</th>
        </tr>
        </thead>
        <tbody>
        {sortedData.map(({clientId, name, phone, latestDate, amount}, index) => (
          <tr key={clientId}>
            <td className="id">{index + 1}</td>
            <td className="date">{formatDate(latestDate)}</td>
            <td className="store">{name}</td>
            <td className="contact">{phone ? formatPhone(phone) : ''}</td>
            <td className="right">{amount.toLocaleString()} 원</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientAmountTable;
