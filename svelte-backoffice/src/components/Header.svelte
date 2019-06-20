<script>
    export let is_logged_in;
</script>

<header class="sticky-top">
	<nav class="navbar navbar-expand-xl navbar-dark bg-darker">
		<a class="navbar-brand" href="#"><img class="h-50px d-none d-sm-block" src="../imgs/esl.png" alt="Logo ESL"></a>
		<button class="navbar-toggler mr-auto" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle Navigation">
			<span class="navbar-toggler-icon"></span></button>
		<div class="collapse navbar-collapse" id="navbarCollapse">
			<ul class="navbar-nav">
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle text-nowrap" href="#" role="button" data-toggle="dropdown">Teachers</a>
					<div class="dropdown-menu bg-darker"><a class="dropdown-item text-secondary" href="./teachers">Teachers</a><a class="dropdown-item text-secondary" href="./subjects_teachers">Subjects/Teachers</a><a class="dropdown-item text-secondary" href="./projects_teachers">Projects/Teachers</a><a class="dropdown-item text-secondary" href="./mobilities_teachers">Mobilities/Teachers</a>
					</div>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle text-nowrap" href="#" role="button" data-toggle="dropdown">Students</a>
					<div class="dropdown-menu bg-darker"><a class="dropdown-item text-secondary" href="./students">Students</a><a class="dropdown-item text-secondary" href="./mobilities_students">Mobilities/Students</a>
					</div>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle text-nowrap" href="#" role="button" data-toggle="dropdown">Subjects</a>
					<div class="dropdown-menu bg-darker"><a class="dropdown-item text-secondary" href="./subjects">Subjects</a><a class="dropdown-item text-secondary" href="./subjects_teachers">Subjects/Teachers</a>
					</div>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle text-nowrap" href="#" role="button" data-toggle="dropdown">Partners</a>
					<div class="dropdown-menu bg-darker"><a class="dropdown-item text-secondary" href="./partners">Partners</a><a class="dropdown-item text-secondary" href="./partners_projects">Partners/Projects</a>
					</div>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle text-nowrap" href="#" role="button" data-toggle="dropdown">Mobilities</a>
					<div class="dropdown-menu bg-darker"><a class="dropdown-item text-secondary" href="./mobilities">Mobilities</a><a class="dropdown-item text-secondary" href="./mobilities_students">Mobilities/Students</a><a class="dropdown-item text-secondary" href="./mobilities_teachers">Mobilities/Teachers</a>
					</div>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle text-nowrap" href="#" role="button" data-toggle="dropdown">Projects</a>
					<div class="dropdown-menu bg-darker"><a class="dropdown-item text-secondary" href="./projects">Projects</a><a class="dropdown-item text-secondary" href="./projects_logos">Projects/Logos</a><a class="dropdown-item text-secondary" href="./projects_teachers">Projects/Teachers</a><a class="dropdown-item text-secondary" href="./partners_projects">Partners/Projects</a>
					</div>
				</li>
				<li class="nav-item"><a class="nav-link" href="./courses">Courses</a></li>
				<li class="nav-item"><a class="nav-link" href="./countries">Countries</a></li>
				<li class="nav-item"><a class="nav-link text-nowrap" href="./studentgroups">Student Groups</a></li>
			</ul>
		</div>
		<ul class="navbar-nav mr-2 flex-row">
			<li class="nav-item"><a class="nav-link text-nowrap" href="" data-toggle="modal" data-target="#login-modal"><i class="fas fa-user"></i>&nbsp;{!is_logged_in ? "Login" : "Logout"}</a></li>
		</ul>
	</nav>
</header>