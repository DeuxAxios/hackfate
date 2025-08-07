// Dynamic Website System - Mobile-First Self-Editing Website
// Designed for easy deployment and management through GitHub Pages

// ===== Application State =====
let appState = {
    isEditMode: false,
    isFirstTime: true,
    isPreviewMode: false,
    currentTheme: 'blue',
    siteTitle: 'GOATSTUFF2.0',
    siteDescription: 'Welcome to GOATSTUFF2.0',
    menuItems: [],
    contentItems: [],
    currentEditingId: null,
    currentMediaTab: 'images'
};

// ===== DOM Elements Cache =====
const elements = {
    loadingScreen: null,
    welcomeScreen: null,
    editToggle: null,
    editNotice: null,
    menuToggle: null,
    rotatingMenu: null,
    contentDisplay: null,
    contentInput: null,
    floatingActions: null,
    settingsPanel: null,
    toastContainer: null,
    shareModal: null,
    shareUrlInput: null
};

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    cacheElements();
    
    // Check for shared data in URL hash
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    if (sharedData) {
        try {
            const decodedData = decodeURIComponent(atob(sharedData));
            const parsedData = JSON.parse(decodedData);
            appState = { ...appState, ...parsedData };
            appState.isFirstTime = false; // Not first time if loading shared data
            appState.isEditMode = false; // Shared view is always read-only
            appState.isPreviewMode = true; // Shared view is always preview
            showToast('Loaded shared content!', 'success');
        } catch (e) {
            console.error('Error decoding shared data:', e);
            showToast('Invalid shared link.', 'error');
            loadStoredData(); // Fallback to local storage if shared data is invalid
        }
    } else {
        loadStoredData();
    }

    setupEventListeners();
    initializeContent();
    
    // Initialize telegram interface (show by default when not in edit mode)
    toggleTelegramInterface();
    
    // Show welcome screen for first-time users
    if (appState.isFirstTime) {
        showWelcomeScreen();
    } else {
        hideLoadingScreen();
    }
}

function cacheElements() {
    elements.loadingScreen = document.getElementById('loading-screen');
    elements.welcomeScreen = document.getElementById('welcome-screen');
    elements.editToggle = document.getElementById('edit-mode-toggle');
    elements.editNotice = document.getElementById('edit-mode-notice');
    elements.menuToggle = document.getElementById('menu-toggle');
    elements.rotatingMenu = document.getElementById('rotating-menu');
    elements.contentDisplay = document.getElementById('content-display');
    elements.contentInput = document.getElementById('content-input');
    elements.floatingActions = document.getElementById('floating-actions');
    elements.settingsPanel = document.getElementById('settings-panel');
    elements.toastContainer = document.getElementById('toast-container');
    elements.shareModal = document.getElementById('share-modal');
    elements.shareUrlInput = document.getElementById('share-url');
}

// ===== Local Storage Management =====
function loadStoredData() {
    const stored = localStorage.getItem('dynamicWebsiteData');
    if (stored) {
        const data = JSON.parse(stored);
        appState = { ...appState, ...data };
        appState.isFirstTime = false;
    } else {
        // Set default content for new users
        appState.menuItems = [
            {
                id: generateId(),
                icon: '🏠',
                title: 'Home',
                description: 'Welcome page',
                active: true
            },
            {
                id: generateId(),
                icon: '📱',
                title: 'About',
                description: 'Learn more about this site',
                active: false
            }
        ];
        
        appState.contentItems = [
            {
                id: generateId(),
                title: 'Welcome to GOATSTUFF2.0!',
                text: 'This is your live website! New content cards will appear here as they\'re added. Bookmark this page to follow all updates.',
                images: [],
                videos: [],
                timestamp: new Date().toISOString(),
                menuId: appState.menuItems[0].id
            }
        ];
    }
    
    applyStoredSettings();
}

function saveData() {
    localStorage.setItem('dynamicWebsiteData', JSON.stringify(appState));
    showToast('Changes saved successfully!', 'success');
}

function applyStoredSettings() {
    // Apply site title
    document.getElementById('dynamic-title').textContent = appState.siteTitle;
    document.getElementById('site-title').textContent = appState.siteTitle;
    
    // Apply theme
    document.body.className = `theme-${appState.currentTheme}`;
    
    // Update theme color meta tag
    const themeColors = {
        blue: '#3b82f6',
        green: '#10b981', 
        purple: '#8b5cf6',
        orange: '#f59e0b',
        pink: '#ec4899'
    };
    document.querySelector('meta[name="theme-color"]').content = themeColors[appState.currentTheme];
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Header controls
    elements.editToggle.addEventListener('click', toggleEditMode);
    elements.menuToggle.addEventListener('click', toggleMenu);
    
    // Menu controls
    document.getElementById('close-menu').addEventListener('click', closeMenu);
    document.getElementById('add-menu-item').addEventListener('click', addMenuItem);
    
    // Edit mode controls
    document.getElementById('save-changes').addEventListener('click', saveData);
    document.getElementById('cancel-edit').addEventListener('click', cancelEdit);
    document.getElementById('save-content').addEventListener('click', saveContent);
    document.getElementById('delete-content').addEventListener('click', deleteContent);
    
    // Floating action button
    document.getElementById('add-content').addEventListener('click', addNewContent);
    
    // Settings panel
    document.getElementById('settings-toggle').addEventListener('click', openSettings);
    
    // Preview toggle
    document.getElementById('preview-toggle').addEventListener('click', togglePreviewMode);
    document.getElementById('close-settings').addEventListener('click', closeSettings);
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    document.getElementById('export-data').addEventListener('click', exportData);
    document.getElementById('import-data').addEventListener('click', importData);
    
    // Share feature
    document.getElementById('share-site').addEventListener('click', openShareModal);
    document.getElementById('close-share-modal').addEventListener('click', closeShareModal);
    document.getElementById('copy-share-url').addEventListener('click', copyShareUrl);
    
    // Welcome screen
    document.getElementById('complete-setup').addEventListener('click', completeSetup);
    
    // Theme selection in welcome screen
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => selectTheme(e.target.dataset.theme));
    });
    
    // Close overlays on background click
    elements.rotatingMenu.addEventListener('click', (e) => {
        if (e.target === elements.rotatingMenu) closeMenu();
    });
    
    elements.settingsPanel.addEventListener('click', (e) => {
        if (e.target === elements.settingsPanel) closeSettings();
    });
    
    elements.welcomeScreen.addEventListener('click', (e) => {
        if (e.target === elements.welcomeScreen) return; // Don't close on background
    });
    
    elements.shareModal.addEventListener('click', (e) => {
        if (e.target === elements.shareModal) closeShareModal();
    });
}

// ===== Edit Mode Management =====
function toggleEditMode() {
    // Prevent entering edit mode if in preview mode (i.e., loaded from shared URL)
    if (appState.isPreviewMode && !appState.isEditMode) {
        showToast('Cannot edit in preview mode. Please open the original site.', 'warning');
        return;
    }

    appState.isEditMode = !appState.isEditMode;
    
    if (appState.isEditMode) {
        elements.editToggle.classList.add('active');
        elements.editNotice.classList.remove('hidden');
        elements.floatingActions.classList.remove('hidden');
        document.getElementById('add-menu-item').classList.remove('hidden');
        
        // Make content items editable
        document.querySelectorAll('.content-item').forEach(item => {
            item.classList.add('editable');
        });
        
        // Make site title editable
        elements.editToggle.title = 'Exit Content Mode';
        showToast('Content mode activated - tap items to edit', 'success');
    } else {
        elements.editToggle.classList.remove('active');
        elements.editNotice.classList.add('hidden');
        elements.floatingActions.classList.add('hidden');
        document.getElementById('add-menu-item').classList.add('hidden');
        
        // Remove editable state
        document.querySelectorAll('.content-item').forEach(item => {
            item.classList.remove('editable');
        });
        
        elements.editToggle.title = 'Enter Content Mode';
        hideContentInput();
        showToast('Content mode deactivated', 'info');
    }
    
    // Toggle telegram interface
    toggleTelegramInterface();
}

// ===== Menu Management =====
function toggleMenu() {
    elements.rotatingMenu.classList.toggle('hidden');
    elements.menuToggle.classList.toggle('active');
    
    if (!elements.rotatingMenu.classList.contains('hidden')) {
        renderMenuItems();
    }
}

function closeMenu() {
    elements.rotatingMenu.classList.add('hidden');
    elements.menuToggle.classList.remove('active');
}

function renderMenuItems() {
    const container = document.getElementById('menu-items');
    container.innerHTML = '';
    
    appState.menuItems.forEach(item => {
        const menuElement = createMenuItemElement(item);
        container.appendChild(menuElement);
    });
}

function createMenuItemElement(item) {
    const div = document.createElement('button');
    div.className = `menu-item ${item.active ? 'active' : ''}`;
    div.innerHTML = `
        <span class="menu-item-icon">${item.icon}</span>
        <div class="menu-item-content">
            <div class="menu-item-title">${item.title}</div>
            <div class="menu-item-desc">${item.description}</div>
        </div>
    `;
    
    div.addEventListener('click', () => selectMenuItem(item.id));
    
    if (appState.isEditMode) {
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            editMenuItem(item.id);
        });
    }
    
    return div;
}

function selectMenuItem(itemId) {
    // Update active state
    appState.menuItems.forEach(item => {
        item.active = item.id === itemId;
    });
    
    closeMenu();
    renderContent();
    saveData();
}

function addMenuItem() {
    const newItem = {
        id: generateId(),
        icon: '📄',
        title: 'New Section',
        description: 'Tap to edit this section',
        active: false
    };
    
    appState.menuItems.push(newItem);
    renderMenuItems();
    showToast('New menu item added', 'success');
}

function editMenuItem(itemId) {
    const item = appState.menuItems.find(menuItem => menuItem.id === itemId);
    if (!item) return;
    
    const newTitle = prompt('Edit menu item title:', item.title);
    if (newTitle === null) return; // User cancelled
    
    const newDesc = prompt('Edit menu description:', item.description);
    if (newDesc === null) return; // User cancelled
    
    // Update the menu item
    item.title = newTitle.trim() || item.title;
    item.description = newDesc.trim() || item.description;
    
    renderMenuItems();
    saveData();
    showToast('Menu item updated', 'success');
}

// ===== Content Management =====
function initializeContent() {
    renderContent();
}

function renderContent() {
    const activeMenuItem = appState.menuItems.find(item => item.active);
    if (!activeMenuItem) return;
    
    const relevantContent = appState.contentItems.filter(item => 
        item.menuId === activeMenuItem.id
    );
    
    elements.contentDisplay.innerHTML = '';
    
    if (relevantContent.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'content-item';
        emptyState.innerHTML = `
            <div class="content-title">No content yet</div>
            <div class="content-text">This section is empty. ${appState.isEditMode ? 'Tap the + button to add content.' : 'Switch to content mode to add content.'}</div>
        `;
        elements.contentDisplay.appendChild(emptyState);
        return;
    }
    
    relevantContent.forEach(item => {
        const contentElement = createContentElement(item);
        elements.contentDisplay.appendChild(contentElement);
    });
}

function createContentElement(item) {
    const div = document.createElement('div');
    div.className = `content-item ${appState.isEditMode ? 'editable' : ''}`;
    div.dataset.id = item.id;
    
    // Create media HTML for images and videos
    let mediaHtml = '';
    if (item.images && item.images.length > 0 || item.videos && item.videos.length > 0) {
        mediaHtml = '<div class="content-media">';
        
        // Add images
        if (item.images && item.images.length > 0) {
            item.images.forEach(imageUrl => {
                if (imageUrl.trim()) {
                    mediaHtml += `<img src="${imageUrl}" alt="${item.title}" class="content-image" loading="lazy">`;
                }
            });
        }
        
        // Add videos
        if (item.videos && item.videos.length > 0) {
            item.videos.forEach(videoUrl => {
                if (videoUrl.trim()) {
                    mediaHtml += `
                        <video class="content-video" controls preload="metadata">
                            <source src="${videoUrl}" type="video/mp4">
                            <source src="${videoUrl}" type="video/webm">
                            <source src="${videoUrl}" type="video/mov">
                            Your browser does not support the video tag.
                        </video>
                    `;
                }
            });
        }
        
        mediaHtml += '</div>';
    }
    
    // Fallback for old single image format
    if (!mediaHtml && item.image) {
        mediaHtml = `<div class="content-media"><img src="${item.image}" alt="${item.title}" class="content-image" loading="lazy"></div>`;
    }
    
    div.innerHTML = `
        ${mediaHtml}
        <div class="content-title">${item.title}</div>
        <div class="content-text">${item.text}</div>
        <div class="content-meta">
            <span>📅 ${formatDate(item.timestamp)}</span>
        </div>
    `;
    
    if (appState.isEditMode) {
        div.addEventListener('click', () => editContent(item.id));
    }
    
    return div;
}

function addNewContent() {
    if (!appState.isEditMode) return;
    
    const activeMenuItem = appState.menuItems.find(item => item.active);
    if (!activeMenuItem) {
        showToast('Select a menu item first', 'warning');
        return;
    }
    
    showContentInput({
        title: '',
        text: '',
        image: '',
        menuId: activeMenuItem.id
    });
}

function editContent(contentId) {
    if (!appState.isEditMode) return;
    
    const content = appState.contentItems.find(item => item.id === contentId);
    if (!content) return;
    
    showContentInput(content, contentId);
}

function showContentInput(content, editingId = null) {
    appState.currentEditingId = editingId;
    
    document.getElementById('edit-title').value = content.title || '';
    document.getElementById('edit-text').value = content.text || '';
    
    // Populate media inputs
    populateMediaInputs(content);
    
    elements.contentInput.classList.remove('hidden');
    document.getElementById('edit-title').focus();
    
    // Show/hide delete button
    const deleteBtn = document.getElementById('delete-content');
    deleteBtn.style.display = editingId ? 'block' : 'none';
}

function hideContentInput() {
    elements.contentInput.classList.add('hidden');
    appState.currentEditingId = null;
}

function cancelEdit() {
    hideContentInput();
}

function saveContent() {
    const title = document.getElementById('edit-title').value.trim();
    const text = document.getElementById('edit-text').value.trim();
    
    // Update media arrays from current inputs
    updateMediaArrays();
    
    if (!title && !text && currentImages.length === 0 && currentVideos.length === 0) {
        showToast('Please add a title, content, or media', 'warning');
        return;
    }
    
    const activeMenuItem = appState.menuItems.find(item => item.active);
    if (!activeMenuItem) {
        showToast('No active menu item', 'error');
        return;
    }
    
    if (appState.currentEditingId) {
        // Update existing content
        const contentIndex = appState.contentItems.findIndex(item => 
            item.id === appState.currentEditingId
        );
        
        if (contentIndex !== -1) {
            appState.contentItems[contentIndex] = {
                ...appState.contentItems[contentIndex],
                title: title || 'Untitled',
                text,
                images: [...currentImages],
                videos: [...currentVideos],
                timestamp: new Date().toISOString()
            };
            showToast('Content updated!', 'success');
        }
    } else {
        // Create new content
        const newContent = {
            id: generateId(),
            title: title || 'Untitled',
            text,
            images: [...currentImages],
            videos: [...currentVideos],
            timestamp: new Date().toISOString(),
            menuId: activeMenuItem.id
        };
        
        appState.contentItems.push(newContent);
        showToast('Content added!', 'success');
    }
    
    hideContentInput();
    renderContent();
    saveData();
}

function deleteContent() {
    if (!appState.currentEditingId) return;
    
    if (confirm('Are you sure you want to delete this content?')) {
        appState.contentItems = appState.contentItems.filter(item => 
            item.id !== appState.currentEditingId
        );
        
        hideContentInput();
        renderContent();
        saveData();
        showToast('Content deleted', 'info');
    }
}

// ===== Settings Management =====
function openSettings() {
    elements.settingsPanel.classList.remove('hidden');
    
    // Populate form with current values
    document.getElementById('site-title-input').value = appState.siteTitle;
    document.getElementById('site-theme').value = appState.currentTheme;
    document.getElementById('site-description').value = appState.siteDescription;
}

function closeSettings() {
    elements.settingsPanel.classList.add('hidden');
}

function saveSettings() {
    appState.siteTitle = document.getElementById('site-title-input').value.trim() || 'Dynamic Website';
    appState.currentTheme = document.getElementById('site-theme').value;
    appState.siteDescription = document.getElementById('site-description').value.trim();
    
    applyStoredSettings();
    saveData();
    closeSettings();
    showToast('Settings saved!', 'success');
}

// ===== Theme Management =====
function selectTheme(theme) {
    appState.currentTheme = theme;
    document.body.className = `theme-${theme}`;
    
    // Update theme button selection
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.theme === theme);
    });
}

// ===== Welcome Screen =====
function showWelcomeScreen() {
    elements.loadingScreen.classList.add('hidden');
    elements.welcomeScreen.classList.remove('hidden');
    
    // Set default theme selection
    document.querySelector('[data-theme="blue"]').classList.add('selected');
}

function completeSetup() {
    const title = document.getElementById('welcome-title').value.trim();
    const content = document.getElementById('welcome-content').value.trim();
    
    if (title) {
        appState.siteTitle = title;
        document.getElementById('dynamic-title').textContent = title;
        document.getElementById('site-title').textContent = title;
    }
    
    if (content) {
        // Update the first content item
        if (appState.contentItems.length > 0) {
            appState.contentItems[0].text = content;
        }
    }
    
    appState.isFirstTime = false;
    elements.welcomeScreen.classList.add('hidden');
    
    renderContent();
    saveData();
    
    // Ensure telegram interface is visible for content management
    document.getElementById('telegram-interface').classList.remove('hidden');
    
    showToast(`${appState.siteTitle} is now live! Share this URL with your group.`, 'success');
}

// ===== Data Import/Export =====
function exportData() {
    const dataBlob = new Blob([JSON.stringify(appState, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appState.siteTitle.replace(/\s+/g, '-').toLowerCase()}-backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (confirm('This will replace all current data. Continue?')) {
                    appState = { ...appState, ...importedData };
                    applyStoredSettings();
                    renderMenuItems();
                    renderContent();
                    saveData();
                    closeSettings();
                    showToast('Data imported successfully!', 'success');
                }
            } catch (error) {
                showToast('Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ===== Utility Functions =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

function hideLoadingScreen() {
    setTimeout(() => {
        elements.loadingScreen.classList.add('hidden');
        // Ensure telegram interface is visible for content management
        document.getElementById('telegram-interface').classList.remove('hidden');
    }, 1000);
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    elements.toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (elements.toastContainer.contains(toast)) {
                elements.toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ===== PWA Features =====
// Note: Service Worker registration removed for GitHub Pages static deployment
// The app still works as PWA with manifest.json for installability

// Add to home screen prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button or toast
    showToast('Add this website to your home screen for the best experience!', 'info');
});

// Handle install
function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showToast('Thanks for installing!', 'success');
            } 
            deferredPrompt = null;
        });
    }
}

// ===== Share Feature =====
function openShareModal() {
    elements.shareModal.classList.remove('hidden');
    const currentAppState = { ...appState };
    // Remove sensitive or unnecessary data for sharing
    delete currentAppState.isEditMode;
    delete currentAppState.isFirstTime;
    delete currentAppState.currentEditingId;
    
    const encodedData = btoa(encodeURIComponent(JSON.stringify(currentAppState)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
    elements.shareUrlInput.value = shareUrl;
    elements.shareUrlInput.select();
}

function closeShareModal() {
    elements.shareModal.classList.add('hidden');
}

function copyShareUrl() {
    elements.shareUrlInput.select();
    document.execCommand('copy');
    showToast('Share URL copied to clipboard!', 'success');
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + E for edit mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
    }
    
    // Ctrl/Cmd + S for save (when in edit mode)
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && appState.isEditMode) {
        e.preventDefault();
        saveData();
    }
    
    // Escape to close overlays
    if (e.key === 'Escape') {
        if (!elements.rotatingMenu.classList.contains('hidden')) {
            closeMenu();
        } else if (!elements.settingsPanel.classList.contains('hidden')) {
            closeSettings();
        } else if (!elements.contentInput.classList.contains('hidden')) {
            cancelEdit();
        }
    }
});

// ===== Touch Gestures =====
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    // Swipe up to open menu (if not in edit mode)
    if (diff > swipeThreshold && !appState.isEditMode) {
        if (elements.rotatingMenu.classList.contains('hidden')) {
            toggleMenu();
        }
    }
    
    // Swipe down to close menu
    if (diff < -swipeThreshold) {
        if (!elements.rotatingMenu.classList.contains('hidden')) {
            closeMenu();
        }
    }
}

// ===== Auto-save functionality =====
let autoSaveTimer;

function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveData();
    }, 2000); // Auto-save after 2 seconds of inactivity
}

// Add auto-save to content editing
document.getElementById('edit-title').addEventListener('input', scheduleAutoSave);
document.getElementById('edit-text').addEventListener('input', scheduleAutoSave);

// ===== Enhanced Media Management =====
let currentImages = [];
let currentVideos = [];

// Media tab switching
document.getElementById('images-tab').addEventListener('click', () => switchMediaTab('images'));
document.getElementById('videos-tab').addEventListener('click', () => switchMediaTab('videos'));

// Add media buttons
document.getElementById('add-image-url').addEventListener('click', () => addMediaInput('image'));
document.getElementById('add-video-url').addEventListener('click', () => addMediaInput('video'));

// File upload handlers
document.getElementById('image-upload').addEventListener('change', handleImageUpload);
document.getElementById('video-upload').addEventListener('change', handleVideoUpload);

// Telegram-like interface handlers
document.getElementById('attach-media').addEventListener('click', openMediaAttachment);
document.getElementById('post-media-upload').addEventListener('change', handlePostMediaUpload);
document.getElementById('submit-post').addEventListener('click', submitQuickPost);

// Welcome screen media upload
document.getElementById('welcome-media-upload').addEventListener('change', handleWelcomeMediaUpload);

// Auto-resize textarea
document.getElementById('post-text').addEventListener('input', autoResizeTextarea);

function switchMediaTab(tab) {
    appState.currentMediaTab = tab;
    
    // Update tab buttons
    document.querySelector('.media-tab.active').classList.remove('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    // Update sections
    document.querySelector('.media-section.active').classList.remove('active');
    document.getElementById(`${tab}-section`).classList.add('active');
}

function addMediaInput(type) {
    const list = document.getElementById(`${type}-list`);
    const inputGroup = document.createElement('div');
    inputGroup.className = 'media-input-group';
    
    const input = document.createElement('input');
    input.type = 'url';
    input.className = 'media-url-input';
    input.placeholder = `Enter ${type} URL`;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-media-btn';
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
        list.removeChild(inputGroup);
        updateMediaArrays();
    });
    
    input.addEventListener('input', updateMediaArrays);
    
    inputGroup.appendChild(input);
    inputGroup.appendChild(removeBtn);
    list.appendChild(inputGroup);
    
    input.focus();
}

function updateMediaArrays() {
    // Update images array
    currentImages = Array.from(document.querySelectorAll('#image-list .media-url-input'))
        .map(input => input.value.trim())
        .filter(url => url);
    
    // Update videos array
    currentVideos = Array.from(document.querySelectorAll('#video-list .media-url-input'))
        .map(input => input.value.trim())
        .filter(url => url);
}

function handleImageUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            // Convert to data URL for immediate use
            const reader = new FileReader();
            reader.onload = (e) => {
                addMediaInput('image');
                const inputs = document.querySelectorAll('#image-list .media-url-input');
                const lastInput = inputs[inputs.length - 1];
                lastInput.value = e.target.result;
                updateMediaArrays();
            };
            reader.readAsDataURL(file);
        }
    }
}

function handleVideoUpload(event) {
    const files = event.target.files;
    for (let file of files) {
        if (file.type.startsWith('video/')) {
            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                showToast('Video file too large. Maximum size is 50MB.', 'warning');
                continue;
            }
            
            // Convert to data URL for immediate use
            const reader = new FileReader();
            reader.onload = (e) => {
                addMediaInput('video');
                const inputs = document.querySelectorAll('#video-list .media-url-input');
                const lastInput = inputs[inputs.length - 1];
                lastInput.value = e.target.result;
                updateMediaArrays();
            };
            reader.readAsDataURL(file);
        }
    }
}

function populateMediaInputs(content) {
    // Clear existing inputs
    document.getElementById('image-list').innerHTML = '';
    document.getElementById('video-list').innerHTML = '';
    currentImages = [];
    currentVideos = [];
    
    // Populate images
    if (content.images && content.images.length > 0) {
        content.images.forEach(imageUrl => {
            if (imageUrl.trim()) {
                addMediaInput('image');
                const inputs = document.querySelectorAll('#image-list .media-url-input');
                const lastInput = inputs[inputs.length - 1];
                lastInput.value = imageUrl;
            }
        });
    } else if (content.image) {
        // Handle old single image format
        addMediaInput('image');
        const inputs = document.querySelectorAll('#image-list .media-url-input');
        if (inputs.length > 0) {
            inputs[0].value = content.image;
        }
    }
    
    // Populate videos
    if (content.videos && content.videos.length > 0) {
        content.videos.forEach(videoUrl => {
            if (videoUrl.trim()) {
                addMediaInput('video');
                const inputs = document.querySelectorAll('#video-list .media-url-input');
                const lastInput = inputs[inputs.length - 1];
                lastInput.value = videoUrl;
            }
        });
    }
    
    updateMediaArrays();
}

// ===== Telegram-like Posting Interface =====
let currentPostMedia = [];

function toggleTelegramInterface() {
    const telegramInterface = document.getElementById('telegram-interface');
    const floatingActions = document.getElementById('floating-actions');
    
    if (appState.isPreviewMode) {
        // Preview mode - hide all management interfaces
        telegramInterface.classList.add('hidden');
        floatingActions.classList.add('hidden');
    } else {
        // Management mode - always show telegram interface for posting
        telegramInterface.classList.remove('hidden');
        
        if (appState.isEditMode) {
            // Edit mode - show both telegram interface AND floating actions
            floatingActions.classList.remove('hidden');
        } else {
            // Normal mode - just telegram interface
            floatingActions.classList.add('hidden');
        }
    }
}

function openMediaAttachment() {
    document.getElementById('post-media-upload').click();
}

function handlePostMediaUpload(event) {
    const files = event.target.files;
    const composerMedia = document.getElementById('composer-media');
    
    for (let file of files) {
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const mediaUrl = e.target.result;
                currentPostMedia.push({
                    url: mediaUrl,
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    file: file
                });
                
                // Create preview
                const preview = document.createElement('div');
                preview.className = 'media-preview';
                
                const mediaElement = file.type.startsWith('image/') ? 
                    document.createElement('img') : 
                    document.createElement('video');
                
                mediaElement.src = mediaUrl;
                if (mediaElement.tagName === 'VIDEO') {
                    mediaElement.muted = true;
                }
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'media-preview-remove';
                removeBtn.textContent = '×';
                removeBtn.onclick = () => {
                    const index = currentPostMedia.findIndex(m => m.url === mediaUrl);
                    if (index > -1) {
                        currentPostMedia.splice(index, 1);
                    }
                    composerMedia.removeChild(preview);
                };
                
                preview.appendChild(mediaElement);
                preview.appendChild(removeBtn);
                composerMedia.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    }
    
    // Clear the file input
    event.target.value = '';
}

function autoResizeTextarea() {
    const textarea = document.getElementById('post-text');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function submitQuickPost() {
    const postText = document.getElementById('post-text').value.trim();
    
    if (!postText && currentPostMedia.length === 0) {
        showToast('Please add some content or media', 'warning');
        return;
    }
    
    const activeMenuItem = appState.menuItems.find(item => item.active);
    if (!activeMenuItem) {
        showToast('Select a menu section first', 'warning');
        return;
    }
    
    // Create new post
    const newPost = {
        id: generateId(),
        title: postText ? (postText.length > 50 ? postText.substring(0, 50) + '...' : postText) : 'Media Post',
        text: postText,
        images: currentPostMedia.filter(m => m.type === 'image').map(m => m.url),
        videos: currentPostMedia.filter(m => m.type === 'video').map(m => m.url),
        timestamp: new Date().toISOString(),
        menuId: activeMenuItem.id
    };
    
    appState.contentItems.push(newPost);
    
    // Clear interface for next post
    clearPostComposer();
    
    // Update display
    renderContent();
    saveData();
    
    showToast('Posted!', 'success');
    
    // Auto-scroll to show new post
    setTimeout(() => {
        const contentDisplay = document.getElementById('content-display');
        contentDisplay.scrollTop = contentDisplay.scrollHeight;
    }, 100);
}

function clearPostComposer() {
    document.getElementById('post-text').value = '';
    document.getElementById('composer-media').innerHTML = '';
    currentPostMedia = [];
    autoResizeTextarea();
}

function handleWelcomeMediaUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        showToast(`${files.length} file(s) selected for first post`, 'success');
    }
}

// ===== Responsive image loading =====
function optimizeImages() {
    const images = document.querySelectorAll('.content-image');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD4KICA8L3N2Zz4=';
        });
    });
}

// ===== Preview Mode =====
function togglePreviewMode() {
    appState.isPreviewMode = !appState.isPreviewMode;
    const previewToggle = document.getElementById('preview-toggle');
    const telegramInterface = document.getElementById('telegram-interface');
    const editToggle = document.getElementById('edit-mode-toggle');
    const settingsToggle = document.getElementById('settings-toggle');
    
    if (appState.isPreviewMode) {
        // Preview mode - hide management interface
        previewToggle.classList.add('active');
        previewToggle.title = 'Exit Preview';
        telegramInterface.classList.add('hidden');
        editToggle.classList.add('hidden');
        settingsToggle.classList.add('hidden');
        
        // Force exit edit mode
        if (appState.isEditMode) {
            appState.isEditMode = false;
            document.getElementById('edit-mode-toggle').classList.remove('active');
            document.getElementById('edit-mode-notice').classList.add('hidden');
            document.getElementById('floating-actions').classList.add('hidden');
            document.getElementById('add-menu-item').classList.add('hidden');
            hideContentInput();
        }
        
        showToast('Preview Mode - This is how your group sees the website', 'info');
    } else {
        // Management mode - show management interface  
        previewToggle.classList.remove('active');
        previewToggle.title = 'Preview Live Website';
        telegramInterface.classList.remove('hidden');
        editToggle.classList.remove('hidden');
        settingsToggle.classList.remove('hidden');
        
        showToast('Management Mode - Add content for your group', 'info');
    }
    
    renderContent();
}

// Run image optimization after content renders
const observer = new MutationObserver(optimizeImages);
observer.observe(elements.contentDisplay, { childList: true, subtree: true });