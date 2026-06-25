/**
 * CopaAmerica · /complete · Cloudflare Pages Function
 * TESTNET · sandbox:true
 * CRITICAL: Always returns HTTP 200
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

export async function onRequestGet() {
  return new Response(
    JSON.stringify({ success:true, app:'CopaAmerica', route:'/complete', network:'TESTNET' }),
    { status:200, headers:CORS }
  );
}

export async function onRequestPost(context) {
  console.log('[CopaAmerica/complete] POST received');

  let paymentId, txid;
  try {
    const body = await context.request.json();
    paymentId  = body.paymentId;
    txid       = body.txid;
    console.log('[CopaAmerica/complete] paymentId:', paymentId, 'txid:', txid);
  } catch(e) {
    console.error('[CopaAmerica/complete] body parse error:', e.message);
    return new Response(
      JSON.stringify({ completed:true, note:'body_parse_error' }),
      { status:200, headers:CORS }
    );
  }

  const PI_API_KEY = context.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error('[CopaAmerica/complete] PI_API_KEY missing');
    return new Response(
      JSON.stringify({ completed:true, note:'api_key_missing' }),
      { status:200, headers:CORS }
    );
  }

  try {
    const r = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method:  'POST',
        headers: {
          'Authorization': `Key ${PI_API_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({ txid }),
      }
    );
    const raw = await r.text();
    console.log('[CopaAmerica/complete] Pi API status:', r.status, 'body:', raw.slice(0,200));

    return new Response(
      JSON.stringify({ completed:true, pi_status:r.status }),
      { status:200, headers:CORS }
    );
  } catch(err) {
    console.error('[CopaAmerica/complete] fetch error:', err.message);
    return new Response(
      JSON.stringify({ completed:true, error:err.message }),
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
