// Configuration (replace with your actual values)
const AZURE_STORAGE_ACCOUNT = "blume";
const SAS_TOKEN = "sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-07-01T05:02:43Z&st=2025-04-27T21:02:43Z&spr=https&sig=7as6U8fEHynntgF1yHlNPAuZKTXlQpiKqeohnO02QnM%3D";
const CONTAINER_NAME = "videos";

document.getElementById('upload-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('video-upload');
    const statusDiv = document.getElementById('upload-status');
    
    if (fileInput.files.length === 0) {
        statusDiv.textContent = "Please select a file first";
        return;
    }
    
    const file = fileInput.files[0];
    const blobName = `${Date.now()}-${file.name}`;
    
    try {
        statusDiv.textContent = "Uploading...";
        
        // Create the upload URL
        const uploadUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${SAS_TOKEN}`;
        
        // Upload using Fetch API
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'x-ms-blob-type': 'BlockBlob',
                'Content-Type': file.type
            },
            body: file
        });
        
        if (response.ok) {
            statusDiv.textContent = "Upload successful!";
            loadVideos(); // Refresh the video list
        } else {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
    } catch (error) {
        statusDiv.textContent = error.message;
        console.error(error);
    }
});

async function loadVideos() {
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = '';
    
    // List blobs using the Azure Storage REST API
    const listUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}?restype=container&comp=list&${SAS_TOKEN}`;
    
    try {
        const response = await fetch(listUrl);
        const xml = await response.text();
        
        // Parse the XML response (simplified example)
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const blobs = xmlDoc.getElementsByTagName("Blob");
        
        for (let blob of blobs) {
            const blobName = blob.getElementsByTagName("Name")[0].textContent;
            const videoUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}?${SAS_TOKEN}`;
            
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
    }
}

// Load videos when page loads
document.addEventListener('DOMContentLoaded', loadVideos);