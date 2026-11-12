const USERS_KEY = 'stockpilot_users';
const SESSION_KEY = 'stockpilot_session';

async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function registerUser(email, password, name) {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
        return { ok: false, error: 'An account with this email already exists.' };
    }
    const passwordHash = await hashPassword(password);
    const user = {
        id: Date.now().toString(),
        email,
        name,
        passwordHash,
        createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
}

async function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
        return { ok: false, error: 'Invalid email or password.' };
    }
    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
        return { ok: false, error: 'Invalid email or password.' };
    }
    const session = {
        userId: user.id,
        email: user.email,
        name: user.name,
        loggedInAt: new Date().toISOString()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: { id: user.id, email: user.email, name: user.name } };
}

function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch {
        return null;
    }
}

function logout() {
    sessionStorage.removeItem(SESSION_KEY);
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}
