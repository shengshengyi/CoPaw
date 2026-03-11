/**
 * User Model - 用户模型
 * 
 * 对应数据库表: users
 * 包含用户基本信息、认证、角色等字段
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true
      },
      comment: '用户名'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      comment: '邮箱地址'
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
      comment: '密码哈希值'
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '昵称'
    },
    avatarUrl: {
      type: DataTypes.STRING(255),
      field: 'avatar_url',
      comment: '头像URL'
    },
    bio: {
      type: DataTypes.TEXT,
      comment: '个人简介'
    },
    status: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1, 2]]
      },
      comment: '状态: 0-禁用, 1-正常, 2-未激活'
    },
    role: {
      type: DataTypes.SMALLINT,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1, 2]]
      },
      comment: '角色: 0-管理员, 1-普通用户, 2-版主'
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      field: 'last_login_at',
      comment: '最后登录时间'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['username'] },
      { fields: ['email'] },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ],
    comment: '用户表'
  });

  // 实例方法
  User.prototype.isAdmin = function() {
    return this.role === 0;
  };

  User.prototype.isModerator = function() {
    return this.role === 2;
  };

  User.prototype.isActive = function() {
    return this.status === 1;
  };

  // 类方法
  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: 'user_id',
      as: 'posts'
    });
    User.hasMany(models.Reply, {
      foreignKey: 'user_id',
      as: 'replies'
    });
  };

  return User;
};
