/**
 * ProductAmountTable 컴포넌트
 *
 * 상품별 판매 데이터를 표 형태로 출력하는 컴포넌트
 * - 품목명, 규격, 수량, 판매금액을 행 단위로 구성하여 시각적으로 정리
 * - amountLabel을 통해 마지막 열 라벨(예: "판매금액")을 동적으로 지정 가능
 * - 수량과 금액은 천 단위로 쉼표 포맷
 * - 규격(spec)이 없는 경우 "-" 표시
 */

import React from "react";

interface ProductSalesRow {
  itemId: number;
  name: string;
  spec?: string;
  quantity: number;
  amount: number;
}

interface ProductAmountProps {
  data: ProductSalesRow[];
  amountLabel: string;
}


const ProductAmountTable = ({data, amountLabel}: ProductAmountProps) => {
  return (
    <div className="table-container">
      <table className="amount-table">
        <thead>
        <tr>
          <th>No</th>
          <th>품목</th>
          <th>규격</th>
          <th>수량</th>
          <th>{amountLabel}</th>
        </tr>
        </thead>
        <tbody>
        {data.map(({itemId, name, spec, quantity, amount}, index) => (
          <tr key={itemId ?? index}>
            <td className="itemId">{index + 1}</td>
            <td className="name">{name}</td>
            <td className="spec">{spec ?? "-"}</td>
            <td className="quantity">{quantity.toLocaleString()}</td>
            <td className="amount">{amount.toLocaleString()} 원</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductAmountTable;
