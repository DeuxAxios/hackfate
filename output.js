// Output Display - Image-First Web App
class OutputDisplay {
    constructor() {
        this.init();
    }

    init() {
        this.loadContent();
        this.bindEvents();
    }

    bindEvents() {
        // Share button
        document.getElementById('share-btn').addEventListener('click', () => {
            this.showShareModal();
        });

        // Close modal
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideShareModal();
        });

        // Copy link
        document.getElementById('copy-link').addEventListener('click', () => {
            this.copyShareLink();
        });

        // Close modal on background click
        document.getElementById('share-modal').addEventListener('click', (e) => {
            if (e.target.id === 'share-modal') {
                this.hideShareModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideShareModal();
            }
        });
    }

    loadContent() {
        const saved = localStorage.getItem('websiteContent');
        
        if (!saved) {
            this.showNoContent();
            return;
        }

        try {
            const data = JSON.parse(saved);
            this.displayContent(data);
        } catch (e) {
            console.error('Error loading content:', e);
            this.showNoContent();
        }
    }

    displayContent(data) {
        // Set page title
        document.title = data.title || 'Your Website';

        // Show content card, hide no-content message
        document.getElementById('output-card').style.display = 'block';
        document.getElementById('no-content').style.display = 'none';

        // Display media (IMAGES FIRST - HERO PLACEMENT)
        this.displayMedia(data.media);

        // Display title
        document.getElementById('card-title').textContent = data.title || 'Untitled';

        // Display text content
        const textDisplay = document.getElementById('card-text-display');
        if (data.text) {
            textDisplay.textContent = data.text;
            textDisplay.style.display = 'block';
        } else {
            textDisplay.style.display = 'none';
        }

        // Display timestamp
        this.displayTimestamp(data.timestamp);

        console.log('Content displayed:', data);
    }

    displayMedia(media) {
        const mediaContainer = document.getElementById('media-container');
        mediaContainer.innerHTML = '';

        if (!media || !media.content) {
            mediaContainer.style.display = 'none';
            return;
        }

        mediaContainer.style.display = 'block';

        if (media.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = media.content;
            img.alt = media.name || 'Shared image';
            img.loading = 'lazy';
            
            // Add click handler for full-screen viewing
            img.addEventListener('click', () => {
                this.showFullscreenMedia(media);
            });
            
            // Add styling for cursor
            img.style.cursor = 'pointer';
            img.title = 'Click to view full size';
            
            mediaContainer.appendChild(img);
        } else if (media.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = media.content;
            video.controls = true;
            video.preload = 'metadata';
            
            // Prevent right-click context menu for some protection
            video.addEventListener('contextmenu', (e) => e.preventDefault());
            
            mediaContainer.appendChild(video);
        }
    }

    showFullscreenMedia(media) {
        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            cursor: pointer;
        `;

        const img = document.createElement('img');
        img.src = media.content;
        img.alt = media.name || 'Full size image';
        img.style.cssText = `
            max-width: 95%;
            max-height: 95%;
            object-fit: contain;
            border-radius: 8px;
        `;

        overlay.appendChild(img);
        document.body.appendChild(overlay);

        // Close on click
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        // Close on escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    displayTimestamp(timestamp) {
        const timestampElement = document.getElementById('timestamp');
        
        if (!timestamp) {
            timestampElement.style.display = 'none';
            return;
        }

        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        let displayText;
        if (diffDays === 0) {
            if (diffHours === 0) {
                displayText = 'Just now';
            } else {
                displayText = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
            }
        } else if (diffDays === 1) {
            displayText = 'Yesterday';
        } else if (diffDays < 7) {
            displayText = `${diffDays} days ago`;
        } else {
            displayText = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        timestampElement.textContent = `Created ${displayText}`;
        timestampElement.style.display = 'block';
    }

    showNoContent() {
        document.getElementById('output-card').style.display = 'none';
        document.getElementById('no-content').style.display = 'block';
        document.querySelector('.action-buttons').style.display = 'none';
    }

    showShareModal() {
        const modal = document.getElementById('share-modal');
        const shareUrl = document.getElementById('share-url');
        
        shareUrl.value = window.location.href;
        modal.style.display = 'flex';
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    hideShareModal() {
        const modal = document.getElementById('share-modal');
        modal.style.opacity = '0';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
    }

    async copyShareLink() {
        const shareUrl = document.getElementById('share-url');
        const copyBtn = document.getElementById('copy-link');
        
        try {
            await navigator.clipboard.writeText(shareUrl.value);
            
            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ Copied!';
            copyBtn.style.background = '#00c851';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#0088cc';
            }, 2000);
            
            this.showNotification('Link copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            shareUrl.select();
            document.execCommand('copy');
            this.showNotification('Link copied to clipboard!', 'success');
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
    new OutputDisplay();
    console.log('Output Display initialized');
});