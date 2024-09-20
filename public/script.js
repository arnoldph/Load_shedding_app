document.addEventListener('DOMContentLoaded', async () => {
    const scheduleDiv = document.getElementById('schedule');
    const suburbSearch = document.getElementById('suburb-search');
    const suburbSelect = document.getElementById('suburb-select');

    // Fetch and populate suburb data
    const MUNICIPALITY_ID = 166; // Example municipality ID
    await populateSuburbDropdown(MUNICIPALITY_ID);

    // Add event listener for search input
    suburbSearch.addEventListener('input', () => {
        filterSuburbs(suburbSearch.value);
    });

    // Add event listener for suburb selection
    suburbSelect.addEventListener('change', async () => {
        const suburbId = suburbSelect.value;
        if (suburbId) {
            const provinceId = 3; // Example province ID
            const municipalityTotal = 1; // Example municipality total
            await fetchAndRenderSchedule(suburbId, provinceId, municipalityTotal);
        } else {
            scheduleDiv.innerHTML = 'Please select a suburb.';
        }
    });

    async function populateSuburbDropdown(municipalityId) {
        suburbSelect.innerHTML = '<option value="">Select a suburb</option>'; // Clear previous options
        const pageSize = 5093;
        const pageNum = 1;
    
        try {
            const url = `http://localhost:3000/proxy?url=${encodeURIComponent(`http://loadshedding.eskom.co.za/LoadShedding/GetSurburbData/?pageSize=${pageSize}&pageNum=${pageNum}&id=${municipalityId}`)}`;
            console.log('Fetching suburb data from:', url); // Debugging step
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Suburb data:', data); // Log the data to check if it's correct
    
            if (!data.Results || !Array.isArray(data.Results)) {
                throw new Error('Expected an array in the Results property but received a different type');
            }
    
            data.Results.forEach(suburb => {
                const option = document.createElement('option');
                option.value = suburb.id;
                option.textContent = suburb.text;
                suburbSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching suburb data:', error);
        }
    }

    function filterSuburbs(searchTerm) {
        const options = suburbSelect.options;
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const text = option.textContent.toLowerCase();
            const value = option.value;
            if (text.includes(searchTerm.toLowerCase()) || value.includes(searchTerm)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        }
    }

    async function fetchAndRenderSchedule(suburbId, provinceId, municipalityTotal) {
        scheduleDiv.innerHTML = ''; // Clear previous schedule

        try {
            const response = await fetch(`/api/LoadShedding?suburb_id=${suburbId}&province_id=${provinceId}&municipality_total=${municipalityTotal}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const stageNumber = data.stage;
            const htmlContent = data.schedule;

            // Render the filtered data
            const extractedData = extractDayAndTimes(htmlContent);
            const groupedData = groupByDay(extractedData);

            for (const [day, times] of Object.entries(groupedData)) {
                const daySection = document.createElement('div');
                daySection.classList.add('day-section');

                const dayHeader = document.createElement('h3');
                dayHeader.textContent = `${day} (Stage: ${stageNumber})`; // Display day and stage
                daySection.appendChild(dayHeader);

                times.forEach(item => {
                    const timeSlot = document.createElement('div');
                    timeSlot.classList.add('time-slot');

                    const timeSpan = document.createElement('span');
                    timeSpan.classList.add('time');
                    timeSpan.textContent = item.time; // Display time

                    const stageSpan = document.createElement('span');
                    stageSpan.classList.add('stage');
                    stageSpan.textContent = `${stageNumber}`; // Display stage

                    timeSlot.appendChild(timeSpan);
                    timeSlot.appendChild(stageSpan);
                    daySection.appendChild(timeSlot);
                });

                scheduleDiv.appendChild(daySection);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            scheduleDiv.innerHTML = 'Failed to load data.';
        }
    }

    function extractDayAndTimes(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const scheduleDays = doc.querySelectorAll('.scheduleDay');
        const schedule = [];

        scheduleDays.forEach(scheduleDay => {
            const day = scheduleDay.querySelector('.dayMonth').textContent.trim();
            const timeLinks = scheduleDay.querySelectorAll('a');

            timeLinks.forEach(link => {
                const time = link.textContent.trim();
                schedule.push({ day, time });
            });
        });

        return schedule;
    }

    function groupByDay(data) {
        return data.reduce((acc, item) => {
            if (!acc[item.day]) {
                acc[item.day] = [];
            }
            acc[item.day].push(item);
            return acc;
        }, {});
    }
});