// Content Editor - Image-First Web App
class ContentEditor {
    constructor() {
        this.mediaData = {
            content: null,
            type: null,
            name: null
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadExistingContent();
    }

    bindEvents() {
        // File upload
        document.getElementById('mediaFile').addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });

        // Remove media
        document.getElementById('remove-media').addEventListener('click', () => {
            this.removeMedia();
        });

        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.preview();
        });

        // Submit button
        document.getElementById('submitBtn').addEventListener('click', () => {
            this.submit();
        });

        // Auto-save as user types
        document.getElementById('websiteTitle').addEventListener('input', () => {
            this.autoSave();
        });

        document.getElementById('cardText').addEventListener('input', () => {
            this.autoSave();
        });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            this.showNotification('Please select an image or video file', 'error');
            return;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('File size must be less than 10MB', 'error');
            return;
        }

        document.getElementById('file-name').textContent = `📎 ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.mediaData = {
                content: e.target.result,
                type: file.type,
                name: file.name
            };
            
            this.showMediaPreview();
            this.showNotification(`${file.type.startsWith('image/') ? 'Image' : 'Video'} added successfully!`, 'success');
            this.autoSave();
        };

        reader.onerror = () => {
            this.showNotification('Error reading file', 'error');
        };

        reader.readAsDataURL(file);
    }

    showMediaPreview() {
        const previewContainer = document.getElementById('media-preview');
        const previewContent = document.getElementById('preview-content');
        
        previewContent.innerHTML = '';
        
        if (this.mediaData.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = this.mediaData.content;
            img.alt = 'Preview';
            previewContent.appendChild(img);
        } else if (this.mediaData.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = this.mediaData.content;
            video.controls = true;
            previewContent.appendChild(video);
        }
        
        previewContainer.style.display = 'block';
    }

    removeMedia() {
        this.mediaData = {
            content: null,
            type: null,
            name: null
        };
        
        document.getElementById('file-name').textContent = '📎 Choose a picture or video...';
        document.getElementById('media-preview').style.display = 'none';
        document.getElementById('mediaFile').value = '';
        
        this.showNotification('Media removed', 'info');
        this.autoSave();
    }

    getCurrentData() {
        return {
            title: document.getElementById('websiteTitle').value.trim(),
            text: document.getElementById('cardText').value.trim(),
            media: this.mediaData,
            timestamp: new Date().toISOString()
        };
    }

    validateContent() {
        const data = this.getCurrentData();
        
        if (!data.title) {
            this.showNotification('Please enter a website title', 'error');
            document.getElementById('websiteTitle').focus();
            return false;
        }
        
        if (!data.text && !data.media.content) {
            this.showNotification('Please add some content or upload media', 'error');
            document.getElementById('cardText').focus();
            return false;
        }
        
        return true;
    }

    preview() {
        if (!this.validateContent()) return;
        
        this.saveContent();
        this.showNotification('Opening preview...', 'info');
        
        // Open preview in new tab
        setTimeout(() => {
            window.open('output.html', '_blank');
        }, 500);
    }

    submit() {
        if (!this.validateContent()) return;
        
        this.saveContent();
        this.showNotification('Content saved! Redirecting...', 'success');
        
        // Redirect to output page
        setTimeout(() => {
            window.location.href = 'output.html';
        }, 1000);
    }

    saveContent() {
        const data = this.getCurrentData();
        localStorage.setItem('websiteContent', JSON.stringify(data));
        console.log('Content saved:', data);
    }

    autoSave() {
        // Auto-save every 2 seconds after user stops typing
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const data = this.getCurrentData();
            if (data.title || data.text || data.media.content) {
                localStorage.setItem('websiteContent', JSON.stringify(data));
                console.log('Auto-saved');
            }
        }, 2000);
    }

    loadExistingContent() {
        const saved = localStorage.getItem('websiteContent');
        if (!saved) return;
        
        try {
            const data = JSON.parse(saved);
            
            if (data.title) {
                document.getElementById('websiteTitle').value = data.title;
            }
            
            if (data.text) {
                document.getElementById('cardText').value = data.text;
            }
            
            if (data.media && data.media.content) {
                this.mediaData = data.media;
                document.getElementById('file-name').textContent = `📎 ${data.media.name || 'Previously uploaded file'}`;
                this.showMediaPreview();
            }
            
            console.log('Loaded existing content');
        } catch (e) {
            console.error('Error loading saved content:', e);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(400px)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#00c851',
            error: '#ff4757',
            info: '#0088cc',
            warning: '#ffb142'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContentEditor();
    console.log('Content Editor initialized');
});