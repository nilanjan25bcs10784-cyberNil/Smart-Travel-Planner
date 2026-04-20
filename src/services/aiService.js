// src/services/aiService.js
// Calls the Anthropic Claude API for AI-powered trip suggestions.
// The API key is injected via the claude.ai environment — no key needed in code.

const CLAUDE_API = 'https://api.anthropic.com/v1/messages'

const callClaude = async (prompt, systemPrompt) => {
  const response = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) throw new Error('AI service unavailable')
  const data = await response.json()
  return data.content?.[0]?.text ?? ''
}

// ─── Generate a full itinerary ────────────────────────────────────────────────
export const generateItinerary = async ({ destination, days, budget, interests }) => {
  const system = `You are an expert travel planner. Respond ONLY with a valid JSON array, no markdown, no preamble.
Each element represents one day and has the shape:
{ "day": number, "title": string, "activities": [{ "time": string, "activity": string, "location": string, "cost": number, "notes": string }] }`

  const prompt = `Create a ${days}-day itinerary for ${destination}.
Budget: ₹${budget} total.
Interests: ${interests || 'general sightseeing, food, culture'}.
Return JSON only.`

  const raw = await callClaude(prompt, system)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─── Generate packing suggestions ─────────────────────────────────────────────
export const generatePackingList = async ({ destination, days, tripType }) => {
  const system = `You are a travel expert. Respond ONLY with a valid JSON array, no markdown, no preamble.
Shape: [{ "category": string, "item": string, "essential": boolean }]`

  const prompt = `Suggest a packing list for a ${days}-day ${tripType || 'leisure'} trip to ${destination}. JSON only.`

  const raw = await callClaude(prompt, system)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─── Generate budget breakdown ────────────────────────────────────────────────
export const generateBudgetBreakdown = async ({ destination, days, totalBudget }) => {
  const system = `You are a budget travel expert. Respond ONLY with a valid JSON array, no markdown, no preamble.
Shape: [{ "category": string, "estimatedAmount": number, "notes": string }]`

  const prompt = `Suggest a budget breakdown for a ${days}-day trip to ${destination} with a total budget of ₹${totalBudget}. JSON only.`

  const raw = await callClaude(prompt, system)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ─── Quick travel tips ────────────────────────────────────────────────────────
export const getTravelTips = async ({ destination }) => {
  const system = `You are a seasoned traveler. Respond ONLY with a JSON array, no markdown.
Shape: [{ "tip": string, "category": string }] — max 6 tips.`

  const prompt = `Give me essential travel tips for visiting ${destination}. JSON only.`

  const raw = await callClaude(prompt, system)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
