<script>
    import {Link} from 'svelte-routing';

    export let is_logged_in;
    export let logout;

    function handleLogoutClick() {
        logout();
    }
</script>

<header class="sticky-top">
	<nav class="navbar navbar-expand-xl navbar-dark bg-darker">
		<Link class="navbar-brand" to="/svelte/projects"><img class="h-50px d-none d-sm-block" src="/../imgs/esl.png" alt="Logo ESL"></Link>
		<button class="navbar-toggler mr-auto" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle Navigation">
			<span class="navbar-toggler-icon"></span></button>
		<div class="collapse navbar-collapse" id="navbarCollapse">
			<ul class="navbar-nav">
				<Link to="/svelte/projects"><li class="nav-item"><span class="nav-link">Projects</span></li></Link>
				<Link to="/svelte/teachers"><li class="nav-item"><span class="nav-link">Teachers</span></li></Link>
				<Link to="/svelte/students"><li class="nav-item"><span class="nav-link">Students</span></li></Link>
				<Link to="/svelte/partners"><li class="nav-item"><span class="nav-link">Partners</span></li></Link>
				<Link to="/svelte/mobilities"><li class="nav-item"><span class="nav-link">Mobilities</span></li></Link>
				<Link to="/svelte/subjects"><li class="nav-item"><span class="nav-link">Subjects</span></li></Link>
				<Link to="/svelte/courses"><li class="nav-item"><span class="nav-link">Courses</span></li></Link>
				<Link to="/svelte/countries"><li class="nav-item"><span class="nav-link">Countries</span></li></Link>
				<Link to="/svelte/studentgroups"><li class="nav-item"><span class="nav-link">Student Groups</span></li></Link>
			</ul>
		</div>
		<ul class="navbar-nav mr-2 flex-row">
		    {#if is_logged_in}
			    <li class="nav-item"><span class="nav-link text-nowrap cursor-pointer" on:click={handleLogoutClick}><i class="fas fa-user"></i> Logout</span></li>
			{:else}
			    <li class="nav-item"><span class="nav-link text-nowrap cursor-pointer" data-toggle="modal" data-target="#login-modal"><i class="fas fa-user"></i> Login</span></li>
			{/if}
		</ul>
	</nav>
</header>