<script>
    import axios from 'axios';
    import BasicTable from './../BasicTable.svelte';
    import BasicModal from './../BasicModal.svelte';

    export let is_logged_in;
    export let getToken;

    export let id;

    let selectedRows = [];
    let selection_field = "IDTeacher";

    let mobility_teachers = [];
    let genders = [
        {
            display: "Male",
            value: "Male",
        },
        {
            display: "Female",
            value: "Female",
        }
    ];

    let mobility = "";

    let table_headers = [
        {columnName: ' ', key: "isParticipating", toggler: true},
        {columnName: "Name", key: "name"},
        {columnName: "Teacher #", key: "teacherNumber"},
        {columnName: 'Age', key: "age"},
        {columnName: 'Gender', key: "gender"},
        {columnName: 'Email', key: "email"}
    ];
    let toggle_fields = [
    	{field: "IDMobility"},
    	{field: "IDTeacher"}
    ];


    let confirm_del = false;

    let isAddModalOpen = false;
    let isEditModalOpen = false;

    let add_modal_fields = {
    	fields: [{
            field: "teacherNumber",
            type: "text",
            display: "Teacher #",
            placeholder: "eg. p701617004",
            value: ""
        }, {
            field: "name",
            type: "text",
            display: "Name",
            placeholder: "eg. Duarte Duarte",
            value: ""
        }, {
            field: "birthday",
            type: "date",
            display: "Birthday",
            placeholder: "",
            value: ""
        }, {
            field: "gender",
            type: "select",
            display: "Gender",
            placeholder: "Choose a gender",
            value: "",
            options: genders
        }, {
            field: "email",
            type: "email",
            display: "Email",
            placeholder: "eg. teacher.email@gmail.com",
            value: ""
        }]
    };
    let edit_modal_fields = {
    	ID: null,
    	fields: [{
            field: "teacherNumber",
            type: "text",
            display: "Teacher #",
            placeholder: "eg. p701617004",
            value: ""
        }, {
            field: "name",
            type: "text",
            display: "Name",
            placeholder: "eg. Duarte Duarte",
            value: ""
        }, {
            field: "birthday",
            type: "date",
            display: "Birthday",
            placeholder: "",
            value: ""
        }, {
            field: "gender",
            type: "select",
            display: "Gender",
            placeholder: "Choose a gender",
            value: "",
            options: genders
        }, {
            field: "email",
            type: "email",
            display: "Email",
            placeholder: "eg. teacher.email@gmail.com",
            value: ""
        }]
    };

    function getMobilityTeachers(){
    	axios.get(`/api/get/mobility_teachers?IDMobility=${id}`, {headers: {Authorization: getToken()}}).then(function(res) {
    		mobility_teachers = res.data;
    		mobility = res.data[0].mobility;
    		for(let i = 0; i < mobility_teachers.length; i++) {
                let age = new Date(new Date() - new Date(mobility_teachers[i].birthday)).getFullYear() - 1970;
                if(isNaN(age)){
                    age = 0;
                }
                mobility_teachers[i].age = age;
                console.log(age);
            }
    		console.log(res.data);
    	}).catch(err => {
    		console.log(err.response);
    	});
    }

    function toggleRowSelect(id) {
    	let index = selectedRows.indexOf(id);
    	if(index === -1){
            selectedRows = [...selectedRows, id];
    	}else {
            selectedRows.splice(index, 1);
            selectedRows = selectedRows;
    	}

    	console.log(selectedRows);
    }

    function handleOutsideTableClick(event) {
        if (event.target.tagName.toLowerCase() === "button"){
            return;
        }
        let table = event.currentTarget.querySelector("table");
        if(table != null ){
            if(table.contains(event.target)){
                console.log("Hello there General Kenobi");
                return;
            }
        }

        confirm_del = false;
        selectedRows = [];
    }

    function setIsAddModalOpen(value){
    	isAddModalOpen = value;
    }

    function setIsEditModalOpen(value){
    	isEditModalOpen = value;
    }

    function handleAddButtonClick(){
    	for(let i = 0; i < add_modal_fields.fields.length; i++) {
    	    add_modal_fields.fields[i].value = "";
    	}

        setIsAddModalOpen(true);
    }

    function handleEditButtonClick(){
    	if(selectedRows.length === 1){
            for (let i = 0; i < mobility_teachers.length; i++) {
                if (mobility_teachers[i][selection_field] === selectedRows[0]) {
                	edit_modal_fields.ID = selectedRows[0];
    		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
    		        	if (edit_modal_fields.fields[j].type === "date") {
                            edit_modal_fields.fields[j].value = mobility_teachers[i][edit_modal_fields.fields[j].field].slice(0, -14);
                            console.log(mobility_teachers[i][edit_modal_fields.fields[j].field]);
    		        	} else {
                            edit_modal_fields.fields[j].value = mobility_teachers[i][edit_modal_fields.fields[j].field];
                            console.log(edit_modal_fields.fields[j].value);
    		        	}
    			    }
    			}
    		}

    		setIsEditModalOpen(true);
    	}
    }

    function handleDeleteClick(event) {
    	let del_btn_el = event.currentTarget;
    	if(!del_btn_el.classList.contains("disabled")){
    	    if(!confirm_del){
               confirm_del = true;
    	    }else if(selectedRows.length > 0){
                axios.delete("/api/delete/teachers", {
                    data: {
                        rows: selectedRows
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res => {
                	confirm_del = false;
                	selectedRows = [];
                    getMobilityTeachers();
                }).catch(err =>{
                    console.log(err.response);
                });
            }
    	}
    }

    // axios.defaults.withCredentials = true;

    $: if(is_logged_in){
    	getMobilityTeachers();
    }
</script>

{#if is_logged_in}
    <BasicModal mode="add" getToken={getToken} table="teachers" fields={add_modal_fields} table_title="Teachers" isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} onAdd="{getMobilityTeachers}"/>
    <BasicModal mode="edit" getToken={getToken} table="teachers" fields={edit_modal_fields} table_title="Teachers" isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} onEdit="{getMobilityTeachers}"/>
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px" on:click={handleOutsideTableClick}>
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
            <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Mobility Teachers</span></h2>
            <h3 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">{mobility}</span></h3>
            <span>
                <button class="btn btn-success mb-2" on:click={handleAddButtonClick}>Add +</button>
                <button class="{selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2'}" id="edit-btn" on:click={handleEditButtonClick}>Edit</button>
                <button class="{`btn btn-danger mb-2 ${selectedRows.length >= 1 ? '' : 'disabled'}`}" id="delete-btn" on:click={handleDeleteClick}>{confirm_del ? "Are you sure?" : "Delete"}</button>
            </span>
            <BasicTable getToken={getToken} table="mobilities_teachers" table_headers={table_headers} data={mobility_teachers} toggle_fields="{toggle_fields}" onToggle="{getMobilityTeachers}" selectedRows={selectedRows} toggleRowSelect="{toggleRowSelect}" selection_field={selection_field} />
        </div>
    </div>
{/if}