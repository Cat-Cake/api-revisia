module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateImport: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    texte: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'documents',
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, { foreignKey: 'utilisateurId', onDelete: 'CASCADE' });
    Document.hasMany(models.Summary, { foreignKey: 'documentId', onDelete: 'CASCADE' });
    Document.hasMany(models.Flashcard, { foreignKey: 'documentId', onDelete: 'CASCADE' });
    Document.hasMany(models.Quiz, { foreignKey: 'documentId', onDelete: 'CASCADE' });
    Document.hasMany(models.Result, { foreignKey: 'documentId', onDelete: 'CASCADE' });
  };

  return Document;
};
