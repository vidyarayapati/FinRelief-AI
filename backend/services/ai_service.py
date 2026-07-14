def predict_settlement(loan_amount, interest_rate, emi):
    """
    Predict a suggested settlement amount based on simple rules.
    This is Version 1 (Rule-Based AI).
    """

    # High interest loans
    if interest_rate >= 12:
        settlement = loan_amount * 0.60

    # Medium interest loans
    elif interest_rate >= 8:
        settlement = loan_amount * 0.70

    # Low interest loans
    else:
        settlement = loan_amount * 0.80

    return {
        "original_loan": loan_amount,
        "interest_rate": interest_rate,
        "monthly_emi": emi,
        "recommended_settlement": round(settlement, 2)
    }

def generate_negotiation_strategy(loan_amount, interest_rate, emi):
    """
    Generate a simple negotiation strategy based on loan details.
    """

    if interest_rate >= 12:
        strategy = [
            "Offer 60% of the outstanding loan amount.",
            "Request a complete waiver of penalty charges.",
            "Explain financial hardship with supporting documents.",
            "Request a No Due Certificate after settlement."
        ]

    elif interest_rate >= 8:
        strategy = [
            "Offer around 70% of the outstanding loan amount.",
            "Request reduction of interest charges.",
            "Ask for flexible repayment options.",
            "Request written settlement confirmation."
        ]

    else:
        strategy = [
            "Negotiate for 80% settlement.",
            "Request lower interest charges.",
            "Complete settlement in one payment if possible."
        ]

    return {
        "loan_amount": loan_amount,
        "interest_rate": interest_rate,
        "emi": emi,
        "strategy": strategy
    }
def fallback_strategy():
    """
    Returns a default negotiation strategy if AI is unavailable.
    """

    return {
        "message": "AI service is currently unavailable.",
        "fallback_strategy": [
            "Contact your lender as early as possible.",
            "Explain your financial situation honestly.",
            "Request a lower settlement amount.",
            "Ask for EMI restructuring if settlement is not possible.",
            "Get every agreement in writing."
        ]
    }