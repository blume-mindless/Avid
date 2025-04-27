// Azure Storage SDK
const { BlobServiceClient } = require('@azure/storage-blob');

// Configuration
const AZURE_STORAGE_CONNECTION_STRING = "LmPYFX98fjr4h/A6AWErhXCrESiZoO9SIYRIr1FFLY5CdIPtfmn6B0NzFINqFQk4hLerR4l+mOjb+AStwg+mNg==";
const VIDEO_CONTAINER_NAME = "videos";

// Initialize
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(VIDEO_CONTAINER_NAME);

document.getElementById('upload-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('video-upload');
    const statusDiv = document.getElementById('upload-status');
    
    if (fileInput.files.length === 0) {
        statusDiv.textContent = "Please select a file first";
        return;
    }
    
    const file = fileInput.files[0];
    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    try {
        statusDiv.textContent = "Uploading...";
        await blockBlobClient.uploadBrowserData(file);
        statusDiv.textContent = "Upload successful!";
        loadVideos(); // Refresh the video list
    } catch (error) {
        statusDiv.textContent = `Upload failed: ${error.message}`;
    }
});

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