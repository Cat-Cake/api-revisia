const createError = require('http-errors');

const BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'mistral';
const MAX_CHARS = 8000;

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
        keep_alive: '30m',
        options: { temperature: 0.3 },
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
    console.error('Réponse Ollama non-JSON reçue :', raw);
    throw createError(502, "Réponse de l'IA invalide (JSON attendu)");
  }
}

function truncate(texte) {
  return texte.length > MAX_CHARS ? texte.slice(0, MAX_CHARS) : texte;
}

async function generateSummary(texte) {
  const prompt = `Voici un extrait de cours :
"""${truncate(texte)}"""

En te basant uniquement sur ce cours, rédige un résumé court (3 à 5 phrases) et un résumé détaillé (plusieurs paragraphes structurés).
Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, selon exactement ce format :
{"court": "...", "detaille": "..."}

Exemple de réponse attendue (structure uniquement, adapte le contenu au cours ci-dessus) :
{"court": "Ce cours traite de X. Il aborde Y et Z. Il conclut sur W.", "detaille": "Le cours commence par... Ensuite... Enfin..."}`;

  const result = await callOllama(prompt);
  if (!result.court || !result.detaille) {
    console.error('Résumé incomplet reçu d\'Ollama :', JSON.stringify(result));
    throw createError(502, "Réponse de l'IA incomplète pour le résumé");
  }
  return result;
}

async function generateFlashcards(texte, count = 5) {
  const prompt = `Voici un extrait de cours :
"""${truncate(texte)}"""

En te basant uniquement sur ce cours, génère ${count} flashcards de révision (question/réponse).
Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, selon exactement ce format :
{"flashcards": [{"question": "...", "reponse": "..."}]}

Exemple de réponse attendue (structure uniquement, adapte le contenu au cours ci-dessus) :
{"flashcards": [{"question": "Qu'est-ce que X ?", "reponse": "X est..."}]}`;

  const result = await callOllama(prompt);
  const flashcards = (Array.isArray(result.flashcards) ? result.flashcards : [])
    .filter((f) => f && typeof f.question === 'string' && f.question.trim() &&
      typeof f.reponse === 'string' && f.reponse.trim())
    .map((f) => ({ question: f.question.trim(), reponse: f.reponse.trim() }));

  if (flashcards.length === 0) {
    console.error('Flashcards incomplètes reçues d\'Ollama :', JSON.stringify(result));
    throw createError(502, "Réponse de l'IA incomplète pour les flashcards");
  }
  return flashcards;
}

async function generateQuiz(texte, count = 5) {
  const prompt = `Voici un extrait de cours :
"""${truncate(texte)}"""

En te basant uniquement sur ce cours, génère un quiz à choix multiples de ${count} questions.
Chaque question doit avoir exactement 4 propositions courtes et distinctes (jamais une liste de plusieurs éléments dans une seule proposition).
Pour CHAQUE question, indique la bonne réponse via le champ "index_bonne_reponse" : un nombre entier entre 0 et 3 donnant la position de la bonne réponse dans le tableau "propositions" (0 = première, 1 = deuxième, 2 = troisième, 3 = quatrième). Ce champ est obligatoire, ne l'omets jamais.
Réponds UNIQUEMENT avec un objet JSON valide, sans aucun texte avant ou après, selon exactement ce format :
{"quiz": [{"question": "...", "propositions": ["...", "...", "...", "..."], "index_bonne_reponse": 0}]}

Exemple de réponse attendue (structure uniquement, adapte le contenu au cours ci-dessus ; ici la bonne réponse est "C", donc l'index vaut 2) :
{"quiz": [{"question": "Que représente X ?", "propositions": ["A", "B", "C", "D"], "index_bonne_reponse": 2}]}`;

  const result = await callOllama(prompt);
  const quiz = (Array.isArray(result.quiz) ? result.quiz : [])
    .filter((q) => q && typeof q.question === 'string' && q.question.trim() &&
      Array.isArray(q.propositions) && q.propositions.length >= 2 &&
      Number.isInteger(q.index_bonne_reponse) &&
      q.index_bonne_reponse >= 0 && q.index_bonne_reponse < q.propositions.length)
    .map((q) => {
      const propositions = q.propositions.map((p) => String(p).trim());
      return {
        question: q.question.trim(),
        propositions,
        bonne_reponse: propositions[q.index_bonne_reponse],
      };
    });

  if (quiz.length === 0) {
    console.error('Quiz incomplet reçu d\'Ollama :', JSON.stringify(result));
    throw createError(502, "Réponse de l'IA incomplète pour le quiz");
  }
  if (quiz.length < result.quiz.length) {
    console.warn(`${result.quiz.length - quiz.length} question(s) de quiz écartée(s) (format invalide reçu d'Ollama)`);
  }
  return quiz;
}

module.exports = { generateSummary, generateFlashcards, generateQuiz };
