/** @format */
/*The aim of this script will be severalfold.
1) To clean excess punctuation.
2) To give locales with unknown locations coordinates based on the mean for the polity with which they are associated. Where there are two or more states, they will be given a location between the means of both.
3) To update the GEOMETRY field based on the new geocoding rules.
*/
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { where } = require('@tensorflow/tfjs');
const dbPath = path.join(__dirname, '../Database.sqlite');
//Open the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error('Error opening database:', err.message);
	} else {
		console.log('Connected to the database');
	}
});
const query = `SELECT * FROM locales_corrected`;
//Run the queries
db.all(query, [], (err, rows) => {
	if (err) {
		console.error(err.message);
		return;
	}
	//This bit of the script aims to take each unique polity and push them to an array, this will be useful later because we will want to assign mean coordinates to each of the categories.
	//We have now isolated all unique polities and pushed them to an array.
	let uniquePolities = [];
	for (const row of rows) {
		const stopValue = row.polity;
		const testRegex = RegExp(/\b[A-Z][a-zA-Z]*\b/g);
		if (testRegex.test(stopValue)) {
			const makeBoundaries = stopValue.match(testRegex);
			makeBoundaries.forEach((element) => {
				if (!uniquePolities.includes(element)) {
					const polityObject = { polity: element, coordinates: null };
					uniquePolities.push(polityObject);
				}
			});
			console.log(stopValue, testRegex, makeBoundaries);
		}
		//This bit will test all locations and assign them mean coordinates based on the mean for that polity
		const unknownLocationTest = 'Unk';
	}
	console.log(uniquePolities);
});

//Close the DB connection
db.close((err) => {
	if (err) {
		console.error('Error closing database:', err);
	} else {
		console.log('Database connection closed.');
	}
});