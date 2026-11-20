
const SUPABASE_URL = "https://rllifzccztgddtxezlws.supabase.co";

// Paste your existing Supabase publishable key below.
const SUPABASE_KEY = "sb_publishable_jjsgJSj00VRPGFRcr6xSjw_39RYcG4A";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const resetForm = document.getElementById("resetForm");
const resetMessage = document.getElementById("resetMessage");

async function checkRecoverySession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        resetMessage.textContent =
            "Invalid or expired recovery link. Request another password reset email.";
        return false;
    }

    return true;
}

resetForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
        resetMessage.textContent = "Password must be at least 8 characters.";
        return;
    }

    if (password !== confirmPassword) {
        resetMessage.textContent = "Passwords do not match.";
        return;
    }

    resetMessage.textContent = "Updating password...";

    try {
        const validSession = await checkRecoverySession();

        if (!validSession) return;

        const { error } = await supabaseClient.auth.updateUser({
            password: password
        });

        if (error) throw error;

        resetMessage.textContent =
            "Password updated successfully! You can now return to SmartPOS and sign in.";

        await supabaseClient.auth.signOut();

    } catch (error) {
        console.error(error);
        resetMessage.textContent = "Error: " + error.message;
    }
});

checkRecoverySession();
