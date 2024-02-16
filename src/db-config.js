module.exports = {
    HOST: `${process.env.DB_HOST}`,
    USER: `${process.env.DB_USER}`,
    PASSWORD: `${process.env.DB_PASSWORD}`,
    DB: `${process.env.DB_NAME}`,
    dialect:  `${process.env.DB_DIALECT}`,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
// module.exports = {
//   HOST: `${process.env.host}`,
//   USER: `${process.env.user}`,
//   PASSWORD: `${process.env.password}`,
//   DB: `${process.env.db_name}`,
//     dialect: "mysql",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };
