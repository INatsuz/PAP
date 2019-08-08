<script>
    import {Link} from 'svelte-routing';

    export let projects;
    export let toggleRowSelect;
    export let selectedRows;
    export let updateImage;

    function handleRowClick(event, id) {
        toggleRowSelect(id);
    }

    function handleImageChange(file, id) {
        updateImage(file, id).then(res => {
        	let image_el = document.querySelector(`#image-${id}`);
        	image_el.setAttribute("src", image_el.getAttribute("src") + "?time="+ new Date().getTime());
        });
    }

</script>

<div class="table-responsive rounded dark-scroll">
    <table class="table table-dark table-bordered table-hover nowrap m-0">
        <thead>
            <tr class="table-headers">
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px">#</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px">Project Code</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px">Name</th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px text-center"><i class="fas fa-images fa-fw"></i></th>
                <th scope="col" class="position-sticky border-bottom-0 border-top-0 top-0px bg-darkest shadow-y-dark-1px text-center">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each projects as project, i}
                <tr class="{selectedRows.indexOf(project.ID) === -1 ? 'table-row' : 'table-row bg-secondary'}"
                on:click="{event => {handleRowClick(event, project.ID)}}">
                    <td>{project.ID}</td>
                    <td>{project.projectCode}</td>
                    <td>{project.name}</td>
                    <td class="text-center">
                        <input type="file" class="d-none" name={project.ID} id={`image-input-${project.ID}`} on:change="{event => handleImageChange(event.target.files[0], project.ID)}">
                        <label for={`image-input-${project.ID}`}>
                            <img src={`/imgs/projects/${project.ID}.png`} id="{`image-${project.ID}`}" height="50" class="cursor-pointer" alt="Project Logo">
                        </label>
                    </td>
                    <td class="text-center vertical-align-middle">
                        <Link to={`/svelte/project_partners/${project.ID}`}><i class="fas fa-school fa-fw cursor-pointer mr-1 text-light"></i></Link>
                        <Link to={`/svelte/mobilities/${project.ID}`}><i class="fas fa-plane fa-fw cursor-pointer ml-1 text-light"></i></Link>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
