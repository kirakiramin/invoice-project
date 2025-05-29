/**
 * ClientRegisterModal 컴포넌트
 *
 * 거래처를 새로 등록하거나 기존 거래처 정보를 수정하는 폼 모달
 * - name은 필수 입력 필드
 * - 초기값 존재 시 '수정', 없으면 '등록' 모드로 동작
 */

"use client";
import {useState, useEffect} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheck} from "@fortawesome/free-solid-svg-icons";

// 거래처 타입 정의
interface Client {
  id: number | null;
  name: string;
  phone: string;
  note?: string;
  isFavorite: boolean;
}

// 모달 컴포넌트 Props 정의
interface ClientRegisterModalProps {
  isOpen: boolean; // 모달 열림 여부
  onCloseAction: () => void; // 모달 닫기 콜백
  onRegisterAction: (client: Client) => void; // 등록/수정 완료 시 호출되는 콜백
  initialData?: Client | null; // 수정 시 기존 거래처 정보
}


const ClientRegisterModal = ({
                               isOpen,
                               onCloseAction,
                               onRegisterAction,
                               initialData,
                             }: ClientRegisterModalProps) => {
  const [id, setId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // 필수값 검증 상태(name만 필수)
  const [errors, setErrors] = useState<{ name: boolean }>({name: false});

  // 모달이 열릴 때 기존 데이터 로드
  useEffect(() => {
    if (initialData) {
      setId(initialData.id ?? null);
      setName(initialData.name);
      setPhone(initialData.phone);
      setNote(initialData.note || "");
      setIsFavorite(initialData.isFavorite);
    } else {
      setId(null);
      setName("");
      setPhone("");
      setNote("");
      setIsFavorite(false);
    }
    // 오류 초기화
    setErrors({name: false});
  }, [initialData, isOpen]);

  //필수값 검증 후 onRegisterAction 콜백 실행
  const handleSubmit = () => {
    if (name.trim() === "") {
      alert("거래처 명은 필수 입력 사항입니다.");
      setErrors({name: true}); // 에러 상태 설정
      return;
    }

    const newClient: Client = {
      id,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
      isFavorite,
    };

    onRegisterAction(newClient);
    onCloseAction();
  };

  return (
    isOpen && (
      <div className="modal-overlay">
        <div className="modal">
          <button onClick={onCloseAction} className="close-btn">✕</button>
          <div className="modal-header">
            <h2 className="under-line">{initialData ? "거래처 정보 수정" : "신규 거래처 등록"}</h2>
          </div>
          <div className="modal-content">
            <div className="wrapper">
              <label>거래처 명</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const value = e.target.value;
                  setName(value);
                  if (value.trim() !== "") {
                    setErrors({name: false}); // 정상 입력 시 에러 제거
                  }
                }}
                placeholder="거래처 명을 입력하세요"
                className={errors.name ? "error" : ""}
              />
            </div>
            <div className="wrapper">
              <label>거래처 전화 번호</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="전화번호를 입력하세요"
              />
            </div>
            <div className="wrapper">
              <label>비고</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="비고 사항을 입력하세요"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button className="default primary" onClick={handleSubmit}>
              <FontAwesomeIcon icon={faCheck} className="icon"/>
              {initialData ? "수정하기" : "등록하기"}
            </button>
          </div>
        </div>
      </div>
    )
  );
}

export default ClientRegisterModal;