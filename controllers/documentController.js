const createError = require('http-errors');
const { Document } = require('../models');
const pdfService = require('../services/pdfService');
const generationService = require('../services/generationService');

function toSummaryJson(doc) {
  return {
    id: doc.id,
    nom: doc.nom,
    dateImport: doc.dateImport,
    longueurTexte: doc.texte ? doc.texte.length : 0,
  };
}

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, 'Aucun fichier PDF fourni (champ "file")');
    }

    const texte = await pdfService.extractText(req.file.buffer);
    if (!texte) {
      throw createError(422, "Impossible d'extraire du texte de ce PDF");
    }

    const document = await Document.create({
      nom: req.body.nom || req.file.originalname,
      texte,
      utilisateurId: req.user.id,
    });

    res.status(201).json({ document: toSummaryJson(document) });

    generateFlashcardsAndQuizInBackground(document);
  } catch (err) {
    next(err);
  }
};

async function generateFlashcardsAndQuizInBackground(document) {
  try {
    await generationService.generateFlashcardsForDocument(document);
    await generationService.generateQuizForDocument(document);
  } catch (err) {
    console.error(`Génération IA en arrière-plan échouée pour le document ${document.id} :`, err.message);
  }
}

exports.list = async (req, res, next) => {
  try {
    const documents = await Document.findAll({
      where: { utilisateurId: req.user.id },
      order: [['dateImport', 'DESC']],
    });
    res.json({ documents: documents.map(toSummaryJson) });
  } catch (err) {
    next(err);
  }
};

async function findOwnedDocument(id, userId) {
  const document = await Document.findOne({ where: { id, utilisateurId: userId } });
  if (!document) {
    throw createError(404, 'Document introuvable');
  }
  return document;
}

exports.getOne = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    res.json({
      document: {
        id: document.id,
        nom: document.nom,
        dateImport: document.dateImport,
        texte: document.texte,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const document = await findOwnedDocument(req.params.id, req.user.id);
    await document.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.findOwnedDocument = findOwnedDocument;
