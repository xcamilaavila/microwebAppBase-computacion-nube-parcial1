function login() {
    var data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    fetch(`${USERS_API}/api/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    .then(response => {
        return response.json().then(body => ({ status: response.status, body }));
    })
    .then(({ status, body }) => {
        var messageEl = document.getElementById('login-message');
        if (status === 200) {
            messageEl.textContent = 'Sesión iniciada correctamente';
            messageEl.style.color = 'green';
            setTimeout(() => { window.location.href = '/'; }, 1000);
        } else {
            messageEl.textContent = body.message || 'Error al iniciar sesión';
            messageEl.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('login-message').textContent = 'Error de conexión';
    });
}
