<script>
    import axios from 'axios';
    import BasicTable from './../BasicTable.svelte';
    import BasicModal from './../BasicModal.svelte';

    export let is_logged_in;
    export let getToken;

    export let id;

    let selectedRows = [];
    let selection_field = "IDPartner";

    let project_partners = [];
    let countries = [];
    let project_name = "";

    let table_headers = [
        {columnName: ' ', key: "isPartner", toggler: true},
        {columnName: 'Name', key: "name"},
        {columnName: "Country", key: "country"},
    ];
    let toggle_fields = [
    	{field: "IDPartner"},
    	{field: "IDProject"}
    ];


    let confirm_del = false;

    let isAddModalOpen = false;
    let isEditModalOpen = false;

    let add_modal_fields = {
    	fields: [{
        	field: "name",
        	type: "text",
        	display: "Name",
        	placeholder: "eg. Escola Secundária de Loulé",
        	value: ""
        }, {
        	field: "IDCountry",
        	type: "select",
        	display: "Country",
        	placeholder: "Choose a country",
        	value: "",
        	options: countries
        }, {
        	field: "description",
        	type: "textarea",
        	display: "Description",
        	placeholder: "eg. This is a school based in...",
        	value: ""
        }]
    };
    let edit_modal_fields = {
    	ID: null,
    	fields: [{
        	field: "name",
        	type: "text",
        	display: "Name",
        	placeholder: "eg. Escola Secundária de Loulé",
        	value: ""
        }, {
        	field: "IDCountry",
        	type: "select",
        	display: "Country",
        	placeholder: "Choose a country",
        	value: "",
        	options: countries
        }, {
        	field: "description",
        	type: "textarea",
        	display: "Description",
        	placeholder: "eg. This is a school based in...",
        	value: ""
        }]
    };

    function getProjectPartners(){
    	axios.get(`/api/get/project_partners?IDProject=${id}`, {headers: {Authorization: getToken()}}).then(function(res) {
    		project_partners = res.data;
    		project_name = res.data[0].projectName;
    		console.log(res.data);
    	}).catch(err => {
    		console.log(err.response);
    	});
    }

    function getCountries() {
    	console.log("Attempting to fetch countries");
    	axios.get("/api/get/countries", {headers: {Authorization: getToken()}}).then(res => {
    		for(let i = 0; i < res.data.length; i++) {
    		    countries.push({value: res.data[i].ID, display: res.data[i].country, original: res.data[i]});
    		}
    		add_modal_fields = add_modal_fields;
    		edit_modal_fields = edit_modal_fields;
    		console.log("Successfully fetched countries");
    	}).catch(err => {
    		console.log("There was an error fetching the countries");
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
    	if (countries.length === 0) {
            getCountries();
        }
    	for(let i = 0; i < add_modal_fields.fields.length; i++) {
    	    add_modal_fields.fields[i].value = "";
    	}

        setIsAddModalOpen(true);
    }

    function handleEditButtonClick(){
    	if(selectedRows.length === 1){
    		if (countries.length === 0) {
    			getCountries();
    		}

            for (let i = 0; i < project_partners.length; i++) {
                if (project_partners[i][selection_field] === selectedRows[0]) {
                	edit_modal_fields.ID = selectedRows[0];
    		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
    		        	if (edit_modal_fields.fields[j].type === "date") {
                            edit_modal_fields.fields[j].value = project_partners[i][edit_modal_fields.fields[j].field].slice(0, -14);
                            console.log(project_partners[i][edit_modal_fields.fields[j].field]);
    		        	} else {
                            edit_modal_fields.fields[j].value = project_partners[i][edit_modal_fields.fields[j].field];
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
                axios.delete("/api/delete/partners", {
                    data: {
                        rows: selectedRows
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res => {
                	confirm_del = false;
                	selectedRows = [];
                    getProjectPartners();
                }).catch(err =>{
                    console.log(err.response);
                });
            }
    	}
    }

    // axios.defaults.withCredentials = true;

    $: if(is_logged_in){
    	getProjectPartners();
    }
</script>

{#if is_logged_in}
    <BasicModal mode="add" getToken={getToken} table="partners" fields={add_modal_fields} table_title="Partners" isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} onAdd="{getProjectPartners}"/>
    <BasicModal mode="edit" getToken={getToken} table="partners" fields={edit_modal_fields} table_title="Partners" isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} onEdit="{getProjectPartners}"/>
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px" on:click="{handleOutsideTableClick}">
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
            <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Project Partners</span></h2>
            <h3 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">{project_name}</span></h3>
            <span>
                <button class="btn btn-success mb-2" on:click={handleAddButtonClick}>Add +</button>
                <button class="{selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2'}" id="edit-btn" on:click={handleEditButtonClick}>Edit</button>
                <button class="{`btn btn-danger mb-2 ${selectedRows.length >= 1 ? '' : 'disabled'}`}" id="delete-btn" on:click={handleDeleteClick}>{confirm_del ? "Are you sure?" : "Delete"}</button>
            </span>
            <BasicTable getToken={getToken} table="partners_projects" table_headers={table_headers} data={project_partners} toggle_fields="{toggle_fields}" onToggle={getProjectPartners} selectedRows={selectedRows} toggleRowSelect="{toggleRowSelect}" selection_field={selection_field} />
        </div>
    </div>
{/if}