export const runtime = 'nodejs'
import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {Prisma} from '@prisma/client';

// GET 요청 - 특정 Client의 Invoice 리스트 조회 (InvoiceDetail 가격 합계 포함)
export async function GET(req: Request) {
  try {
    const {searchParams} = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({error: 'clientId는 필수입니다.'}, {status: 400});
    }

    const clientIdNum = Number(clientId);

    // LAG()를 사용해 previousBalance 포함한 Invoice 데이터 조회
    const invoices: {
      id: number;
      no: number;
      createDate: Date;
      balance: number;
      previousBalance: number | null;
    }[] = await prisma.$queryRaw`
        SELECT i.id,
               i.no,
               i."createDate",
               i.balance,
               LAG(i.balance) OVER (PARTITION BY i."clientId" ORDER BY i."createDate") AS "previousBalance"
        FROM "Invoice" i
        WHERE i."clientId" = ${clientIdNum}
        ORDER BY i."createDate" DESC
    `;

    // invoiceIds 목록 추출
    const invoiceIds = invoices.map(inv => inv.id);

    // InvoiceDetail 합계 가져오기 (Prisma.sql 및 Prisma.join 사용)
    const totals: { invoiceId: number; total: number }[] = invoiceIds.length > 0
      ? await prisma.$queryRaw<
        { invoiceId: number; total: number }[]
      >(
        Prisma.sql`
            SELECT "invoiceId",
                   SUM(quantity * price) AS total
            FROM "InvoiceDetail"
            WHERE "invoiceId" IN (${Prisma.join(invoiceIds)})
            GROUP BY "invoiceId"
        `
      )
      : [];

    // total 정보와 merge
    const formattedInvoices = invoices.map((invoice) => {
      const totalRaw = totals.find(t => t.invoiceId === invoice.id)?.total ?? 0;
      const total = typeof totalRaw === 'bigint' ? Number(totalRaw) : totalRaw;

      return {
        id: invoice.id,
        no: invoice.no,
        createDate: invoice.createDate,
        balance: invoice.balance,
        previousBalance: invoice.previousBalance ?? 0,
        total,
      };
    });

    return NextResponse.json({invoices: formattedInvoices}, {status: 200});
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}
