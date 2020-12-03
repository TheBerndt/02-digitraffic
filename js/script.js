//declaring variables
let table = document.getElementById('json');
const search = document.getElementById('search');
const matchList = document.getElementById('stationQueries');
const icon = document.createElementNS('http://www.w3.org/2000/svg', 'img');
icon.innerHTML = '<img src="icons/time.svg">'
document.getElementById("currentStationName").style.display = 'none';
let submitted = false;
let stationdata;

/* fetch stationlist that can be used to match
searched station and the stationshortcode that is
used in URL to get timetables then search
returned json and filter with regexp matchin stationname
OR stationshortcode */
const searchStations = async searchMeta => {
    const res = await fetch('https://rata.digitraffic.fi/api/v1/metadata/stations');
    const stations = await res.json();
    //match to current input using regexp
    let matches = stations.filter(station => {
        const regex = new RegExp(`^${searchMeta}`, 'gi');
        return station.stationName.match(regex) || station.stationShortCode.match(regex);
    });
    //if input is empty, matches = empty array and empty html
    if (searchMeta.length === 0) {
        stations = [];
        matchList.innerHTML = '';
    }
    //console.log(`matches are: ${matches}`);
    matchStations(matches);
}

//stationShortCode to get correct timetables for station (it's added in the URL)
let matchedCode = '';

//get matches and render them in html using map method
const matchStations = matches => {
    if(matches.length > 0) {
        const html = matches.map(match => `<option value="${match.stationName}"><option value="${match.stationShortCode}">`).join(' ');
        console.log('html is: ' + html);
        matchList.innerHTML = html;
        currentStationName = matches.map(match => `${match.stationName}`);
        matchedCode = matches.map(match => `${match.stationShortCode}`);
        //code = code.toString().split(',')[0];
        console.log('code from output is:' + matchedCode);
    }
}



//eventlistened for input, activates searchStates function
search.addEventListener('input', () => searchStations(search.value)); 


//handle submit
form.onsubmit = () => {
    //diable default submit
    event.preventDefault();
    //check if form is already submitted
    //if so, clean the table for new search
    if (submitted == false) {
        submitted = true;
        fetchDigiTraffic();
        console.log(`submitted is :${submitted}`);
    } else {
        table.innerHTML = '';
        fetchDigiTraffic();
    };
};

//add searched stationcode string to URL
const timetableURL = () => {
    const stationCode = matchedCode;
    //console.log('stationcode is: ' + stationCode);
    //console.log('this is the stationcode to request: ' + stationCode);
    const URL = `https://rata.digitraffic.fi/api/v1//live-trains/station/${stationCode}?minutes_before_departure=60&minutes_after_departure=0&minutes_before_arrival=0&minutes_after_arrival=0&train_categories=Commuter`;
    return URL;
}

//fetch data from digitraffic with url containing the stationcode
const fetchDigiTraffic = async () => {
    try {
        const URL = timetableURL();
        await fetch(URL)
            .then((response) => {
                return response.json();
            })
            .then((stationData) => {
                console.log(stationData);
                document.getElementById("currentStationName").innerHTML = currentStationName;
                document.getElementById("currentStationName").style.display = 'inline-block';

                

                //looping the fetched JSONs
                {   
                    for (let i in stationData) {
                        const commuterLineID = stationData[i].commuterLineID;
                        let commercialTrack = stationData[i].timeTableRows[i].commercialTrack;
                        const findDestination = stationData[i].timeTableRows.length;
                        const destination = stationData[i].timeTableRows[findDestination - 1].stationShortCode;
                        const start = stationData[i].timeTableRows[0].stationShortCode;
                        console.log(destination);
                        console.log(start);
                        //trackdata is sometimes missing from digitraffics data, replacing those with dash to indicate missing information
                        if (commercialTrack == '') {
                            commercialTrack = '-';
                        }

                        //console.log('commercialtrack is ' + commercialTrack);
                        let scheduledTime = stationData[i].timeTableRows[i].scheduledTime;
                        //console.log(scheduledTime);

                        //take timestamp from digitraffic json and convert it from UTC+0 timezone to UTC+2
                        let localTime = new Date(scheduledTime);
                        //console.log(`local:${localTime}`);
                        //this is a fix for displaying time correctly in iOS
                        localTimeString = localTime.toLocaleTimeString('fi-FI');
                        //console.log(localTimeString);
                        //let renderTime = localTimeString.split(',')[1];
                       
                        //create table for rendering the time table data
                        let row = table.insertRow(i);
                        let train = row.insertCell(0);
                        train.innerHTML = `${commuterLineID}`;
                        let track = row.insertCell(1);
                        track.innerHTML = `${commercialTrack}`;
                        let clock = row.insertCell(2);
                        clock.id = 'clockcell';
                        clock.innerHTML = `<img id="clock" src="icons/time.svg">`
                        let departure = row.insertCell(3);
                        departure.id = 'departurecell';
                        departure.innerHTML = `${localTimeString}`;
                        let from = row.insertCell(4);
                        from.innerHTML = `${start}`;
                        let to = row.insertCell(5);
                        to.innerHTML = `${destination}`;
                    }
                    //create headers for table
                    const rowtd = table.insertRow(0);
                    const linetd = rowtd.insertCell(0)
                    linetd.id = ("rowtd");
                    linetd.innerHTML = "Line";
                    let tracktd = rowtd.insertCell(1);
                    tracktd.id = ("rowtd");
                    tracktd.innerHTML = "Track"
                    let mt = rowtd.insertCell(2)
                    let departuretd = rowtd.insertCell(3);
                    departuretd.id = ("rowtd");
                    departuretd.innerHTML = "Time"
                    let fromtd = rowtd.insertCell(4);
                    fromtd.id = ("rowtd");
                    fromtd.innerHTML = "From"
                    let totd = rowtd.insertCell(5);
                    totd.id = ("rowtd");
                    totd.innerHTML = "To"
                }

            })
            //catch errors 
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }

}