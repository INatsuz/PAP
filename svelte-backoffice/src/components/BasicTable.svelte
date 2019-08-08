<script>
    import axios from 'axios';
    import {Link} from 'svelte-routing';

    export let getToken;

    export let table;

    export let table_headers;
    export let data;
    export let toggleRowSelect;
    export let selectedRows;
    export let selection_field;

    export let toggle_fields;
    export let onToggle;

    function handleToggleClick(row){
        if (row.ID !== null){
        	console.log("Hey");
            axios.delete(`/api/delete/${table}`, {
                data: {
                    rows: [row.ID]
                },
                headers: {
                    Authorization: getToken()
                }
            }).then(res => {
                onToggle();
            }).catch(err =>{
                console.log(err.response);
            });
        } else {
        	console.log("Bye");
        	let data = {ID: null};
        	console.log(toggle_fields);
        	for(let i = 0; i < toggle_fields.length; i++) {
        		console.log(toggle_fields[i].field);
        	    data[toggle_fields[i].field] = row[toggle_fields[i].field];
        	}
        	console.log(data);

            axios.post(`/api/insert/${table}`, data, {headers: {Authorization: getToken()}}).then(res => {
                console.log(`Successfully added relation`);
                onToggle();
            }).catch(err => {
                console.log(err.response);
            });
        }
        console.log(row);
    }

    function handleRowClick(event, id) {
    	if (!event.target.classList.contains("toggler")) {
            toggleRowSelect(id);
    	}
    	// event.currentTarget.classList.toggle("bg-secondary");
    }
</script>

<style>
    .toggler{
        min-width: 50px;
    }
</style>

<div class="table-responsive rounded dark-scroll">
    <table class="table table-dark table-bordered table-scrollable table-hover nowrap m-0">
        <thead>
            <tr class="table-headers">
                {#each table_headers as header, i}
                    <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px {header.actions ? ' text-center' : ''}">{header.columnName}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each data as row, i}
                <tr class="{selectedRows.indexOf(row[selection_field]) === -1 ? 'table-row' : 'table-row bg-secondary'}"
                on:click="{event => {handleRowClick(event, row[selection_field])}}">
                    {#each table_headers as header, i}
                        {#if header.actions}
                            <td class="text-center vertical-align-middle">
                            {#each header.actions as action}
                                <Link to={`${action.link}${row[action.query_field]}`}><i class="{`fas ${action.icon} fa-fw cursor-pointer mr-1 text-light`}"></i></Link>
                            {/each}
                            </td>
                        {:else}
                            {#if header.toggler}
                                <td class="{row[header.key] === 'true' ? 'bg-success' : 'bg-danger'} cursor-pointer toggler" on:click="{event => {handleToggleClick(row)}}">&nbsp;</td>
                            {:else}
                                <td class="{header.wrap ? 'wrap' : ''}">{row[header.key]}</td>
                            {/if}
                        {/if}
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
