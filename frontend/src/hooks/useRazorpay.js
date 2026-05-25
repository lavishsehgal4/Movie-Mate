const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'
const BASE = 'http://localhost:5000/api/v1'

function loadScript() {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) { resolve(true); return }
    const s = document.createElement('script')
    s.src = RAZORPAY_SCRIPT
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/**
 * initiatePayment({ show_id, seat_ids, user, movie, theatre, onSuccess, onFailure })
 * 1. Loads Razorpay script
 * 2. Calls create-order API
 * 3. Opens Razorpay popup
 * 4. On payment success → calls verify-payment API
 * 5. Calls onSuccess(bookingId) or onFailure(error)
 */
export async function initiatePayment({ show_id, seat_ids, user, movie, theatre, onSuccess, onFailure }) {
  // 1. load script
  const loaded = await loadScript()
  if (!loaded) { onFailure('Failed to load payment gateway. Check your connection.'); return }

  // 2. create order
  let orderData
  try {
    const r = await fetch(`${BASE}/booking/create-order`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_id, seat_ids }),
    })
    const d = await r.json()
    if (!d.success) throw new Error(d.message || 'Failed to create order')
    orderData = d.data
  } catch (e) {
    onFailure(e.message); return
  }

  // 3. open Razorpay
  const options = {
    key:      orderData.key,
    amount:   orderData.amount,
    currency: orderData.currency,
    order_id: orderData.order_id,
    name:     'MovieMate',
    description: `${movie?.title || 'Movie'} · ${seat_ids.length} seat${seat_ids.length !== 1 ? 's' : ''}`,
    image:    theatre?.chain_logo || '',
    prefill: {
      name:  user ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
    },
    theme: { color: '#e8813a' },
    modal: {
      ondismiss: () => onFailure('Payment cancelled by user'),
    },
    handler: async (response) => {
      // 4. verify payment
      try {
        const vr = await fetch(`${BASE}/booking/verify-payment`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            show_id,
            seat_ids,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          }),
        })
        const vd = await vr.json()
        if (!vd.success) throw new Error(vd.message || 'Payment verification failed')
        onSuccess(vd.data.booking_id)
      } catch (e) {
        onFailure(e.message)
      }
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (resp) => {
    onFailure(resp.error?.description || 'Payment failed')
  })
  rzp.open()
}
