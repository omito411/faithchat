# routes/stripe_webhook.py
import os, stripe
from fastapi import APIRouter, Request, HTTPException

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the events you care about
    if event["type"] in ("payment_intent.succeeded", "charge.succeeded"):
        # TODO: record donation in DB, send thank-you, etc.
        pass

    return {"received": True}
