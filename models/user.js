module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    motDePasse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'utilisateurs',
  });

  User.associate = (models) => {
    User.hasMany(models.Document, { foreignKey: 'utilisateurId', onDelete: 'CASCADE' });
    User.hasMany(models.Result, { foreignKey: 'utilisateurId', onDelete: 'CASCADE' });
  };

  return User;
};
