<script>
    import axios from 'axios';

    export let getToken;

    export let table;
    export let table_headers;
    export let data;
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
        	console.log(add_fields);
        	for(let i = 0; i < add_fields.length; i++) {
        		console.log(add_fields[i].field);
        	    data[add_fields[i].field] = row[add_fields[i].field];
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

</script>

<div class="table-responsive rounded dark-scroll">
    <table class="table table-dark table-bordered table-scrollable table-hover nowrap m-0">
        <thead>
            <tr class="table-headers">
                {#each table_headers as header, i}
                    <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px">{header.columnName}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each data as row, i}
                <tr>
                    {#each table_headers as header, i}
                        {#if header.toggler}
                            <td class="{row[header.key] === 'true' ? 'bg-success' : 'bg-danger'} cursor-pointer" on:click="{event => {handleToggleClick(row)}}">&nbsp;</td>
                        {:else}
                            <td class="{header.wrap ? 'wrap' : ''}">{row[header.key]}</td>
                        {/if}
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
