/**
 * ClientInputForm 컴포넌트
 *
 * 사용자가 인보이스 항목을 직접 입력할 수 있는 입력 폼 UI를 제공하는 컴포넌트
 * - 날짜, 품목 리스트, 입금액, 비고 등 다양한 항목을 입력 가능
 * - 품목 항목은 동적으로 추가 및 삭제할 수 있으며, 과일 자동 입력 기능 제공
 * - 입력값은 유효성 검사를 거쳐 상위 컴포넌트로 전달됨 (setInvoiceData, setIsUpdated 활용)
 * - 입력값에 따라 금액 합계와 한글 변환 결과도 실시간으로 표시
 */

"use client";
import {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAppleWhole, faPlus, faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {InvoiceItem, InvoiceData} from "@/types/common";
import fruitCategories from "@/data/fruitCategories";

// 포커스 가능한 필드만 정의 (total 제외)
type FocusableField = "name" | "spec" | "quantity" | "price";

// ClientInputForm 컴포넌트에 전달되는 props 타입
interface ClientInputFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  setIsUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

// 숫자 포맷팅 함수: 음수 허용하도록
const formatNumber = (value: string) => {
  const cleaned = value.replace(/[^\d-]/g, ""); // 숫자와 마이너스만 허용
  const isNegative = cleaned.startsWith("-");
  const number = cleaned.replace(/-/g, ""); // 마이너스 제거 후 콤마 처리
  const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return isNegative ? `-${formatted}` : formatted;
};

// 숫자를 한글 금액으로 변환하는 함수 (예: 123456 → 십이만삼천사백오십육 원)
const convertToKoreanCurrency = (num: number): string => {
  if (num === 0) return "원";

  const numberText = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  const unitText = ["", "십", "백", "천"];
  const bigUnitText = ["", "만", "억", "조"];

  let result = "";
  let unitIndex = 0;
  let bigUnitIndex = 0;
  let chunk = "";

  while (num > 0) {
    const digit = num % 10;
    if (digit !== 0) {
      let word = numberText[digit] + unitText[unitIndex];
      if (digit === 1 && unitIndex === 1) word = "십";
      chunk = word + chunk;
    }

    unitIndex++;

    if (unitIndex > 3) {
      unitIndex = 0;
      if (chunk !== "") {
        result = chunk + bigUnitText[bigUnitIndex] + " " + result;
      }
      chunk = "";
      bigUnitIndex++;
    }

    num = Math.floor(num / 10);
  }

  if (chunk !== "") {
    result = chunk + bigUnitText[bigUnitIndex] + " " + result;
  }

  return result.replace(/\s+/g, "").trim() + " 원";
};


const ClientInputForm = ({invoiceData, setInvoiceData, setIsUpdated}: ClientInputFormProps) => {
  // 현재 날짜를 기준으로 기본값 설정
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0");
  const currentDay = today.getDate().toString().padStart(2, "0");

  // 확인 여부 상태 (제출 후 true)
  const [isConfirmed, setIsConfirmed] = useState(false);

  // 현재 포커스된 `input`의 index 저장
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // 과일 선택 모달 표시 여부
  const [showFruitOptions, setShowFruitOptions] = useState(false);

  // 입력 폼 상태 초기화
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNumber: invoiceData.invoiceNumber.startsWith("INVOICE-")
      ? invoiceData.invoiceNumber
      : `INVOICE-${invoiceData.invoiceNumber}`,
    year: currentYear,
    month: currentMonth,
    day: currentDay,
    items: Array.from({length: 5}, () => ({
      name: "",
      spec: "",
      quantity: "",
      price: "",
      total: ""
    })),
    payment: "",
    note: "",
  });

  // input 요소들 ref 설정
  const itemRefs = useRef<Array<Partial<Record<FocusableField, HTMLInputElement | null>>>>([]);

  // 외부 상태(invoiceData) 반영
  useEffect(() => {
    setFormData({
      invoiceNumber: invoiceData.invoiceNumber.startsWith("INVOICE-")
        ? invoiceData.invoiceNumber
        : `INVOICE-${invoiceData.invoiceNumber}`,
      year: invoiceData.year || currentYear,
      month: invoiceData.month || currentMonth,
      day: invoiceData.day || currentDay,
      items: invoiceData.items.length > 0
        ? invoiceData.items
        : Array.from({length: 5}, () => ({
          name: "",
          spec: "",
          quantity: "",
          price: "",
          total: ""
        })),
      payment: invoiceData.payment || "",
      note: invoiceData.note || "",
    });
  }, [invoiceData]);

  // 입력값 검증 상태
  const [errors, setErrors] = useState<{ items: boolean[]; month: boolean; day: boolean }>({
    items: new Array(5).fill(false),
    month: false,
    day: false,
  });

  // `input` 포커스 핸들러 (현재 포커스된 `input`의 index를 설정)
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  // `input`에서 Enter 키 입력 시 다음 필드로 포커스 이동
  const handleEnterKey = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    field: FocusableField
  ) => {
    if (e.key !== "Enter") return;

    e.preventDefault();

    const fields: FocusableField[] = ["name", "spec", "quantity", "price"];
    const currentIdx = fields.indexOf(field);

    if (currentIdx < fields.length - 1) {
      const nextField = fields[currentIdx + 1];
      setTimeout(() => {
        itemRefs.current[rowIndex]?.[nextField]?.focus();
      }, 0);
    } else {
      // 마지막 필드(price)일 경우 → 다음 행의 name으로 포커스
      setTimeout(() => {
        const nextRow = rowIndex + 1;
        if (itemRefs.current[nextRow]?.name) {
          itemRefs.current[nextRow].name?.focus();
        }
      }, 0);
    }
  };


  // 과일 옵션 클릭 핸들러 (선택된 과일을 현재 포커스된 항목의 `name` 필드에 입력)
  const handleFruitClick = (fruit: string) => {
    if (focusedIndex === null) return; // 포커스된 input이 없으면 실행 안 함

    setFormData((prev) => {
      const updatedItems = prev.items.map((item, i) =>
        i === focusedIndex ? {...item, name: fruit} : item
      );
      return {...prev, items: updatedItems};
    });
  };

  // 일반 입력 필드 변경 핸들러 (숫자 입력값은 `formatNumber` 적용)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "payment" ? formatNumber(value) : value,
    }));
  };

  // 개별 항목 변경 핸들러 (수량과 가격 변경 시 `total` 자동 계산)
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const formattedValue = field === "quantity" || field === "price"
      ? formatNumber(value)
      : value;

    setFormData((prev) => {
      const updatedItems = prev.items.map((item, i) => {
        if (i === index) {
          const newItem = {...item, [field]: formattedValue};
          const quantity = parseInt(newItem.quantity.replace(/,/g, ""), 10) || 0;
          const price = parseInt(newItem.price.replace(/,/g, ""), 10) || 0;
          const total = quantity * price;

          return {...newItem, total: total.toLocaleString()};
        }
        return item;
      });

      return {...prev, items: updatedItems};
    });

    setErrors((prev) => {
      const newErrors = {...prev};
      newErrors.items[index] = false;
      return newErrors;
    });
  };

  // 항목 삭제 핸들러
  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));

    setErrors((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // 항목 추가 핸들러
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, {name: "", spec: "", quantity: "", price: "", total: ""}],
    }));

    setErrors((prev) => ({
      ...prev,
      items: [...prev.items, false],
    }));
  };

  // 폼 제출 핸들러 (입력값 검증 후 `setInvoiceData` 호출)
  const handleSubmit = () => {
    const monthError = !formData.month.trim();
    const dayError = !formData.day.trim();

    const newErrors = formData.items.map((item) => {
      const hasInput = !!item.name.trim() || !!item.quantity.trim() || !!item.price.trim();
      const isIncomplete = !item.name.trim() || !item.quantity.trim() || !item.price.trim();
      return hasInput && isIncomplete;
    });

    setErrors({items: newErrors, month: monthError, day: dayError});

    if (monthError || dayError || newErrors.includes(true)) {
      alert("입력되지 않은 필드가 있습니다. 확인 후 다시 시도하세요.");
      return;
    }

    setInvoiceData(formData);
    setIsConfirmed(true);
    setIsUpdated(true);
  };

  return (
    <div className="invoice-form">
      {/* 영수증 번호 */}
      <div className="invoice-number">영수증 번호: {formData.invoiceNumber}</div>

      {/* 반영하기 버튼 */}
      <div className="action-buttons">
        <button className={isConfirmed ? "active" : "inactive"} onClick={handleSubmit}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="icon"/>
          반영하기
        </button>
      </div>

      {/* 날짜 입력 */}
      <div className="date-group">
        <span className="year">{formData.year}년</span>
        <input
          type="text"
          name="month"
          placeholder="MM"
          value={formData.month}
          maxLength={2}
          onChange={handleInputChange}
          className={errors.month ? "error-border" : ""}
        />
        <span>월</span>
        <input
          type="text"
          name="day"
          placeholder="DD"
          value={formData.day}
          maxLength={2}
          onChange={handleInputChange}
          className={errors.day ? "error-border" : ""}
        />
        <span>일</span>
      </div>

      <hr className="divider narrow"/>
      <button className="toggle-fruit-btn" onClick={() => setShowFruitOptions(!showFruitOptions)}>
        <FontAwesomeIcon icon={faAppleWhole} className="icon"/>
        {showFruitOptions ? "과일 목록 닫기" : "과일 목록 보기"}
      </button>

      {/* 과일 목록 모달 */}
      {showFruitOptions && (
        <div className="fruit-options">
          <button className="close-btn" onClick={() => setShowFruitOptions(false)}>✕</button>
          {Object.entries(fruitCategories).map(([category, fruits]) => (
            <div key={category} className="fruit-category">
              <h4>{category}</h4>
              <div className="fruit-buttons">
                {fruits.map((fruit) => (
                  <button key={fruit} onClick={() => handleFruitClick(fruit)}>
                    {fruit}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <hr className="divider narrow"/>

      {/* 품목 입력 */}
      <div className=" item-group">
        <div className="input-header">
          <span className="left">No.</span>
          <span>품명</span>
          <span>규격</span>
          <span>수량</span>
          <span>단가</span>
          <span></span>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="input-row">
            <span>{index + 1}</span>
            <input
              type="text"
              placeholder="품명"
              value={item.name}
              className={errors.items[index] && !item.name ? "error-border" : ""}
              ref={(el) => {
                if (!itemRefs.current[index]) itemRefs.current[index] = {};
                itemRefs.current[index].name = el;
              }}
              onKeyDown={(e) => handleEnterKey(e, index, "name")}
              onFocus={() => handleFocus(index)} // 포커스 감지
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="규격"
              value={item.spec}
              ref={(el) => {
                if (!itemRefs.current[index]) itemRefs.current[index] = {};
                itemRefs.current[index].spec = el;
              }}
              onKeyDown={(e) => handleEnterKey(e, index, "spec")}
              onChange={(e) => handleItemChange(index, "spec", e.target.value)}
            />
            <input
              type="text"
              className={`quantity ${errors.items[index] && !item.quantity ? "error-border" : ""}`}
              placeholder="수량"
              value={item.quantity}
              ref={(el) => {
                if (!itemRefs.current[index]) itemRefs.current[index] = {};
                itemRefs.current[index].quantity = el;
              }}
              onKeyDown={(e) => handleEnterKey(e, index, "quantity")}
              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
            />
            <input
              type="text"
              className={`price ${errors.items[index] && !item.price ? "error-border" : ""}`}
              placeholder="단가"
              value={item.price}
              ref={(el) => {
                if (!itemRefs.current[index]) itemRefs.current[index] = {};
                itemRefs.current[index].price = el;
              }}
              onKeyDown={(e) => handleEnterKey(e, index, "price")}
              onChange={(e) => handleItemChange(index, "price", e.target.value)}
            />
            <button className="remove-btn" onClick={() => handleRemoveItem(index)}>✕</button>
          </div>
        ))}

        <button className="add-item" onClick={handleAddItem}>
          <FontAwesomeIcon icon={faPlus} className="icon"/>품목 추가
        </button>
      </div>
      <hr className="divider"/>

      {/* 입금액 & 비고 입력 */}
      <div className="payment-group">
        <label>입금액</label>
        <input
          type="text"
          name="payment"
          placeholder="입금액"
          value={formData.payment}
          onChange={handleInputChange}
        />
        <span className="korean-number">
    {convertToKoreanCurrency(parseInt(formData.payment.replace(/,/g, ""), 10) || 0)}
        </span>
      </div>
      <div className="note-group">
        <label>비고</label>
        <textarea
          name="note"
          placeholder="비고"
          value={formData.note}
          onChange={handleInputChange}
        />
      </div>
      {/* 추가 반영하기 버튼 */}
      <div className="action-buttons-bottom">
        <button className={isConfirmed ? "active" : "inactive"} onClick={handleSubmit}>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="icon"/>
          반영하기
        </button>
      </div>
    </div>
  );
};

export default ClientInputForm;

