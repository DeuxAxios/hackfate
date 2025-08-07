// GOATSTUFF2.0 - Full Featured Content Management
class ContentManager {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('goatstuff_posts')) || [];
        this.editingPost = null;
        this.attachedMedia = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.displayPosts();
    }

    bindEvents() {
        // Submit post
        document.getElementById('submit-post').addEventListener('click', () => {
            this.submitPost();
        });

        // Attach media
        document.getElementById('attach-media').addEventListener('click', () => {
            document.getElementById('post-media-upload').click();
        });

        // File upload handler
        document.getElementById('post-media-upload').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Enter key to submit
        document.getElementById('post-text').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitPost();
            }
        });
    }

    handleFileUpload(files) {
        console.log('Files selected:', files.length);
        Array.from(files).forEach(file => {
            console.log('Processing file:', file.name, file.type);
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('File loaded successfully');
                    const media = {
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        data: e.target.result,
                        name: file.name,
                        size: file.size
                    };
                    this.attachedMedia.push(media);
                    this.displayAttachedMedia();
                    this.showToast(`${media.type} added: ${file.name}`);
                };
                reader.onerror = () => {
                    console.error('Error reading file:', file.name);
                    this.showToast('Error loading file');
                };
                reader.readAsDataURL(file);
            } else {
                console.log('File type not supported:', file.type);
                this.showToast('Only images and videos are supported');
            }
        });
    }

    displayAttachedMedia() {
        const mediaContainer = document.getElementById('composer-media');
        console.log('Displaying media:', this.attachedMedia.length, 'items');
        mediaContainer.innerHTML = '';

        if (this.attachedMedia.length === 0) {
            mediaContainer.style.display = 'none';
            return;
        }

        mediaContainer.style.display = 'block';
        this.attachedMedia.forEach((media, index) => {
            const mediaPreview = document.createElement('div');
            mediaPreview.className = 'media-preview';
            
            if (media.type === 'image') {
                mediaPreview.innerHTML = `
                    <img src="${media.data}" alt="Preview" class="preview-image" onload="console.log('Image loaded')" onerror="console.error('Image failed to load')">
                    <button class="remove-media" data-index="${index}" title="Remove">×</button>
                    <span class="media-label">📷</span>
                `;
            } else {
                mediaPreview.innerHTML = `
                    <video src="${media.data}" class="preview-video" controls>
                        Your browser doesn't support video.
                    </video>
                    <button class="remove-media" data-index="${index}" title="Remove">×</button>
                    <span class="media-label">🎥</span>
                `;
            }
            
            mediaContainer.appendChild(mediaPreview);
        });

        // Add remove media handlers
        document.querySelectorAll('.remove-media').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.attachedMedia.splice(index, 1);
                this.displayAttachedMedia();
                this.showToast('Media removed');
            });
        });
    }

    submitPost() {
        const textInput = document.getElementById('post-text');
        const text = textInput.value.trim();

        if (!text && this.attachedMedia.length === 0) {
            this.showToast('Please add some content or media');
            return;
        }

        if (this.editingPost) {
            // Update existing post
            this.editingPost.text = text;
            this.editingPost.media = [...this.attachedMedia];
            this.editingPost.edited = true;
            this.editingPost.editedAt = new Date().toISOString();
            this.editingPost = null;
            this.showToast('Post updated!');
        } else {
            // Create new post
            const post = {
                id: Date.now().toString(),
                text: text,
                media: [...this.attachedMedia],
                timestamp: new Date().toISOString(),
                edited: false
            };
            this.posts.unshift(post);
            this.showToast('Post added!');
        }

        // Clear inputs
        textInput.value = '';
        this.attachedMedia = [];
        this.displayAttachedMedia();

        // Save and refresh display
        this.savePosts();
        this.displayPosts();
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        this.editingPost = post;
        document.getElementById('post-text').value = post.text;
        this.attachedMedia = [...post.media];
        this.displayAttachedMedia();
        
        // Scroll to input
        document.querySelector('.telegram-interface').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('post-text').focus();
        
        this.showToast('Editing post - make changes and submit');
    }

    deletePost(postId) {
        if (confirm('Delete this post?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            this.savePosts();
            this.displayPosts();
            this.showToast('Post deleted');
        }
    }

    displayPosts() {
        const container = document.getElementById('content-display');
        
        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="welcome-message">
                    <h2>Welcome to GOATSTUFF2.0</h2>
                    <p>Share photos, videos, and messages with your group</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.posts.map(post => this.renderPost(post)).join('');

        // Add event listeners for edit/delete buttons
        document.querySelectorAll('.edit-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                this.editPost(postId);
            });
        });

        document.querySelectorAll('.delete-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = e.target.dataset.postId;
                this.deletePost(postId);
            });
        });
    }

    renderPost(post) {
        const date = new Date(post.timestamp).toLocaleString();
        const editedText = post.edited ? ' (edited)' : '';
        
        const mediaHtml = post.media.map(media => {
            if (media.type === 'image') {
                return `<img src="${media.data}" alt="Shared image" class="post-media-item">`;
            } else {
                return `<video src="${media.data}" controls class="post-media-item"></video>`;
            }
        }).join('');

        return `
            <div class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <span class="post-date">${date}${editedText}</span>
                    <div class="post-actions">
                        <button class="edit-post" data-post-id="${post.id}" title="Edit">✏️</button>
                        <button class="delete-post" data-post-id="${post.id}" title="Delete">🗑️</button>
                    </div>
                </div>
                ${post.text ? `<div class="post-text">${this.escapeHtml(post.text)}</div>` : ''}
                ${mediaHtml ? `<div class="post-media">${mediaHtml}</div>` : ''}
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\n/g, '<br>');
    }

    savePosts() {
        localStorage.setItem('goatstuff_posts', JSON.stringify(this.posts));
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContentManager();
});