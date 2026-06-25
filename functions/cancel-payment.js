/**
 * CopaAmerica · /cancel-payment · Cloudflare Pages Function
 * TESTNET · sandbox:true
 */

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type':                 'application/json',
};

export async function onRequestPost(context) {
  console.log('[CopaAmerica/cancel-payment] POST received');
  let paymentId;
  try {
    const body = await context.request.json();
    paymentId  = body.paymentId;
  } catch(e) {}

  const PI_API_KEY = context.env.PI_API_KEY;
  if (PI_API_KEY && paymentId) {
    try {
      await fetch(`https://api.minepi.com/v2/payments/${paymentId}/cancel`, {
        method:  'POST',
        headers: { 'Authorization':`Key ${PI_API_KEY}`, 'Content-Type':'application/json' },
      });
    } catch(e) { console.error('[CopaAmerica/cancel]', e.message); }
  }

  return new Response(
    JSON.stringify({ cancelled:true }),
    { status:200, headers:CORS }
  );
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({ success:true, route:'/cancel-payment', network:'TESTNET' }),
    { status:200, headers:CORS }
  );
}

export async function onRequestOptions() {
  return new Response(null, { status:200, headers:{
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }});
}
