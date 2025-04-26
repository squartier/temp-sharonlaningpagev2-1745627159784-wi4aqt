// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let editor;
    let currentSection = 'hero';
    let currentField = '';
    let adminMode = false;
    const adminPanel = document.getElementById('adminPanel');
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const adminNavBtns = document.querySelectorAll('.admin-nav-btn');
    const editableElements = document.querySelectorAll('.editable');
    
    // Initialize Quill editor
    function initEditor() {
        editor = new Quill('#editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }
        });
    }
    
    // Toggle admin panel
    adminToggleBtn.addEventListener('click', function() {
        adminPanel.classList.toggle('active');
        document.body.classList.toggle('admin-mode');
        adminMode = document.body.classList.contains('admin-mode');
        
        if (adminPanel.classList.contains('active') && !editor) {
            initEditor();
        }
    });
    
    // Close admin panel
    closeAdminBtn.addEventListener('click', function() {
        adminPanel.classList.remove('active');
        document.body.classList.remove('admin-mode');
        adminMode = false;
    });
    
    // Handle admin navigation
    adminNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            adminNavBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Set current section
            currentSection = this.getAttribute('data-section');
            
            // Load section content
            loadSectionContent(currentSection);
        });
    });
    
    // Load section content into editor
    function loadSectionContent(section) {
        // Get all editable elements in the section
        const sectionElement = document.querySelector(`[data-section="${section}"]`);
        if (!sectionElement) return;
        
        // Create a list of editable fields in this section
        const fields = Array.from(sectionElement.querySelectorAll('.editable')).map(el => {
            return {
                field: el.getAttribute('data-field'),
                content: el.innerHTML
            };
        });
        
        // Display the fields in the editor
        let editorContent = `<h2>Edit ${section.charAt(0).toUpperCase() + section.slice(1)} Section</h2>`;
        
        fields.forEach(field => {
            editorContent += `<h3 class="edit-field" data-field="${field.field}">${field.field}</h3>`;
            editorContent += `<div class="edit-content" data-field="${field.field}">${field.content}</div>`;
        });
        
        // Set editor content
        editor.root.innerHTML = editorContent;
        
        // Add click event to field headers
        setTimeout(() => {
            const fieldHeaders = editor.root.querySelectorAll('.edit-field');
            fieldHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const field = this.getAttribute('data-field');
                    const content = sectionElement.querySelector(`[data-field="${field}"]`).innerHTML;
                    
                    // Set current field
                    currentField = field;
                    
                    // Clear editor and set content
                    editor.root.innerHTML = '';
                    editor.clipboard.dangerouslyPasteHTML(0, content);
                    
                    // Show save button
                    saveChangesBtn.style.display = 'block';
                });
            });
        }, 100);
    }
    
    // Save changes
    saveChangesBtn.addEventListener('click', function() {
        if (!currentSection || !currentField) return;
        
        // Get content from editor
        const content = editor.root.innerHTML;
        
        // Update the element on the page
        const element = document.querySelector(`[data-section="${currentSection}"] [data-field="${currentField}"]`);
        if (element) {
            element.innerHTML = content;
            
            // Show success message
            alert(`Content updated for ${currentField} in ${currentSection} section!`);
            
            // Reload section content
            loadSectionContent(currentSection);
        }
    });
    
    // Make editable elements clickable in admin mode
    editableElements.forEach(el => {
        el.addEventListener('click', function(e) {
            if (!adminMode) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            // Get section and field
            const section = this.closest('.editable-section').getAttribute('data-section');
            const field = this.getAttribute('data-field');
            
            // Set current section and field
            currentSection = section;
            currentField = field;
            
            // Activate the correct nav button
            adminNavBtns.forEach(btn => {
                if (btn.getAttribute('data-section') === section) {
                    btn.click();
                }
            });
            
            // Open the editor directly to this field
            setTimeout(() => {
                const fieldHeader = editor.root.querySelector(`.edit-field[data-field="${field}"]`);
                if (fieldHeader) {
                    fieldHeader.click();
                }
            }, 200);
        });
    });
    
    // Video embedding functionality
    const videoFields = document.querySelectorAll('[data-field="main-video"], [data-field="video1"], [data-field="video2"], [data-field="video3"]');
    videoFields.forEach(field => {
        field.addEventListener('click', function() {
            if (!adminMode) return;
            
            const videoUrl = prompt('Enter video embed code or URL:');
            if (!videoUrl) return;
            
            // Handle YouTube URLs
            if (videoUrl.includes('youtube.com/watch?v=') || videoUrl.includes('youtu.be/')) {
                let videoId = '';
                
                if (videoUrl.includes('youtube.com/watch?v=')) {
                    videoId = videoUrl.split('v=')[1].split('&')[0];
                } else if (videoUrl.includes('youtu.be/')) {
                    videoId = videoUrl.split('youtu.be/')[1];
                }
                
                if (videoId) {
                    const embedCode = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    this.innerHTML = embedCode;
                }
            } 
            // Handle Vimeo URLs
            else if (videoUrl.includes('vimeo.com/')) {
                let videoId = videoUrl.split('vimeo.com/')[1];
                
                if (videoId) {
                    const embedCode = `<iframe width="100%" height="100%" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                    this.innerHTML = embedCode;
                }
            }
            // Handle direct embed codes
            else if (videoUrl.includes('<iframe')) {
                this.innerHTML = videoUrl;
            }
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (adminMode) return; // Don't scroll in admin mode
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Offset for fixed navbar
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse.classList.contains('show')) {
                    navbarCollapse.classList.remove('show');
                }
            }
        });
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const company = document.getElementById('company').value;
            const industry = document.getElementById('industry').value;
            const message = document.getElementById('message').value;
            
            // In a real implementation, you would send this data to your server
            // For now, we'll just show a success message
            alert(`Thank you for your message, ${name}! We'll get back to you soon.`);
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Export site content for Vercel/Netlify deployment
    function exportSiteContent() {
        // This function would gather all content and prepare it for export
        // In a real implementation, this would create a JSON file or similar
        // For now, we'll just log a message
        console.log('Site content exported for deployment');
    }
    
    // Add export button to admin panel
    const adminHeader = document.querySelector('.admin-header');
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-sm btn-success ms-2';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
    exportBtn.addEventListener('click', exportSiteContent);
    adminHeader.appendChild(exportBtn);
    
    // Initialize the first section in the admin panel
    if (adminNavBtns.length > 0) {
        adminNavBtns[0].classList.add('active');
    }
});
