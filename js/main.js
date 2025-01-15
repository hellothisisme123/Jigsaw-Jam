fetch('http://192.168.240.9:3006/jigsawJam/data')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // const dataDiv = document.getElementById('data');
                // data.forEach(item => {
                //     // Display each item (customize as needed)
                //     dataDiv.innerHTML += `<p>ID: ${item.id}, Name: ${item.name}</p>`;
                // });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });