/* ===============================
   MEETLY — SUPABASE AUTHENTICATION
================================ */

const supabaseClient = window.meetlySupabase;
console.log("MEETLY auth script started");

window.addEventListener("DOMContentLoaded", () => {
    console.log("MEETLY page is ready");
});

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const googleButton = document.getElementById("googleButton");

if (!supabaseClient) {
    console.error("Supabase is not initialized. Check your script order.");
} else if (loginForm && emailInput && passwordInput) {

    let isSignUp = false;

    // Status message
    // Status message
let statusMessage = document.getElementById("authMessage");

if (!statusMessage) {
    statusMessage = document.createElement("p");
    statusMessage.id = "authMessage";
    statusMessage.setAttribute("role", "status");
    loginForm.insertAdjacentElement("afterend", statusMessage);
}

// Switch between sign-in and sign-up
let switchButton = document.getElementById("authSwitch");

if (!switchButton) {
    switchButton = document.createElement("button");
    switchButton.type = "button";
    switchButton.id = "authSwitch";
    switchButton.textContent = "Need an account? Sign Up";
    statusMessage.insertAdjacentElement("afterend", switchButton);
}

    function showMessage(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? "#e74c3c" : "#2e9d62";
    }

    function getMainPageUrl() {
        return new URL("meetly.html", window.location.href).href;
    }

    switchButton.addEventListener("click", () => {
        isSignUp = !isSignUp;

        const submitButton = loginForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) {
            submitButton.textContent = isSignUp ? "Create Account" : "Sign In";
        }

        switchButton.textContent = isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up";

        showMessage("");
    });

    // Email sign-in and account creation
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Enter your email and password.", true);
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        showMessage(isSignUp ? "Creating your account..." : "Signing in...");

        try {
            if (isSignUp) {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password
                });

                if (error) throw error;

                if (data.session) {
                    window.location.href = getMainPageUrl();
                } else {
                    showMessage(
                        "Account created! Check your email to confirm your account, then sign in."
                    );
                }
            } else {
                const { error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                window.location.href = getMainPageUrl();
            }
        } catch (error) {
            showMessage(error.message || "Authentication failed.", true);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    // Google sign-in
    if (googleButton) {
        googleButton.addEventListener("click", async (event) => {
            event.preventDefault();

            showMessage("Connecting to Google...");

            try {
                const { error } = await supabaseClient.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo: getMainPageUrl()
                    }
                });

                if (error) throw error;
            } catch (error) {
                showMessage(error.message || "Google sign-in failed.", true);
            }
        });
    }
}
