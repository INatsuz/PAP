<script>
    import {Link} from 'svelte-routing';

    export let mobilities;
    export let toggleRowSelect;
    export let selectedRows;

    function handleRowClick(event, id) {
        toggleRowSelect(id);
    }

</script>

<div class="table-responsive rounded dark-scroll">
    <table class="table table-dark table-bordered table-hover nowrap m-0">
        <thead>
            <tr class="table-headers">
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px">#</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px">Origin</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px">Destination</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px text-center">Departure</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px text-center">Arrival</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-dark-1px text-center">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each mobilities as mobility, i}
                <tr class="{selectedRows.indexOf(mobility.ID) === -1 ? 'table-row' : 'table-row bg-secondary'}"
                on:click="{event => {handleRowClick(event, mobility.ID)}}">
                    <td>{mobility.ID}</td>
                    <td>{mobility.origin}</td>
                    <td>{mobility.target}</td>
                    <td>{mobility.departureDate.slice(0, -14)}</td>
                    <td>{mobility.arrivalDate.slice(0, -14)}</td>
                    <td class="text-center vertical-align-middle">
                        <Link to={`/svelte/mobility_teachers/${mobility.ID}`}><i class="fas fa-chalkboard-teacher fa-fw cursor-pointer mr-1 text-light" title="Teachers"/></Link>
                        <Link to={`/svelte/mobility_students/${mobility.ID}`}><i class="fas fa-user-graduate fa-fw cursor-pointer ml-1 text-light" title="Students"/></Link>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
