export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {Prisma} from '@prisma/client';

// POST 요청 - Invoice 및 InvoiceDetail을 함께 등록
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {no, clientId, balance, note, payment, details} = body;

    if (!no || !clientId || !Array.isArray(details)) {
      return NextResponse.json({error: '올바른 요청 데이터를 제공해야 합니다.'}, {status: 400});
    }

    // 트랜잭션을 사용하여 Invoice 및 InvoiceDetail 저장
    const createdInvoice = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Invoice 생성
      const invoice = await tx.invoice.create({
        data: {
          no,
          clientId,
          note: note ?? null,
          balance: balance ?? 0,
          payment: payment ?? 0,
        },
      });

      // InvoiceDetail 생성
      if (details.length > 0) {
        await tx.invoiceDetail.createMany({
          data: details.map((detail) => ({
            invoiceId: invoice.id,
            name: detail.name,
            spec: detail.spec ?? null,
            quantity: detail.quantity ?? 1,
            price: detail.price ?? 0,
          })),
        });
      }

      // Invoice.balance 값이 있으면 Client의 balance 업데이트
      if (payment && payment > 0) {
        await tx.client.update({
          where: {id: clientId},
          data: {
            balance: balance ?? 0,
            updateDate: new Date(),
          },
        });
      }

      return invoice;
    });

    return NextResponse.json({invoiceId: createdInvoice.id}, {status: 201});
  } catch (error) {
    console.error('Error creating invoice with details:', error);
    return NextResponse.json({error: '서버 오류가 발생했습니다.'}, {status: 500});
  }
}