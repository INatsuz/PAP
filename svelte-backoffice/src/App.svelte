<script>
    import {Router, Link, Route} from 'svelte-routing';
    import axios from 'axios';

    import Home from './routes/Home.svelte';
    import About from './routes/About.svelte';

    let people = [];
    axios.get("http://vraminhos.com/").then(function(res) {
        console.log(res.data);
        people = res.data;
    });

    function handleClick (event){
    	people =
    	[{
    		name: "Miguel",
    		age: 16
    	}, {
    		name: "Ana Rita",
    		age: 10
    	}];
    }

	export let url = "";
</script>

<div>
    <Router url="{url}">
        <nav>
            <Link to="/backoffice/">Home</Link>
            <Link to="/backoffice/about/">About</Link>
        </nav>
        <div>
            <Route path="/backoffice/" component="{Home}"/>
            <Route path="/backoffice/about/" component="{About}"/>
        </div>
        <ul>
            {#each people as person, i}
                <li on:click={handleClick}>{person.name} : {person.age}</li>
            {/each}
        </ul>
    </Router>
</div>
