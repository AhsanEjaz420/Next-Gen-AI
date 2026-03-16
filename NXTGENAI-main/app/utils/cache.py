import time
from typing import Dict, Any, Optional

class SimpleCache:
    def __init__(self, ttl: int = 60):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry["timestamp"] < self.ttl:
                return entry["value"]
            else:
                del self._cache[key]
        return None

    def set(self, key: str, value: Any):
        self._cache[key] = {
            "value": value,
            "timestamp": time.time()
        }

    def delete(self, key: str):
        if key in self._cache:
            del self._cache[key]

# Global cache instances
user_cache = SimpleCache(ttl=60)  # Cache user data for 60 seconds
