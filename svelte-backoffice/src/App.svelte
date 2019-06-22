<script>
    import {Router, Link, Route} from 'svelte-routing';
    import axios from 'axios';

    import Header from './components/Header.svelte';
    import LoginModal from './components/LoginModal.svelte';
    import Teachers from './components/teachers/Teachers.svelte';
    import Projects from './components/projects/Projects.svelte';
    import About from './components/About.svelte';

	export let url = "";

	let is_logged_in = false;

	function login(username, password) {
		console.log("Trying to log in");
        axios.post("/api/login", {username: username, password: password}).then(res => {
        	localStorage.setItem("api-auth-token", res.data.token);
        	is_logged_in = true;
        	console.log(res.data);
        }).catch(err => {
        	console.log(err.response.data);
        });
	}

	function logout() {
        removeToken();
        is_logged_in = false;
	}

	function checkLogin() {
	    axios.get("/api/logincheck", {headers: {Authorization: getToken()}}).then(res => {
            is_logged_in = true;
        }).catch(err => {
            console.log(err.response.data);
        });
	}

	function getToken() {
	    return localStorage.getItem("api-auth-token");
	}

	function setToken(token) {
		localStorage.setItem("api-auth-token", token);
	}

	function removeToken() {
	    localStorage.removeItem("api-auth-token");
	}
	checkLogin();

</script>

<div>
    <Router url="{url}">
        {#if !is_logged_in}
            <LoginModal login={login} />
        {/if}
        <Header is_logged_in={is_logged_in} logout={logout} />
        <div>
            <Route path="/svelte/teachers">
                <Teachers is_logged_in={is_logged_in} getToken={getToken} />
            </Route>
            <Route path="/svelte/">
                <Projects is_logged_in={is_logged_in} getToken={getToken}/>
            </Route>
            {#if !is_logged_in}
                <div class="container p-5 d-flex justify-content-center">
                    <h3 class="m-5 p-3 text-center bg-danger rounded shadow-lg d-inline-block">You must login with your account to do anything in the backoffice</h3>
                </div>
            {/if}
        </div>
    </Router>
</div>