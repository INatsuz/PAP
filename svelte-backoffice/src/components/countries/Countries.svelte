<script>
    import axios from 'axios';
    import BasicTable from './../BasicTable.svelte';
    import BasicModal from '../BasicModal.svelte';

    export let is_logged_in;
    export let getToken;

    let countries = [];
    let table_headers = [
        {columnName: '#', key: "ID"},
        {columnName: "Country", key: "country"}
    ];
    let selectedRows = [];

    let confirm_del = false;

    let isAddModalOpen = false;
    let isEditModalOpen = false;

    let add_modal_fields = {
        fields: [{
    		field: "country",
    		type: "text",
    		display: "Country",
    		placeholder: "eg. Portugal",
    		value: ""
        }]
    };

    let edit_modal_fields = {
    	ID: null,
        fields: [{
    		field: "country",
    		type: "text",
    		display: "Country",
    		placeholder: "eg. Portugal",
    		value: ""
        }]
    };

    // axios.defaults.withCredentials = true;

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
                axios.delete("/api/delete/countries", {
                    data: {
                        rows: selectedRows
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res =>{
                	confirm_del = false;
                    getCountries();
                }).catch(err =>{
                    console.log(err.response);
                });
            }
    	}
    }

    function getCountries() {
    	console.log("Trying to fetch countries");
        axios.get("/api/get/countries", {headers: {Authorization: getToken()}}).then(function(res) {
        	countries = res.data;
            console.log(res.data);
        });
    }

    function setIsAddModalOpen(value){
    	isAddModalOpen = value;
    }

    function setIsEditModalOpen(value){
    	isEditModalOpen = value;
    }

    function handleAddButtonClick(){
        setIsAddModalOpen(true);
    }

    function handleEditButtonClick(){
    	if(selectedRows.length === 1){
    		for (let i = 0; i < countries.length; i++) {
                if (countries[i].ID === selectedRows[0]) {
                    edit_modal_fields.ID = selectedRows[0];
                    for (let j = 0; j < edit_modal_fields.fields.length; j++) {
                        edit_modal_fields.fields[j].value = countries[i][edit_modal_fields.fields[j].field];
                    }
                }
            }

    		setIsEditModalOpen(true);
    	}
    }

    $: if(is_logged_in){
    	getCountries();
    }
</script>

{#if is_logged_in}
    <BasicModal mode="add" getToken={getToken} table="countries" table_title="Countries" fields="{add_modal_fields}" isOpen="{isAddModalOpen}" setIsOpen="{setIsAddModalOpen}" onAdd="{getCountries}"/>
    <BasicModal mode="edit" getToken={getToken} table="countries" table_title="Countries" fields="{edit_modal_fields}" isOpen="{isEditModalOpen}" setIsOpen="{setIsEditModalOpen}" onEdit="{getCountries}"/>
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px" on:click={handleOutsideTableClick}>
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
        <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Countries</span></h2>
            <span>
                <button class="btn btn-success mb-2" on:click={handleAddButtonClick}>Add +</button>
                <button class="{selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2'}" id="edit-btn" on:click={handleEditButtonClick}>Edit</button>
                <button class="{`btn btn-danger mb-2 ${selectedRows.length >= 1 ? '' : 'disabled'}`}" id="delete-btn" on:click={handleDeleteClick}>{confirm_del ? "Are you sure?" : "Delete"}</button>
            </span>
            <BasicTable table_headers={table_headers} data={countries} toggleRowSelect={toggleRowSelect} selectedRows={selectedRows} />
        </div>
    </div>
{/if}