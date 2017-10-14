import {shortener} from "./shortener";
const functions = require('firebase-functions');

// shortener.listen(3100, function(){
//     console.log('Server listening on port 3100');
// });

exports.shorten = functions.https.onRequest(shortener);
