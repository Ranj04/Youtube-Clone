document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('photo-container');

    fetch('https://jsonplaceholder.typicode.com/albums/2/photos')
        .then(response => response.json())
        .then(data => {
            let photoCount = 0;
            data.forEach(photo => {
                const photoDiv = document.createElement('div');
                photoDiv.className = 'photo';

                const img = document.createElement('img');
                img.src = photo.url;
                img.alt = photo.title;

                const title = document.createElement('p');
                title.textContent = photo.title;

                photoDiv.appendChild(img);
                photoDiv.appendChild(title);

                container.appendChild(photoDiv);
                photoCount++;

                // Add fade out effect
                photoDiv.addEventListener('click', function () {
                    photoDiv.style.transition = 'opacity 1s';
                    photoDiv.style.opacity = '0';
                    setTimeout(() => {
                        container.removeChild(photoDiv);
                        photoCount--;
                        updatePhotoCount(photoCount);
                    }, 1000);
                });
            });

            // Display photo count
            updatePhotoCount(photoCount);
        });

    function updatePhotoCount(count) {
        let countElement = document.getElementById('photo-count');
        countElement.textContent = `Number of photos displayed: ${count}`;
    }
});