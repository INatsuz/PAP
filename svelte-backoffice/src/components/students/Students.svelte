<script>
    import axios from 'axios';
    import BasicTable from './../BasicTable.svelte';
    import BasicModal from '../BasicModal.svelte';

    export let is_logged_in;
    export let getToken;

    let selectedRows = [];
    let selection_field = "ID";

    let students = [];
    let student_groups = [];
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

    let table_headers = [
    	{columnName: '#', key: "ID"},
    	{columnName: "Student #", key: "studentNumber"},
    	{columnName: 'Name', key: "name"},
    	{columnName: 'Age', key: "age"},
    	{columnName: 'Gender', key: "gender"},
    	{columnName: 'Email', key: "email"},
    ];

    let confirm_del = false;

    let isAddModalOpen = false;
    let isEditModalOpen = false;

    let add_modal_fields = {
    	fields: [{
    		field: "studentNumber",
    	    type: "text",
    	    display: "Student #",
    	    placeholder: "eg. a701617004",
    	    value: ""
        }, {
    	    field: "name",
    	    type: "text",
    	    display: "Name",
    	    placeholder: "eg. Vasco Raminhos",
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
            placeholder: "eg. student.email@gmail.com",
            value: ""
        }, {
            field: "IDClass",
            type: "select",
            display: "Class",
            placeholder: "Choose the student's class",
            value: "",
            options: student_groups
        }]
    };
    let edit_modal_fields = {
    	ID: null,
    	fields: [{
    		field: "studentNumber",
    	    type: "text",
    	    display: "Student #",
    	    placeholder: "eg. a701617004",
    	    value: ""
        }, {
    	    field: "name",
    	    type: "text",
    	    display: "Name",
    	    placeholder: "eg. Vasco Raminhos",
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
            placeholder: "eg. student.email@gmail.com",
            value: ""
        }, {
            field: "IDClass",
            type: "select",
            display: "Class",
            placeholder: "Choose the student's class",
            value: "",
            options: student_groups
        }]
    };

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

    function handleDeleteClick(event) {
    	let del_btn_el = event.currentTarget;
    	if(!del_btn_el.classList.contains("disabled")){
    	    if(!confirm_del){
               confirm_del = true;
    	    }else if(selectedRows.length > 0){
                axios.delete("/api/delete/students", {
                    data: {
                        rows: selectedRows
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res => {
                	confirm_del = false;
                    getStudents();
                }).catch(err =>{
                    console.log(err.response);
                });
            }
    	}
    }

    function getStudents() {
    	console.log("Trying to fetch students");
        axios.get("/api/get/students", {headers: {Authorization: getToken()}}).then(function(res) {
        	students = res.data;
            console.log(res.data);
            for(let i = 0; i < students.length; i++) {
                let age = new Date(new Date() - new Date(students[i].birthday)).getFullYear() - 1970;
                if(isNaN(age)){
                    age = 0;
                }
                students[i].age = age;
                console.log(age);
            }
        });
    }

    function getStudentGroups() {
    	console.log("Trying to fetch classes");
        axios.get("/api/get/studentgroups", {headers: {Authorization: getToken()}}).then(function(res) {
            for(let i = 0; i < res.data.length; i++) {
                student_groups.push({value: res.data[i].ID, display: res.data[i].grade + res.data[i].designation, original: res.data[i]});
            }
            add_modal_fields = add_modal_fields;
            edit_modal_fields = edit_modal_fields;
        }).catch(err => {
        	console.log(err.response);
        });
    }

    function setIsAddModalOpen(value){
    	isAddModalOpen = value;
    }

    function setIsEditModalOpen(value){
    	isEditModalOpen = value;
    }

    function handleAddButtonClick(){
    	if (student_groups.length === 0) {
    	    getStudentGroups();
    	}

        setIsAddModalOpen(true);
    }

    function handleEditButtonClick(){
    	if(selectedRows.length === 1){
    		if (student_groups.length === 0) {
                getStudentGroups();
            }
            for (let i = 0; i < students.length; i++) {
                if (students[i].ID === selectedRows[0]) {
                	edit_modal_fields.ID = selectedRows[0];
    		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
    		        	if (edit_modal_fields.fields[j].type === "date") {
                            edit_modal_fields.fields[j].value = students[i][edit_modal_fields.fields[j].field].slice(0, -14);
                            console.log(students[i][edit_modal_fields.fields[j].field]);
    		        	} else {
                            edit_modal_fields.fields[j].value = students[i][edit_modal_fields.fields[j].field];
                            console.log(edit_modal_fields.fields[j].value);
    		        	}
    			    }
    			}
    		}

    		setIsEditModalOpen(true);
    	}
    }

    $: if(is_logged_in){
    	getStudents();
    }
</script>

{#if is_logged_in}
    <BasicModal mode="add" getToken={getToken} table="students" fields={add_modal_fields} table_title="Students" isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} onAdd="{getStudents}"/>
    <BasicModal mode="edit" getToken={getToken} table="students" fields={edit_modal_fields} table_title="Students" isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} onEdit="{getStudents}"/>
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px" on:click={handleOutsideTableClick}>
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
            <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Students</span></h2>
            <span>
                <button class="btn btn-success mb-2" on:click={handleAddButtonClick}>Add +</button>
                <button class="{selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2'}" id="edit-btn" on:click={handleEditButtonClick}>Edit</button>
                <button class="{`btn btn-danger mb-2 ${selectedRows.length >= 1 ? '' : 'disabled'}`}" id="delete-btn" on:click={handleDeleteClick}>{confirm_del ? "Are you sure?" : "Delete"}</button>
            </span>
            <BasicTable table_headers={table_headers} data={students} toggleRowSelect={toggleRowSelect} selectedRows={selectedRows} selection_field={selection_field}/>
        </div>
    </div>
{/if}