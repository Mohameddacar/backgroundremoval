document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImage = document.getElementById('previewImage');
    const removeBgBtn = document.getElementById('removeBgBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const loadingContainer = document.getElementById('loadingContainer');

    let originalImage = null;

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('dragover');
    }

    function unhighlight() {
        dropArea.classList.remove('dragover');
    }

    dropArea.addEventListener('drop', handleDrop, false);
    fileInput.addEventListener('change', handleFileSelect, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    originalImage = e.target.result;
                    previewImage.src = originalImage;
                    previewContainer.style.display = 'flex';
                    downloadBtn.disabled = true;
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    // Remove background functionality
    removeBgBtn.addEventListener('click', async () => {
        if (!originalImage) return;

        try {
            loadingContainer.style.display = 'flex';
            previewContainer.style.display = 'none';

            // Convert base64 to blob
            const response = await fetch(originalImage);
            const blob = await response.blob();

            // Create form data
            const formData = new FormData();
            formData.append('image_file', blob);

            // Remove.bg API key
            const apiKey = '87NYnQZxzr9FeubigomCfFnE';

            const result = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey
                },
                body: formData
            });

            if (!result.ok) {
                throw new Error('Failed to remove background');
            }

            const processedBlob = await result.blob();
            const processedUrl = URL.createObjectURL(processedBlob);
            
            previewImage.src = processedUrl;
            downloadBtn.disabled = false;
            previewContainer.style.display = 'flex';
            loadingContainer.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to remove background. Please try again.');
            loadingContainer.style.display = 'none';
            previewContainer.style.display = 'flex';
        }
    });

    // Download functionality
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = previewImage.src;
        link.download = 'background-removed.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Reset functionality
    resetBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewImage.src = '';
        originalImage = null;
        previewContainer.style.display = 'none';
        downloadBtn.disabled = true;
    });
}); 