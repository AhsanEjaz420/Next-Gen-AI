from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Alembic Config
config = context.config

# Add project root to python path to ensure app modules are found
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set DATABASE_URL from env
DATABASE_URL = os.getenv("DATABASE_URL")
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import Base + models
from app.database import Base
from app.models.subscription import Subscription, GUID
from app.models.user_session import UserSession
from app.models.user import User


target_metadata = Base.metadata

def render_item(type_, obj, autogen_context):
    """Apply custom rendering for selected items."""
    if type_ == 'type' and isinstance(obj, GUID):
        # Add import for the type to the migration script
        autogen_context.imports.add("from app.models.subscription import GUID")
        return "GUID()"
    return False

def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_item=render_item,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            render_item=render_item,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
