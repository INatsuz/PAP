$(document).ready(function () {
	let window = $("#general-info");
	let container = $("#general-info-container");

	$("#general-info-cross").click(function (event) {
		toggleInfoWindow();
	});

	$(".descriptions").click(function (event) {
		let projectID = $(event.target).parent().data("id-project");
		let projectName = $(event.target).parent().data("project");

		for (let i = 0; i < projects_json.length; i++) {
			if (projects_json[i].ID === projectID) {
				let layout =
					"<div class='row no-gutters'>" +
					`<p class='m-0 p-1 font-size-12px'>${projects_json[i].projectCode}</p>` +
					"<article class='p-1 wrap text-justify'>" +
					`${projects_json[i].description}` +
					"</article>" +
					"</div>";
				container.html(layout);
				break;
			}
		}

		changeHeader(projectID, projectName);
		toggleInfoWindow(true);
		// $("#sidebarCollapse").collapse("hide");
	});

	$(".partners").click(function (event) {
		let projectID = $(event.target).parent().data("id-project");
		let projectName = $(event.target).parent().data("project");

		let list = "";
		for (let i = 0; i < partners_projects_json.length; i++) {
			if (partners_projects_json[i].IDProject === projectID) {
				console.log("Boas");
				list += `<li class="font-size-18px">${partners_projects_json[i].partner}</li>`;
				console.log(list);
			}
			let layout =
				"<div class='row no-gutters'>" +
				"<div class='col'>" +
				"<article class='p-1 wrap'>" +
				"<h4>Partners</h4>" +
				"<ul>" +
				`${list}` +
				"</ul>" +
				"</article>" +
				"</div>" +
				"</div>";
			container.html(layout);
		}

		changeHeader(projectID, projectName);
		toggleInfoWindow(true);
		// $("#sidebarCollapse").collapse("hide");
	});

	$(".participants").click(function (event) {
		let projectID = $(event.target).parent().data("id-project");
		let projectName = $(event.target).parent().data("project");
		let people = [];

		let list = "";
		for (let i = 0; i < participants_json.length; i++) {
			if (participants_json[i].IDProject === projectID && people.indexOf(participants_json[i].name) === -1) {
				list += `<li class="font-size-18px">${participants_json[i].name}</li>`;
				people.push(participants_json[i].name);
			}
			let layout =
				"<div class='row no-gutters'>" +
				"<div class='col'>" +
				"<article class='p-1 wrap'>" +
				"<h4>Participants</h4>" +
				"<ul>" +
				`${list}` +
				"</ul>" +
				"</article>" +
				"</div>" +
				"</div>";
			container.html(layout);
		}

		changeHeader(projectID, projectName);
		toggleInfoWindow(true);
		// $("#sidebarCollapse").collapse("hide");
	});

	function changeHeader(projectID, project) {
		$("#general-info-logo").attr("src", `imgs/projects/${projectID}.png`);
		$("#general-info-title").text(`${project}`);
	}

	function toggleInfoWindow(value) {
		if (value !== undefined) {
			if (value) {
				if (window.hasClass("d-none")) {
					window.removeClass("d-none");
				}
			} else {
				if (!window.hasClass("d-none")) {
					window.addClass("d-none");
				}
			}
			return;
		}
		window.toggleClass("d-none");
	}
});