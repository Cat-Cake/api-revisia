module.exports = (sequelize, DataTypes) => {
  // Le cahier des charges relie les Resultats a un `quiz_id`. Ici un "quiz" est
  // en realite un ensemble de questions liees a un document (table Quiz), donc
  // le resultat d'une tentative est rattache au document dont le quiz a ete joue.
  const Result = sequelize.define('Result', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'resultats',
  });

  Result.associate = (models) => {
    Result.belongsTo(models.User, { foreignKey: 'utilisateurId', onDelete: 'CASCADE' });
    Result.belongsTo(models.Document, { foreignKey: 'documentId', onDelete: 'CASCADE' });
  };

  return Result;
};
