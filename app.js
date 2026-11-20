
// =====================================
// 
/* =====================================
   SMARTPOS - MAIN JAVASCRIPT
   Supabase Connection and Login
===================================== */

// 1. SUPABASE CONFIGURATION

const SUPABASE_URL =
    "https://rllifzccztgddtxezlws.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_jjsgJSj00VRPGFRcr6xSjw_39RYcG4A";


// 2. INITIALIZE SUPABASE

let supabaseClient = null;
let isConnected = false;
let selectedRole = "worker";

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

// Create the connection status display
const status = document.createElement("div");
status.id = "connectionStatus";

status.style.padding = "12px";
status.style.margin = "12px 0";
status.style.borderRadius = "8px";
status.style.fontWeight = "bold";

if (loginForm && loginForm.parentNode) {
    loginForm.parentNode.insertBefore(status, loginForm);
} else {
    document.body.prepend(status);
}


// 3. DISPLAY MESSAGES

function showStatus(text, success) {
    if (!status) return;

    status.textContent = text;
    status.style.color = success ? "green" : "red";
    status.style.padding = "12px";
    status.style.background = success ? "#e7f8ec" : "#fdeaea";
    status.style.borderRadius = "8px";
}

function showMessage(text) {
    if (message) {
        message.textContent = text;
    } else {
        alert(text);
    }
}


// 4. CHECK SUPABASE CONNECTION

async function connectSupabase() {

    showStatus("Connecting to Supabase...", false);

    try {

        if (!window.supabase) {
            throw new Error("Supabase library did not load.");
        }

        if (
            SUPABASE_KEY === "PASTE_YOUR_PUBLISHABLE_KEY_HERE" ||
            !SUPABASE_KEY.trim()
        ) {
            throw new Error("Please add your publishable key.");
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        const response = await fetch(
            SUPABASE_URL + "/auth/v1/health",
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error("Server error: HTTP " + response.status);
        }

        isConnected = true;

        showStatus(
            "CONNECTED! SmartPOS is connected to Supabase!",
            true
        );

    } catch (error) {

        isConnected = false;

        showStatus(
            "CONNECTION FAILED: " + error.message,
            false
        );

        console.error("Connection error:", error);
    }
}


// 5. SELECT ACCOUNT TYPE

window.selectRole = function(role, button) {

    selectedRole = role;

    document.querySelectorAll(".account-btn")
        .forEach(function(item) {
            item.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    showMessage(role.toUpperCase() + " login selected.");
};


// 6. LOGIN SYSTEM

if (!loginForm) {

    console.error("SmartPOS error: loginForm was not found.");

} else {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        console.log("SmartPOS: Sign In button pressed.");

        showMessage("SIGN IN BUTTON WORKS! Checking account...");

        if (!isConnected || !supabaseClient) {
            showMessage("Supabase is not connected. Please wait.");
            return;
        }

        const emailElement = document.getElementById("email");
        const passwordElement = document.getElementById("password");

        if (!emailElement || !passwordElement) {
            showMessage("Login error: Email or password field missing.");
            return;
        }

        const email = emailElement.value.trim();
        const password = passwordElement.value;

        if (!email || !password) {
            showMessage("Please enter your email and password.");
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Signing in...";
        }

        try {

            // Authenticate with Supabase

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) throw error;

            // Retrieve the user's profile

            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("username, full_name, role, active")
                    .eq("id", data.user.id)
                    .single();

            if (profileError) throw profileError;

            // Check account status

            if (!profile.active) {
                throw new Error("This account is inactive.");
            }

            // Check selected account type

            if (profile.role !== selectedRole) {
                throw new Error(
                    "Wrong account type. Please select " +
                    profile.role + " login."
                );
            }

            
showMessage(
    "WELCOME, " + profile.full_name +
    "! Login successful."
);

console.log("SmartPOS login successful:", profile);

// Open the dashboard

// Open the correct dashboard
const welcomeSection = document.querySelector(".welcome");
const loginCard = document.querySelector(".login-card");
const dashboard = document.getElementById("dashboard");

const dashboardWelcome =
    document.getElementById("dashboardWelcome");

const dashboardTitle =
    document.getElementById("dashboardTitle");

if (dashboard) {
    if (welcomeSection) {
        welcomeSection.style.display = "none";
    }

    if (loginCard) {
        loginCard.style.display = "none";
    }

    dashboard.style.display = "block";

    dashboardWelcome.textContent =
        "Welcome, " + profile.full_name;

    dashboardTitle.textContent =
        profile.role === "admin"
        ? "SmartPOS Admin Dashboard"
        : "SmartPOS Worker Dashboard";
}

const dashboard = document.getElementById("dashboard");
const dashboardWelcome = document.getElementById("dashboardWelcome");
const dashboardTitle = document.getElementById("dashboardTitle");

if (loginSection && dashboard) {
    loginSection.style.display = "none";
    dashboard.style.display = "block";

    dashboardWelcome.textContent =
        "Welcome, " + profile.full_name;

    dashboardTitle.textContent =
        profile.role === "admin"
        ? "SmartPOS Admin Dashboard"
        : "SmartPOS Worker Dashboard";
}

        } catch (error) {

            console.error("SmartPOS login error:", error);

            showMessage("LOGIN FAILED: " + error.message);

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Sign In →";
            }
        }
    });
}


// 7. START SMARTPOS

/* =================================
   SMARTPOS FORGOT PASSWORD
================================= */

const forgotPasswordLink =
    document.getElementById("forgotPasswordLink");

if (forgotPasswordLink) {

    forgotPasswordLink.addEventListener("click", async function(event) {

        event.preventDefault();

        const emailInput = document.getElementById("email");
        const email = emailInput.value.trim();

        if (!email) {
            showMessage("Please enter your email address first.");
            emailInput.focus();
            return;
        }

        if (!isConnected || !supabaseClient) {
            showMessage("Please wait for Supabase to connect.");
            return;
        }

        showMessage("Sending password recovery email...");

        try {

            const { error } =
                await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: "https://josephmasauso123-source.github.io/SmartPOS/reset-password.html"
});

            if (error) {
                throw error;
            }

            showMessage(
                "Password recovery email sent! Check your inbox."
            );

        } catch (error) {

            console.error("Password recovery error:", error);

            showMessage(
                "Could not send recovery email: " + error.message
            );
        }
    });
}

connectSupabase();

console.log("SmartPOS JavaScript loaded successfully.");
