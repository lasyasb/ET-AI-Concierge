import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface InsurancePlan {
  id: string;
  age: number;
  monthlyIncome: number;
  dependents: number;
  existingCoverage: number;
  riskPreference: "Low" | "Medium" | "High";
  suggestedCoverage: number;
  estimatedPremium: number;
  protectionScore: number;
  timestamp: string;
  lastUpdated?: string;
}

export interface SelectedInsurance {
  id: string;
  name: string;
  coverage: string;
  premium: string;
  timestamp: string;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  displayName?: string;
  ageGroup?: string;
  incomeRange?: string;
  goals?: string[];
  riskAppetite?: string;
  interests?: string[];
  persona?: string;
  riskLevel?: string;
  intentScore?: number;
  orientation?: string;
  reasoning?: string;
  onboardingComplete?: boolean;
  recommendations?: Recommendation[];
  enrolledMasterclasses?: EnrolledMasterclass[];
  savedSIPPlans?: SIPPlan[];
  portfolioResults?: PortfolioResult[];
  loanChecks?: LoanCheck[];
  insurancePlans?: InsurancePlan[];
  selectedInsurance?: SelectedInsurance;
  wealthScore?: number;
  financialScore?: number;
  savingsGoalProgress?: number;
  savingsGoals?: SavingsGoal[];
  achievements?: Achievement[];
  level?: string;
  advisorChatHistory?: AdvisorMessage[];
  createdAt?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentSavings: number;
  category: "Car" | "Emergency Fund" | "Home" | "Retirement" | "Other";
  deadline?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface AdvisorMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface EnrolledMasterclass {
  id: string;
  title: string;
  enrolledAt: string;
}

export interface SIPPlan {
  id: string;
  monthly: number;
  years: number;
  returns: number;
  futureValue: number;
  timestamp: string;
  lastUpdated?: string;
}

export interface PortfolioResult {
  id: string;
  riskScore: string;
  divScore: number;
  insight: string;
  timestamp: string;
  lastUpdated?: string;
}

export interface LoanCheck {
  id: string;
  loanType: string;
  eligibleAmount: number;
  salary: number;
  timestamp: string;
  lastUpdated?: string;
}

export interface Recommendation {
  serviceId: string;
  title: string;
  description: string;
  whyRecommended: string;
  actionUrl: string;
}

const SYSTEM_INSTRUCTION = `
You are ET AI Concierge, a premium financial advisor for The Economic Times (ET). 
Your goal is to understand the user's financial profile through a short, intelligent chat (3-5 questions).

GUIDELINES:
1. Ask ONE question at a time.
2. Be friendly, professional, and advisor-like.
3. Topics to cover: Age group, Monthly income range, Financial goals, Risk appetite, Interests (trading, investing, saving, learning).
4. Adapt your questions based on previous answers.
5. If the user provides multiple pieces of info at once, acknowledge them and move to the next missing topic.
6. Once you have enough information (usually after 3-5 questions), end the conversation by saying exactly "ONBOARDING_COMPLETE" followed by a brief wrap-up message.

DO NOT provide recommendations yet. Just collect the profile.
`;

export async function getNextQuestion(history: { role: "user" | "model"; content: string }[]) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return response.text;
}

export async function classifyAndRecommend(history: { role: "user" | "model"; content: string }[]) {
  const prompt = `
  Based on the following conversation, classify the user into a financial persona and recommend relevant ET services.
  
  PERSONAS: Beginner, Trader, Long-term Investor, High Net Worth Individual, Student.
  SERVICES & INTERNAL ROUTES: 
  - ET Prime: /dashboard (Default dashboard view)
  - ET Markets: /dashboard (Default dashboard view)
  - Masterclasses: /masterclasses
  - Wealth Tools: /tools
  - Insurance Planner: /tools
  - Loan Assistant: /loans
  
  CONVERSATION:
  ${history.map(h => `${h.role}: ${h.content}`).join("\n")}
  
  RETURN JSON in this format:
  {
    "persona": "...",
    "riskLevel": "Low/Medium/High",
    "intentScore": 0-100,
    "orientation": "Learning/Action",
    "reasoning": "Brief explanation of why this persona was chosen.",
    "recommendations": [
      {
        "serviceId": "...",
        "title": "...",
        "description": "...",
        "whyRecommended": "AI generated personalized reasoning based on the user's specific answers.",
        "actionUrl": "..."
      }
    ]
  }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          persona: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
          intentScore: { type: Type.NUMBER },
          orientation: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                serviceId: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                whyRecommended: { type: Type.STRING },
                actionUrl: { type: Type.STRING }
              },
              required: ["serviceId", "title", "description", "whyRecommended", "actionUrl"]
            }
          }
        },
        required: ["persona", "riskLevel", "intentScore", "orientation", "reasoning", "recommendations"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getAdvisorResponse(history: AdvisorMessage[], profile: UserProfile) {
  const context = `
  You are a Personal Financial Advisor for ET AI Concierge. 
  User Profile:
  - Persona: ${profile.persona}
  - Risk Level: ${profile.riskLevel}
  - Goals: ${profile.goals?.join(", ")}
  - Orientation: ${profile.orientation}
  - Financial Score: ${profile.financialScore}/100
  
  Current Savings Goals:
  ${profile.savingsGoals?.map(g => `- ${g.title}: ${g.currentSavings}/${g.targetAmount}`).join("\n")}
  
  Provide helpful, concise, and actionable financial advice. Use Markdown for formatting.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history.map(h => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] })),
    config: {
      systemInstruction: context,
      temperature: 0.7,
    },
  });

  return response.text;
}
