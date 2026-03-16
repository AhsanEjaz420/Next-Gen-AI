from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.routes.caption import router as caption_router
from app.routes.hashtag import router as hashtag_router
from app.routes.content_ideas import router as content_ideas_router
from app.routes.blog_seo import router as blog_seo_router
from app.routes.email_reply import router as email_reply_router
from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.payment import router as payment_router
from app.routes.history import router as history_router
from app.routes.profile import router as profile_router
from app.routes.insights import router as insights_router
from app.routes.batch import router as batch_router
from app.routes.paid.social_calendar import router as social_calendar_router
from app.routes.paid.product_description import router as product_description_router
from app.routes.paid.competitor_analysis import router as competitor_router
from app.seed_admin import seed_admin
from app.database import SessionLocal

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        seed_admin(db)
        yield
    finally:
        db.close()

app = FastAPI(
    title="NXTGENAI Backend",
    version="1.0.0",
    description="Backend API for NXTGENAI AI tools",
    lifespan=lifespan
)

# ✅ GLOBAL EXCEPTION HANDLER (Unhandled Exceptions)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred on our end. Our team is looking into it.",
            "detail": str(exc) if settings.OPENAI_MODEL.startswith("gpt-4") else None # Only show details in dev-like models
        },
    )

# ✅ VALIDATION ERROR HANDLER (422 Errors)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error_code": "VALIDATION_ERROR",
            "message": "The data provided is invalid.",
            "detail": exc.errors()
        },
    )

# ✅ CORS CONFIG (Production + Local)
# Ensure origins don't have trailing slashes
origins = [
    str(settings.FRONTEND_URL).rstrip("/"),
    str(settings.FRONTEND_URL_LOCAL).rstrip("/"),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(caption_router)
app.include_router(hashtag_router)
app.include_router(content_ideas_router)
app.include_router(blog_seo_router)
app.include_router(email_reply_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(payment_router)
app.include_router(history_router)
app.include_router(profile_router)
app.include_router(insights_router)
app.include_router(batch_router)
app.include_router(social_calendar_router)
app.include_router(product_description_router)
app.include_router(competitor_router)


@app.get("/")
def root():
    return {"status": "API running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
