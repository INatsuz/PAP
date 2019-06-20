<script>
    import {Router, Link, Route} from 'svelte-routing';
    import axios from 'axios';

    import Home from './routes/Home.svelte';
    import About from './routes/About.svelte';
	export let url = "";
</script>

<div>
    <Router url="{url}">
        <nav>
            <Link to="/svelte/">Home</Link>
            <Link to="/svelte/about/">About</Link>
        </nav>
        <div>
            <Route path="/svelte/" component="{Home}"/>
            <Route path="/svelte/about/" component="{About}"/>
        </div>
    </Router>
</div>
