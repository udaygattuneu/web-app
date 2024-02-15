module.exports = {
    HOST: `${process.env.host}`,
    USER: `${process.env.user}`,
    PASSWORD: `${process.env.password}`,
    DB: `${process.env.db_name}`,
    dialect: "mysql",
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
// module.exports = {
//   HOST: `localhost`,
//   USER: `root`,
//   PASSWORD: `Uday_Sql23@`,
//   DB: `database1`,
//     dialect: "mysql",
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// };
