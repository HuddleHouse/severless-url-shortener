import {fbAdmin} from "../firebase-admin";

var db = fbAdmin.firestore();
var counterRef = db.collection('counters');
var urlRef = db.collection('urls');
var clickRef = db.collection('clicks');

export const updateCounter = () => {
    console.log('updateCounter');
    counterRef.doc('url_count').get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data());

                let data = doc.data();
                counterRef.doc('url_count').update({seq: data.seq + 1});
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });
};

export const getCounter = () => {
    console.log('getCounter');
    return counterRef.doc('url_count').get();
};

export const saveUrl = (url, counter) => {
    console.log('saveUrl');
    return urlRef.doc(String(counter)).set(url)
};

export const findUrl = (url) => {
    return urlRef.where('long_url', '==', url).get();
};

export const addClick = (click) => {
    return clickRef.add(click);
};

export const getClickStatsForId = (id) => {
    return clickRef.where('url_id', '==', id).get();
};

export const getClickStats = () => {
    return clickRef.orderBy('url_id').get();
};

export const getUrls = () => {
    return urlRef.get();
};

export const findById = (id) => {
    return urlRef.doc(String(id)).get();
};