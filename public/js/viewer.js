// Configuration (same as upload.js)
const AZURE_STORAGE_ACCOUNT = "blume";
const SAS_TOKEN = "&sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-07-01T05:02:43Z&st=2025-04-27T21:02:43Z&spr=https&sig=7as6U8fEHynntgF1yHlNPAuZKTXlQpiKqeohnO02QnM%3D";
const CONTAINER_NAME = "videos";

async function loadVideos() {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '';
    
    const listUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list${SAS_TOKEN}`;
    
    try {
        const response = await fetch(listUrl);
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const blobs = xmlDoc.getElementsByTagName("Blob");
        
        for (let blob of blobs) {
            const blobName = blob.getElementsByTagName("Name")[0].textContent;
            const videoUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}${SAS_TOKEN}`;
            
            const videoElement = document.createElement('div');
            videoElement.className = 'video-item';
            videoElement.innerHTML = `
                <video controls width="300">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <p>${blobName}</p>
            `;
            
            videoContainer.appendChild(videoElement);
        }
    } catch (error) {
        console.error("Error loading videos:", error);
        videoContainer.innerHTML = `<p>Error loading videos. Please try again later.</p>`;
    }
}

// Load videos when page loads
document.addEventListener('DOMContentLoaded', loadVideos);