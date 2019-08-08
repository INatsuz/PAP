<script>
    import axios from 'axios';
    import BasicRelationTable from './../BasicRelationTable.svelte';

    export let is_logged_in;
    export let getToken;

    export let id;

    let teacher_subjects = [];
    let teacher_name = "";

    let table_headers = [
        {columnName: ' ', key: "isTeacher", toggler: true},
        {columnName: "Subject", key: "subject"}
    ];
    let add_fields = [
    	{field: "IDTeacher"},
    	{field: "IDSubject"}
    ];

    function getTeacherSubjects(){
    	axios.get(`/api/get/teacher_subjects?IDTeacher=${id}`, {headers: {Authorization: getToken()}}).then(function(res) {
    		teacher_subjects = res.data;
    		teacher_name = res.data[0].name;
    		console.log(res.data);
    	}).catch(err => {
    		console.log(err.response);
    	});
    }

    // axios.defaults.withCredentials = true;

    $: if(is_logged_in){
    	getTeacherSubjects();
    }
</script>

{#if is_logged_in}
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px">
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
            <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Teacher Subjects</span></h2>
            <h3 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">{teacher_name}</span></h3>
            <BasicRelationTable getToken={getToken} table="subjects_teachers" table_headers={table_headers} data={teacher_subjects} add_fields="{add_fields}" onToggle={getTeacherSubjects} />
        </div>
    </div>
{/if}