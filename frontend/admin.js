/* =========================================
   ONESOS TRIM
   ADMIN LOGIN
========================================= */


const loginForm =
    document.getElementById("adminLoginForm");


const loginError =
    document.getElementById("loginError");



loginForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const username =
            document.getElementById("username").value.trim();


        const password =
            document.getElementById("password").value;


        /*
            Temporary admin login.

            Later we can connect this
            with Django authentication.
        */

        const ADMIN_USERNAME = "OneSos";

        const ADMIN_PASSWORD = "Admin";


        if (
            username === ADMIN_USERNAME &&
            password === ADMIN_PASSWORD
        ) {

            // Save login status

            localStorage.setItem(
                "onesos_admin_logged_in",
                "true"
            );


            // Go to dashboard

            window.location.href =
                "dashboard.html";


        } else {

            loginError.textContent =
                "Invalid username or password.";

        }

    }
);