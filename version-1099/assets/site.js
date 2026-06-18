(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
        let current = 0;
        let timer = null;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        };

        const startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        thumbs.forEach(function (thumb) {
            thumb.addEventListener('click', function () {
                const index = Number(thumb.getAttribute('data-hero-thumb'));
                showSlide(index);
                startTimer();
            });
        });

        startTimer();
    }

    const scopes = document.querySelectorAll('[data-filter-scope]');

    scopes.forEach(function (scope) {
        const input = scope.querySelector('[data-card-search]');
        const grid = scope.parentElement.querySelector('.searchable-grid');
        const cards = grid ? Array.from(grid.children) : [];
        const yearButtons = Array.from(scope.querySelectorAll('[data-filter-year]'));
        const categoryButtons = Array.from(scope.querySelectorAll('[data-filter-category]'));
        const params = new URLSearchParams(window.location.search);
        let activeYear = '';
        let activeCategory = '';

        if (input && input.hasAttribute('data-query-input') && params.get('q')) {
            input.value = params.get('q');
        }

        const updateButtons = function (buttons, activeValue, attrName) {
            buttons.forEach(function (button) {
                button.classList.toggle('is-active', button.getAttribute(attrName) === activeValue);
            });
        };

        const filterCards = function () {
            const keyword = input ? input.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category')
                ].join(' ').toLowerCase();
                const matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchesYear = !activeYear || card.getAttribute('data-year') === activeYear;
                const matchesCategory = !activeCategory || card.getAttribute('data-category') === activeCategory;

                card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesCategory));
            });
        };

        if (input) {
            input.addEventListener('input', filterCards);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || '';
                updateButtons(yearButtons, activeYear, 'data-filter-year');
                filterCards();
            });
        });

        categoryButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-category') || '';
                updateButtons(categoryButtons, activeCategory, 'data-filter-category');
                filterCards();
            });
        });

        filterCards();
    });
})();
