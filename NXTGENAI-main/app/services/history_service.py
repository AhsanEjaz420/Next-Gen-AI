from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
import json
from datetime import datetime, timedelta
from app.models.content_history import ContentHistory
from typing import Any, Dict

from app.core.llm import generate_text
from app.prompts.refine_prompt import REFINE_SYSTEM_PROMPT

class HistoryService:
    @staticmethod
    async def get_user_stats(db: AsyncSession, user_id: str):
        """
        Aggregates usage statistics for the user.
        """
        # 1. Total Generations
        stmt_total = select(func.count(ContentHistory.id)).filter(ContentHistory.user_id == user_id)
        res_total = await db.execute(stmt_total)
        total_count = res_total.scalar() or 0

        # 2. Tool Distribution
        stmt_dist = select(
            ContentHistory.tool_name, 
            func.count(ContentHistory.id)
        ).filter(ContentHistory.user_id == user_id).group_by(ContentHistory.tool_name)
        res_dist = await db.execute(stmt_dist)
        distribution = {row[0]: row[1] for row in res_dist.all()}

        # 3. Daily Usage (Last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        stmt_daily = select(
            func.date(ContentHistory.created_at), 
            func.count(ContentHistory.id)
        ).filter(
            ContentHistory.user_id == user_id,
            ContentHistory.created_at >= seven_days_ago
        ).group_by(func.date(ContentHistory.created_at)).order_by(func.date(ContentHistory.created_at))
        
        res_daily = await db.execute(stmt_daily)
        daily_usage = [{"date": str(row[0]), "count": row[1]} for row in res_daily.all()]

        return {
            "total_generations": total_count,
            "tool_distribution": distribution,
            "daily_usage": daily_usage
        }

    @staticmethod
    async def refine_content(db: AsyncSession, user_id: str, history_id: int, instruction: str):
        """
        Takes an old generation and refines it based on new instructions.
        """
        stmt = select(ContentHistory).filter(
            ContentHistory.user_id == user_id,
            ContentHistory.id == history_id
        )
        result = await db.execute(stmt)
        old_entry = result.scalar_one_or_none()
        
        if not old_entry:
            return None

        user_prompt = f"""
ORIGINAL INPUTS: {json.dumps(old_entry.input_data)}
PREVIOUS OUTPUT: {old_entry.output_content}

NEW REFINEMENT INSTRUCTION: {instruction}

Please provide the updated content now:
"""
        refined_output = await generate_text(
            system_prompt=REFINE_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            temperature=0.7,
            max_tokens=2000
        )

        new_entry = await HistoryService.save_history(
            db=db,
            user_id=user_id,
            tool_name=old_entry.tool_name,
            input_data={**old_entry.input_data, "refinement_instruction": instruction},
            output_content=refined_output
        )
        
        return new_entry

    @staticmethod
    async def save_history(
        db: AsyncSession, 
        user_id: str, 
        tool_name: str, 
        input_data: Dict[str, Any], 
        output_content: str
    ):
        history_entry = ContentHistory(
            user_id=user_id,
            tool_name=tool_name,
            input_data=input_data,
            output_content=output_content
        )
        db.add(history_entry)
        await db.commit()
        await db.refresh(history_entry)
        return history_entry

    @staticmethod
    async def get_user_history(db: AsyncSession, user_id: str, limit: int = 20):
        stmt = select(ContentHistory).filter(
            ContentHistory.user_id == user_id
        ).order_by(ContentHistory.created_at.desc()).limit(limit)
        
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def toggle_favorite(db: AsyncSession, user_id: str, history_id: int):
        stmt = select(ContentHistory).filter(
            ContentHistory.user_id == user_id,
            ContentHistory.id == history_id
        )
        result = await db.execute(stmt)
        entry = result.scalar_one_or_none()
        
        if entry:
            entry.is_favorite = not entry.is_favorite
            await db.commit()
            await db.refresh(entry)
        return entry
