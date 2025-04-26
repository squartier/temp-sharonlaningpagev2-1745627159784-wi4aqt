// Language switcher functionality for Sharon AI Landing Page
document.addEventListener('DOMContentLoaded', function() {
    // Add language switcher to the navigation
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    const languageSwitcher = document.createElement('li');
    languageSwitcher.className = 'nav-item dropdown language-switcher';
    languageSwitcher.innerHTML = `
        <a class="nav-link dropdown-toggle" href="#" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-globe"></i> <span id="currentLanguage">English</span>
        </a>
        <ul class="dropdown-menu" aria-labelledby="languageDropdown">
            <li><a class="dropdown-item" href="#" data-lang="en">English</a></li>
            <li><a class="dropdown-item" href="#" data-lang="nl">Nederlands</a></li>
        </ul>
    `;
    navbarNav.appendChild(languageSwitcher);
    
    // Initialize language from localStorage or default to English
    let currentLang = localStorage.getItem('sharonAILanguage') || 'en';
    setLanguage(currentLang);
    
    // Add event listeners to language switcher items
    document.querySelectorAll('.language-switcher .dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            localStorage.setItem('sharonAILanguage', lang);
        });
    });
    
    // Function to set language throughout the page
    function setLanguage(lang) {
        document.documentElement.lang = lang;
        document.getElementById('currentLanguage').textContent = lang === 'en' ? 'English' : 'Nederlands';
        
        // Update all translatable elements
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // Handle special cases for elements with different content types
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.getAttribute('placeholder')) {
                        element.setAttribute('placeholder', translations[lang][key]);
                    } else {
                        element.value = translations[lang][key];
                    }
                } else if (element.tagName === 'A' && element.getAttribute('data-bs-original-title')) {
                    element.setAttribute('data-bs-original-title', translations[lang][key]);
                } else {
                    element.innerHTML = translations[lang][key];
                }
            }
        });
        
        // Update document title
        document.title = lang === 'en' ? 'Sharon AI | Expert-Designed AI Workflows' : 'Sharon AI | Door Experts Ontworpen AI-Workflows';
        
        // Update admin panel text if it exists
        if (document.getElementById('adminToggleBtn')) {
            document.getElementById('adminToggleBtn').innerHTML = `<i class="fas fa-lock"></i> ${translations[lang].admin}`;
        }
        
        // Update industry dropdown options in contact form
        const industrySelect = document.getElementById('industry');
        if (industrySelect) {
            const selectedValue = industrySelect.value;
            
            // Clear existing options
            while (industrySelect.options.length > 0) {
                industrySelect.remove(0);
            }
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            defaultOption.textContent = translations[lang].selectIndustry;
            industrySelect.appendChild(defaultOption);
            
            // Add industry options
            const industries = [
                { value: 'Retail & Distribution', key: 'retailDistribution' },
                { value: 'Professional Services', key: 'professionalServices' },
                { value: 'Healthcare & Wellness', key: 'healthcare' },
                { value: 'Built Environment', key: 'builtEnvironment' },
                { value: 'Education & Training', key: 'education' },
                { value: 'Government & Public Sector', key: 'government' },
                { value: 'Security & Protection', key: 'security' },
                { value: 'Travel & Hospitality', key: 'travel' },
                { value: 'Manufacturing & Production', key: 'manufacturing' },
                { value: 'Other', key: 'other' }
            ];
            
            industries.forEach(industry => {
                const option = document.createElement('option');
                option.value = industry.value;
                option.textContent = translations[lang][industry.key];
                industrySelect.appendChild(option);
            });
            
            // Restore selected value if possible
            if (selectedValue) {
                for (let i = 0; i < industrySelect.options.length; i++) {
                    if (industrySelect.options[i].value === selectedValue) {
                        industrySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }
});
