import {
    addClick, findById, findUrl, getClickStats, getClickStatsForId, getCounter, getUrls, saveUrl,
    updateCounter
} from "./providers/firebase-service";
import {config} from "./config";
import {encode, decode} from "./providers/hash-service";
import {isUndefined} from "util";
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var geoip = require('geoip-lite');
var cors = require('cors');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/shorten', function(req, res){
    var longUrl = req.body.url;
    var shortUrl = '';

    // checks to see if the URL exists
    findUrl(longUrl).then(snapshot => {
        if(snapshot.docs.length) {
            // There already is a short url, so return that
            // We take the counter id from Firestore and run it against the base58 encode function
            let id = snapshot.docs[0].id;
            shortUrl = config.webhost + encode(id);
            res.send({'shortUrl': shortUrl});
        }
        else {
            // Make a new short URL and store it in Firestore
            let date = new Date();
            let url = {
                long_url: longUrl,
                created_at: date
            };

            getCounter().then(doc => {
                let counter = doc.data().seq;
                console.log(counter)
                saveUrl(url, counter).then((ret) => {
                    console.log(ret);
                    updateCounter();
                    shortUrl = config.webhost + encode(counter);
                    res.send({'shortUrl': shortUrl});
                });
            }).catch(err => {
                console.log('Error getting document', err);
            });
        }

    }).catch(err => {
        console.log('Error getting documents', err);
    });

});

app.get('/api/stats', function(req, res){
    // Get all the click stats from Firestore
    getClickStats().then(snapshot => {
        if (snapshot.docs.length) {
            let clicks = {};
            snapshot.forEach(doc => {
                let click = doc.data();

                if(isUndefined(clicks[click.url_id])) {
                    clicks[click.url_id] = {
                        numClicks: 0,
                        longUrl: click.long_url,
                        urlId: click.url_id,
                        shortUrl: config.webhost + encode(click.url_id),
                        clickData: []
                    };
                }
                clicks[click.url_id].numClicks += 1;
                clicks[click.url_id].clickData.push(click);
            });

            getUrls().then(snap => {
                snap.forEach(doc => {
                    let url = doc.data();
                    if(isUndefined(clicks[doc.id])) {
                        clicks[doc.id] = {
                            numClicks: 0,
                            longUrl: url.long_url,
                            urlId: doc.id,
                            shortUrl: config.webhost + encode(doc.id),
                            clickData: []
                        };
                    }
                });
                res.send(clicks);
            }).catch(err => {
                console.log('Error getting document', err);
            });


        }
    }).catch(err => {
        console.log('Error getting document', err);
    });
});

app.get('/:encoded_id', function(req, res){
    var base58Id = req.params.encoded_id;
    var id = decode(base58Id);

    findById(id).then(doc => {
        if (!doc.exists) {
            console.log('No such URL!');
            res.redirect(config.redirect);
        } else {
            console.log("URL Found");
            // Redirect to the Long URL
            res.redirect(doc.data().long_url);

            // Get the IP address of the click
            var ip = getClientAddress(req.headers['x-forwarded-for']);
            // Use geoip-lite to get stats from that IP and save to Firestore
            var geo = geoip.lookup(ip);
            var lat = '';
            var lon = '';

            if(geo.ll) {
                lat = geo.ll[0];
                lon = geo.ll[1];
            }
            let date = new Date();
            let click = {
                url_id: id,
                clicked_on: date,
                long_url: doc.data().long_url,
                ip: ip,
                city: geo.city || '',
                country: geo.country || '',
                lat: lat,
                lon: lon,
                state: geo.region || '',
                zip: geo.zip || ''
            };
            addClick(click);
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });
});

app.get('/:encoded_id/test', function(req, res){
    // Redirect to the long URL but do not collect stats
    var base58Id = req.params.encoded_id;
    var id = decode(base58Id);

    findById(id).then(doc => {
        if (!doc.exists) {
            console.log('No such URL!');
            res.redirect(config.redirect);
        } else {
            console.log("URL Found");
            res.redirect(doc.data().long_url);
        }
    }).catch(err => {
        console.log('Error getting document', err);
    });
});

app.get('/:encoded_id/stats', function(req, res){
    var base58Id = req.params.encoded_id;
    var id = decode(base58Id);

    // Get the stats for the Short URl and return them in JSON
    getClickStatsForId(id).then(snapshot => {

        if (snapshot.docs.length) {
            let clicks = [];
            snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                clicks.push(doc.data());
            });
            res.send({
                numClicks: snapshot.docs.length,
                clickData: clicks
            });
        }
        else {
            res.send({
                numClicks: 0,
                clickData: []
            });
        }
    })
});

function getClientAddress(request){
    return (request || '').split(',')[0];
}

export const shortener = app;