const express = require( 'express' );
const redis = require('redis');
const { Client } = require( 'pg' );

// init app
const app = express();
const port = process.env.PORT || 4000;

// init redis
const REDIS_PORT = 6379
const REDIS_HOST = 'redis'
const redisClient = redis.createClient( {
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    legacyMode: true
} );

redisClient.on( 'connect', () =>
{
    console.log( 'Redis connected' );
}
);

redisClient.on( 'error', ( err ) =>
{
    console.error( 'Redis connection error:', err );
}
);
redisClient.connect( );
// DB
const DB_USER = 'root'
const DB_PASSWORD = 'example'
const DB_PORT = '5432'
const DB_HOST = 'postgres'

const URI = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`
const client = new Client( {
    connectionString: URI
} );

client.connect()
    .then( () => {
        console.log( 'PostgreSQL connected' );
    } )
    .catch( ( err ) => {
        console.error( 'PostgreSQL connection error:', err );
    } );

app.get( '/', ( req, res ) =>
{
    redisClient.set( 'product', 'products....' ).then( () =>
    {
        console.log( 'Redis set product' );
    } ).catch( ( err ) =>
    {
        console.error( 'Redis set error:', err );
    } );
    res.send( 'Hello World! hii' );
})

app.get( '/data', ( req, res ) =>
{
    redisClient.get( 'product' ).then( ( value ) =>
    {
        console.log( 'Redis get product:', value );
        res.send( `<h1> Hello</h1> <h2>${value}</h2>` );
    } ).catch( ( err ) =>
    {
        console.error( 'Redis get error:', err );
        res.status( 500 ).send( 'Error retrieving data' );
    } );
} )

app.listen( port, () => {
  console.log( `Server is running on http://localhost:${ port }` );
});