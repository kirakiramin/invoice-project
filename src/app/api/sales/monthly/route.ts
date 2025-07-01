// app/api/sales/goods/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma'; // prisma 인스턴스 경로 확인 필요

export async function GET(req: NextRequest) {
  try {
    const {searchParams} = new URL(req.url);
    const monthParam = searchParams.get('month'); // '2025-05' 형태

    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json({error: 'Invalid or missing `month` query param (format: YYYY-MM)'}, {status: 400});
    }

    const [year, month] = monthParam.split('-').map(Number);
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 1); // 다음 달 1일

    const results = await prisma.$queryRaw<
      {
        name: string;
        spec: string;
        quantity: number;
        amount: number;
      }[]
    >`
        SELECT TRIM(id.name)               AS name,
               TRIM(id.spec)               AS spec,
               SUM(id.quantity)            AS quantity,
               SUM(id.quantity * id.price) AS amount
        FROM "InvoiceDetail" AS id
                 INNER JOIN "Invoice" AS i ON i.id = id."invoiceId"
        WHERE i."createDate" + interval '9 hours' >= ${fromDate}
          AND i."createDate" + interval '9 hours'
            < ${toDate}
          AND id.name != '전잔금'
        GROUP BY TRIM (id.name), TRIM (id.spec)
    `;

    const response = results.map((item) => ({
      name: item.name,
      spec: item.spec,
      quantity: Number(item.quantity) ?? 0,
      amount: Number(item.amount) ?? 0,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('[INVOICE SUMMARY ERROR]', error);
    return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
  }
}