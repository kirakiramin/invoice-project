import {Suspense} from "react";
import HeaderDetailClient from "@/components/header/HeaderDetailClient";
import PrintDirectionType from "@/components/common/PrintDirectionType";

// children으로 하위 페이지 컴포넌트를 감싸는 레이아웃 props
interface LayoutProps {
  children: React.ReactNode;
}

// 상세 페이지용 공통 레이아웃 컴포넌트
const Layout = ({children}: LayoutProps) => {
  return (
    <>
      <PrintDirectionType type="landscape"/>
      <Suspense fallback={<p>로딩 중</p>}>
        <HeaderDetailClient/>
      </Suspense>
      {children}
    </>
  );
};

export default Layout;

