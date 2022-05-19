const path = require('path');
const postgres = require('postgres');
const { adminDB, db } = require('../fsmConfig');

if (process.argv.includes('--create')) {
  create();
} else if (process.argv.includes('--destroy') ) {
  destroy();
}

/**
 * Create a new synx-matrix user and database using configured credentials
 */
async function create () {
  // run destroy first just in case
  await destroy()

  console.log('Creating fresh syncmatrix user and database...')

  // adminDB config represents built-in postgres admin account and db
  const sql = postgres({
    ...adminDB
  })
  let appSQL

  try {
    // create syncmatrix user
    await sql`create user ${sql(db.username)} password '${sql(db.password)}'`

    // create syncmatrix database owned by syncmatrix user
    await sql`create database ${sql(db.database)} with owner ${sql(db.username)}`

    // connect to the syncmatrix db
    appSQL = postgres({
      ...db,
      password: `"${db.password}"`
    })

    // load the schema
    await appSQL.file(path.join(__dirname, '../schemas/schema.sql'))

    // load the data
    await appSQL.file(path.join(__dirname, '../schemas/data.sql'))
  } catch (e) {
    console.error(e)
  }

  appSQL.end()
  sql.end()
}

/**
 * Destroy the syncmatrix database and user
 */
async function destroy () {
  console.log('Wiping out syncmatrix user and database if they exist...')

  // adminDB config represents built-in postgres admin account and db
  const sql = postgres({
    ...adminDB
  })

  try {
    // remove syncmatrix database
    await sql`drop database if exists ${sql(db.database)}`

    // check if syncmatrix user exists
    const [row] = await sql`select * from pg_catalog.pg_roles where rolname = ${db.username}`

    if (row) {
      // remove permissions from syncmatrix user
      await sql`drop owned by ${sql(db.username)}`

      // remove syncmatrix user
      await sql`drop role if exists ${sql(db.username)}`
    }
  } catch (e) {
    console.error(e)
  }

  sql.end()
}
