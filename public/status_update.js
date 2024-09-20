document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');

    try {
        const suburb_id = '1022132'; // Example suburb_id
        const province_id = '3'; // Example province_id
        const municipality_total = '1'; // Example municipality_total

        // Replace with your actual API endpoint
        const response = await fetch(`/api/LoadShedding?suburb_id=${suburb_id}&province_id=${province_id}&municipality_total=${municipality_total}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Assuming the API returns an object with a 'stage' property
        const loadSheddingStage = data.stage;

        if (loadSheddingStage === 0) {
            statusDiv.textContent = 'Eskom Status: Not Load Shedding';
        } else {
            statusDiv.textContent = `Eskom Status: Load Shedding Stage ${loadSheddingStage}`;
        }
    } catch (error) {
        console.error('Error fetching load shedding status:', error);
        statusDiv.textContent = 'Eskom Status: Unable to fetch status';
    }
});