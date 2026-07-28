module.exports = (sequelize, DataTypes) => {
  const Summary = sequelize.define('Summary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM('court', 'detaille'),
      allowNull: false,
      defaultValue: 'detaille',
    },
    contenu: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, {
    tableName: 'resumes',
    indexes: [{ unique: true, fields: ['document_id', 'type'] }],
  });

  Summary.associate = (models) => {
    Summary.belongsTo(models.Document, { foreignKey: 'documentId', onDelete: 'CASCADE' });
  };

  return Summary;
};
