module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database/quiklii_dev.sqlite',
    logging: console.log // opcional: para ver queries en consola
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    logging: false
  }
};
