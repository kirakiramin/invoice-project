export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

// PUT 요청 - Invoice 수정 + InvoiceDetail 재작성 + Client.balance 갱신
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {id, note, balance, payment, details} = body;

    // 기본 유효성 검사
    if (
      !id ||
      typeof balance !== 'number' ||
      typeof payment !== 'number' ||
      !Array.isArray(details)
    ) {
      return NextResponse.json({error: '올바른 요청 데이터를 제공해야 합니다.'}, {status: 400});
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // 1. Invoice 수정
      const invoice = await tx.invoice.update({
        where: {id},
        data: {
          note: note ?? null,
          balance,
          payment,
          updateDate: new Date(),
        },
      });

      // 2. InvoiceDetail 전부 삭제
      await tx.invoiceDetail.deleteMany({
        where: {invoiceId: id},
      });

      // 3. InvoiceDetail 다시 추가
      if (details.length > 0) {
        await tx.invoiceDetail.createMany({
          data: details.map((detail) => ({
            invoiceId: id,
            name: detail.name,
            spec: detail.spec ?? null,
            quantity: detail.quantity ?? 1,
            price: detail.price ?? 0,
          })),
        });
      }

      // 4. Client.balance 업데이트 (invoice의 clientId 사용)
      await tx.client.update({
        where: {id: invoice.clientId},
        data: {
          balance,
          updateDate: new Date(),
        },
      });

      return invoice;
    });

    return NextResponse.json({invoiceId: updatedInvoice.id}, {status: 200});
  } catch (error) {
    console.error('Error updating invoice with details:', error);
    return NextResponse.json({error: '서버 오류가 발생했습니다.'}, {status: 500});
  }
}