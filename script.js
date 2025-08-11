document.addEventListener('DOMContentLoaded', () => {
    const addBlockBtn = document.getElementById('addBlockBtn');
    const saveBtn = document.getElementById('saveBtn');
    const contentBlocksContainer = document.getElementById('content-blocks');
    const template = document.getElementById('content-block-template');

    let contentBlocks = [];
    let nextBlockId = 0;

    // --- State Management ---
    const findBlockById = (id) => contentBlocks.find(b => b.id === id);
    const findBlockIndexById = (id) => contentBlocks.findIndex(b => b.id === id);

    // --- Rendering ---
    const renderBlocks = () => {
        contentBlocksContainer.innerHTML = '';
        if (contentBlocks.length === 0) {
            // If there's no content, don't show anything initially.
        } else {
            contentBlocks.forEach(blockData => {
                const blockElement = document.importNode(template.content, true).firstElementChild;
                blockElement.dataset.id = blockData.id;

                const textArea = blockElement.querySelector('.cardText');
                textArea.value = blockData.text;

                if (blockData.media.content) {
                    const previewContainer = blockElement.querySelector('.media-preview');
                    const fileNameSpan = blockElement.querySelector('.file-name');
                    
                    fileNameSpan.textContent = blockData.media.name || 'Uploaded File';
                    previewContainer.style.display = 'block';
                    previewContainer.innerHTML = ''; // Clear previous preview

                    if (blockData.media.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = blockData.media.content;
                        previewContainer.appendChild(img);
                    } else if (blockData.media.type.startsWith('video/')) {
                        const video = document.createElement('video');
                        video.src = blockData.media.content;
                        video.controls = true;
                        previewContainer.appendChild(video);
                    }
                }
                contentBlocksContainer.appendChild(blockElement);
            });
        }
    };

    // --- Event Handlers ---
    addBlockBtn.addEventListener('click', () => {
        const id = nextBlockId++;
        contentBlocks.push({
            id: id,
            text: '',
            media: { content: null, type: null, name: null }
        });
        renderBlocks();
    });

    saveBtn.addEventListener('click', () => {
        savePageToFile();
    });

    contentBlocksContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('cardText')) {
            const blockId = parseInt(e.target.closest('.content-block').dataset.id, 10);
            const blockData = findBlockById(blockId);
            if (blockData) {
                blockData.text = e.target.value;
            }
        }
    });

    contentBlocksContainer.addEventListener('click', (e) => {
        if (e.target.closest('.file-label')) {
            e.target.closest('.file-label').querySelector('.mediaFile').click();
        }
        if (e.target.classList.contains('removeBlockBtn')) {
            const blockId = parseInt(e.target.closest('.content-block').dataset.id, 10);
            const blockIndex = findBlockIndexById(blockId);
            if (blockIndex > -1) {
                contentBlocks.splice(blockIndex, 1);
                renderBlocks();
            }
        }
    });
    
    contentBlocksContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('mediaFile')) {
            const file = e.target.files[0];
            if (!file) return;
            const blockId = parseInt(e.target.closest('.content-block').dataset.id, 10);
            const blockData = findBlockById(blockId);
            if (!blockData) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                blockData.media = {
                    content: event.target.result,
                    type: file.type,
                    name: file.name
                };
                renderBlocks();
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Save & Load Functionality ---
    const savePageToFile = () => {
        const doc = document.cloneNode(true);
        const newContentContainer = doc.getElementById('content-blocks');
        newContentContainer.innerHTML = ''; // Clear the container

        // Rebuild the content in a non-editable, persistent format
        contentBlocks.forEach(block => {
            const blockElement = document.createElement('div');
            blockElement.className = 'content-block';
            blockElement.dataset.id = block.id;

            const textElement = document.createElement('div');
            textElement.className = 'cardText-output';
            textElement.innerText = block.text;
            blockElement.appendChild(textElement);

            if (block.media.content) {
                const mediaElementContainer = document.createElement('div');
                mediaElementContainer.className = 'media-preview-output';
                let mediaElement;
                if (block.media.type.startsWith('image/')) {
                    mediaElement = document.createElement('img');
                } else {
                    mediaElement = document.createElement('video');
                    mediaElement.controls = true;
                }
                mediaElement.src = block.media.content;
                mediaElement.dataset.name = block.media.name;
                mediaElement.dataset.type = block.media.type;
                mediaElementContainer.appendChild(mediaElement);
                blockElement.appendChild(mediaElementContainer);
            }
            newContentContainer.appendChild(blockElement);
        });

        const finalHtml = doc.documentElement.outerHTML;
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const loadContentFromDOM = () => {
        const existingBlocks = Array.from(contentBlocksContainer.querySelectorAll('.content-block'));
        if (existingBlocks.length > 0) {
            contentBlocks = existingBlocks.map(blockElement => {
                const id = nextBlockId++;
                const text = blockElement.querySelector('.cardText-output')?.innerText || '';
                const mediaTag = blockElement.querySelector('img, video');
                let media = { content: null, type: null, name: null };
                if (mediaTag) {
                    media = {
                        content: mediaTag.src,
                        type: mediaTag.dataset.type,
                        name: mediaTag.dataset.name
                    };
                }
                return { id, text, media };
            });
            renderBlocks();
        } else {
            // If no static content, start with one empty block for a new page
            addBlockBtn.click();
        }
    };

    // --- Initial Load ---
    loadContentFromDOM();
});