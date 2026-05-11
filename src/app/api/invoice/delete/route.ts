export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE 요청 - 가장 최신 invoice.balance가 0일 때만 clientId 기준 전체 삭제 (Client + 모든 Invoice + InvoiceDetail)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId는 필수입니다." },
        { status: 400 },
      );
    }

    const clientIdNum = Number(clientId);
    if (Number.isNaN(clientIdNum)) {
      return NextResponse.json(
        { error: "유효한 clientId를 입력해주세요." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 가장 최신 invoice 조회 (createDate 내림차순)
      const latestInvoice = await tx.invoice.findFirst({
        where: { clientId: clientIdNum },
        orderBy: { createDate: "desc" },
      });

      // invoice가 없으면 Client만 삭제
      if (!latestInvoice) {
        await tx.client.delete({
          where: { id: clientIdNum },
        });
        return { success: true, message: "거래처가 삭제되었습니다." };
      }

      if (latestInvoice.balance !== 0) {
        return {
          success: false,
          message: "아직 정산되지 않은 잔금이 남아 있어 삭제할 수 없습니다.",
        };
      }

      // 해당 client의 모든 invoice id 조회
      const invoices = await tx.invoice.findMany({
        where: { clientId: clientIdNum },
        select: { id: true },
      });
      const invoiceIds = invoices.map((inv) => inv.id);

      // 1. InvoiceDetail 삭제 (FK)
      if (invoiceIds.length > 0) {
        await tx.invoiceDetail.deleteMany({
          where: { invoiceId: { in: invoiceIds } },
        });
      }

      // 2. Invoice 삭제
      await tx.invoice.deleteMany({
        where: { clientId: clientIdNum },
      });

      // 3. Client 삭제
      await tx.client.delete({
        where: { id: clientIdNum },
      });

      return {
        success: true,
        message: "client 및 관련 데이터가 삭제되었습니다.",
      };
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error deleting client and related data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
