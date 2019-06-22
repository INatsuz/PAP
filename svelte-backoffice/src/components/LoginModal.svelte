<script>
    export let login;

    let username = "";
    let password= "";

    function handleLoginClick(event) {
        login(username, password);

        window.$("#login-modal").modal("hide");
    }
</script>

<div class="modal fade" id="login-modal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Login</h5>
                <button class="close" type="button" data-dismiss="modal"><span>x</span></button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">Username</div>
                        </div>
                        <input class="form-control" type="text" placeholder="Username" name="username" on:change="{event => username = event.target.value}"></div>
                </div>
                <div class="form-group mb-0">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">Password</div>
                        </div>
                        <input class="form-control" type="password" placeholder="Password" name="password" on:change="{event => password = event.target.value}"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary mr-auto w-25" on:click={handleLoginClick} >Login</button>
            </div>
        </div>
    </div>
</div>