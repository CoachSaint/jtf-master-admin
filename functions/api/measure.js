// Cloudflare Pages Function proxy for RoofTrue Live Measurement
// Bypasses browser CORS by fetching server-side

export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight if any
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  }

  try {
    let address = "";
    if (request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      address = body.address || "";
    } else {
      const url = new URL(request.url);
      address = url.searchParams.get("address") || "";
    }

    if (!address) {
      return new Response(JSON.stringify({ ok: false, error: "Address is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const res = await fetch("https://quote.jtfhomegroup.com/api/quote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "JTF-Master-Admin/1.0",
      },
      body: JSON.stringify({ address }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e.message || e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
