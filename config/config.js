require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'revisia',
  password: process.env.DB_PASSWORD || 'revisia',
  database: process.env.DB_NAME || 'revisia',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
};

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: base,
};
