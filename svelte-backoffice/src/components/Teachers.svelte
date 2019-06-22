<script>
    import axios from 'axios';
    import BasicTable from './BasicTable.svelte';

    export let is_logged_in;
    export let getToken;

    let teachers = [];
    let table_headers = ['#', "Teacher #", 'Name', 'Age', 'Gender', 'Email'];

    // axios.defaults.withCredentials = true;

    function getTeachers() {
        axios.get("/api/get/teachers", {headers: {Authorization: getToken()}}).then(function(res) {
        	teachers = res.data;
            console.log(res.data);
            for(let i = 0; i < teachers.length; i++) {
                let age = new Date(new Date() - new Date(teachers[i].birthday)).getFullYear() - 1970;
                if(isNaN(age)){
                    age = 0;
                }
                teachers[i].birthday = age;
                console.log(age);
            }
        });
    }
    $: if(is_logged_in){
    	getTeachers();
    }
</script>

<div>
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
</div>