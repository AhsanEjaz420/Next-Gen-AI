import time
from fastapi import HTTPException, Request
from typing import Dict, Tuple
import asyncio

class RateLimiter:
    def __init__(self, requests_limit: int, window_seconds: int):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # Key: user_id, Value: (request_count, window_start_time)
        self.user_data: Dict[str, Tuple[int, float]] = {}
        self.lock = asyncio.Lock()

    async def is_rate_limited(self, user_id: str) -> bool:
        async with self.lock:
            current_time = time.time()
            
            if user_id not in self.user_data:
                self.user_data[user_id] = (1, current_time)
                return False
            
            count, start_time = self.user_data[user_id]
            
            # If window has expired, reset
            if current_time - start_time > self.window_seconds:
                self.user_data[user_id] = (1, current_time)
                return False
            
            # If within window and over limit
            if count >= self.requests_limit:
                return True
            
            # Increment count
            self.user_data[user_id] = (count + 1, start_time)
            return False

# Global limiters: 5 requests per 60 seconds for generation
gen_limiter = RateLimiter(requests_limit=5, window_seconds=60)

async def check_rate_limit(user_id: str):
    if await gen_limiter.is_rate_limited(user_id):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait a minute before generating more content."
        )
