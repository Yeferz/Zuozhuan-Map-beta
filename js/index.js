/** @format */


//Map baselayers are all defined here, as are the filter conditions so the user can search locales on the map.
let searchBy;
let locales;
let filterCondition = /[a-z]/;
let rangeHigh = 722;
let rangeLow = 480;
//This is the slider, taken from here https://digital-geography.com/filter-leaflet-maps-slider/
var slidervar = document.getElementById('slider');
var numberFormatter = wNumb({
	postfix: ` BC`,
	decimals: 0,
});
const reignYears = new Map([
	['Ai', -494],
	['Ding', -508],
	['Zhao', -540],
	['Xiang', -571],
	['Cheng', -589],
	['Xuan', -607],
	['Wen', -625],
	['Xi', -658],
	['Min', -660],
	['Zhuang', -692],
	['Huan', -710],
	['Yin', -722],
]);
noUiSlider.create(slidervar, {
	connect: true,
	start: [480, 722],
	range: {
		min: 480,
		max: 722,
	},
	tooltips: [numberFormatter, numberFormatter], // Show tooltips for both handles
	format: {
		to: function (value) {
			return Math.round(value); // Round the value to the nearest integer for display
		},
		from: function (value) {
			return value; // Return the raw value when slider changes
		},
	},
	direction: 'rtl',
});

let inputNumberMin = document.getElementById('input-number-min');
let inputNumberMax = document.getElementById('input-number-max');
inputNumberMin.addEventListener('change', function () {
	slidervar.noUiSlider.set([this.value, null]);
});
inputNumberMax.addEventListener('change', function () {
	slidervar.noUiSlider.set([null, this.value]);
});

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '© OpenStreetMap',
});

var marker;
var Esri_WorldTerrain = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
	{
		attribution:
			'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
		maxZoom: 13,
	}
);
var Esri_WorldPhysical = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
	{
		attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
		maxZoom: 8,
	}
);
var USGS_USImagery = L.tileLayer(
	'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
	{
		maxZoom: 20,
		attribution:
			'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
	}
);
var Esri_WorldStreetMap = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
	{
		attribution:
			'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
	}
);
var map = L.map('map', {
	center: [34.669724, 112.442223],
	zoom: 10,
	layers: [Esri_WorldPhysical],
});
var markerGroup = L.layerGroup().addTo(map);

var baseMaps = {
	ESRI_Physical: Esri_WorldPhysical,
	ESRI_Terrain: Esri_WorldTerrain,
	OpenStreetMap: osm,
	ESRI_WorldStreetMap: Esri_WorldStreetMap,
	USGS: USGS_USImagery,
};

var layerControl = L.control.layers(baseMaps).addTo(map);
let outScopeSlider;
//This is the bit which initially collects the data from data.json and turns it into markers on the leaflet map, this defines what you see when you first open the main page.
fetch('js/data.json')
	.then((response) => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.json();
	})
	.then((data) => {
		// Process the retrieved JSON data
		// Use the retrieved data for further operations (e.g., creating markers on a map)
		sortIndividualLocalesOnLoad = function (data) {
			for (let i = 0; i < data.length; i++) {
				const indexedLocale = data[i];
				if (
					indexedLocale.latitude < 42 &&
					indexedLocale.latitude > 27 &&
					indexedLocale.longitude < 123 &&
					indexedLocale.longitude > 99 &&
					indexedLocale.hanzi != null
				)
				{
					const latitude = indexedLocale.latitude;
					const longitude = indexedLocale.longitude;
					const labelChinese = indexedLocale.hanzi;
					markerStyle = L.divIcon({
						className: 'custom-marker',
						html: `<div class="marker-text">${indexedLocale.hanzi}</div>`,
						iconSize: [labelChinese * 1.5, labelChinese * 4],
					});
					localeMarker = L.marker(
						[latitude, longitude],
						{
							icon: markerStyle,
						}
					).addTo(markerGroup);
					//This defines the popup which you see when you click on a marker.
					const yearsString = indexedLocale.years;
					const paragraphBreak = '</p><p>';
					const labelHanzi = `Hanzi/&#28450;&#23376;: ${indexedLocale.hanzi}`;
					const romanizedName = `Romanized name: ${indexedLocale.name}`;
					const associatedPolity = `Associated polity: ${indexedLocale.polity}`;
					const modernLocation = `Modern location: ${indexedLocale.location}`;
					const foundIn = `Found in: ${indexedLocale.entries}`;
					const yearsBC = `Ctext link for year BC: `;
					const buffer = '_';
					const labelArr = [];
					labelArr.push( labelHanzi, paragraphBreak, romanizedName, paragraphBreak, associatedPolity, paragraphBreak, modernLocation, paragraphBreak, foundIn, paragraphBreak, yearsBC, buffer );
					localeMarker.openPopup().addEventListener( 'click', () =>
					{
						
					//A new bit which will add hyperlinks in the years array, begin by turning the years to number so that we can parse it later.
					let yearsToNumber;
					if (yearsString !== null) {yearsToNumber = yearsString.split(',')} else {yearsToNumber = [1];};
					const yearsToNumberArr = [];
					for (value of yearsToNumber) {
						const x = Number(value);
						yearsToNumberArr.push(x);
					}
					//Here I will try to write a script which automates links, such that each of the years can be clicked on and will return the passage in which that location is mentioned.
					
						//This function takes the reignyears and returns a new array with each entry matched to a reign year.
					function dukeParser(value, index, array) {
						for (const [duke, year] of reignYears.entries()) {
							if (year + value <= 0) {
								const p = year / -1 - value;
								return [duke, p];
							}
						}
					}
					const yearsToNumberArrParsed = yearsToNumberArr.map(dukeParser);
					//This counter will let the dukeNameAndYear function cycle over the years array.
					let c = 0;
					let yearsLinksArr = [];
					//This function will give us the duke's name and year to be passed into the url. It works by looping over the chinese numbers array. I think there is a more elegant way to do this by changing the array when we jump to double digits but I will implement that later.
					function dukeNameAndYear(input) {
						for (const [key, value] of input) {
							const y = value;
							let counter = 0;
							const chineseYear = function (value) {
								const chineseNumberString = ['-yi', '-er', '-san', '-si', '-wu', '-liu', '-qi', '-ba', '-jiu', '-shi'];
								// console.log(value)
								let result = '';
								for (let i = 0; i < chineseNumberString.length; i++) {
								const x = i;
								for (let i = 0; i < chineseNumberString.length; i++) {
									counter ++;
									if (counter == value && x == 0 && i == 0 ) {
										result = `-yuan`} else if (x == 0 && counter == value) {
										result = `${chineseNumberString[i]}`} else if (counter == value && x == 1)  {result = `${chineseNumberString[9]}${chineseNumberString[i]}`} else if (counter == value) {
									result = `${chineseNumberString[x-1]}-shi${chineseNumberString[i]}`}
								}
							} 
							// console.log(result);
							return result;};
							const chineseYearResult = chineseYear(y);
							const dukeYearString = `/${key}-gong${chineseYearResult}-nian`;
							const urnString = `https://ctext.org/chun-qiu-zuo-zhuan${dukeYearString}`;
							const urnSearch = `<a href="${urnString}#:~:text=${indexedLocale.hanzi}">${yearsToNumberArr[c]}</a>`;
							c++;
							if (yearsToNumber == [1]) {
								yearsLinksArr.push( 'null' );
							} else
							{
								yearsLinksArr.push( urnSearch );
							}
							labelArr.pop();
							labelArr.push( yearsLinksArr );
						}
					};
						dukeNameAndYear( yearsToNumberArrParsed );
						const indexedLocaleString = labelArr.join(' ');
						localeMarker.openPopup([latitude, longitude]).bindPopup( indexedLocaleString );
					});
				} else {
				}
			}
		};
		sortIndividualLocalesOnLoad(data);
	});
// console.log(outScopeSlider);
//This is the same function as earlier but this time filtered with the user defined search term.
retrieveData = function () {
	fetch('js/data.json')
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			// Process the retrieved JSON data
			// console.log(data);
			locales = data;
			// console.log(locales);
			// Use the retrieved data for further operations (e.g., creating markers on a map)
			sortIndividualLocales = function (data) {
				for (let i = 0; i < data.length; i++) {
					let indexedLocale = data[i];
					// console.log(indexedLocale);
					// console.log(indexedLocale.latitude);
					if (
						(searchBy === 'name' &&
							filterCondition.test(indexedLocale.name) &&
							indexedLocale.latitude < 42 &&
							indexedLocale.latitude > 27 &&
							indexedLocale.longitude < 123 &&
							indexedLocale.longitude > 99 &&
							indexedLocale.hanzi != null &&
							indexedLocale.years >= rangeLow &&
							indexedLocale.years <= rangeHigh) ||
						(searchBy === 'polity' &&
							filterCondition.test(indexedLocale.polity) &&
							indexedLocale.latitude < 42 &&
							indexedLocale.latitude > 27 &&
							indexedLocale.longitude < 123 &&
							indexedLocale.longitude > 99 &&
							indexedLocale.hanzi != null &&
							indexedLocale.years >= rangeLow &&
							indexedLocale.years <= rangeHigh) ||
						(searchBy === 'hanzi' &&
							filterCondition.test(indexedLocale.hanzi) &&
							indexedLocale.latitude < 42 &&
							indexedLocale.latitude > 27 &&
							indexedLocale.longitude < 123 &&
							indexedLocale.longitude > 99 &&
							indexedLocale.hanzi != null &&
							indexedLocale.years >= rangeLow &&
							indexedLocale.years <= rangeHigh)
					) {
					const latitude = indexedLocale.latitude;
					const longitude = indexedLocale.longitude;
					const labelChinese = indexedLocale.hanzi;
					markerStyle = L.divIcon({
						className: 'custom-marker',
						html: `<div class="marker-text">${indexedLocale.hanzi}</div>`,
						iconSize: [labelChinese * 1.5, labelChinese * 4],
					});
					localeMarker = L.marker(
						[latitude, longitude],
						{
							icon: markerStyle,
						}
					).addTo(markerGroup);
					//This defines the popup which you see when you click on a marker.
					const yearsString = indexedLocale.years;
					const paragraphBreak = '</p><p>';
					const labelHanzi = `Hanzi/&#28450;&#23376;: ${indexedLocale.hanzi}`;
					const romanizedName = `Romanized name: ${indexedLocale.name}`;
					const associatedPolity = `Associated polity: ${indexedLocale.polity}`;
					const modernLocation = `Modern location: ${indexedLocale.location}`;
					const foundIn = `Found in: ${indexedLocale.entries}`;
					const yearsBC = `Ctext link for year BC: `;
					const buffer = '_';
					const labelArr = [];
					labelArr.push( labelHanzi, paragraphBreak, romanizedName, paragraphBreak, associatedPolity, paragraphBreak, modernLocation, paragraphBreak, foundIn, paragraphBreak, yearsBC, buffer );
					localeMarker.openPopup().addEventListener( 'click', () =>
					{
						
					//A new bit which will add hyperlinks in the years array, begin by turning the years to number so that we can parse it later.
					let yearsToNumber;
					if (yearsString !== null) {yearsToNumber = yearsString.split(',')} else {yearsToNumber = [1];};
					const yearsToNumberArr = [];
					for (value of yearsToNumber) {
						const x = Number(value);
						yearsToNumberArr.push(x);
					}
					//Here I will try to write a script which automates links, such that each of the years can be clicked on and will return the passage in which that location is mentioned.
					
						//This function takes the reignyears and returns a new array with each entry matched to a reign year.
					function dukeParser(value, index, array) {
						for (const [duke, year] of reignYears.entries()) {
							if (year + value <= 0) {
								const p = year / -1 - value;
								return [duke, p];
							}
						}
					}
					const yearsToNumberArrParsed = yearsToNumberArr.map(dukeParser);
					//This counter will let the dukeNameAndYear function cycle over the years array.
					let c = 0;
					let yearsLinksArr = [];
					//This function will give us the duke's name and year to be passed into the url. It works by looping over the chinese numbers array. I think there is a more elegant way to do this by changing the array when we jump to double digits but I will implement that later.
					function dukeNameAndYear(input) {
						for (const [key, value] of input) {
							const y = value;
							let counter = 0;
							const chineseYear = function (value) {
								const chineseNumberString = ['-yi', '-er', '-san', '-si', '-wu', '-liu', '-qi', '-ba', '-jiu', '-shi'];
								// console.log(value)
								let result = '';
								for (let i = 0; i < chineseNumberString.length; i++) {
								const x = i;
								for (let i = 0; i < chineseNumberString.length; i++) {
									counter ++;
									if (counter == value && x == 0 && i == 0 ) {
										result = `-yuan`} else if (x == 0 && counter == value) {
										result = `${chineseNumberString[i]}`} else if (counter == value && x == 1)  {result = `${chineseNumberString[9]}${chineseNumberString[i]}`} else if (counter == value) {
									result = `${chineseNumberString[x-1]}-shi${chineseNumberString[i]}`}
								}
							} 
							// console.log(result);
							return result;};
							const chineseYearResult = chineseYear(y);
							const dukeYearString = `/${key}-gong${chineseYearResult}-nian`;
							const urnString = `https://ctext.org/chun-qiu-zuo-zhuan${dukeYearString}`;
							const urnSearch = `<a href="${urnString}#:~:text=${indexedLocale.hanzi}">${yearsToNumberArr[c]}</a>`;
							c++;
							if (yearsToNumber == [1]) {
								yearsLinksArr.push( 'null' );
							} else
							{
								yearsLinksArr.push( urnSearch );
							}
							labelArr.push( yearsLinksArr );
						}
					};
						dukeNameAndYear( yearsToNumberArrParsed );
						const indexedLocaleString = labelArr.join(' ');
						localeMarker.openPopup([latitude, longitude]).bindPopup( indexedLocaleString );
					} );
					} else
					{
					}
				}
			};
			sortIndividualLocales(locales);
		});
};

//This is where the search terms are implemented and the function called which implements the user's search
let inputResult = document.getElementById('searchInput');
let clearResult = document.getElementById('Clear');
// console.log(searchBy);
// console.log(inputResult.value);
var searchPolity = document.getElementById('Search');
function setPolity() {
	// console.log('Polity filter applied');
	searchBy = document.getElementById('searchBy').value;
	var searchValue = inputResult.value;
	filterCondition = RegExp(searchValue);
	// console.log(filterCondition);
	markerGroup.clearLayers();
	retrieveData();
}
//This function clears the search and reverts to the initial map state
function clearPolity() {
	// console.log('Polity cleared');
	var searchValue = /[a-z]/;
	filterCondition = RegExp(searchValue);
	// console.log(filterCondition);
	searchBy = 'name';
	searchInput.value = '';
	markerGroup.clearLayers();
	retrieveData();
}
function dateFilter() {
	// Extracted from your code
	var searchValue = inputResult.value;
	filterCondition = RegExp(searchValue);
	console.log(`dates changed to ${rangeHigh}BC - ${rangeLow}BC`);

	// Ensure the correct range values are used here
	markerGroup.clearLayers();
	retrieveData();
}

slidervar.noUiSlider.on('update', function (values, handle) {
	//handle = 0 if min-slider is moved and handle = 1 if max slider is moved
	if (handle == 0) {
		document.getElementById('input-number-min').value = values[0];
		// console.log(`input no min changed to ${values[0]}`);
		rangeLow = Math.round(values[0]);
	} else {
		document.getElementById('input-number-max').value = values[1];
		// console.log(`input no max changed to ${values[1]}`);
		rangeHigh = Math.round(values[1]);
	}
	//we will definitely do more here...wait
});
searchPolity.addEventListener('click', setPolity);
clearResult.addEventListener( 'click', clearPolity );



					
// retrieveData();

//These are some buttons which I wrote but decided not to include, in future I might re-implement them so I've left the code commented out.

// Function to remove all markers from the map
// function removeAllMarkers() {
// 	console.log('removeAllMarkersPressed');
// 	// map.remove(marker); // Empty the 'markers' array
// }
// // Function to apply filter for Chu
// var Qi = document.getElementById('Qi');
// function applyFilterQi() {
// 	console.log('Jin filter applied');
// 	filterCondition = /Qi[^n]/;
// 	markerGroup.clearLayers();
// 	retrieveData();
// }
// Qi.addEventListener('click', applyFilterQi);
// var Chu = document.getElementById('Chu');
// function applyFilterChu() {
// 	// Perform actions specific to Option 1
// 	console.log('Chu filter applied');
// 	filterCondition = /Chu/;
// 	markerGroup.clearLayers();

// 	// Add your filtering logic or actions here for Option 1
// }
// Chu.addEventListener('click', applyFilterChu);

// var Jin = document.getElementById('Jin');
// // Function to apply filter for Option 2
// function applyFilterJin() {
// 	console.log('Jin filter applied');
// 	filterCondition = /Jin/;
// 	markerGroup.clearLayers();
// 	retrieveData();
// }
// Jin.addEventListener('click', applyFilterJin);

// Add event listeners to the buttons

// var marker = L.marker( [ 34.669724, 112.442223 ] ).addTo( map );
// marker.bindPopup( '<b>Hello world!</b><br>I am a popup.' ).openPopup();

// var popup = L.popup();

// function onMapClick(e) {
// 	popup
// 		.setLatLng(e.latlng)
// 		.setContent('You clicked the map at ' + e.latlng.toString())
// 		.openOn(map);
// }

// map.on('click', onMapClick);

// const express = require('express');
// const sqlite3 = require( 'sqlite3' ).verbose();
// const path = require('path');
// const app = express();
// const port = 3000;
// const dbPath = path.join(__dirname, '../Database.sqlite');

// const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
// 	if (err) {
// 		console.error('Error opening database:', err.message);
// 	} else {
// 		console.log('Connected to the database');
// 	}
// });

// app.get('/data', (req, res) => {
// 	db.all('SELECT * FROM locales_corrected', (err, rows) => {
// 		if (err) {
// 			res.status(500).json({ error: err.message });
// 			return;
// 		}
// 		res.json({ data: rows });
// 	});
// });

// app.listen(port, () => {
// 	console.log(`Server running on port ${port}`);
// });

// // Create the objects
// const objects = [];

// db.all('SELECT * FROM locales_corrected', (err, rows) => {
// 	if (err) {
// 		console.error('Error executing query:', err);
// 	} else {
// 		rows.forEach((row) => {
// 			const object = {};
// 			for (const key in row) {
// 				if (row.hasOwnProperty(key)) {
// 					object[key] = row[key];
// 				}
// 			}
// 			objects.push(object);
// 		});
// 		console.log('objects', objects);
// 	}
// });
// //Close the DB connection
// db.close((err) => {
// 	if (err) {
// 		console.error('Error closing database:', err);
// 	} else {
// 		console.log('Database connection closed.');
// 	}
// });