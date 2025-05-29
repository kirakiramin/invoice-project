export async function GET() {
  return new Response(
    JSON.stringify({
      region: process.env.VERCEL_REGION,
    }),
    {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    }
  );
}
