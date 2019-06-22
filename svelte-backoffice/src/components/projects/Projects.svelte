<script>
    import axios from 'axios';

    export let is_logged_in;
    export let getToken;

    let projects = [];
    let table_headers = ['#', "Project Code", 'Name', '', 'Gender', 'Email'];

    // axios.defaults.withCredentials = true;

    function getProjects() {
    	console.log("Trying to fetch projects");
        axios.get("/api/get/projects", {headers: {Authorization: getToken()}}).then(function(res) {
        	projects = res.data;
        });
    }

    $: if(is_logged_in){
    	getProjects();
    }
</script>

{#if is_logged_in}
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px">
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
        <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2">Teachers</span></h2>
            <span>
                <button class="btn btn-success mb-2" data-toggle="modal" data-target="#modal-add">Add +</button>
                <button class="btn btn-info mb-2 mx-2 disabled" id="edit-btn">Edit</button>
                <button class="btn btn-danger mb-2 disabled" id="delete-btn">Delete</button>
            </span>
            <BasicTable table_headers={table_headers} data={teachers} />
        </div>
    </div>
{/if}