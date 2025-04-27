// Azure Storage SDK
const { BlobServiceClient } = require('@azure/storage-blob');

// Configuration
const AZURE_STORAGE_CONNECTION_STRING = "your_connection_string";
const VIDEO_CONTAINER_NAME = "videos";

// Initialize
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(VIDEO_CONTAINER_NAME);

async function loadVideos() {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '';
    
    for await (const blob of containerClient.listBlobsFlat()) {
        const videoUrl = `https://blume.blob.core.windows.net/${VIDEO_CONTAINER_NAME}/${blob.name}`;
        
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.innerHTML = `
            <video controls>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <p>${blob.name}</p>
        `;
        
        videoContainer.appendChild(videoElement);
    }
}

// Load videos when page loads
document.addEventListener('DOMContentLoaded', loadVideos);