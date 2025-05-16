const AZURE_STORAGE_ACCOUNT = "blume";
const SAS_TOKEN = "sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-07-01T05:02:43Z&st=2025-04-27T21:02:43Z&spr=https&sig=7as6U8fEHynntgF1yHlNPAuZKTXlQpiKqeohnO02QnM%3D";
const CONTAINER_NAME = "videos";

const escapeHtml = (str) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function loadVideos(searchTerm = '') {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '<p>Loading videos...</p>';

    try {
        const listUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list&${SAS_TOKEN}`;
        const response = await fetch(listUrl);
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        
        videoContainer.innerHTML = '';
        
        // Add search
        const searchHTML = `
            <div class="search-container">
                <input type="text" id="video-search" placeholder="Search by professor..." value="${escapeHtml(searchTerm)}">
                <button id="search-btn">Search</button>
                ${searchTerm ? '<button id="clear-search">Clear</button>' : ''}
            </div>
        `;
        videoContainer.insertAdjacentHTML('afterbegin', searchHTML);

        document.getElementById('search-btn')?.addEventListener('click', () => {
            loadVideos(document.getElementById('video-search').value.trim());
        });

        document.getElementById('clear-search')?.addEventListener('click', () => {
            loadVideos();
        });

        const blobs = xmlDoc.getElementsByTagName("Blob");
        let hasVideos = false;

        for (let blob of blobs) {
            const blobName = blob.getElementsByTagName("Name")[0]?.textContent;
            if (!blobName) continue;
            
            const metadata = blob.getElementsByTagName("Metadata")[0];
            let professorName = '';
            let originalName = blobName;
            
            if (metadata) {
                professorName = metadata.getElementsByTagName("Professor")[0]?.textContent || '';
                originalName = metadata.getElementsByTagName("Originalname")[0]?.textContent || blobName;
            }
            
            if (!professorName) {
                const nameParts = blobName.split('-');
                professorName = nameParts[0].replace(/-/g, ' ');
            }
            
            if (searchTerm && !professorName.toLowerCase().includes(searchTerm.toLowerCase())) continue;

            const videoUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${encodeURIComponent(blobName)}?${SAS_TOKEN}`;
            
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';
            videoElement.innerHTML = `
                <video controls width="300">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <p><strong>Professor:</strong> ${escapeHtml(professorName)}</p>
                <p><strong>File:</strong> ${escapeHtml(originalName)}</p>
            `;

            videoContainer.appendChild(videoElement);
            hasVideos = true;
        }

        if (!hasVideos) {
            videoContainer.innerHTML += '<p>No videos found matching your search.</p>';
        }
    } catch (error) {
        console.error("Error loading videos:", error);
        videoContainer.innerHTML = `<p>Error loading videos: ${escapeHtml(error.message)}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => loadVideos());
