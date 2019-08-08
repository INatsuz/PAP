<script>
    import axios from 'axios';
    import MobilitiesTable from "./MobilitiesTable.svelte";
    import AddMobilityModal from "./AddMobilityModal.svelte";
    import EditMobilityModal from "./EditMobilityModal.svelte";

    export let id;

    export let is_logged_in;
    export let getToken;

    let mobilities = [];
    let partners = [];
    let selectedRows = [];

    let confirm_del = false;
    let isAddModalOpen = false;
    let isEditModalOpen = false;

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
                axios.delete("/api/delete/mobilities", {
                    data: {
                        rows: selectedRows
                    },
                    headers: {
                        Authorization: getToken()
                    }
                }).then(res => {
                    confirm_del = false;
                    selectedRows = [];
                    getMobilities();
                }).catch(err => {
                    console.log(err.response);
                });
            }
    	}
    }

    function setIsAddModalOpen(value){
    	isAddModalOpen = value;
    }

    function setIsEditModalOpen(value){
    	isEditModalOpen = value;
    }

    function getMobilities() {
    	console.log("Attempting to fetch mobilities");
        axios.get(`/api/get/mobilities${id != null ? `?IDProject=${id}` : ""}`, {headers: {Authorization: getToken()}}).then(function(res) {
        	mobilities = res.data;
        	console.log("Mobilities fetched successfully");
        }).catch(err => {
        	console.log("There was an error fetching the mobilities");
        	console.log(err.response);
        });
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

    function handleAddButtonClick(){
    	if (partners.length === 0) {
            getPartners();
        }
        setIsAddModalOpen(true);
    }

    function handleEditButtonClick(){
    	if(selectedRows.length === 1){
            if (partners.length === 0) {
                getPartners();
            }
    		setIsEditModalOpen(true);
    	}
    }

    $: if (is_logged_in) {
    	console.log("Hello");
    	getMobilities();
    }
</script>

{#if is_logged_in}
    <AddMobilityModal getMobilities={getMobilities} partners={partners} getToken={getToken} projectID={id} isOpen={isAddModalOpen} setIsOpen={setIsAddModalOpen} />
    <EditMobilityModal getMobilities={getMobilities} mobilities={mobilities} partners={partners} getToken={getToken} selectedRows={selectedRows} isOpen={isEditModalOpen} setIsOpen={setIsEditModalOpen} />
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px" on:click={handleOutsideTableClick}>
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
        <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2 d-inline-block">Mobilities</span></h2>
            <span>
                <button class="btn btn-success mb-2" on:click={handleAddButtonClick}>Add +</button>
                <button class="{selectedRows.length !== 1 ? 'btn btn-info mb-2 mx-2 disabled' : 'btn btn-info mb-2 mx-2'}" id="edit-btn" on:click={handleEditButtonClick}>Edit</button>
                <button class="{`btn btn-danger mb-2 ${selectedRows.length >= 1 ? '' : 'disabled'}`}" id="delete-btn" on:click={handleDeleteClick}>{confirm_del ? "Are you sure?" : "Delete"}</button>
            </span>
            <MobilitiesTable mobilities={mobilities} toggleRowSelect={toggleRowSelect} selectedRows={selectedRows} />
        </div>
    </div>
{/if}