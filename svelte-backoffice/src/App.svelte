<script>
    import {Router, Link, Route} from 'svelte-routing';
    import axios from 'axios';

    import Header from './components/Header.svelte';
    import LoginModal from './components/LoginModal.svelte';
    import Teachers from './components/Teachers.svelte';
    import About from './components/About.svelte';
	export let url = "";

	let is_logged_in = false;

	checkLogin();
	// login("INatsuz", "2509");

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

	function checkLogin() {
		console.log("Checking login");

	    axios.get("/api/logincheck", {headers: {Authorization: getToken()}}).then(res => {
            is_logged_in = true;

            console.log(res.data.userID);
        }).catch(err => {
            login("INatsuz", "2509");

            console.log(err.response.data);
        });
	}

	function getToken() {
	    return localStorage.getItem("api-auth-token");
	}
</script>

<div>
    <Router url="{url}">
        <LoginModal/>
        <Header is_logged_in={is_logged_in} />
        <div>
            <Route path="/svelte/teachers">
                <Teachers is_logged_in={is_logged_in} getToken={getToken} />
            </Route>
        </div>
    </Router>
</div>