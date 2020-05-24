window.onload = function() {
    // Language selector actions
    var selector = document.getElementById('lang-select');
    if(selector) {
        selector.addEventListener('change', function(e) {
            var lang = e.target.value || 'en';
            localStorage['language'] = lang;
            window.location.replace(
                window.location.href.replace(/\.[^.]+\.html$/, `.${e.target.value}.html`)
            );
        });
    }
};
