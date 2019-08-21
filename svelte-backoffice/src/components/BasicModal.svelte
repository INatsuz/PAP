<script>
    import axios from 'axios';
    import {beforeUpdate} from 'svelte';

    export let getToken;

    export let table;
    export let table_title;
    export let fields;

    export let isOpen;
    export let setIsOpen;

    export let onAdd;
    export let onEdit;

    export let mode;

    beforeUpdate(() => {
    	fields = fields;

    	console.log("Hey before");
    });

    function add() {
        console.log(`Attempting to add ${table}`);

        let data = {ID: null};
        for(let i = 0; i < fields.fields.length; i++) {
            data[fields.fields[i].field] = fields.fields[i].value;
        }
        console.log(data);

        axios.post(`/api/insert/${table}`, data, {headers: {Authorization: getToken()}}).then(res => {
        	console.log(`Successfully added ${table_title}`);
        	onAdd();
        	close();
        }).catch(err => {
        	console.log(err.response);
        });
    }

    function edit() {
        console.log(`Attempting to add ${table}`);

        let data = {ID: fields.ID};
        for (let i = 0; i < fields.fields.length; i++) {
            data[fields.fields[i].field] = fields.fields[i].value;
        }
        console.log(data);

        axios.put(`/api/edit/${table}`, data, {headers: {Authorization: getToken()}}).then(res => {
        	console.log(`Successfully edited ${table_title}`);
        	onEdit();
        	close();
        }).catch(err => {
        	console.log(err.response);
        });
    }

    function handleSubmit(event) {
        if (mode === "add") {
        	add();
        } else if(mode === "edit") {
        	edit()
        }
    }

    function close(){
    	setIsOpen(false);
        window.$(`#${mode}-modal`).modal('hide');
    }

    function open(){
    	setIsOpen(true);
        window.$(`#${mode}-modal`).modal('show');
    }

    $: if (isOpen) {
        open();
        setIsOpen(false);
    }
</script>

<div class="modal fade" id={`${mode}-modal`} tabindex="-1">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">{mode === "add" ? "Add" : "Edit"} {table_title}</h5>
                <button class="close" type="button" data-dismiss="modal"><span>x</span></button>
            </div>
            <div class="modal-body">
                {#each fields.fields as field, i}
                    <div class="form-group">
                        <div class="input-group">
                            <div class="input-group-prepend w-25">
                                <div class="input-group-text w-100">{field.display}</div>
                            </div>
                            {#if field.type === "select"}
                                <select class="form-control" on:change="{event => {field.value = event.target.value}}">
                                    {#if field.value === ""}
                                        <option class="d-none" value="null" selected disabled>Choose an option</option>
                                    {/if}
                                    {#each field.options as option}
                                        {#if field.value === option.value}
                                            <option value={option.value} selected>{option.display}</option>
                                        {:else}
                                            <option value={option.value}>{option.display}</option>
                                        {/if}
                                    {/each}
                                </select>
                            {:else}
                                {#if field.type === "textarea"}
                                    <textarea class="form-control" placeholder={field.placeholder} on:change="{event => {field.value = event.target.value}}">{field.value}</textarea>
                                {:else}
                                    <input class="form-control" type={field.type} value={field.value} placeholder={field.placeholder} on:change="{event => {field.value = event.target.value}}" />
                                {/if}
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
            <div class="modal-footer">
                <button class="btn {mode === 'add' ? 'btn-success' : 'btn-info'} w-100" id={`modal-${mode}-btn`} on:click={handleSubmit}>{mode === "add" ? "Add" : "Edit"}</button>
            </div>
        </div>
    </div>
</div>