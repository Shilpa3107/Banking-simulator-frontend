const BASE_URL = "http://localhost:8080";
let isAdminLoggedIn = false;

function showAdminSection(id) {
    document.querySelectorAll(".admin-section").forEach(sec => {
        sec.style.setProperty('display', 'none', 'important');
    });
    const target = document.getElementById(id);
    if (target) {
        target.style.setProperty('display', 'block', 'important');
        if (id === 'admin-accounts-list') {
            loadAllAccountsAdmin();
        }
    }
}

function showResult(id, msg, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = msg;
    el.className = 'result ' + (isError ? 'error' : 'success');
}

function adminLogin() {
    const id = document.getElementById("a-id").value;
    const pass = document.getElementById("a-pass").value;

    fetch(BASE_URL + "/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password: pass })
    })
        .then(res => {
            if (!res.ok) throw new Error("Unauthorized Access");
            return res.json();
        })
        .then(data => {
            console.log("Admin login successful", data);
            isAdminLoggedIn = true;
            document.getElementById("admin-login-section").style.setProperty('display', 'none', 'important');
            document.getElementById("admin-dashboard").style.setProperty('display', 'block', 'important');
            showAdminSection('admin-accounts-list');
        })
        .catch(err => {
            console.error("Admin login error:", err);
            showResult("admin-login-result", err.message, true);
        });
}

function adminLogout() {
    isAdminLoggedIn = false;
    location.reload();
}

function loadAllAccountsAdmin() {
    console.log("Loading all accounts for admin...");
    const container = document.getElementById("admin-list-container");
    if (!container) {
        console.error("Critical: admin-list-container not found!");
        return;
    }
    container.innerHTML = "<p>Loading data...</p>";

    fetch(BASE_URL + "/accounts/all")
        .then(res => {
            console.log("Response status:", res.status);
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(data => {
            console.log("Data received:", data);
            if (!data || data.length === 0) {
                container.innerHTML = '<p class="text-muted" style="text-align:center; padding: 2rem;">No accounts currently registered in the system.</p>';
                return;
            }

            let html = '<table class="data-table"><thead><tr><th>Acc #</th><th>Name</th><th>Email</th><th>Balance</th><th>Action</th></tr></thead><tbody>';
            data.forEach(acc => {
                html += `<tr>
                <td>${acc.accountNumber}</td>
                <td>${acc.holderName}</td>
                <td>${acc.email}</td>
                <td style="color:var(--success); font-weight:600;">$${parseFloat(acc.balance || 0).toFixed(2)}</td>
                <td><button class="delete-btn" onclick="deleteAccount('${acc.accountNumber}')">Delete</button></td>
            </tr>`;
            });
            html += '</tbody></table>';
            container.innerHTML = html;
        })
        .catch(err => {
            console.error("Fetch error:", err);
            container.innerHTML = `<p class="result error">Failed to load system data: ${err.message}</p>`;
        });
}

function deleteAccount(accNo) {
    if (!confirm("Are you sure you want to delete account " + accNo + "?")) return;

    fetch(BASE_URL + "/admin/accounts/" + accNo, {
        method: "DELETE"
    })
        .then(res => res.text())
        .then(msg => {
            alert(msg);
            loadAllAccountsAdmin();
        })
        .catch(err => alert("Error deleting account"));
}

function adminCreateAccount() {
    const data = {
        name: document.getElementById("ac-name").value,
        email: document.getElementById("ac-email").value,
        balance: document.getElementById("ac-balance").value,
        password: document.getElementById("ac-pass").value
    };

    if (!data.name || !data.email || !data.password) {
        showResult("admin-create-result", "Missing required fields", true);
        return;
    }

    fetch(BASE_URL + "/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(result => {
            showResult("admin-create-result", "Success! Created Acc: " + result.accountNumber);
            loadAllAccountsAdmin();
            // Clear fields
            document.getElementById("ac-name").value = "";
            document.getElementById("ac-email").value = "";
            document.getElementById("ac-balance").value = "";
            document.getElementById("ac-pass").value = "";
        })
        .catch(err => showResult("admin-create-result", "Creation failed", true));
}
