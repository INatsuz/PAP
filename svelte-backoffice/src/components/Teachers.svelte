<script>
    import axios from 'axios';

    let teachers = [];

    (function getTeachers() {
        axios.get("/api/get/teachers").then(function(res) {
        	teachers = res.data;
            console.log(res.data);
        });
    })();
</script>

<div>
    <div class="p-5 position-absolute bottom-0px top-76px left-0px right-0px">
        <div class="container rounded p-4 bg-light shadow h-max-100 d-flex flex-flow-column">
        <h2 class="mb-3 text-dark"><span class="border-bottom-3px border-top-3px border-dark px-2">Teachers</span></h2>

        </div>
    </div>
</div>