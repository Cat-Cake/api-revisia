module.exports = (sequelize, DataTypes) => {
  const Flashcard = sequelize.define('Flashcard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reponse: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'flashcards',
  });

  Flashcard.associate = (models) => {
    Flashcard.belongsTo(models.Document, { foreignKey: 'documentId', onDelete: 'CASCADE' });
  };

  return Flashcard;
};
