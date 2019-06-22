<script>
    export let table_headers;
    export let data;

    let keys = [];
    $: console.log(data);
    $: keys = data.length > 0 ? Object.keys(data[0]) : [];
</script>

<style>
    .table-bordered th{
        border-top: none;
    }
</style>

<div class="table-responsive rounded dark-scroll">
    <table class="table table-dark table-bordered table-hover nowrap m-0">
        <thead>
            <tr class="table-headers">
                {#each table_headers as header, i}
                <th scope="col" class="position-sticky top-0px bg-darkest shadow-top-solid-1px shadow-bottom-dark-1px shadow-top-dark-1px shadow-right-dark-1px shadow-left-dark-1px">{header}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each data as row, i}
                <tr class="table-row">
                    {#each keys as key, i}
                        <td>{row[key]}</td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
