// Sample grave data
const graves = [
    { id: 1, name: 'John Doe', dob: '1970-01-01', dod: '2025-03-01', burialDate: '2025-03-05', plot: 'A1' },
    { id: 2, name: 'Jane Smith', dob: '1980-02-02', dod: '2025-04-01', burialDate: '2025-04-05', plot: 'B2' },
    { id: 3, name: 'Mary Johnson', dob: '1965-03-03', dod: '2025-05-01', burialDate: '2025-05-05', plot: 'C3' },
    // More graves can be added here
];

const CLIENT_ID = '759665749389-9vib7mh27gt0v1cravkvbd8u02b8qo1c.apps.googleusercontent.com';  // Replace with your OAuth 2.0 Client ID
const ABC = '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';  // Replace with your API key
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';  // The scope needed for read/write access
const SHEET_ID = '1sKMmufs5sU_FAvLXkwfmBJEXLWZMalXPzio3rNXhByA';  // Replace with your Google Sheets ID

let auth2;

// Initialize Google Auth2 client
function initAuth() {
    gapi.auth2.init({
        client_id: CLIENT_ID,
    }).then(() => {
        auth2 = gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
            console.log("Already signed in!");
        } else {
            console.log("Please sign in.");
        }
    });
}

// Handle Sign-In and Sign-Out
function handleAuthClick() {
    if (auth2.isSignedIn.get()) {
        auth2.signOut().then(() => {
            console.log('Signed out');
        });
    } else {
        auth2.signIn().then(() => {
            console.log('Signed in');
            fetchDataAndRender();  // Fetch data and render after sign-in
        });
    }
}

// Fetch data from the Google Sheets API
function fetchDataFromSheet() {
    const range = 'Sheet1!A2:E';  // Adjust this range according to your sheet layout

    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: range,
    }).then(response => {
        const rows = response.result.values;
        if (rows.length) {
            graves.length = 0;  // Clear the current graves array before updating
            rows.forEach((row, index) => {
                graves.push({
                    id: index + 1,
                    name: row[0],
                    dob: row[1],
                    dod: row[2],
                    burialDate: row[3],
                    plot: row[4],
                });
            });
            renderGraveyard();  // Re-render the graveyard grid after fetching data
        } else {
            console.log('No data found.');
        }
    }).catch(err => console.error('Error reading data from sheet:', err));
}

// Update a grave in the Google Sheets API
function updateGraveInSheet(graveId, updatedGrave) {
    const range = `Sheet1!A${graveId + 1}:E${graveId + 1}`;  // Assuming data starts at row 2

    const values = [
        [
            updatedGrave.name,
            updatedGrave.dob,
            updatedGrave.dod,
            updatedGrave.burialDate,
            updatedGrave.plot,
        ],
    ];

    const body = {
        values: values,
    };

    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: range,
        valueInputOption: 'RAW',
        resource: body,
    }).then(response => {
        console.log('Grave data updated successfully.');
        renderGraveyard();  // Re-render after update
    }).catch(err => {
        console.error('Error updating data in sheet:', err);
    });
}

// Load the Google Sheets API client
function loadClient() {
    gapi.client.setApiKey(ABC);
    gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4')
        .then(() => console.log('Google Sheets API loaded successfully'))
        .catch(err => console.error('Error loading Google Sheets API:', err));
}

// Render the graveyard grid
function renderGraveyard() {
    const graveyardGrid = document.getElementById('graveyard-grid');
    graveyardGrid.innerHTML = '';  // Clear the grid before re-rendering

    graves.forEach(grave => {
        const graveDiv = document.createElement('div');
        graveDiv.classList.add('grave');
        graveDiv.innerHTML = `<p>${grave.name}</p><small>${grave.plot}</small>`;
        graveDiv.addEventListener('click', () => openModal(grave));
        graveyardGrid.appendChild(graveDiv);
    });
}

// Open modal to edit grave details
function openModal(grave) {
    const modal = document.getElementById('edit-modal');
    document.getElementById('name').value = grave.name;
    document.getElementById('dob').value = grave.dob;
    document.getElementById('dod').value = grave.dod;
    document.getElementById('burial-date').value = grave.burialDate;
    document.getElementById('plot').value = grave.plot;

    modal.style.display = 'flex';

    const cancelBtn = document.getElementById('cancel-btn');
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    const editForm = document.getElementById('edit-form');
    editForm.onsubmit = function (event) {
        event.preventDefault();
        updateGrave(grave.id);
    };
}

// Update grave in the local array and Google Sheets
function updateGrave(graveId) {
    const updatedGrave = {
        name: document.getElementById('name').value,
        dob: document.getElementById('dob').value,
        dod: document.getElementById('dod').value,
        burialDate: document.getElementById('burial-date').value,
        plot: document.getElementById('plot').value
    };

    const graveIndex = graves.findIndex(grave => grave.id === graveId);
    if (graveIndex !== -1) {
        graves[graveIndex] = updatedGrave;  // Update in local array
        updateGraveInSheet(graveId, updatedGrave);  // Update in Google Sheets
    }

    const modal = document.getElementById('edit-modal');
    modal.style.display = 'none';
}

// Initialize the grid when the page loads
window.onload = function () {
    gapi.load('client:auth2', initAuth);
};
