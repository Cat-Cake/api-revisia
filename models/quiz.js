module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    propositions: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    bonneReponse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'quiz',
  });

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.Document, { foreignKey: 'documentId', onDelete: 'CASCADE' });
  };

  return Quiz;
};
