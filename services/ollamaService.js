const createError = require('http-errors');

const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'mistral';
const MAX_CHARS = 12000;

async function callOllama(prompt) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        format: 'json',
        stream: false,
      }),
    });
  } catch (err) {
    throw createError(502, `Impossible de contacter Ollama (${BASE_URL}) : ${err.message}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw createError(502, `Erreur Ollama (${response.status}) : ${body}`);
  }

  const data = await response.json();
  return parseJson(data.response);
}

function parseJson(raw) {
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw createError(502, "Réponse de l'IA invalide (JSON attendu)");
  }
}

function truncate(texte) {
  return texte.length > MAX_CHARS ? texte.slice(0, MAX_CHARS) : texte;
}

async function generateSummary(texte) {
  const prompt = `Tu es un assistant pédagogique. À partir du cours ci-dessous, génère un résumé.
Réponds strictement en JSON avec le format suivant, sans aucun texte hors du JSON :
{"court": "résumé en 3 à 5 phrases", "detaille": "résumé détaillé structuré en plusieurs paragraphes"}

Cours :
"""${truncate(texte)}"""`;

  const result = await callOllama(prompt);
  if (!result.court || !result.detaille) {
    throw createError(502, "Réponse de l'IA incomplète pour le résumé");
  }
  return result;
}

async function generateFlashcards(texte, count = 10) {
  const prompt = `Tu es un assistant pédagogique. À partir du cours ci-dessous, génère ${count} flashcards de révision (question/réponse).
Réponds strictement en JSON avec le format suivant, sans aucun texte hors du JSON :
{"flashcards": [{"question": "...", "reponse": "..."}]}

Cours :
"""${truncate(texte)}"""`;

  const result = await callOllama(prompt);
  if (!Array.isArray(result.flashcards) || result.flashcards.length === 0) {
    throw createError(502, "Réponse de l'IA incomplète pour les flashcards");
  }
  return result.flashcards;
}

async function generateQuiz(texte, count = 10) {
  const prompt = `Tu es un assistant pédagogique. À partir du cours ci-dessous, génère un quiz à choix multiples de ${count} questions.
Chaque question doit avoir exactement 4 propositions, une seule étant correcte.
Réponds strictement en JSON avec le format suivant, sans aucun texte hors du JSON :
{"quiz": [{"question": "...", "propositions": ["...", "...", "...", "..."], "bonne_reponse": "doit être identique à l'une des propositions"}]}

Cours :
"""${truncate(texte)}"""`;

  const result = await callOllama(prompt);
  if (!Array.isArray(result.quiz) || result.quiz.length === 0) {
    throw createError(502, "Réponse de l'IA incomplète pour le quiz");
  }
  return result.quiz;
}

module.exports = { generateSummary, generateFlashcards, generateQuiz };
