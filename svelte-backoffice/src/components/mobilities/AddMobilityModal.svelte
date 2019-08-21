<script>
    import axios from 'axios';

    export let getMobilities;
    export let partners;
    export let getToken;
    export let projectID;

    export let isOpen;
    export let setIsOpen;

    let projects = [];

    let origin = "";
    let originPartner = 0;
    let target = "";
    let targetPartner = 0;
    let departureDate = "";
    let arrivalDate = "";
    let project = 0;

    function addMobility() {
        console.log("Attempting to add mobility");
        let data = {
            ID: null,
            origin: origin,
            IDOriginPartner: originPartner,
            target: target,
            IDTargetPartner: targetPartner,
            departureDate: departureDate,
            arrivalDate: arrivalDate,
            IDProject: projectID != null ? projectID : project
        };
        console.log(data);

        axios.post("/api/insert/mobilities", data, {headers: {Authorization: getToken()}}).then(res => {
        	console.log("Successfully added mobility");
            getMobilities();
        }).catch(err => {
        	console.log(err.response);
        });
    }

    function getProjects() {
        console.log("Attempting to fetch projects");
        axios.get("/api/get/projects", {headers: {Authorization: getToken()}}).then(res => {
            projects = res.data;
            console.log("Successfully fetched projects");
        }).catch(err => {
            console.log("There was an error fetching the projects");
            console.log(err.response);
        });
    }

    function close(){
    	setIsOpen(false);
        window.$("#add-modal").modal('hide');
    }

    function open(){
        origin = "";
        originPartner = 0;
        target = "";
        targetPartner = 0;
        departureDate = "";
        arrivalDate = "";
        project = 0;

    	setIsOpen(true);
        window.$("#add-modal").modal('show');
    }

    $: if (isOpen) {
        if (projectID == null){
            getProjects();
        }

        open();
        setIsOpen(false);
    }

    console.log(projectID);
</script>

<div class="modal fade" id="add-modal" tabindex="-1">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add Mobility</h5>
                <button class="close" type="button" data-dismiss="modal"><span>x</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend w-25">
                            <div class="input-group-text w-100">Origin</div>
                        </div>
                        <input class="form-control" type="text" value="{origin}" placeholder="eg. Sweden, Stockholm" on:change="{event => origin = event.target.value}"/>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend w-25">
                            <div class="input-group-text w-100">Origin Partner</div>
                        </div>
                        <select class="form-control" on:change="{event => originPartner = event.target.value}">
                            {#if originPartner === 0}
                                <option value="0" disabled selected class="d-none">Select Partner</option>
                            {/if}
                            {#each partners as partner, i}
                                {#if originPartner === partner.ID}
                                    <option value={partner.ID} selected>{partner.name}</option>
                                {:else}
                                    <option value={partner.ID}>{partner.name}</option>
                                {/if}
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend w-25">
                            <div class="input-group-text w-100">Target</div>
                        </div>
                        <input class="form-control" type="text" value="{target}" placeholder="eg. Sweden, Stockholm" on:change="{event => target = event.target.value}"/>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend w-25">
                            <div class="input-group-text w-100">Target Partner</div>
                        </div>
                        <select class="form-control" on:change="{event => targetPartner = event.target.value}">
                            {#if originPartner === 0}
                                <option value="0" disabled selected class="d-none">Select Partner</option>
                            {/if}
                            {#each partners as partner, i}
                                {#if targetPartner === partner.ID}
                                    <option value={partner.ID} selected>{partner.name}</option>
                                {:else}
                                    <option value={partner.ID}>{partner.name}</option>
                                {/if}
                            {/each}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend w-25">
                            <div class="input-group-text w-100">Departure</div>
                        </div>
                        <input type="date" class="form-control" value="{departureDate}" on:change="{event => departureDate = event.target.value}"/>
                    </div>
                </div>
                <div class="{`form-group ${projectID != null ? 'mb-0' : ''}`}">
                    <div class="input-group">
                        <div class="input-group-prepend w-25">
                            <div class="input-group-text w-100">Arrival</div>
                        </div>
                        <input type="date" class="form-control" value="{arrivalDate}" on:change="{event => arrivalDate = event.target.value}"/>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success w-100" id="modal-add-btn" on:click={addMobility}>Add</button>
            </div>
        </div>
    </div>
</div>