function checkSession(callback) {
    fetch(`${USERS_API}/api/session`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => callback(data))
        .catch(error => {
            console.error('Error checking session:', error);
            callback({ logged_in: false });
        });
}

function updateNavbar() {
    checkSession(function(data) {
        var loginLink = document.getElementById('nav-login');
        if (!loginLink) return;

        if (data.logged_in) {
            loginLink.textContent = `Logout (${data.username})`;
            loginLink.href = '#';
            loginLink.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        } else {
            loginLink.textContent = 'Login';
            loginLink.href = '/login';
            loginLink.onclick = null;
        }
    });
}

function logout() {
    fetch(`${USERS_API}/api/logout`, {
        method: 'POST',
        credentials: 'include',
    })
    .then(() => {
        window.location.href = '/login';
    })
    .catch(error => console.error('Error:', error));
}
