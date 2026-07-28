require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const documentsRouter = require('./routes/documents');
const resultsRouter = require('./routes/results');
const dashboardRouter = require('./routes/dashboard');

const app = express();

app.use(helmet());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/results', resultsRouter);
app.use('/api/dashboard', dashboardRouter);

// 404
app.use((req, res, next) => {
  next(createError(404, 'Route introuvable'));
});

// error handler (JSON)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    err.status = 400;
    err.expose = true;
  }
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.expose ? err.message : (status === 500 ? 'Erreur interne du serveur' : err.message),
      status,
    },
  });
  if (status === 500) {
    console.error(err);
  }
});

module.exports = app;
