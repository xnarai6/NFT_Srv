module.exports = {
    host: process.env['NFT_DB_HOST'],
    port: process.env['NFTDB_PORT'],
    user: process.env['NFT_DB_USER'],
    password: process.env['NFT_DB_PASSWORD'],
    database: process.env['NFT_DB_DATABASE'],
    connectionLimit: 100,
    connectTimeout: 1000,
    multipleStatements: true,
};