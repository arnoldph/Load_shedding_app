document.addEventListener('DOMContentLoaded', async () => {
    const scheduleDiv = document.getElementById('schedule');
    const scheduleMessage = document.getElementById('schedule-message');
    const suburbSelect = document.getElementById('suburb-select');

    // Fetch and populate suburb data
    const MUNICIPALITY_ID = 166; // Example municipality ID
    await populateSuburbDropdown(MUNICIPALITY_ID);

    // Add event listener for suburb selection
    suburbSelect.addEventListener('change', async () => {
        const suburbId = suburbSelect.value;
        if (suburbId) {
            const provinceId = 3; // Example province ID
            const municipalityTotal = 1; // Example municipality total

            // Fetch and render the schedule
            const scheduleLoaded = await fetchAndRenderSchedule(suburbId, provinceId, municipalityTotal);

            // Hide the message if the schedule is loaded
            if (scheduleLoaded) {
                scheduleMessage.style.display = 'none';
            } else {
                scheduleMessage.style.display = 'block';
            }
        } else {
            scheduleMessage.style.display = 'block';
            scheduleDiv.innerHTML = ''; // Clear the schedule if no suburb is selected
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

    async function fetchAndRenderSchedule(suburbId, provinceId, municipalityTotal) {
        scheduleDiv.innerHTML = ''; // Clear previous schedule

        try {
            const response = await fetch(`/api/LoadShedding?suburb_id=${suburbId}&province_id=${provinceId}&municipality_total=${municipalityTotal}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log(data); // Log the response

            const stageNumber = data.stage;

            // If stage is 0, display "Not Load Shedding" for each day
            if (stageNumber === 0) {
                displayNoLoadSheddingSchedule(scheduleDiv);
                return true; // Indicate that the schedule was successfully loaded
            }

            // Otherwise, render the schedule as usual
            const htmlContent = data.schedule;
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
            return true; // Indicate that the schedule was successfully loaded
        } catch (error) {
            console.error('Error fetching data:', error);
            scheduleDiv.innerHTML = 'Failed to load data.';
            return false; // Indicate that the schedule was not loaded
        }
    }

    /**
     * Displays "Not Load Shedding" for each day in the schedule section.
     * @param {HTMLElement} scheduleDiv - The schedule container element.
     */
    function displayNoLoadSheddingSchedule(scheduleDiv) {
        // Get today's date
        const today = new Date();

        // Loop through the next 20 days
        for (let i = 0; i < 25; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);

            // Format the date (e.g., "Monday, 25 March 2025")
            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            const formattedDate = currentDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

            // Create a section for the day
            const daySection = document.createElement('div');
            daySection.classList.add('day-section');

            // Add the day and date as a header
            const dayHeader = document.createElement('h3');
            dayHeader.textContent = `${dayOfWeek}, ${formattedDate}`;
            daySection.appendChild(dayHeader);

            // Add the "Not Load Shedding" message
            const noLoadSheddingMessage = document.createElement('div');
            noLoadSheddingMessage.classList.add('time-slot');
            noLoadSheddingMessage.textContent = 'Not Load Shedding';
            daySection.appendChild(noLoadSheddingMessage);

            // Append the section to the schedule container
            scheduleDiv.appendChild(daySection);
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