import random
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.simulation import Simulation, SimulationType, SimulationStatus
from src.schemas.simulation import SimulationReveal

SCENARIOS = {
    SimulationType.PHISHING_EMAIL: [
        {
            "name": "Bank Security Alert",
            "content": "Dear Customer, We have detected unusual activity on your account. Please verify your identity immediately by clicking the link below to avoid account suspension.",
            "triggers": ["urgency", "fear", "authority"],
        },
        {
            "name": "Package Delivery Failed",
            "content": "Your package could not be delivered. Please update your shipping address and pay the redelivery fee within 24 hours.",
            "triggers": ["urgency", "curiosity"],
        },
    ],
    SimulationType.SMISHING: [
        {
            "name": "IRS Tax Notice",
            "content": "IRS NOTICE: You have been selected for a random audit. Reply immediately with your SSN to verify your identity or face legal action.",
            "triggers": ["authority", "fear", "urgency"],
        },
        {
            "name": "Bank Fraud Alert",
            "content": "FRAUD ALERT: A $2,499.99 charge was detected on your card. Reply YES to confirm or NO to block your card immediately.",
            "triggers": ["fear", "urgency"],
        },
    ],
    SimulationType.AUTHORITY_SCAM: [
        {
            "name": "CEO Wire Transfer",
            "content": "This is the CEO. I need you to process an urgent wire transfer of $50,000 to this account for a confidential acquisition. Do not discuss with anyone.",
            "triggers": ["authority", "urgency", "secrecy"],
        },
        {
            "name": "IT Department Password Reset",
            "content": "This is IT Security. We need you to reset your password immediately due to a security breach. Click here to set a new password.",
            "triggers": ["authority", "urgency"],
        },
    ],
    SimulationType.URGENCY_FEAR: [
        {
            "name": "Account Suspended",
            "content": "URGENT: Your account has been suspended due to suspicious activity. You must verify your identity within 10 minutes or your account will be permanently closed.",
            "triggers": ["urgency", "fear"],
        },
        {
            "name": "Legal Action Warning",
            "content": "NOTICE: You have been identified in a fraud investigation. Contact our legal department immediately at this number to avoid criminal charges.",
            "triggers": ["fear", "authority", "urgency"],
        },
    ],
    SimulationType.CURIOSITY_BAIT: [
        {
            "name": "Photo Tagged",
            "content": "Someone tagged you in a photo on social media. Click here to see who and what they said about you.",
            "triggers": ["curiosity"],
        },
        {
            "name": "Voice Message",
            "content": "You have a new voice message from an unknown number. Listen to the message before it expires.",
            "triggers": ["curiosity", "urgency"],
        },
    ],
    SimulationType.GREED_PRIZE: [
        {
            "name": "Lottery Winner",
            "content": "CONGRATULATIONS! You have won $1,000,000 in the International Lottery. Claim your prize by providing your bank details for immediate transfer.",
            "triggers": ["greed", "urgency"],
        },
        {
            "name": "Free Gift Card",
            "content": "You have been selected to receive a $500 Amazon gift card! Complete this short survey to claim your reward before it expires.",
            "triggers": ["greed", "urgency"],
        },
    ],
    SimulationType.SECRECY_REQUEST: [
        {
            "name": "Secret Investment",
            "content": "I have an investment opportunity that will triple your money in 30 days. But you must keep this completely confidential - do not tell anyone about this offer.",
            "triggers": ["secrecy", "greed", "urgency"],
        },
        {
            "name": "Inheritance Scam",
            "content": "A distant relative has left you $500,000 in their will. To claim it, you must keep this confidential and pay a small processing fee.",
            "triggers": ["secrecy", "greed"],
        },
    ],
    SimulationType.TECH_SUPPORT: [
        {
            "name": "Microsoft Security Warning",
            "content": "CRITICAL ALERT: Your computer has been infected with a virus. Call Microsoft Support immediately at 1-800-XXX-XXXX to prevent data loss.",
            "triggers": ["fear", "authority", "urgency"],
        },
        {
            "name": "Apple ID Locked",
            "content": "Your Apple ID has been locked due to unauthorized access. Verify your identity now to unlock your account and prevent data deletion.",
            "triggers": ["fear", "urgency", "authority"],
        },
    ],
    SimulationType.ROMANCE_SOCIAL: [
        {
            "name": "Long Lost Friend",
            "content": "Hey! It's been so long. I'm moving to your city next week and would love to catch up. Can you help me with a small favor first?",
            "triggers": ["trust", "reciprocity"],
        },
        {
            "name": "Romance Interest",
            "content": "I've been thinking about you a lot lately. I need your help with something important but I'm embarrassed to ask. Can you send me some money for an emergency?",
            "triggers": ["trust", "empathy", "urgency"],
        },
    ],
}

REVEAL_INFO = {
    "urgency": {
        "explanation": "The attacker created artificial time pressure to prevent you from thinking clearly or verifying the request.",
        "defense": ["Always pause when you feel rushed", "Legitimate organizations give reasonable timeframes", "Ask yourself: why is this urgent?"],
    },
    "fear": {
        "explanation": "The attacker used threats or scary scenarios to trigger an emotional response that overrides rational thinking.",
        "defense": ["Recognize fear as a manipulation tactic", "Verify threats through official channels", "Remember: real authorities don't threaten via text/email"],
    },
    "authority": {
        "explanation": "The attacker impersonated someone in a position of power to make you comply without questioning.",
        "defense": ["Verify the identity through independent channels", "Legitimate authorities don't request sensitive info via email", "Question urgent requests even from authority figures"],
    },
    "greed": {
        "explanation": "The attacker exploited your desire for financial gain or free rewards to lower your guard.",
        "defense": ["If it sounds too good to be true, it is", "Legitimate prizes don't require upfront payments", "Never share financial info for 'prizes'"],
    },
    "curiosity": {
        "explanation": "The attacker used your natural curiosity to get you to click a link or provide information.",
        "defense": ["Don't click links from unknown sources", "Verify through official apps/websites", "Be suspicious of messages designed to provoke curiosity"],
    },
    "secrecy": {
        "explanation": "The attacker asked you to keep the interaction secret to prevent you from getting advice from others.",
        "defense": ["Legitimate opportunities don't require secrecy", "Always discuss suspicious offers with trusted people", "Secrecy requests are a major red flag"],
    },
    "trust": {
        "explanation": "The attacker tried to exploit your trust in relationships or familiarity.",
        "defense": ["Verify identity through a different communication channel", "Be wary of unexpected requests from 'known' contacts", "Don't let trust override security procedures"],
    },
    "reciprocity": {
        "explanation": "The attacker implied a relationship or past favor to create obligation.",
        "defense": ["Don't feel obligated to help strangers", "Verify the relationship through independent means", "Legitimate friends don't ask for money via text"],
    },
    "empathy": {
        "explanation": "The attacker used emotional stories to exploit your compassion.",
        "defense": ["Be cautious of emotional manipulation", "Verify stories through independent sources", "Help through official channels, not direct transfers"],
    },
}


class SimulationEngine:
    async def create_simulation(self, db: AsyncSession, user_id: UUID) -> Simulation:
        sim_type = random.choice(list(SimulationType))
        scenario = random.choice(SCENARIOS[sim_type])

        simulation = Simulation(
            user_id=user_id,
            type=sim_type,
            scenario_name=scenario["name"],
            psychological_triggers=scenario["triggers"],
            status=SimulationStatus.ACTIVE,
            content=scenario["content"],
            delivered_at=datetime.now(timezone.utc),
        )
        db.add(simulation)
        await db.flush()
        await db.refresh(simulation)
        return simulation

    def get_reveal(self, simulation: Simulation) -> SimulationReveal:
        all_tips = []
        for trigger in simulation.psychological_triggers:
            if trigger in REVEAL_INFO:
                all_tips.extend(REVEAL_INFO[trigger]["defense"])

        explanations = []
        for trigger in simulation.psychological_triggers:
            if trigger in REVEAL_INFO:
                explanations.append(f"[{trigger.upper()}] {REVEAL_INFO[trigger]['explanation']}")

        return SimulationReveal(
            simulation_id=simulation.id,
            psychological_triggers=simulation.psychological_triggers,
            explanation=" ".join(explanations),
            defense_tips=list(set(all_tips)),
            difficulty_rating=min(len(simulation.psychological_triggers) + 1, 5),
        )
