document.addEventListener('DOMContentLoaded', function () {
    // Google Sheets API Configuration
    const KEY = 'AIzaSyDJfDniGvYhACNUbgjQWV2cAyvgz2oAYlg'; // Add your API key here
    const SHEET_ID = '1sKMmufs5sU_FAvLXkwfmBJEXLWZMalXPzio3rNXhByA'; // Add your Sheet ID here
    const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
    const CLIENT_ID = '759665749389-9vib7mh27gt0v1cravkvbd8u02b8qo1c.apps.googleusercontent.com'; // Add your Client ID here

    let accessToken = sessionStorage.getItem('accessToken');
    const outputDiv = document.getElementById('output-div');
    const authBtn = document.getElementById('auth-btn');
    const addGraveBtn = document.getElementById('add-grave-btn');

    // Sample grave data - will be replaced with data from Google Sheets
    let graves = [
        { id: 'A1', name: 'Ahmed Abdullah', date: '2023-05-15', age: 78, gender: 'Male', origin: 'Egypt', notes: 'Beloved father and grandfather', x: 120, y: 300, rotation: 0 },
        { id: 'A2', name: 'Fatima Hassan', date: '2023-06-22', age: 65, gender: 'Female', origin: 'Morocco', notes: 'Respected community member', x: 120, y: 400, rotation: 0 },
        { id: 'A3', name: 'Yusuf Ali', date: '2023-07-10', age: 82, gender: 'Male', origin: 'Pakistan', notes: 'Imam for 30 years', x: 120, y: 500, rotation: 0 },
        { id: 'B1', name: 'Aisha Rahman', date: '2023-08-05', age: 45, gender: 'Female', origin: 'Bangladesh', notes: 'Loving mother of three', x: 320, y: 300, rotation: 5 },
        { id: 'B2', name: 'Omar Farooq', date: '2023-09-18', age: 70, gender: 'Male', origin: 'Saudi Arabia', notes: 'Generous philanthropist', x: 320, y: 400, rotation: -3 },
        { id: 'B3', name: 'Zainab Malik', date: '2023-10-30', age: 55, gender: 'Female', origin: 'Jordan', notes: 'Dedicated teacher', x: 320, y: 500, rotation: 0 },
        { id: 'C1', name: 'Ibrahim Khan', date: '2023-11-12', age: 68, gender: 'Male', origin: 'India', notes: 'Respected businessman', x: 520, y: 300, rotation: 0 },
        { id: 'C2', name: 'Khadija Ahmed', date: '2023-12-25', age: 92, gender: 'Female', origin: 'Turkey', notes: 'Oldest community member', x: 520, y: 400, rotation: 2 },
        { id: 'D1', name: 'Mustafa Kamal', date: '2024-01-08', age: 60, gender: 'Male', origin: 'Lebanon', notes: 'Loved by all who knew him', x: 720, y: 300, rotation: -5 },
        { id: 'E1', name: 'Amina Begum', date: '2024-02-14', age: 75, gender: 'Female', origin: 'Malaysia', notes: 'Devoted to charity work', x: 920, y: 300, rotation: 0 },
    ];

    const gravesContainer = document.getElementById('graves-container');
    const cemeteryMap = document.getElementById('cemetery-map');
    const graveModal = document.getElementById('grave-modal');
    const addGraveModal = document.getElementById('add-grave-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const addGraveSaveBtn = document.getElementById('add-grave-save-btn');
    const addGraveCancelBtn = document.getElementById('add-grave-cancel-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const columnFilter = document.getElementById('column-filter');
    const mapPreview = document.getElementById('map-preview');
    const mapPreviewMarker = document.getElementById('map-preview-marker');
    const editMapPreview = document.getElementById('edit-map-preview');
    const editMapPreviewMarker = document.getElementById('edit-map-preview-marker');
    const treeDensitySlider = document.getElementById('tree-density');
    const treeDensityValue = document.getElementById('tree-density-value');
    const shrubDensitySlider = document.getElementById('shrub-density');
    const shrubDensityValue = document.getElementById('shrub-density-value');
    const generateVegetationBtn = document.getElementById('generate-vegetation');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');

    let currentGraveId = null;
    let originalGraveData = null; // Store original data for cancel operation
    let currentScale = 1;
    let currentTranslateX = 0;
    let currentTranslateY = 0;
    let isDraggingMap = false;
    let lastPosX = 0;
    let lastPosY = 0;

    // Fixed vegetation positions
    const fixedTrees = [
        { x: 40, y: 40, small: true },
        { x: 1100, y: 40, small: false },
        { x: 40, y: 700, small: false },
        { x: 1100, y: 700, small: false },
        { x: 52, y: 32, small: true },
        { x: 91, y: 76, small: false },
        { x: 234, y: 67, small: true },
        { x: 456, y: 54, small: false },
        { x: 543, y: 43, small: true },
        { x: 789, y: 50, small: false },
        { x: 120, y: 45, small: true },
        { x: 200, y: 60, small: false },
        { x: 320, y: 50, small: false },
        { x: 450, y: 70, small: false },
        { x: 600, y: 80, small: false },
        { x: 720, y: 65, small: false },
        { x: 850, y: 55, small: false },
        { x: 900, y: 40, small: false },
        { x: 950, y: 78, small: false },
        { x: 1000, y: 50, small: false },
        { x: 180, y: 52, small: true },
        { x: 240, y: 36, small: true },
        { x: 330, y: 61, small: true },
        { x: 400, y: 72, small: true },
        { x: 570, y: 50, small: true },
        { x: 680, y: 48, small: true }
    ];

    const fixedShrubs = [
        { x: 200, y: 200 },
        { x: 400, y: 150 },
        { x: 600, y: 150 },
        { x: 800, y: 150 },
        { x: 200, y: 650 },
        { x: 400, y: 650 },
        { x: 600, y: 650 },
        { x: 800, y: 650 },
        { x: 70, y: 34 },
    ];

    // Check if user is authenticated
    function isAuthenticated() {
        return !!accessToken;
    }

    // Update UI based on authentication status
    function updateAuthUI() {
        if (isAuthenticated()) {
            outputDiv.textContent = 'Authenticated. You can now modify the data.';
            deleteBtn.disabled = false;
            editBtn.disabled = false;
            addGraveBtn.style.display = 'block';
        } else {
            outputDiv.textContent = 'Not authenticated. Please authenticate to make changes.';
            deleteBtn.disabled = true;
            editBtn.disabled = true;
            addGraveBtn.style.display = 'none';
        }
    }

    // Google Sheets Authentication
    async function authenticate() {
        try {
            accessToken = await getToken();
            if (accessToken) {
                sessionStorage.setItem('accessToken', accessToken);
                updateAuthUI();
            } else {
                outputDiv.textContent = 'Authorization failed.';
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            outputDiv.textContent = 'Authentication error. Check console for details.';
        }
    }

    function getToken() {
        return new Promise((resolve, reject) => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                callback: (tokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        reject(tokenResponse);
                    }
                    resolve(tokenResponse.access_token);
                },
            });
            tokenClient.requestAccessToken();
        });
    }

    // Add trees to the cemetery map
    function addFixedVegetation() {
        // Add fixed trees
        fixedTrees.forEach(tree => {
            const treeElement = createTree(tree.x, tree.y, tree.small);
            gravesContainer.appendChild(treeElement);
        });

        // Add fixed shrubs
        fixedShrubs.forEach(shrub => {
            const shrubElement = createShrub(shrub.x, shrub.y);
            gravesContainer.appendChild(shrubElement);
        });
    }

    // Generate random vegetation
    function generateRandomVegetation() {
        // Clear existing random vegetation
        const existingTrees = document.querySelectorAll('.tree');
        const existingShrubs = document.querySelectorAll('.shrub');
        existingTrees.forEach(tree => tree.remove());
        existingShrubs.forEach(shrub => shrub.remove());

        const treeDensity = parseInt(treeDensitySlider.value);
        const shrubDensity = parseInt(shrubDensitySlider.value);

        const mapWidth = cemeteryMap.offsetWidth;
        const mapHeight = cemeteryMap.offsetHeight;

        // Calculate number of trees and shrubs based on density and map size
        const treeCount = Math.floor((mapWidth * mapHeight * treeDensity) / 100000);
        const shrubCount = Math.floor((mapWidth * mapHeight * shrubDensity) / 100000);

        // Generate random trees
        for (let i = 0; i < treeCount; i++) {
            const x = Math.floor(Math.random() * (mapWidth - 80)) + 40;
            const y = Math.floor(Math.random() * (mapHeight - 120)) + 40;

            // Check if position is too close to a grave
            if (!isNearGrave(x, y, 80)) {
                const isSmall = Math.random() > 0.5;
                const tree = createTree(x, y, isSmall);
                tree.classList.add('random');
                gravesContainer.appendChild(tree);
            }
        }

        // Generate random shrubs
        for (let i = 0; i < shrubCount; i++) {
            const x = Math.floor(Math.random() * (mapWidth - 60)) + 30;
            const y = Math.floor(Math.random() * (mapHeight - 80)) + 40;

            // Check if position is too close to a grave
            if (!isNearGrave(x, y, 50)) {
                const shrub = createShrub(x, y);
                shrub.classList.add('random');
                gravesContainer.appendChild(shrub);
            }
        }
    }

    // Check if position is near a grave
    function isNearGrave(x, y, minDistance) {
        for (const grave of graves) {
            const dx = grave.x - x;
            const dy = grave.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    // Create a tree element
    function createTree(x, y, isSmall) {
        const tree = document.createElement('div');
        tree.className = isSmall ? 'tree small' : 'tree';
        tree.classList.add('fixed');
        tree.style.left = `${x}px`;
        tree.style.top = `${y}px`;
        tree.style.zIndex = 2;

        const trunk = document.createElement('div');
        trunk.className = 'tree-trunk';

        const foliage = document.createElement('div');
        foliage.className = 'tree-foliage';

        tree.appendChild(trunk);
        tree.appendChild(foliage);

        return tree;
    }

    // Create a shrub element
    function createShrub(x, y) {
        const shrub = document.createElement('div');
        shrub.className = 'shrub fixed';
        shrub.style.left = `${x}px`;
        shrub.style.top = `${y}px`;
        shrub.style.zIndex = 1;

        return shrub;
    }

    // Fetch data from Google Sheets
    async function fetchDataFromSheet() {
        if (!KEY || !SHEET_ID) {
            console.log('API Key or Sheet ID not set');
            return;
        }

        const range = 'Sheet1!A2:J'; // Adjust range based on your sheet structure

        try {
            const response = await fetch(`${BASE_URL}/values/${range}?key=${KEY}`);
            const data = await response.json();

            if (data.values && data.values.length) {
                graves = data.values.map((row) => ({
                    id: row[0] || '',
                    name: row[1] || '',
                    date: row[2] || '',
                    age: row[3] || '',
                    gender: row[4] || '',
                    origin: row[5] || '',
                    notes: row[6] || '',
                    x: parseInt(row[7]) || 0,
                    y: parseInt(row[8]) || 0,
                    rotation: parseInt(row[9]) || 0
                }));
                renderGraves();
            } else {
                console.log('No data found in sheet');
            }
        } catch (error) {
            console.error('Error fetching data from sheet:', error);
        }
    }

    // Update grave in Google Sheets
    async function updateGraveInSheet(grave) {
        if (!isAuthenticated()) {
            alert('Please authenticate first');
            return false;
        }

        const index = graves.findIndex(g => g.id === grave.id);
        if (index === -1) return false;

        // Row index is index + 2 because sheet data starts at row 2
        const range = `Sheet1!A${index + 2}:J${index + 2}`;

        const values = [
            [
                grave.id,
                grave.name,
                grave.date,
                grave.age,
                grave.gender,
                grave.origin,
                grave.notes,
                grave.x,
                grave.y,
                grave.rotation
            ]
        ];

        try {
            const response = await fetch(`${BASE_URL}/values/${range}?valueInputOption=USER_ENTERED`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Grave updated successfully in sheet');
            return true;
        } catch (error) {
            console.error('Error updating grave in sheet:', error);
            alert('Failed to update grave in Google Sheet');
            return false;
        }
    }

    // Add new grave to Google Sheets
    async function addGraveToSheet(grave) {
        if (!isAuthenticated()) {
            alert('Please authenticate first');
            return false;
        }

        const range = 'Sheet1!A:J'; // Append to the sheet

        const values = [
            [
                grave.id,
                grave.name,
                grave.date,
                grave.age,
                grave.gender,
                grave.origin,
                grave.notes,
                grave.x,
                grave.y,
                grave.rotation
            ]
        ];

        try {
            const response = await fetch(`${BASE_URL}/values/${range}:append?valueInputOption=USER_ENTERED`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Grave added successfully to sheet');
            return true;
        } catch (error) {
            console.error('Error adding grave to sheet:', error);
            alert('Failed to add grave to Google Sheet');
            return false;
        }
    }

    // Delete grave from Google Sheets
    async function deleteGraveFromSheet(graveId) {
        if (!isAuthenticated()) {
            alert('Please authenticate first');
            return false;
        }

        const index = graves.findIndex(g => g.id === graveId);
        if (index === -1) return false;

        // We'll clear the row instead of deleting it to maintain sheet structure
        const range = `Sheet1!A${index + 2}:J${index + 2}`;

        try {
            const response = await fetch(`${BASE_URL}/values/${range}:clear`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log('Grave deleted successfully from sheet');

            // Remove from local array
            graves.splice(index, 1);
            renderGraves();
            return true;
        } catch (error) {
            console.error('Error deleting grave from sheet:', error);
            alert('Failed to delete grave from Google Sheet');
            return false;
        }
    }

    // Initialize map preview with existing graves
    function initMapPreview(previewElement, markerElement, isEditMode = false) {
        // Clear existing graves
        const existingGraves = previewElement.querySelectorAll('.map-preview-grave');
        existingGraves.forEach(grave => grave.remove());

        // Add existing graves to the preview
        graves.forEach(grave => {
            const graveElement = document.createElement('div');
            graveElement.className = 'map-preview-grave';

            // Fix the scaling issue - use the actual container dimensions
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = previewElement.offsetWidth;
            const previewHeight = previewElement.offsetHeight;

            const scaleX = previewWidth / containerWidth;
            const scaleY = previewHeight / containerHeight;

            graveElement.style.left = `${grave.x * scaleX}px`;
            graveElement.style.top = `${grave.y * scaleY}px`;
            graveElement.style.transform = `rotate(${grave.rotation}deg)`;

            // Highlight current grave in edit mode
            if (isEditMode && grave.id === currentGraveId) {
                graveElement.style.display = 'none'; // Hide the current grave as it's represented by the marker
            }

            previewElement.appendChild(graveElement);
        });

        // Position the marker for edit mode
        if (isEditMode && currentGraveId) {
            const currentGrave = graves.find(g => g.id === currentGraveId);
            if (currentGrave) {
                const containerWidth = cemeteryMap.offsetWidth;
                const containerHeight = cemeteryMap.offsetHeight;
                const previewWidth = previewElement.offsetWidth;
                const previewHeight = previewElement.offsetHeight;

                const scaleX = previewWidth / containerWidth;
                const scaleY = previewHeight / containerHeight;

                markerElement.style.left = `${currentGrave.x * scaleX}px`;
                markerElement.style.top = `${currentGrave.y * scaleY}px`;
                markerElement.style.transform = `rotate(${currentGrave.rotation}deg)`;
            }
        }

        // Make the marker draggable
        let isDragging = false;
        let offsetX, offsetY;

        markerElement.addEventListener('mousedown', function (e) {
            isDragging = true;
            offsetX = e.clientX - markerElement.getBoundingClientRect().left;
            offsetY = e.clientY - markerElement.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDragging) return;

            const rect = previewElement.getBoundingClientRect();
            let newX = e.clientX - rect.left - offsetX;
            let newY = e.clientY - rect.top - offsetY;

            // Keep within bounds
            newX = Math.max(0, Math.min(newX, rect.width - markerElement.offsetWidth));
            newY = Math.max(0, Math.min(newY, rect.height - markerElement.offsetHeight));

            markerElement.style.left = `${newX}px`;
            markerElement.style.top = `${newY}px`;

            // Update input fields with corrected scaling
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = previewElement.offsetWidth;
            const previewHeight = previewElement.offsetHeight;

            const scaleX = containerWidth / previewWidth;
            const scaleY = containerHeight / previewHeight;

            if (isEditMode) {
                document.getElementById('input-x').value = Math.round(newX * scaleX);
                document.getElementById('input-y').value = Math.round(newY * scaleY);
            } else {
                document.getElementById('new-grave-x').value = Math.round(newX * scaleX);
                document.getElementById('new-grave-y').value = Math.round(newY * scaleY);
            }
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
        });

        // Click on map to position marker
        previewElement.addEventListener('click', function (e) {
            if (e.target === markerElement) return;

            const rect = previewElement.getBoundingClientRect();
            let newX = e.clientX - rect.left - (markerElement.offsetWidth / 2);
            let newY = e.clientY - rect.top - (markerElement.offsetHeight / 2);

            // Keep within bounds
            newX = Math.max(0, Math.min(newX, rect.width - markerElement.offsetWidth));
            newY = Math.max(0, Math.min(newY, rect.height - markerElement.offsetHeight));

            markerElement.style.left = `${newX}px`;
            markerElement.style.top = `${newY}px`;

            // Update input fields with corrected scaling
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = previewElement.offsetWidth;
            const previewHeight = previewElement.offsetHeight;

            const scaleX = containerWidth / previewWidth;
            const scaleY = containerHeight / previewHeight;

            if (isEditMode) {
                document.getElementById('input-x').value = Math.round(newX * scaleX);
                document.getElementById('input-y').value = Math.round(newY * scaleY);
            } else {
                document.getElementById('new-grave-x').value = Math.round(newX * scaleX);
                document.getElementById('new-grave-y').value = Math.round(newY * scaleY);
            }
        });
    }

    // Render all graves
    function renderGraves() {
        // Clear existing graves and vegetation
        const existingGraves = document.querySelectorAll('.grave');
        const existingTrees = document.querySelectorAll('.tree');
        const existingShrubs = document.querySelectorAll('.shrub');
        existingGraves.forEach(grave => grave.remove());
        existingTrees.forEach(tree => tree.remove());
        existingShrubs.forEach(shrub => shrub.remove());

        // Add fixed vegetation
        addFixedVegetation();

        // Add column labels back at the top
        const columnLabels = document.querySelectorAll('.column-label');
        if (columnLabels.length === 0) {
            const labels = ['A', 'B', 'C', 'D', 'E'];
            labels.forEach((label, index) => {
                const labelElement = document.createElement('div');
                labelElement.className = 'column-label';
                labelElement.style.left = `${120 + (index * 200)}px`; // Increased spacing between columns
                labelElement.textContent = label;
                gravesContainer.appendChild(labelElement);
            });
        }

        // Add row labels on the left
        const rowLabels = document.querySelectorAll('.row-label');
        if (rowLabels.length === 0) {
            for (let i = 1; i <= 6; i++) {
                const labelElement = document.createElement('div');
                labelElement.className = 'row-label';
                labelElement.style.bottom = `${i * 100}px`;
                labelElement.textContent = i;
                gravesContainer.appendChild(labelElement);
            }
        }

        // Add graves
        graves.forEach(grave => {
            const graveElement = document.createElement('div');
            graveElement.className = 'grave';
            graveElement.setAttribute('data-id', grave.id);
            graveElement.style.left = `${grave.x}px`;
            graveElement.style.top = `${grave.y}px`;
            graveElement.style.transform = `rotate(${grave.rotation}deg)`;

            const idElement = document.createElement('div');
            idElement.className = 'plot-attachment';
            idElement.textContent = grave.id  + ':';

            const nameElement = document.createElement('div');
            nameElement.className = 'grave-name';
            nameElement.textContent = grave.name;

            graveElement.appendChild(idElement);
            graveElement.appendChild(nameElement);

            graveElement.addEventListener('click', () => openGraveDetails(grave.id));

            gravesContainer.appendChild(graveElement);
        });
    }

    // Open grave details modal
    function openGraveDetails(graveId) {
        const grave = graves.find(g => g.id === graveId);
        if (!grave) return;

        currentGraveId = graveId;

        // Set modal to view mode
        document.querySelector('.modal-content').classList.remove('edit-mode');
        document.querySelector('.modal-content').classList.add('view-mode');

        // Update modal content
        document.getElementById('modal-grave-id').textContent = grave.id;
        document.getElementById('detail-name').textContent = grave.name || '-';
        document.getElementById('detail-date').textContent = grave.date || '-';
        document.getElementById('detail-age').textContent = grave.age || '-';
        document.getElementById('detail-gender').textContent = grave.gender || '-';
        document.getElementById('detail-origin').textContent = grave.origin || '-';
        document.getElementById('detail-notes').textContent = grave.notes || '-';
        document.getElementById('detail-x').textContent = grave.x || '-';
        document.getElementById('detail-y').textContent = grave.y || '-';
        document.getElementById('detail-rotation').textContent = grave.rotation || '-';

        // Set input values
        document.getElementById('input-name').value = grave.name || '';
        document.getElementById('input-date').value = grave.date || '';
        document.getElementById('input-age').value = grave.age || '';
        document.getElementById('input-gender').value = grave.gender || 'Male';
        document.getElementById('input-origin').value = grave.origin || '';
        document.getElementById('input-notes').value = grave.notes || '';
        document.getElementById('input-x').value = grave.x || '';
        document.getElementById('input-y').value = grave.y || '';
        document.getElementById('input-rotation').value = grave.rotation || '';

        // Update edit button state based on authentication
        editBtn.disabled = !isAuthenticated();
        deleteBtn.disabled = !isAuthenticated();

        graveModal.classList.add('active');
    }

    // Switch to edit mode
    function switchToEditMode() {
        if (!isAuthenticated()) {
            alert('Please authenticate first to edit graves');
            return;
        }

        // Store original data for cancel operation
        const grave = graves.find(g => g.id === currentGraveId);
        if (grave) {
            originalGraveData = { ...grave };
        }

        document.querySelector('.modal-content').classList.remove('view-mode');
        document.querySelector('.modal-content').classList.add('edit-mode');

        // Initialize the edit map preview
        initMapPreview(editMapPreview, editMapPreviewMarker, true);
    }

    // Switch to view mode
    function switchToViewMode() {
        document.querySelector('.modal-content').classList.remove('edit-mode');
        document.querySelector('.modal-content').classList.add('view-mode');
    }

    // Save grave changes
    async function saveGraveChanges() {
        if (!isAuthenticated()) {
            alert('Please authenticate first to save changes');
            return;
        }

        const grave = graves.find(g => g.id === currentGraveId);
        if (!grave) return;

        // Update grave data
        grave.name = document.getElementById('input-name').value;
        grave.date = document.getElementById('input-date').value;
        grave.age = document.getElementById('input-age').value;
        grave.gender = document.getElementById('input-gender').value;
        grave.origin = document.getElementById('input-origin').value;
        grave.notes = document.getElementById('input-notes').value;
        grave.x = parseInt(document.getElementById('input-x').value) || grave.x;
        grave.y = parseInt(document.getElementById('input-y').value) || grave.y;
        grave.rotation = parseInt(document.getElementById('input-rotation').value) || 0;

        // Update in Google Sheets
        const success = await updateGraveInSheet(grave);

        if (success) {
            // Update view mode display
            document.getElementById('detail-name').textContent = grave.name || '-';
            document.getElementById('detail-date').textContent = grave.date || '-';
            document.getElementById('detail-age').textContent = grave.age || '-';
            document.getElementById('detail-gender').textContent = grave.gender || '-';
            document.getElementById('detail-origin').textContent = grave.origin || '-';
            document.getElementById('detail-notes').textContent = grave.notes || '-';
            document.getElementById('detail-x').textContent = grave.x || '-';
            document.getElementById('detail-y').textContent = grave.y || '-';
            document.getElementById('detail-rotation').textContent = grave.rotation || '-';

            // Update grave element on the map
            renderGraves();

            switchToViewMode();
            originalGraveData = null; // Clear original data
        }
    }

    // Cancel edit
    function cancelEdit() {
        if (originalGraveData && currentGraveId) {
            // Restore original values to input fields
            document.getElementById('input-name').value = originalGraveData.name || '';
            document.getElementById('input-date').value = originalGraveData.date || '';
            document.getElementById('input-age').value = originalGraveData.age || '';
            document.getElementById('input-gender').value = originalGraveData.gender || 'Male';
            document.getElementById('input-origin').value = originalGraveData.origin || '';
            document.getElementById('input-notes').value = originalGraveData.notes || '';
            document.getElementById('input-x').value = originalGraveData.x || '';
            document.getElementById('input-y').value = originalGraveData.y || '';
            document.getElementById('input-rotation').value = originalGraveData.rotation || '';
        }

        switchToViewMode();
        originalGraveData = null; // Clear original data
    }

    // Add new grave
    async function addNewGrave() {
        if (!isAuthenticated()) {
            alert('Please authenticate first to add a new grave');
            return;
        }

        const newId = document.getElementById('new-grave-id').value;
        const x = parseInt(document.getElementById('new-grave-x').value);
        const y = parseInt(document.getElementById('new-grave-y').value);
        const rotation = parseInt(document.getElementById('new-grave-rotation').value) || 0;

        // Validate inputs
        if (!newId || isNaN(x) || isNaN(y)) {
            alert('Please fill in all required fields (Plot Attachment, X, Y positions)');
            return;
        }

        // Check if ID already exists
        if (graves.some(g => g.id === newId)) {
            alert('A grave with this Plot Attachment already exists');
            return;
        }

        // Create new grave object
        const newGrave = {
            id: newId,
            name: document.getElementById('new-name').value,
            date: document.getElementById('new-date').value,
            age: document.getElementById('new-age').value,
            gender: document.getElementById('new-gender').value,
            origin: document.getElementById('new-origin').value,
            notes: document.getElementById('new-notes').value,
            x: x,
            y: y,
            rotation: rotation
        };

        // Add to Google Sheets
        const success = await addGraveToSheet(newGrave);

        if (success) {
            // Add to graves array
            graves.push(newGrave);

            // Re-render graves
            renderGraves();

            // Close modal
            addGraveModal.classList.remove('active');

            // Reset form
            document.getElementById('new-grave-id').value = '';
            document.getElementById('new-grave-x').value = '';
            document.getElementById('new-grave-y').value = '';
            document.getElementById('new-grave-rotation').value = '0';
            document.getElementById('new-name').value = '';
            document.getElementById('new-date').value = '';
            document.getElementById('new-age').value = '';
            document.getElementById('new-gender').value = 'Male';
            document.getElementById('new-origin').value = '';
            document.getElementById('new-notes').value = '';

            // Reset map preview marker
            mapPreviewMarker.style.left = '0px';
            mapPreviewMarker.style.top = '0px';
        }
    }

    // Search graves
    function searchGraves() {
        const searchTerm = searchInput.value.toLowerCase();
        const columnValue = columnFilter.value;

        // Filter graves based on search term and column
        graves.forEach(grave => {
            const graveElement = document.querySelector(`.grave[data-id="${grave.id}"]`);
            if (!graveElement) return;

            const matchesSearch = searchTerm === '' ||
                grave.id.toLowerCase().includes(searchTerm) ||
                (grave.name && grave.name.toLowerCase().includes(searchTerm));

            const matchesColumn = columnValue === '' || grave.id.startsWith(columnValue);

            if (matchesSearch && matchesColumn) {
                graveElement.style.display = 'flex';
                // Highlight if search term is not empty
                if (searchTerm !== '') {
                    graveElement.style.backgroundColor = 'var(--grave-highlight)';
                    graveElement.style.zIndex = '5';
                } else {
                    graveElement.style.backgroundColor = 'var(--grave-color)';
                    graveElement.style.zIndex = '1';
                }
            } else {
                graveElement.style.display = 'none';
            }
        });
    }

    // Map zoom and pan functions
    function zoomIn() {
        currentScale += 0.1;
        updateMapTransform();
    }

    function zoomOut() {
        currentScale = Math.max(0.5, currentScale - 0.1);
        updateMapTransform();
    }

    function resetView() {
        currentScale = 1;
        currentTranslateX = 0;
        currentTranslateY = 0;
        updateMapTransform();
    }

    function updateMapTransform() {
        cemeteryMap.style.transform = `scale(${currentScale}) translate(${currentTranslateX}px, ${currentTranslateY}px)`;
    }

    // Initialize map dragging
    function initMapDragging() {
        cemeteryMap.addEventListener('mousedown', function (e) {
            if (e.target === cemeteryMap || e.target === gravesContainer) {
                isDraggingMap = true;
                lastPosX = e.clientX;
                lastPosY = e.clientY;
                cemeteryMap.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', function (e) {
            if (!isDraggingMap) return;

            const dx = (e.clientX - lastPosX) / currentScale;
            const dy = (e.clientY - lastPosY) / currentScale;

            currentTranslateX += dx;
            currentTranslateY += dy;

            updateMapTransform();

            lastPosX = e.clientX;
            lastPosY = e.clientY;
        });

        document.addEventListener('mouseup', function () {
            isDraggingMap = false;
            cemeteryMap.style.cursor = 'grab';
        });

        // Touch events for mobile
        cemeteryMap.addEventListener('touchstart', function (e) {
            if (e.target === cemeteryMap || e.target === gravesContainer) {
                isDraggingMap = true;
                lastPosX = e.touches[0].clientX;
                lastPosY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchmove', function (e) {
            if (!isDraggingMap) return;

            const dx = (e.touches[0].clientX - lastPosX) / currentScale;
            const dy = (e.touches[0].clientY - lastPosY) / currentScale;

            currentTranslateX += dx;
            currentTranslateY += dy;

            updateMapTransform();

            lastPosX = e.touches[0].clientX;
            lastPosY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', function () {
            isDraggingMap = false;
        });

        // Pinch to zoom
        let initialDistance = 0;
        let initialScale = 1;

        cemeteryMap.addEventListener('touchstart', function (e) {
            if (e.touches.length === 2) {
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScale = currentScale;
            }
        });

        cemeteryMap.addEventListener('touchmove', function (e) {
            if (e.touches.length === 2) {
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );

                const ratio = currentDistance / initialDistance;
                currentScale = Math.max(0.5, Math.min(3, initialScale * ratio));

                updateMapTransform();
            }
        });
    }

    // Add touch events for mobile
    function addTouchEvents() {
        // For map preview marker
        mapPreviewMarker.addEventListener('touchstart', function (e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = mapPreview.getBoundingClientRect();
            let newX = touch.clientX - rect.left - (mapPreviewMarker.offsetWidth / 2);
            let newY = touch.clientY - rect.top - (mapPreviewMarker.offsetHeight / 2);

            // Keep within bounds
            newX = Math.max(0, Math.min(newX, rect.width - mapPreviewMarker.offsetWidth));
            newY = Math.max(0, Math.min(newY, rect.height - mapPreviewMarker.offsetHeight));

            mapPreviewMarker.style.left = `${newX}px`;
            mapPreviewMarker.style.top = `${newY}px`;

            // Update input fields with corrected scaling
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = mapPreview.offsetWidth;
            const previewHeight = mapPreview.offsetHeight;

            const scaleX = containerWidth / previewWidth;
            const scaleY = containerHeight / previewHeight;

            document.getElementById('new-grave-x').value = Math.round(newX * scaleX);
            document.getElementById('new-grave-y').value = Math.round(newY * scaleY);
        });

        // For edit map preview marker
        editMapPreviewMarker.addEventListener('touchstart', function (e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = editMapPreview.getBoundingClientRect();
            let newX = touch.clientX - rect.left - (editMapPreviewMarker.offsetWidth / 2);
            let newY = touch.clientY - rect.top - (editMapPreviewMarker.offsetHeight / 2);

            // Keep within bounds
            newX = Math.max(0, Math.min(newX, rect.width - editMapPreviewMarker.offsetWidth));
            newY = Math.max(0, Math.min(newY, rect.height - editMapPreviewMarker.offsetHeight));

            editMapPreviewMarker.style.left = `${newX}px`;
            editMapPreviewMarker.style.top = `${newY}px`;

            // Update input fields with corrected scaling
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = editMapPreview.offsetWidth;
            const previewHeight = editMapPreview.offsetHeight;

            const scaleX = containerWidth / previewWidth;
            const scaleY = containerHeight / previewHeight;

            document.getElementById('input-x').value = Math.round(newX * scaleX);
            document.getElementById('input-y').value = Math.round(newY * scaleY);
        });

        // For map preview click
        mapPreview.addEventListener('touchend', function (e) {
            if (e.target === mapPreviewMarker) return;

            const touch = e.changedTouches[0];
            const rect = mapPreview.getBoundingClientRect();
            let newX = touch.clientX - rect.left - (mapPreviewMarker.offsetWidth / 2);
            let newY = touch.clientY - rect.top - (mapPreviewMarker.offsetHeight / 2);

            // Keep within bounds
            newX = Math.max(0, Math.min(newX, rect.width - mapPreviewMarker.offsetWidth));
            newY = Math.max(0, Math.min(newY, rect.height - mapPreviewMarker.offsetHeight));

            mapPreviewMarker.style.left = `${newX}px`;
            mapPreviewMarker.style.top = `${newY}px`;

            // Update input fields with corrected scaling
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = mapPreview.offsetWidth;
            const previewHeight = mapPreview.offsetHeight;

            const scaleX = containerWidth / previewWidth;
            const scaleY = containerHeight / previewHeight;

            document.getElementById('new-grave-x').value = Math.round(newX * scaleX);
            document.getElementById('new-grave-y').value = Math.round(newY * scaleY);
        });

        // For edit map preview click
        editMapPreview.addEventListener('touchend', function (e) {
            if (e.target === editMapPreviewMarker) return;

            const touch = e.changedTouches[0];
            const rect = editMapPreview.getBoundingClientRect();
            let newX = touch.clientX - rect.left - (editMapPreviewMarker.offsetWidth / 2);
            let newY = touch.clientY - rect.top - (editMapPreviewMarker.offsetHeight / 2);

            // Keep within bounds
            newX = Math.max(0, Math.min(newX, rect.width - editMapPreviewMarker.offsetWidth));
            newY = Math.max(0, Math.min(newY, rect.height - editMapPreviewMarker.offsetHeight));

            editMapPreviewMarker.style.left = `${newX}px`;
            editMapPreviewMarker.style.top = `${newY}px`;

            // Update input fields with corrected scaling
            const containerWidth = cemeteryMap.offsetWidth;
            const containerHeight = cemeteryMap.offsetHeight;
            const previewWidth = editMapPreview.offsetWidth;
            const previewHeight = editMapPreview.offsetHeight;

            const scaleX = containerWidth / previewWidth;
            const scaleY = containerHeight / previewHeight;

            document.getElementById('input-x').value = Math.round(newX * scaleX);
            document.getElementById('input-y').value = Math.round(newY * scaleY);
        });
    }

    // Event listeners
    authBtn.addEventListener('click', authenticate);

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            graveModal.classList.remove('active');
            addGraveModal.classList.remove('active');
            originalGraveData = null; // Clear original data
        });
    });

    editBtn.addEventListener('click', switchToEditMode);

    saveBtn.addEventListener('click', saveGraveChanges);

    cancelBtn.addEventListener('click', cancelEdit);

    deleteBtn.addEventListener('click', function () {
        if (!isAuthenticated()) {
            alert('Please authenticate first to delete graves');
            return;
        }

        if (confirm('Are you sure you want to delete this grave?')) {
            deleteGraveFromSheet(currentGraveId);
            graveModal.classList.remove('active');
        }
    });

    addGraveBtn.addEventListener('click', () => {
        if (!isAuthenticated()) {
            alert('Please authenticate first to add a new grave');
            return;
        }

        addGraveModal.classList.add('active');
        initMapPreview(mapPreview, mapPreviewMarker); // Initialize map preview when opening modal
    });

    addGraveSaveBtn.addEventListener('click', addNewGrave);

    addGraveCancelBtn.addEventListener('click', () => {
        addGraveModal.classList.remove('active');
    });

    searchBtn.addEventListener('click', searchGraves);

    searchInput.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            searchGraves();
        }
    });

    // Vegetation controls
    treeDensitySlider.addEventListener('input', function () {
        treeDensityValue.textContent = `${this.value}%`;
    });

    shrubDensitySlider.addEventListener('input', function () {
        shrubDensityValue.textContent = `${this.value}%`;
    });

    generateVegetationBtn.addEventListener('click', generateRandomVegetation);

    // Map zoom controls
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    resetViewBtn.addEventListener('click', resetView);

    // Check if already authenticated
    updateAuthUI();

    // Initialize
    renderGraves();
    addTouchEvents();
    initMapDragging();
    cemeteryMap.style.cursor = 'grab';

    // Try to fetch data from Google Sheets if API key is set
    if (KEY && SHEET_ID) {
        fetchDataFromSheet();
    }
});