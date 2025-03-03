// Your Google Sheets API key
const ABC = 'AIzaSyDJfDniGvYhACNUbgjQWV2cAyvgz2oAYlg';  // Replace with your actual API Key

// The ID of the Google Sheets document you want to read/write
const SHEET_ID = '1sKMmufs5sU_FAvLXkwfmBJEXLWZMalXPzio3rNXhByA';  // Replace with your Sheet ID

// Base URL for Google Sheets API
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

// Select elements from the DOM
const graveyardGrid = document.getElementById('graveyard-grid');
const modal = document.getElementById('edit-modal');
const cancelBtn = document.getElementById('cancel-btn');
const editForm = document.getElementById('edit-form');

// Fetch data once when the page loads and then render
function fetchDataAndRender() {
    fetchDataFromSheet().then(() => {
        renderGraveyard();  // Render after data is fetched
    });
}

// Fetch data from the Google Sheets
function fetchDataFromSheet() {
    const range = 'Sheet1!A2:E';  // Adjust this range according to your sheet layout

    return fetch(`${BASE_URL}/values/${range}?key=${ABC}`)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            if (rows.length) {
                graves = rows.map((row, index) => ({
                    id: index + 1,
                    name: row[0],
                    dob: row[1],
                    dod: row[2],
                    burialDate: row[3],
                    plot: row[4],
                }));
            } else {
                console.log('No data found.');
            }
        })
        .catch(err => console.error('Error reading data from sheet:', err));
}

// Render the graveyard grid
function renderGraveyard() {
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
    // Populate modal with grave details
    document.getElementById('name').value = grave.name;
    document.getElementById('dob').value = grave.dob;
    document.getElementById('dod').value = grave.dod;
    document.getElementById('burial-date').value = grave.burialDate;
    document.getElementById('plot').value = grave.plot;

    // Show the modal
    modal.style.display = 'flex';

    // Set up the form submission to update the grave
    editForm.onsubmit = function(event) {
        event.preventDefault();
        updateGrave(grave.id);
    };
}

// Close the modal without saving
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Update grave data locally and update in the Google Sheets
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

    modal.style.display = 'none';
    renderGraveyard();  // Re-render after update
}

// Update a grave in the Google Sheets
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

    fetch(`${BASE_URL}/values/${range}?valueInputOption=RAW&key=${ABC}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Grave data updated successfully.');
        })
        .catch(err => console.error('Error updating data in sheet:', err));
}

// Initialize the grid when the page loads
window.onload = fetchDataAndRender;