from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import hash_password

ADMIN_EMAIL = "admin@nxtgenai.com"
ADMIN_PASSWORD = "admin123"

def seed_admin(db: Session):
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        return
    
    admin = User(
        username="admin",
        email=ADMIN_EMAIL,
        hashed_password=hash_password(ADMIN_PASSWORD),
        role="admin"
    )

    db.add(admin)
    db.commit()