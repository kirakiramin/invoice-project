/**
 * LoginForm 컴포넌트
 *
 * - 고정된 아이디와 입력 비밀번호를 비교하여 로그인 처리
 * - 로그인 성공 시 /main 경로로 이동
 * - 실패 시 에러 메시지 출력
 */

"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {login} from "@/utils/api";

const fixedUserId = "user20"; // 고정 아이디
const fixedPassword = "2020"; // 고정 비밀번호


const LoginForm = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (password === fixedPassword) {
      try {
        await login();
        router.push("/main"); // 로그인 후 이동할 페이지
      } catch {
        setError("로그인에 실패했습니다.");
      }
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <>
      <div className="input-group">
        <label>아이디</label>
        <input type="text" value={fixedUserId} disabled/>
      </div>
      <div className="input-group">
        <label>비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="비밀번호 입력"
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleLogin}>로그인</button>
    </>
  );
};

export default LoginForm;
