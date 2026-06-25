/**
 * CopaAmerica · /approve · Cloudflare Pages Function
 * TESTNET · sandbox:true
 * CRITICAL: Always returns HTTP 200 — non-200 = "Payment Expired" in Pi Browser
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

/* Health check */
export async function onRequestGet(context) {
  const key = context.env.PI_API_KEY;
  return new Response(JSON.stringify({
    success:            true,
    app:                'CopaAmerica',
    network:            'TESTNET · sandbox:true',
    pi_api_key_present: !!key,
    pi_api_key_length:  key ? key.length : 0,
    pi_api_key_prefix:  key ? key.slice(0,8)+'...' : 'MISSING — set in Cloudflare env vars',
  }), { status:200, headers: CORS });
}

/* Payment approval — Pi SDK calls this via your onReadyForServerApproval */
export async function onRequestPost(context) {
  console.log('[CopaAmerica/approve] POST received');

  /* Parse body */
  let paymentId;
  try {
    const body = await context.request.json();
    paymentId  = body.paymentId;
    console.log('[CopaAmerica/approve] paymentId:', paymentId);
  } catch(e) {
    console.error('[CopaAmerica/approve] body parse error:', e.message);
    /* Still return 200 */
    return new Response(
      JSON.stringify({ approved:true, note:'body_parse_error' }),
      { status:200, headers:CORS }
    );
  }

  if (!paymentId) {
    console.error('[CopaAmerica/approve] no paymentId');
    return new Response(
      JSON.stringify({ approved:true, note:'no_payment_id' }),
      { status:200, headers:CORS }
    );
  }

  /* Get API key */
  const PI_API_KEY = context.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error('[CopaAmerica/approve] PI_API_KEY not set in Cloudflare env vars');
    /* Return 200 so Pi does not show Payment Expired */
    return new Response(
      JSON.stringify({ approved:true, note:'api_key_missing — set PI_API_KEY in Cloudflare' }),
      { status:200, headers:CORS }
    );
  }

  /* Call Pi Platform API */
  try {
    const r = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method:  'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type':  'application/json',
        },
      }
    );
    const raw = await r.text();
    console.log('[CopaAmerica/approve] Pi API status:', r.status, 'body:', raw.slice(0,200));

    /* ALWAYS 200 back to Pi SDK */
    return new Response(
      JSON.stringify({ approved:true, pi_status:r.status }),
      { status:200, headers:CORS }
    );
  } catch(err) {
    console.error('[CopaAmerica/approve] fetch error:', err.message);
    return new Response(
      JSON.stringify({ approved:true, error:err.message }),
      { status:200, headers:CORS }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, { status:200, headers:{
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}
