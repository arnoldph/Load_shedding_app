document.addEventListener('DOMContentLoaded', async () => {
    const scheduleDiv = document.getElementById('schedule');

    try {
        const response = await fetch('/api/LoadShedding?suburb_id=1022131&stage=7&province_id=3&municipality_total=4');
        const contentType = response.headers.get('content-type');

        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
            // Assuming the HTML response is structured in a way that you can extract the relevant data
            // You may need to parse the HTML and extract the data accordingly
        }

        // If data is JSON, filter out unwanted Feeder data
        if (Array.isArray(data)) {
            const filteredData = data.filter(item => {
                return !item.Feeder.includes('CIVIC CENTRE / CIVIC1/2195 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('CIVIC CENTRE / CIVIC1/JABULANI/SHOPPING/CENTRE 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('CIVIC CENTRE / CIVIC5/2612 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('CIVIC CENTRE / CIVIC5/HVC/JAB 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('ZOLA MAIN / ZOL2/6087 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('ZOLA MAIN / ZOL2/804 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('ZONDI / ZON1/592 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('ZONDI / ZON1/960 1 11kV MV Feeder Underground Cable') &&
                       !item.Feeder.includes('ZONDI / ZON2/1065 1 11kV MV Feeder Underground Cable');
            });

            // Render the filtered data
            if (filteredData.length > 0) {
                filteredData.forEach(item => {
                    const scheduleItem = document.createElement('div');
                    scheduleItem.classList.add('schedule-item');

                    const dateDiv = document.createElement('div');
                    dateDiv.classList.add('date');
                    const daySpan = document.createElement('span');
                    daySpan.classList.add('day');
                    daySpan.textContent = item.Day; // Assuming item.Day exists
                    const monthSpan = document.createElement('span');
                    monthSpan.classList.add('month');
                    monthSpan.textContent = item.Month; // Assuming item.Month exists
                    const dateNumberSpan = document.createElement('span');
                    dateNumberSpan.classList.add('date-number');
                    dateNumberSpan.textContent = item.DateNumber; // Assuming item.DateNumber exists

                    dateDiv.appendChild(daySpan);
                    dateDiv.appendChild(monthSpan);
                    dateDiv.appendChild(dateNumberSpan);
                    scheduleItem.appendChild(dateDiv);

                    const detailsDiv = document.createElement('div');
                    detailsDiv.classList.add('details');
                    detailsDiv.textContent = `Time: ${item.Time}`; // Exclude Feeder data
                    scheduleItem.appendChild(detailsDiv);

                    scheduleDiv.appendChild(scheduleItem);
                });
            } else {
                scheduleDiv.innerHTML = 'No schedule available.';
            }
        } else {
            // Handle HTML response if necessary
            scheduleDiv.innerHTML = data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        scheduleDiv.innerHTML = 'Failed to load data.';
    }
});