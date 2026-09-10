import re
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.threat import ThreatAnalysis, ThreatLevel
from src.schemas.threat import ThreatAnalysisResponse

URGENCY_KEYWORDS = [
    "immediately", "urgent", "asap", "right now", "hurry", "limited time",
    "expires", "deadline", "today only", "act now", "don't wait", "critical",
    "emergency", "fast", "quick", "instant", "within minutes", "before it's too late",
]

FEAR_KEYWORDS = [
    "suspended", "terminated", "closed", "arrested", "legal action", "lawsuit",
    "criminal", "investigation", "fraud", "hack", "infected", "virus",
    "stolen", "compromised", "breach", "unauthorized", "warning", "alert",
    "danger", "risk", "threat", "secure", "verify", "confirm",
]

AUTHORITY_KEYWORDS = [
    "irs", "fbi", "police", "government", "ceo", "president", "manager",
    "director", "security", "administrator", "official", "department",
    "federal", "state", "agency", "bureau", "authority", "in charge",
    "legal", "compliance", "audit",
]

GREED_KEYWORDS = [
    "won", "winner", "prize", "lottery", "million", "billion", "free",
    "gift", "bonus", "reward", "cash", "money", "inheritance", "claim",
    "receive", "collect", "fortune", "wealth", "rich", "profit",
]

SECRECY_KEYWORDS = [
    "confidential", "secret", "don't tell", "keep quiet", "between us",
    "private", "anonymous", "discreet", "hush", "quiet", "hidden",
    "exclusive", "restricted", "classified", "off the record",
]

CURIOSITY_KEYWORDS = [
    "see who", "find out", "discover", "revealed", "exposed", "caught",
    "photo", "video", "message", "voicemail", "tagged", "mentioned",
    "secret", "shocking", "surprising", "unexpected", "mystery",
]


class ThreatAnalyzer:
    def _count_keyword_matches(self, text: str, keywords: list[str]) -> int:
        text_lower = text.lower()
        return sum(1 for kw in keywords if kw in text_lower)

    def _detect_excessive_punctuation(self, text: str) -> bool:
        exclamations = text.count("!")
        questions = text.count("?")
        return exclamations > 2 or questions > 2

    def _detect_all_caps_words(self, text: str) -> bool:
        words = text.split()
        caps_words = [w for w in words if w.isupper() and len(w) > 2]
        return len(caps_words) > 2

    def _detect_urgency_pressure(self, text: str) -> bool:
        patterns = [
            r"within \d+ (minute|hour|day)",
            r"before \d+",
            r"expires? (today|tomorrow|soon)",
            r"last (chance|warning|notice)",
            r"act now",
        ]
        return any(re.search(p, text.lower()) for p in patterns)

    def analyze(self, db: AsyncSession, user_id: str, text: str) -> ThreatAnalysis:
        urgency_score = self._count_keyword_matches(text, URGENCY_KEYWORDS)
        fear_score = self._count_keyword_matches(text, FEAR_KEYWORDS)
        authority_score = self._count_keyword_matches(text, AUTHORITY_KEYWORDS)
        greed_score = self._count_keyword_matches(text, GREED_KEYWORDS)
        secrecy_score = self._count_keyword_matches(text, SECRECY_KEYWORDS)
        curiosity_score = self._count_keyword_matches(text, CURIOSITY_KEYWORDS)

        if self._detect_excessive_punctuation(text):
            urgency_score += 1
        if self._detect_all_caps_words(text):
            urgency_score += 1
        if self._detect_urgency_pressure(text):
            urgency_score += 2

        total_score = urgency_score + fear_score + authority_score + greed_score + secrecy_score + curiosity_score

        triggers = []
        if urgency_score >= 2:
            triggers.append("urgency")
        if fear_score >= 2:
            triggers.append("fear")
        if authority_score >= 2:
            triggers.append("authority")
        if greed_score >= 2:
            triggers.append("greed")
        if secrecy_score >= 1:
            triggers.append("secrecy")
        if curiosity_score >= 1:
            triggers.append("curiosity")

        if total_score >= 8:
            threat_level = ThreatLevel.DANGER.value
        elif total_score >= 4:
            threat_level = ThreatLevel.CAUTION.value
        else:
            threat_level = ThreatLevel.SAFE.value

        threat_score = min(total_score / 15.0, 1.0)

        explanation_parts = []
        if urgency_score >= 2:
            explanation_parts.append("Contains urgency language designed to rush your decision-making.")
        if fear_score >= 2:
            explanation_parts.append("Uses fear-inducing language to create anxiety.")
        if authority_score >= 2:
            explanation_parts.append("References authority figures to establish unearned credibility.")
        if greed_score >= 2:
            explanation_parts.append("Exploits desire for financial gain or rewards.")
        if secrecy_score >= 1:
            explanation_parts.append("Requests secrecy to prevent you from seeking advice.")
        if curiosity_score >= 1:
            explanation_parts.append("Attempts to provoke curiosity to bait engagement.")
        if not explanation_parts:
            explanation_parts.append("No significant social engineering indicators detected.")

        analysis = ThreatAnalysis(
            user_id=user_id,
            input_text=text,
            threat_level=threat_level,
            threat_score=threat_score,
            triggers=triggers,
            explanation=" ".join(explanation_parts),
        )
        db.add(analysis)
        return analysis
