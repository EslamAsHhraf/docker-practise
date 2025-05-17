const express = require( 'express' );
const mongoose = require('mongoose');


const app = express();
const port = process.env.PORT || 4000;

const DB_USER = 'root'
const DB_PASSWORD = 'example'
const DB_PORT = '27017'
const DB_HOST = 'mongo'

const URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`

mongoose.connect( URI ).then( () => {
    console.log( 'MongoDB connected' );
}).catch( ( err ) => {
    console.error( 'MongoDB connection error:', err );
});

app.get( '/', ( req, res ) =>
{
    res.send( 'Hello World! hii' );
})

app.listen( port, () => {
  console.log( `Server is running on http://localhost:${ port }` );
});