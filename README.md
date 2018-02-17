# Free URL Shortener using Firebase, Google Cloud Firestore, and Cloud Functions

## Features of <a href="https://pug.gl" target="_blank">pug.gl</a>

* Generate short URL's on [pug.gl](https://pug.gl)
* Build Routes and API
	* **/:encoded_id** - GET: Redirects to the Long URL
	* **/:encoded_id/test** - GET: Redirects to Long URL without saving click information in Firestore
	* **/:encoded_id/stats** - GET: Returns JSON of the stats for that particular Short URL
	* **/api/shorten** - POST: Returns Short URL
	* **/api/stats** - GET: Returns JSON of the stats for ALL short URL's

The stats that we will save for each click are:

```
{
	url_id: string,
	clicked_on: Date,
	long_url: string, //long URL that was shortened
	ip: string, // IP address of the click
	city: string, // City of the IP
	country: string,
	lat: number,
	lon: number,
	
	region: string,
	zip: number
}
```

## Global Requirements
You don't necessarily need the versions I list. Technology changes quick and I want to guarantee if you have the versions listed installed it will work! I do the same in the `package.json` file later.

* NodeJS (v6.11.1)
* NPM
* <a href="https://www.npmjs.com/package/typescript" target="_blank">typescript</a> (v2.1.4)
* <a href="https://www.npmjs.com/package/firebase-tools" target="_blank">firebase-tools</a> (v3.13.1) CLI for Firebase
