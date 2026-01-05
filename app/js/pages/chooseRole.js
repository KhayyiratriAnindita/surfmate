// Enable admin actions now that pages exist
document.addEventListener('DOMContentLoaded', () => {
    const targets = {
        login: 'loginAdmin.html'
    };

    document.querySelectorAll('[data-admin-action]').forEach(btn => {
        const action = btn.getAttribute('data-admin-action');
        if (action !== 'login') return;
        const href = targets[action];
        if (!href) return;
        btn.setAttribute('href', href);
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = href;
        });
    });
});
