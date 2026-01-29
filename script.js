const BASE_URL = "http://localhost:8080";
let currentUser = null;

function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(id);
    if (target) {
        target.style.display = 'block';
    }
}

function updateUI() {
    const authRequired = document.querySelectorAll(".auth-required");
    const logoutBtn = document.getElementById("logout-btn");
    const loginNav = document.getElementById("nav-login-btn");
    const signupNav = document.getElementById("nav-signup-btn");

    if (currentUser) {
        authRequired.forEach(el => el.style.display = 'flex');
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (loginNav) loginNav.style.display = 'none';
        if (signupNav) signupNav.style.display = 'none';

        // Update user bar
        const nameEl = document.getElementById("display-name");
        const balanceEl = document.getElementById("display-balance");
        if (nameEl) nameEl.innerText = currentUser.holderName;
        if (balanceEl) balanceEl.innerText = parseFloat(currentUser.balance).toFixed(2);

        // Auto-fill account inputs
        if (document.getElementById("d-acc")) document.getElementById("d-acc").value = currentUser.accountNumber;
        if (document.getElementById("w-acc")) document.getElementById("w-acc").value = currentUser.accountNumber;
        if (document.getElementById("t-from")) document.getElementById("t-from").value = currentUser.accountNumber;
    } else {
        authRequired.forEach(el => el.style.display = 'none');
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginNav) loginNav.style.display = 'inline-block';
        if (signupNav) signupNav.style.display = 'inline-block';
    }
}

function showResult(id, msg, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = msg;
    el.className = 'result ' + (isError ? 'error' : 'success');
}

// Sign Up
function createAccount() {
    const data = {
        name: document.getElementById("c-name").value,
        email: document.getElementById("c-email").value,
        balance: document.getElementById("c-balance").value,
        password: document.getElementById("c-pass").value
    };

    if (!data.name || !data.email || !data.password) {
        showResult("create-result", "Please fill all fields", true);
        return;
    }

    fetch(BASE_URL + "/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            showResult("create-result", "Account Created! Acc No: " + result.accountNumber);
            // Clear form
            document.getElementById("c-name").value = "";
            document.getElementById("c-email").value = "";
            document.getElementById("c-balance").value = "";
            document.getElementById("c-pass").value = "";
        })
        .catch(err => showResult("create-result", "Error creating account", true));
}

// Login
function login() {
    const data = {
        identifier: document.getElementById("l-id").value,
        password: document.getElementById("l-pass").value
    };

    if (!data.identifier || !data.password) {
        showResult("login-result", "Enter credentials", true);
        return;
    }

    fetch(BASE_URL + "/accounts/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) throw new Error("Invalid account number or password");
            return res.json();
        })
        .then(user => {
            currentUser = user;
            showResult("login-result", "Welcome back!");
            updateUI();
            setTimeout(() => showSection('view'), 500);
            viewAccount();
        })
        .catch(err => {
            showResult("login-result", err.message, true);
        });
}

function logout() {
    currentUser = null;
    updateUI();
    showSection('login');
}

function deposite() {
    const amount = document.getElementById("d-amount").value;
    if (!amount || amount <= 0) {
        showResult("deposite-result", "Enter valid amount", true);
        return;
    }

    const data = {
        accNo: currentUser.accountNumber,
        amount: amount
    };

    fetch(BASE_URL + "/transactions/deposite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(msg => {
            if (msg.includes("Error")) throw new Error(msg);
            showResult("deposite-result", msg);
            document.getElementById("d-amount").value = "";
            refreshUserData();
        })
        .catch(err => showResult("deposite-result", err.message, true));
}

function withdraw() {
    const amount = document.getElementById("w-amount").value;
    if (!amount || amount <= 0) {
        showResult("withdraw-result", "Enter valid amount", true);
        return;
    }

    const data = {
        accNo: currentUser.accountNumber,
        amount: amount
    };

    fetch(BASE_URL + "/transactions/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(msg => {
            if (msg.includes("Error")) throw new Error(msg);
            showResult("withdraw-result", msg);
            document.getElementById("w-amount").value = "";
            refreshUserData();
        })
        .catch(err => showResult("withdraw-result", err.message, true));
}

function transfer() {
    const toAcc = document.getElementById("t-to").value;
    const amount = document.getElementById("t-amount").value;

    if (!toAcc || !amount || amount <= 0) {
        showResult("trasfer-result", "Fill all fields correctly", true);
        return;
    }

    const data = {
        fromAcc: currentUser.accountNumber,
        toAcc: toAcc,
        amount: amount
    }

    fetch(BASE_URL + "/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.text())
        .then(msg => {
            if (msg.includes("Error")) throw new Error(msg);
            showResult("trasfer-result", msg);
            document.getElementById("t-to").value = "";
            document.getElementById("t-amount").value = "";
            refreshUserData();
        })
        .catch(err => showResult("trasfer-result", err.message, true));
}

function refreshUserData() {
    if (!currentUser) return;
    fetch(BASE_URL + "/accounts/" + currentUser.accountNumber)
        .then(res => res.json())
        .then(data => {
            currentUser = data;
            updateUI();
        });
}

function viewAccount() {
    const searchAcc = document.getElementById("v-acc").value;
    const acc = searchAcc || (currentUser ? currentUser.accountNumber : null);

    if (!acc) return;

    fetch(BASE_URL + "/accounts/" + acc)
        .then(res => {
            if (!res.ok) throw new Error("Account not found");
            return res.json();
        })
        .then(data => {
            const container = document.getElementById("view-result-styled");
            container.innerHTML = `
            <div class="account-card">
                <div><span class="label">Holder Name</span> <span class="value">${data.holderName}</span></div>
                <div><span class="label">Account Number</span> <span class="value">${data.accountNumber}</span></div>
                <div><span class="label">Email</span> <span class="value">${data.email}</span></div>
                <div style="margin-top:15px; border-top: 1px solid var(--border); padding-top:10px;">
                    <span class="label">Current Balance</span> 
                    <span class="value" style="color:var(--success); font-size:1.2rem;">$${parseFloat(data.balance).toFixed(2)}</span>
                </div>
            </div>
        `;
        })
        .catch(err => {
            document.getElementById("view-result-styled").innerHTML = `<p class="result error">${err.message}</p>`;
        });
}

function listAccount() {
    fetch(BASE_URL + "/accounts/all")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("list-container");
            if (data.length === 0) {
                container.innerHTML = "No accounts found in system.";
                return;
            }

            let html = '<table class="data-table"><thead><tr><th>Acc #</th><th>Name</th><th>Balance</th></tr></thead><tbody>';
            data.forEach(acc => {
                html += `<tr>
                <td>${acc.accountNumber}</td>
                <td>${acc.holderName}</td>
                <td>$${parseFloat(acc.balance).toFixed(2)}</td>
            </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        })
        .catch(err => {
            document.getElementById("list-container").innerHTML = `<p class="result error">Failed to load accounts</p>`;
        });
}

// Initial UI
updateUI();