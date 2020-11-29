
let table = document.getElementById('json');
const search = document.getElementById('search');
const matchList = document.getElementById('stationQueries');
const icon = document.createElementNS('http://www.w3.org/2000/svg', 'img');
icon.innerHTML = '<img src="icons/time.svg">'
let submitted = false;
let stationdata;

let time = new Date();
let timenow = document.getElementById("timenow");
timenow.innerHTML = time;

//search stationlist.json and filter
const searchStates = async searchText => {
    const res = await fetch('https://rata.digitraffic.fi/api/v1/metadata/stations');
    const states = await res.json();
    //match to current input
    let matches = states.filter(state => {
        const regex = new RegExp(`^${searchText}`, 'gi');
        return state.stationName.match(regex) || state.stationShortCode.match(regex);
    });

    //if input is empty, matches = empty array and empty html
    if (searchText.length === 0) {
        matches = [];
        matchList.innerHTML = '';
    }

    console.log(`matches are: ${matches}`);
    

    outputHtml(matches);

}

//stationShortCode to fetch timetables
let code = '';

const outputHtml = matches => {
    if(matches.length > 0) {
        const html = matches.map(match => `<option value="${match.stationName}"><option value="${match.stationShortCode}">`).join(' ');
        console.log('html is: ' + html);
        matchList.innerHTML = html;
        code = matches.map(match => `${match.stationShortCode}`);
        //code = code.toString().split(',')[0];
        console.log('code from output is:' + code);
    }
}

search.addEventListener('input', () => searchStates(search.value)); 


//handle input submit
form.onsubmit = () => {
    //diable default submit
    event.preventDefault();
    //check if form is already submitted
    //if so, clean the table for new search
    if (submitted == false) {
        submitted = true;
        fetchDigiTraffic();
        console.log(submitted);
    } else {
        table.innerHTML = '';
        fetchDigiTraffic();
    };
};

//add searched stationcode string to URL
const timetableURL = () => {
    const form = document.getElementById('form');
    let stationCode = code;
    console.log('stationcode is: ' + stationCode);
    //make here function that searches the station name from
    //digitraffic (another fetch also) and replaces it with correct stationcode
    console.log('this is the stationcode to request: ' + stationCode);
    const stationURL = 'https://rata.digitraffic.fi/api/v1//live-trains/station/';
    const searchURL = `${stationURL}${stationCode}?minutes_before_departure=60&minutes_after_departure=0&minutes_before_arrival=0&minutes_after_arrival=0&train_categories=Commuter`;
    return searchURL;
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

                {
                    for (let i in stationData) {
                        const commuterLineID = stationData[i].commuterLineID;
                        let commercialTrack = stationData[i].timeTableRows[i].commercialTrack;
                        const findDestination = stationData[i].timeTableRows.length;
                        const destination = stationData[i].timeTableRows[findDestination - 1].stationShortCode;
                        const start = stationData[i].timeTableRows[0].stationShortCode;
                        console.log(destination);
                        console.log(start);
                        //trackdata is sometimes missing, replacing those with dash
                        if (commercialTrack == '') {
                            commercialTrack = '-';
                        }

                        console.log('commercialtrack is ' + commercialTrack);
                        let scheduledTime = stationData[i].timeTableRows[i].scheduledTime;
                        scheduledTime = scheduledTime.split('T')[1];
                        scheduledTime = scheduledTime.slice(0, -5);

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
                        departure.innerHTML = `${scheduledTime}`;
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

    } catch (error) {
        console.log(error)
    }

}