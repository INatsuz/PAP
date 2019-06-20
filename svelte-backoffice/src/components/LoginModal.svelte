<div class="modal fade" id="login-modal" tabindex="-1" role="dialog">
	<form action="/backoffice/login" method="post">
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
							<input class="form-control" type="text" placeholder="Username" name="username"></div>
					</div>
					<div class="form-group mb-0">
						<div class="input-group">
							<div class="input-group-prepend">
								<div class="input-group-text">Password</div>
							</div>
							<input class="form-control" type="password" placeholder="Password" name="password"></div>
					</div>
				</div>
				<div class="modal-footer">
					<button class="btn btn-primary mr-auto w-25" type="submit">Login</button>
				</div>
			</div>
		</div>
	</form>
</div>