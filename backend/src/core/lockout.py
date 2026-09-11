from collections import defaultdict
from datetime import datetime, timedelta, timezone


class AccountLockout:
    def __init__(self, max_attempts: int = 5, lockout_duration_minutes: int = 15):
        self.attempts: dict[str, list[datetime]] = defaultdict(list)
        self.max_attempts = max_attempts
        self.lockout_duration = timedelta(minutes=lockout_duration_minutes)

    def _cleanup_old_attempts(self, identifier: str) -> None:
        cutoff = datetime.now(timezone.utc) - self.lockout_duration
        self.attempts[identifier] = [
            attempt for attempt in self.attempts[identifier]
            if attempt > cutoff
        ]

    def is_locked(self, identifier: str) -> bool:
        self._cleanup_old_attempts(identifier)
        return len(self.attempts[identifier]) >= self.max_attempts

    def record_failure(self, identifier: str) -> None:
        self.attempts[identifier].append(datetime.now(timezone.utc))

    def clear_failures(self, identifier: str) -> None:
        self.attempts.pop(identifier, None)

    def get_remaining_lockout_seconds(self, identifier: str) -> int:
        if not self.attempts[identifier]:
            return 0
        oldest_in_window = min(self.attempts[identifier])
        unlock_time = oldest_in_window + self.lockout_duration
        remaining = (unlock_time - datetime.now(timezone.utc)).total_seconds()
        return max(0, int(remaining))


lockout_manager = AccountLockout()
