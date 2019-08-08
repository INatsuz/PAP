<script>
    import axios from 'axios';
    
    export let getMobilities;
    export let getToken;
    export let mobilities;
    export let partners;
    export let selectedRows;

    export let isOpen;
    export let setIsOpen;

    let id = 0;
    let origin = "";
    let originPartner = 0;
    let target = "";
    let targetPartner = 0;
    let departureDate = "";
    let arrivalDate = "";
    
    function editMobility() {
    	let data = {
    		ID: id,
    		origin: origin,
    		IDOriginPartner: originPartner,
    		target: target,
    		IDTargetPartner: targetPartner,
    		departureDate: departureDate,
    		arrivalDate: arrivalDate
    	};
    	console.log(data);


    	console.log("Trying to edit mobilities");
        axios.put("/api/edit/mobilities", data, {headers: {Authorization: getToken()}}).then(res => {
        	console.log("Successfully edited mobility");

        	getMobilities();
        	close();
        }).catch(err => {
        	console.log("There was an error editing the project");
        });
    }

    function close(){
    	setIsOpen(false);
        window.$("#edit-modal").modal('hide');
    }

    function open(){
    	setIsOpen(true);
        window.$("#edit-modal").modal('show');
    }

    $: if (isOpen) {
    	open();

    	console.log(mobilities);
    	console.log(selectedRows);

    	for(let i = 0; i < mobilities.length; i++) {
    	    if(mobilities[i].ID === selectedRows[0]){
                id = selectedRows[0];
                origin = mobilities[i].origin;
                originPartner = mobilities[i].IDOriginPartner;
                target = mobilities[i].target;
                targetPartner = mobilities[i].IDTargetPartner;
                departureDate = mobilities[i].departureDate;
                arrivalDate = mobilities[i].arrivalDate;
                console.log("Hey");
                console.log(departureDate);
                console.log(arrivalDate);
    	    }
    	}

    	setIsOpen(false);
    }
</script>

<div class="modal fade" id="edit-modal" tabindex="-1">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Edit Project</h5>
                <button class="close" type="button" data-dismiss="modal"><span>x</span></button>
            </div>
            <div class="modal-body">
                <div class="modal-body">
                    <div class="form-group">
                        <div class="input-group">
                            <div class="input-group-prepend w-25">
                                <div class="input-group-text w-100">Origin</div>
                            </div>
                            <input class="form-control" type="text" value={origin} placeholder="eg. Sweden, Stockholm" on:change="{event => origin = event.target.value}"/>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <div class="input-group-prepend w-25">
                                <div class="input-group-text w-100">Origin Partner</div>
                            </div>
                            <select class="form-control" on:change="{event => originPartner = event.target.value}">
                                {#each partners as partner, i}
                                    {#if partner.ID === originPartner}
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
                            <input class="form-control" type="text" value={target} placeholder="eg. Sweden, Stockholm" on:change="{event => target = event.target.value}"/>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-group">
                            <div class="input-group-prepend w-25">
                                <div class="input-group-text w-100">Target Partner</div>
                            </div>
                            <select class="form-control" on:change="{event => targetPartner = event.target.value}">
                                {#each partners as partner, i}
                                    {#if partner.ID === targetPartner}
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
                            <input type="date" value="{departureDate.slice(0, -14)}" class="form-control" on:change="{event => departureDate = event.target.value}"/>
                        </div>
                    </div>
                    <div class="form-group mb-0">
                        <div class="input-group">
                            <div class="input-group-prepend w-25">
                                <div class="input-group-text w-100">Arrival</div>
                            </div>
                            <input type="date" value="{arrivalDate.slice(0, -14)}" class="form-control" on:change="{event => arrivalDate = event.target.value}"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-info w-100" on:click={editMobility}>Edit</button>
            </div>
        </div>
    </div>
</div>