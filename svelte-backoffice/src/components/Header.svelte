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
		<Link class="navbar-brand" to="/backoffice/projects"><img class="h-50px d-none d-sm-block" src="./../public/imgs/esl.png" alt="Logo ESL"></Link>
		<ul class="navbar-nav mr-2 ml-auto flex-row">
		    {#if is_logged_in}
			    <li class="nav-item"><span class="nav-link text-nowrap cursor-pointer" on:click={handleLogoutClick}><i class="fas fa-user"></i> Logout</span></li>
			{:else}
			    <li class="nav-item"><span class="nav-link text-nowrap cursor-pointer" data-toggle="modal" data-target="#login-modal"><i class="fas fa-user"></i> Login</span></li>
			{/if}
		</ul>
	</nav>
</header>