from fastapi import FastAPI, Depends
import bcrypt
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import Body
from fastapi.responses import FileResponse
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.colors import HexColor
import os
import math
from dotenv import load_dotenv
import google.generativeai as genai

styles = getSampleStyleSheet()

title_style = styles["Heading1"]
title_style.alignment = TA_CENTER
title_style.textColor = HexColor("#1E3A8A")

normal_style = styles["BodyText"]
normal_style.leading = 22

from database import SessionLocal, User, FinancialHistory

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()

# CORS (React connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# DATABASE SESSION
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# REQUEST MODEL
# -------------------------
class LoginRequest(BaseModel):
    email: str
    password: str
class RegisterRequest(BaseModel):
    email: str
    password: str
class ResetPasswordRequest(BaseModel):
    email: str
    password: str
class FinancialRequest(BaseModel):
    user_id: int
    total_debt: int
    income: int
    emi: int
    interest_rate: float = 0
    overdue_months: int
    total_emi_months: int
    paid_emi_months: int
    remaining_emi_months: int

# -------------------------
# HOME ROUTE
# -------------------------
@app.get("/")
def home():
    return {"message": "Backend is running"}
# -------------------------
# REGISTER API
# -------------------------
@app.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        return {
            "message": "Email already registered"
        }
    hashed_password = bcrypt.hashpw(
    data.password.encode("utf-8"),
    bcrypt.gensalt()
).decode("utf-8")
    # Create new user
    new_user = User(
        email=data.email,
        password=hashed_password,
        total_debt=0,
        income=0,
        emi=0,
        interest_rate=0,
        overdue_months=0,
        total_emi_months=0,
        paid_emi_months=0,
        remaining_emi_months=0,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Account created successfully"
    }
# -------------------------
# LOGIN API (REAL DB)
# -------------------------
@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    print("Entered Email:", data.email)

    # Check if user exists
    user = db.query(User).filter(User.email == data.email).first()
    print("DB User:", user)

    if not user:
        return {
            "success": False,
            "message": "User not found. Please create an account."
        }
    print("DB Password:", user.password)
    print("Entered Password:", data.password)

    # Check password
    if not bcrypt.checkpw(
    data.password.encode("utf-8"),
    user.password.encode("utf-8")
):
      return {
        "success": False,
        "message": "Incorrect password."
    }

    # Login successful
    return {
        "success": True,
        "user_id": user.id,
        "message": "Login successful"
    }

# -------------------------
# DASHBOARD API (REAL DB)
# -------------------------
@app.get("/dashboard/{user_id}")
def dashboard(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"error": "User not found"}

    # Calculate EMI Ratio
    emi_ratio = (user.emi / user.income) * 100 if user.income > 0 else 100

# Calculate Debt-to-Income Ratio
    debt_ratio = user.total_debt / user.income if user.income > 0 else 999

    score = 100

# EMI Impact
    if emi_ratio >= 60:
       score -= 30
    elif emi_ratio >= 40:
       score -= 20
    elif emi_ratio >= 20:
       score -= 10

# Overdue Impact
    if user.overdue_months >= 12:
       score -= 30
    elif user.overdue_months >= 6:
        score -= 20
    elif user.overdue_months >= 3:
         score -= 10

# Debt Impact
    if debt_ratio >= 12:
        score -= 20
    elif debt_ratio >= 6:
         score -= 10

# Keep score between 0 and 100
    score = max(0, min(score, 100))

# Financial Status
    if score >= 80:
       status = "Low Risk 🟢"
    elif score >= 50:
       status = "Medium Risk 🟡"
    else:
        status = "High Risk 🔴"   

    return {
    "user_id": user.id,
    "total_debt": user.total_debt,
    "income": user.income,
    "emi": user.emi,
    "overdue_months": user.overdue_months,
    "total_emi_months": user.total_emi_months,
     "paid_emi_months": user.paid_emi_months,
"remaining_emi_months": user.remaining_emi_months,
    "status": status,
    "score" : score,
    "message": "AI analysis completed"
}
from pydantic import BaseModel

class ChatRequest(BaseModel):
    user_id: int
    question: str


@app.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Get user from database
        user = db.query(User).filter(User.id == request.user_id).first()

        if not user:
            return {
                "reply": "User not found."
            }

        # Build a personalized prompt
        prompt = f"""
You are an expert financial advisor.

Answer ONLY the user's question.

Rules:
- Give exactly 10 numbered points.
- Each point must be short (10-15 words).
- Use simple English.
- Give practical advice.
- No introduction.
- No conclusion.
- No paragraphs.
- No markdown.

User Question:
{request.question}
"""

        response = model.generate_content(prompt)

        return {
            "reply": response.text
        }

    except Exception as e:
        return {
            "reply": f"Error: {str(e)}"
        }
    
@app.post("/financial-details")
def save_financial_details(data: FinancialRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == data.user_id).first()

    if not user:
        return {"message": "User not found"}

    user.total_debt = data.total_debt
    user.income = data.income
    user.emi = data.emi
    user.interest_rate = data.interest_rate
    user.overdue_months = data.overdue_months
    user.total_emi_months = data.total_emi_months
    user.paid_emi_months = data.paid_emi_months
    user.remaining_emi_months = data.remaining_emi_months

# Calculate Total EMI Months
    if data.interest_rate <= 0:
       total_emi_months = math.ceil(data.total_debt / data.emi)
    else:
       P = data.total_debt
       r = data.interest_rate / (12 * 100)
       EMI = data.emi

       total_emi_months = math.ceil(
        -math.log(1 - (P * r / EMI)) / math.log(1 + r)
    )

    user.total_emi_months = total_emi_months
    user.remaining_emi_months = max(
    0,
    total_emi_months - data.paid_emi_months
)

    history = FinancialHistory(
        user_id=user.id,
        total_debt=user.total_debt,
        income=user.income,
        emi=user.emi,
        interest_rate=user.interest_rate,
        overdue_months=user.overdue_months,
        total_emi_months=user.total_emi_months,
        paid_emi_months=user.paid_emi_months,
        remaining_emi_months=user.remaining_emi_months,
)

    db.add(history)

    db.commit()

    return {
    "message": "Financial details saved successfully"
}
class SettlementRequest(BaseModel):
    user_id: int
    history_id: int | None = None

    recommendation: str =""
    negotiation_letter: str = ""

@app.post("/settlement-advice")
def settlement_advice(data: SettlementRequest, db: Session = Depends(get_db)):

    if data.history_id:

       user = (
        db.query(FinancialHistory)
        .filter(FinancialHistory.id == data.history_id)
        .first()
    )

    else:

       user = (
        db.query(User)
        .filter(User.id == data.user_id)
        .first()
    )

    if not user:
        return {"error": "User not found"}
    # Calculate EMI Ratio
    emi_ratio = (user.emi / user.income) * 100 if user.income > 0 else 100

# Calculate Debt-to-Income Ratio
    debt_ratio = user.total_debt / user.income if user.income > 0 else 999

    score = 100

# EMI Impact
    if emi_ratio >= 60:
       score -= 30
    elif emi_ratio >= 40:
        score -= 20
    elif emi_ratio >= 20:
       score -= 10

# Overdue Impact
    if user.overdue_months >= 12:
       score -= 30
    elif user.overdue_months >= 6:
       score -= 20
    elif user.overdue_months >= 3:
        score -= 10

# Debt Impact
    if debt_ratio >= 12:
        score -= 20
    elif debt_ratio >= 6:
        score -= 10

# Keep score between 0 and 100
    score = max(0, min(score, 100))

# Financial Status
    if score >= 80:
       status = "Low Risk 🟢"
    elif score >= 50:
       status = "Medium Risk 🟡"
    else:
       status = "High Risk 🔴"
    
   

    if status == "Low Risk 🟢":
        prompt = f"""
You are a financial advisor.

The user is financially healthy.

Financial Details:
- Total Debt: ₹{user.total_debt}
- Monthly Income: ₹{user.income}
- Monthly EMI: ₹{user.emi}
- Score: {score}/100

Generate EXACTLY 5 recommendations.

Rules:
- One sentence per recommendation.
- Maximum 15 words.
- Simple English.
- No headings.
- No markdown.
- Do NOT mention debt settlement, loan restructuring or overdue payments.

Recommendations should focus on:
- Saving money
- SIPs, Fixed Deposits, Recurring Deposits
- Emergency fund
- Budgeting
- Long-term financial planning
"""

    elif status == "Medium Risk 🟡":
        prompt = f"""
You are a financial advisor.

The user is in Medium Risk.

Financial Details:
- Total Debt: ₹{user.total_debt}
- Monthly Income: ₹{user.income}
- Monthly EMI: ₹{user.emi}
- Score: {score}/100

Generate EXACTLY 5 recommendations.

Rules:
- One sentence only.
- Maximum 15 words.
- Simple English.
- No headings.
- No markdown.

Recommendations should focus on:
- Reduce unnecessary expenses
- Increase savings
- Pay extra EMI whenever possible
- Build an emergency fund
- Track monthly expenses
"""

    else:
        prompt = f"""
You are a financial advisor.

The user is in High Risk.

Financial Details:
- Total Debt: ₹{user.total_debt}
- Monthly Income: ₹{user.income}
- Monthly EMI: ₹{user.emi}
- Overdue Months: {user.overdue_months}
- Score: {score}/100

Generate EXACTLY 5 recommendations.

Rules:
- One sentence only.
- Maximum 15 words.
- Simple English.
- No headings.
- No markdown.

Recommendations should focus on:
- Debt settlement
- EMI restructuring
- Clear overdue payments
- Avoid new loans
- Monthly repayment planning
"""

    response = model.generate_content(prompt)

    return {
        "recommendation": response.text
    }
from sqlalchemy import text

with SessionLocal().bind.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN paid_emi_months INTEGER DEFAULT 0"))
    except:
        pass

    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN remaining_emi_months INTEGER DEFAULT 0"))
    except:
        pass

    conn.commit()
@app.post("/negotiation-letter")
def negotiation_letter(
    data: SettlementRequest,
    db: Session = Depends(get_db)
):
    if data.history_id:
        user = (
            db.query(FinancialHistory)
            .filter(FinancialHistory.id == data.history_id)
            .first()
        )
    else:
        user = (
            db.query(User)
            .filter(User.id == data.user_id)
            .first()
        )

    if not user:
        return {"error": "User not found"}

    prompt = f"""
Generate a professional loan settlement request letter.

Borrower's Details:
Total Debt: ₹{user.total_debt}
Income: ₹{user.income}
Monthly EMI: ₹{user.emi}
Overdue Months: {user.overdue_months}

Write a professional negotiation letter requesting
loan settlement or EMI restructuring.
"""

    letter = f"""
Dear Loan Manager,

Subject: Request for Loan Settlement / EMI Restructuring

Loan Account Number: ______________________

I am writing to respectfully request a review of my current loan account. My total outstanding debt is Rs. {user.total_debt}, my monthly income is Rs. {user.income}, and my current monthly EMI is Rs. {user.emi}. I have {user.overdue_months} overdue month(s).

Due to financial constraints, I kindly request the bank to consider either a suitable loan settlement or a restructuring of my EMI schedule. I am fully committed to repaying my obligations and would greatly appreciate a repayment plan that better matches my current financial capacity.

I assure you of my sincere intention to cooperate with the bank and resolve this matter responsibly. I request you to review my financial situation and suggest the most suitable repayment option.

Thank you for your consideration.

Sincerely,

Borrower

Signature: ______________________

Date: ______________________
"""

    pdf_path = "Negotiation_Letter.pdf"

    doc = SimpleDocTemplate(pdf_path)
    story = []

    styles = getSampleStyleSheet()

    title_style = styles["Heading1"]
    title_style.alignment = TA_CENTER
    title_style.textColor = HexColor("#2563EB")

    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    story.append(Paragraph("FinRelief AI", title_style))
    story.append(
        Paragraph(
            "AI Powered Debt Relief and Financial Recovery System",
            normal_style,
        )
    )

    story.append(Spacer(1,20))

    story.append(
        Paragraph("AI Negotiation Letter", heading_style)
    )

    story.append(Spacer(1,10))

    story.append(
        Paragraph(
            letter.replace("\n","<br/>"),
            normal_style
        )
    )

    

    doc.build(story)

    return {
    "letter": letter,
    "pdf": "Negotiation_Letter.pdf"
}

@app.get("/download-negotiation-letter")
def download_negotiation_letter():

    pdf_path = "Negotiation_Letter.pdf"

    return FileResponse(
        path=pdf_path,
        filename="Negotiation_Letter.pdf",
        media_type="application/pdf"
    )


# ============================================================
# DOWNLOAD REPORT
# ============================================================

@app.post("/download-report")
def download_report(
    data: SettlementRequest,
    db: Session = Depends(get_db)
):

    if data.history_id:
        user = (
            db.query(FinancialHistory)
            .filter(FinancialHistory.id == data.history_id)
            .first()
        )
    else:
        user = (
            db.query(User)
            .filter(User.id == data.user_id)
            .first()
        )

    if not user:
        return {"error": "User not found"}

    pdf_path = "FinRelief_Report.pdf"

    doc = SimpleDocTemplate(pdf_path)

    story = []

    styles = getSampleStyleSheet()

    title_style = styles["Heading1"]
    title_style.alignment = TA_CENTER
    title_style.textColor = HexColor("#2563EB")

    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    # -------------------------
    # SCORE
    # -------------------------

    emi_ratio = (user.emi / user.income) * 100 if user.income > 0 else 100
    debt_ratio = user.total_debt / user.income if user.income > 0 else 999

    score = 100

    if emi_ratio >= 60:
        score -= 30
    elif emi_ratio >= 40:
        score -= 20
    elif emi_ratio >= 20:
        score -= 10

    if user.overdue_months >= 12:
        score -= 30
    elif user.overdue_months >= 6:
        score -= 20
    elif user.overdue_months >= 3:
        score -= 10

    if debt_ratio >= 12:
        score -= 20
    elif debt_ratio >= 6:
        score -= 10

    score = max(0, min(score,100))

    if score >= 80:
        status = "Low Risk 🟢"
    elif score >= 50:
        status = "Medium Risk 🟡"
    else:
        status = "High Risk 🔴"

    # -------------------------
    # EMI
    # -------------------------

    total_emi_months = (
        math.ceil(user.total_debt / user.emi)
        if user.emi > 0 else 0
    )

    remaining_emi_months = max(
        total_emi_months - user.paid_emi_months,
        0
    )

    # -------------------------
    # Settlement Recommendation
    # -------------------------

    

    # -------------------------
    # Negotiation Letter
    # -------------------------

    

    # =================================================

    story.append(Paragraph("FinRelief AI", title_style))

    story.append(
        Paragraph(
            "AI Powered Debt Relief and Financial Recovery System",
            normal_style
        )
    )

    story.append(Spacer(1,20))

    story.append(
        Paragraph("Financial Report", heading_style)
    )

    story.append(Spacer(1,10))

    story.append(
        Paragraph(
            f"User ID : {user.user_id if hasattr(user,'user_id') else user.id}",
            normal_style
        )
    )

    story.append(Spacer(1,15))

    story.append(
        Paragraph("Financial Summary", heading_style)
    )

    story.append(
        Paragraph(
            f"""
Total Debt : Rs. {user.total_debt}<br/>
Monthly Income : Rs. {user.income}<br/>
Monthly EMI : Rs. {user.emi}<br/>
Interest Rate : {getattr(user,'interest_rate',0)}%<br/>
Overdue Months : {user.overdue_months}<br/>
EMIs Already Paid : {user.paid_emi_months}<br/>
Total EMI Months : {total_emi_months}<br/>
Remaining EMI Months : {remaining_emi_months}
""",
            normal_style
        )
    )

    story.append(Spacer(1,20))

    story.append(
        Paragraph("AI Financial Health", heading_style)
    )

    story.append(
        Paragraph(
            f"""
Financial Health Score : {score}%<br/>
AI Status : {status}
""",
            normal_style
        )
    )

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            "AI Settlement Recommendation",
            heading_style
        )
    )

    story.append(
    Paragraph(
        data.recommendation.replace("\n", "<br/>"),
        normal_style
    )
)

    story.append(Spacer(1,20))

    story.append(
        Paragraph(
            "AI Negotiation Letter",
            heading_style
        )
    )

    story.append(
    Paragraph(
        data.negotiation_letter.replace("\n", "<br/>"),
        normal_style
    )
)

    doc.build(story)

    return FileResponse(
        path=pdf_path,
        filename="FinRelief_Report.pdf",
        media_type="application/pdf",
    )
@app.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db)):

    history = (
        db.query(FinancialHistory)
        .filter(FinancialHistory.user_id == user_id)
        .order_by(FinancialHistory.created_at.desc())
        .all()
    )

    return history
@app.get("/history-details/{history_id}")
def get_history_details(history_id: int, db: Session = Depends(get_db)):

    history = (
        db.query(FinancialHistory)
        .filter(FinancialHistory.id == history_id)
        .first()
    )

    if not history:
        return {"message": "History not found"}

    # EMI Ratio
    emi_ratio = (
        (history.emi / history.income) * 100
        if history.income > 0 else 100
    )

    # Debt Ratio
    debt_ratio = (
        history.total_debt / history.income
        if history.income > 0 else 999
    )

    score = 100

    # EMI Impact
    if emi_ratio >= 60:
        score -= 30
    elif emi_ratio >= 40:
        score -= 20
    elif emi_ratio >= 20:
        score -= 10

    # Overdue Impact
    if history.overdue_months >= 12:
        score -= 30
    elif history.overdue_months >= 6:
        score -= 20
    elif history.overdue_months >= 3:
        score -= 10

    # Debt Impact
    if debt_ratio >= 12:
        score -= 20
    elif debt_ratio >= 6:
        score -= 10

    score = max(0, min(score, 100))

    if score >= 80:
        status = "Low Risk 🟢"
    elif score >= 50:
        status = "Medium Risk 🟡"
    else:
        status = "High Risk 🔴"

    return {
        "id": history.id,
        "user_id": history.user_id,
        "total_debt": history.total_debt,
        "income": history.income,
        "emi": history.emi,
        "overdue_months": history.overdue_months,
        "total_emi_months": history.total_emi_months,
        "paid_emi_months": history.paid_emi_months,
        "remaining_emi_months": history.remaining_emi_months,
        "score": score,
        "status": status,
        "created_at": history.created_at,
    }
@app.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:
        return {
            "success": False,
            "message": "User not found."
        }

    hashed_password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user.password = hashed_password

    db.commit()

    return {
        "success": True,
        "message": "Password updated successfully."
    }