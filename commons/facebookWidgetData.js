var Sequelize = require("sequelizedb.js");

/**
 * Facebook widget model
 */
var facebookWidgetData = Sequelize.define('users_data_facebook', {
  id: Sequelize.INTEGER,
  userID: Sequelize.TEXT,
  saveTime: Sequelize.DATE,
  viewID: Sequelize.INTEGER,
  campaignID: Sequelize.INTEGER,
  effectiveStatus: Sequelize.STRING,
  objective: Sequelize.STRING,
  impressions: Sequelize.INTEGER,
  reach: Sequelize.INTEGER,
  clicks: Sequelize.INTEGER,
  cpc: Sequelize.FLOAT,
  cpm: Sequelize.FLOAT,
  cpp: Sequelize.FLOAT,
  ctr: Sequelize.FLOAT,
  comments: Sequelize.INTEGER,
  likes: Sequelize.INTEGER,
  unique_clicks: Sequelize.INTEGER
});

module.exports = facebookWidgetData;
