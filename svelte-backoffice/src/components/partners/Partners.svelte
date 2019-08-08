<script>
    import axios from 'axios';
    import BasicModal from '../BasicModal.svelte';
    import BasicTable from '../BasicTable.svelte';

    export let is_logged_in;
    export let getToken;

    let selectedRows = [];

    let partners = [];
    let countries = [];

    let table_headers = [
        {columnName: '#', key: "ID"},
        {columnName: 'Name', key: "name"},
        {columnName: "Country", key: "country"},
        {columnName: "Description", key: "description", wrap: true}
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

    function toggleRowSelect(id) {
    	let index = selectedRows.indexOf(id);
    	if (index === -1) {
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
        if(table != null){
            if(table.contains(event.target)){
                return;
            }
        }

        confirm_del = false;
        selectedRows = [];
    }

    function handleDeleteClick(event) {
    	let del_btn_el = event.currentTarget;
    	if(!del_btn_el.classList.contains("disabled")){
    	    if (!confirm_del) {
               confirm_del = true;
    	    } else if(selectedRows.length > 0) {
                axios.delete("/api/delete/partners", {
                    data: {
                        rows: selectedRows
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res => {
                    confirm_del = false;
                    getPartners();
                }).catch(err => {
                    console.log(err.response);
                });
            }
    	}
    }

    function getPartners() {
    	console.log("Attempting to fetch partners");
    	axios.get("/api/get/partners", {headers: {Authorization: getToken()}}).then(res => {
    		partners = res.data;
    		console.log("Successfully fetched partners");
    	}).catch(err => {
    		console.log("There was an error fetching the partners");
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
        setIsAddModalOpen(true);
    }

    function handleEditButtonClick(){
    	if(selectedRows.length === 1){
    	    if (countries.length === 0) {
                getCountries();
            }
            for (let i = 0; i < partners.length; i++) {
                if (partners[i].ID === selectedRows[0]) {
                	edit_modal_fields.ID = selectedRows[0];
    		        for (let j = 0; j < edit_modal_fields.fields.length; j++) {
    		            edit_modal_fields.fields[j].value = partners[i][edit_modal_fields.fields[j].field];
    			    }
    			}
    		}

    		setIsEditModalOpen(true);
    	}
    }

    $: if (is_logged_in) {
    	getPartners();
    }
</script>

{#if is_logged_in}
    <BasicModal mode="add" getToken={getToken} table="partners" fields={add_modal_fields} table_title="Partners" isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} onAdd="{getPartners}"/>
    <BasicModal mode="edit" getToken={getToken} table="partners" fields={edit_modal_fields} table_title="Partners" isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} onEdit="{getPartners}"/>
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px" on:click={handleOutsideTableClick}>
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
        <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Partners</span></h2>
            <span>
                <button class="btn btn-success mb-2" on:click={handleAddButtonClick}>Add +</button>
                <button class="{selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2'}" id="edit-btn" on:click={handleEditButtonClick}>Edit</button>
                <button class="{`btn btn-danger mb-2 ${selectedRows.length >= 1 ? '' : 'disabled'}`}" id="delete-btn" on:click={handleDeleteClick}>{confirm_del ? "Are you sure?" : "Delete"}</button>
            </span>
            <BasicTable table_headers={table_headers} data={partners} toggleRowSelect={toggleRowSelect} selectedRows={selectedRows} />
        </div>
    </div>
{/if}