import LoginForm from "@/components/login/LoginForm";

const LoginPage = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>로그인</h2>

        {/* 로그인 입력 폼 컴포넌트 */}
        <LoginForm/>
      </div>
    </div>
  );
};

export default LoginPage;
