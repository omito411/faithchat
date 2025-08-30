# routes/donations.py
import os, stripe
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, EmailStr

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")  # set in .env

class CreateIntentIn(BaseModel):
    amount_eur: float = Field(..., gt=0, lt=10000)  # guardrails: €0–€10k
    email: EmailStr | None = None
    recurring: bool = False

@router.post("/donate/create-intent")
def create_payment_intent(payload: CreateIntentIn):
    try:
        amount_cents = int(round(payload.amount_eur * 100))
        pi = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="eur",
            automatic_payment_methods={"enabled": True},  # Apple/Google Pay + cards
            receipt_email=payload.email,
            metadata={"purpose": "donation", "recurring": str(payload.recurring)},
        )
        return {"clientSecret": pi.client_secret}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
