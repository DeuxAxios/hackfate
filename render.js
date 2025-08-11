
document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');

    fetch('_data/content.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.blocks && data.blocks.length > 0) {
                renderPosts(data.blocks);
            } else {
                postsContainer.innerHTML = '<p>No content has been added yet. Check back soon!</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching or parsing content:', error);
            postsContainer.innerHTML = '<p>Could not load content. Please try again later.</p>';
        });

    function renderPosts(blocks) {
        postsContainer.innerHTML = ''; // Clear any existing content

        blocks.forEach(block => {
            const postElement = document.createElement('article');
            postElement.className = 'post-block';

            if (block.title) {
                const titleElement = document.createElement('h2');
                titleElement.textContent = block.title;
                postElement.appendChild(titleElement);
            }

            if (block.media) {
                const mediaElement = document.createElement('img');
                mediaElement.src = block.media;
                mediaElement.alt = block.title || 'Content Image';
                postElement.appendChild(mediaElement);
            }

            if (block.text) {
                const textElement = document.createElement('div');
                // Note: DecapCMS markdown widget returns HTML. For security in a real app,
                // you would sanitize this. For this project, we'll trust the source.
                textElement.innerHTML = block.text;
                postElement.appendChild(textElement);
            }

            postsContainer.appendChild(postElement);
        });
    }
});
