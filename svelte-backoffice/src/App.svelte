<script>
    import {Router, Link, Route} from 'svelte-routing';
    import axios from 'axios';

    import Header from './components/Header.svelte';
    import LoginModal from './components/LoginModal.svelte';
    import Home from './components/Teachers.svelte';
    import About from './components/About.svelte';
	export let url = "";

</script>

<div>
    <LoginModal/>
    <Header is_logged_in={false}/>
    <Router url="{url}">
        <nav>
            <Link to="/svelte/">Home</Link>
            <Link to="/svelte/about/">About</Link>
        </nav>
        <div>
            <Route path="/svelte/" component="{Home}"></Route>
            <Route path="/svelte/" component="{Home}"></Route>
        </div>
    </Router>
</div>
