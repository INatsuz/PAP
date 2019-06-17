$(document).ready(function () {
    //Declaring a Google Maps Api Geocoder
    let geocoder = undefined;

    //The field for storing the selected rows and their respective elements so it's easier to delete later and so I don't have to look up the element again later
    let selected_rows = {ids: [], rows: []};

    //Checks if the table was clicked, and redirects it to the respective table row, this way it supports even rows dynamically added later with JQuery
    $(".table").on("click", ".table-row", function () {
        let id = parseInt($(this).children(".id-field").html());
        $(this).toggleClass("bg-secondary");
        if (selected_rows.ids.indexOf(id) !== -1) { //Checks if the row is always selected and if so deselects it
            selected_rows.rows.splice(selected_rows.ids.indexOf(id), 1);
            selected_rows.ids.splice(selected_rows.ids.indexOf(id), 1);
        } else { //Adds both the id and the element to the selected rows object
            selected_rows.rows.push($(this));
            selected_rows.ids.push(id);
        }
        toggleButtons(selected_rows);
    });

    //Event handler meant to detect if the user clicks outside the table and deselecting all the rows currently highlighted
    $("body").click(function (event) {
        //Checks if the click was outside of the table and if it wasn't in any buttons, only then does it deselect the rows
        if (!$(event.target).is(".table-row") && !$(event.target).parents(".table-row").length > 0 && !$(event.target).is(".btn") && !$(event.target).parents(".modal").length > 0) {
            clearSelected(selected_rows);
            toggleButtons(selected_rows);
        }
    });


    //Button Events ↓
    //Delete button click event
    $("#delete-btn").click(function (event) {
        //Checks if the delete button is disabled
        if (!$(this).is(".disabled")) {
            if (!$(this).hasClass("confirm")) {
                $(this).toggleClass("confirm");
                $(this).text("Are you sure?");
            } else {
                let url = "../api/delete/" + $("#table").data("table");
                let data = {
                    rows: JSON.stringify(selected_rows.ids)
                };
                //Post request to delete one or multiple records by passing the IDs as a JSON string
                $.post(url, data, function (response, status, xhr) {
                    selected_rows.rows.forEach(function (element) {
                        element.remove();
                    });
                    clearSelected(selected_rows);
                    toggleButtons(selected_rows);
                });
            }
        }
    });

    //Edit button click event
    $("#edit-btn").click(function (event) {
        //Checks if the delete button is disabled, if so it cancels the event
        if ($(this).hasClass("disabled")) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        } else { //Checks is the edit button is enabled
            let fields = [];
            //Stores all the table fields and whether they are an age by checking the "data-field" and the "data-is-age" attributes in the table headers
            $(".table-headers th[data-field]").each(function (index) {
                if (index > 0) {
                    fields.push({field: $(this).data("field"), isAge: $(this).data("is-age")});
                }
                console.log(fields);
            });

            //Loops through the td tags in the selected table row and sets the modal edit window inputs to the values in the table cells
            $(selected_rows.rows[0].children("td:not(.id-field):lt(" + fields.length + ")")).each(function (index, cell) {
                if (fields[index].isAge) {
                    $("#edit-" + fields[index].field).val($(cell).data("date"));
                } else if ($("#edit-" + fields[index].field).is("select") && $("#edit-" + fields[index].field + " option:first-child").attr("value") !== undefined) {
                    let option = $("#edit-" + fields[index].field + " option:contains('" + $(cell).text() + "')");
                    $("#edit-" + fields[index].field).val(option.val());
                } else {
                    $("#edit-" + fields[index].field).val($(cell).text());
                }
            });

            //Shows the edit modal window
            $("#modal-edit").modal("show");
        }
    });

    //Handles the enter key by cancelling the event in the add modal window and redirecting it to the click handler
    $("#modal-add").keydown(function (e) {
        if (e.which === 13 && e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            $("#modal-add-btn").click();
            return false;
        }
    });

    //Handles the post request after the modal add button is clicked
    $("#modal-add-btn").click(function () {
        let url = "../api/insert/" + $("table").data("table");
        let fields = [];
        let data = {};

        function getLocation(location_fields, index) {
            let element_id = "#add-" + $(location_fields[index]).data("field");
            if (geocoder === undefined) {
                geocoder = new google.maps.Geocoder();
            }
            geocoder.geocode({address: $(element_id).val()}, function (results, status) {
                if (status === "OK") {
                    $(element_id + "Lat").val(results[0].geometry.location.lat());
                    $(element_id + "Lng").val(results[0].geometry.location.lng());
                }
                if (index < location_fields.length - 1) {
                    getLocation(location_fields, index + 1);
                } else {
                    handleAdd();
                }
            });
        }

        let location_fields = $(".table-headers th[data-is-location]");
        if (location_fields.length > 0) {
            getLocation(location_fields, 0);
        } else {
            handleAdd();
        }

        function handleAdd() {
            //Stores all the table fields and whether they are an age by checking the "data-field" and the "data-is-age" attributes in the table headers
            $(".table-headers th[data-field]").each(function (index) {
                if (index > 0) {
                    fields.push({
                        field: $(this).data("field"),
                        isAge: $(this).data("is-age"),
                        wrap: $(this).data("wrap"),
                        isHidden: $(this).data("is-hidden"),
                        isImage: $(this).data("is-image")
                    });
                    let element_id = "#add-" + $(this).data("field");
                    data[$(this).data("field")] = $(element_id).val();
                }
            });

            //Post request to add the record to the database
            $.post(url, data, function (response, status, xhr) {
                //This block of code creates the HTML for the table rows so it can be added in real time without having to refresh or get information from the database
                let table_row_markup = '<tr class="table-row"><th class="id-field" scope="row">' + response[0].ID + '</th>';
                for (let i = 0; i < fields.length; i++) {
                    if (!fields[i].isHidden) {
                        if (fields[i].isAge) { //This if checks if the field is an age and if so calculates the age according to the birth date given
                            let age = new Date(new Date() - Date.parse(data[fields[i].field])).getFullYear() - 1970;
                            table_row_markup += '<td class="align-middle" data-date=' + data[fields[i].field] + '>' + age + '</td>';
                        } else if ($("#add-" + fields[i].field).is("select") && $("#add-" + fields[i].field + " option:first-child").attr("value") !== undefined) { //This if checks if the input in the add modal window is a select type and if it has an option value defined
                            //Selects the option with the value equal to the ID chosen in the select input
                            let option = $("#add-" + fields[i].field + " option[value='" + $("#add-" + fields[i].field).val() + "']");
                            table_row_markup += '<td class="align-middle">' + option.html() + '</td>';
                        } else if (fields[i].wrap === true) { //This is where all the text and select inputs without the value attribute defined
                            table_row_markup += '<td class="wrap">' + data[fields[i].field] + '</td>';
                            console.log("Hey")
                        } else if (fields[i].isImage === true) { //This is where all the text and select inputs without the value attribute defined
                            table_row_markup += `<td class="align-middle"><img src="../imgs/projects/${response[0].ID}.png" alt="Image" height="50"></td>`;
                            console.log("Hey")
                        } else { //This is where all the text and select inputs without the value attribute defined
                            table_row_markup += '<td class="align-middle">' + data[fields[i].field] + '</td>';
                        }
                    }else{
                        table_row_markup += '<td class="d-none"></td>'
                    }
                }
                table_row_markup += "</tr>";
                $("#table").append(table_row_markup);

                //Hides the modal window and empties the input fields after the record has been successfully added to the database
                $("#modal-add").modal("hide");
                $("input").each(function (index) {
                    $(this).val("");
                });
            });
        }
    });

    //Handles the enter key by cancelling the event in the add modal window and redirecting it to the click handler
    $("#modal-edit").keydown(function (e) {
        if (e.which === 13 && e.shiftKey) {
            e.preventDefault();
            $("#modal-edit-btn").click();
        }
    });

    $("#modal-edit-btn").click(function (event) {
        let url = "../api/edit/" + $("table").data("table");
        let fields = [];
        let data = {};

        function getLocation(location_fields, index) {
            let element_id = "#edit-" + $(location_fields[index]).data("field");
            if (geocoder === undefined) {
                geocoder = new google.maps.Geocoder();
            }
            geocoder.geocode({address: $(element_id).val()}, function (results, status) {
                if (status === "OK") {
                    $(element_id + "Lat").val(results[0].geometry.location.lat());
                    $(element_id + "Lng").val(results[0].geometry.location.lng());
                }
                if (index < location_fields.length - 1) {
                    getLocation(location_fields, index + 1);
                } else {
                    handleEdit();
                }
            });
        }

        let location_fields = $(".table-headers th[data-is-location]");
        if (location_fields.length > 0) {
            getLocation(location_fields, 0);
        } else {
            handleEdit();
        }

        function handleEdit() {
            //Stores all the table fields and whether they are an age by checking the "data-field" and the "data-is-age" attributes in the table headers
            $(".table-headers th[data-field]").each(function (index) {
                if (index > 0) {
                    fields.push({field: $(this).data("field"), isAge: $(this).data("is-age")});
                    let element_id = "#edit-" + $(this).data("field");
                    data[$(this).data("field")] = $(element_id).val();
                }
            });
            //Setting the ID for the WHERE clause in the update query
            data.ID = selected_rows.ids[0];
            //Sending the post request
            console.log(data);
            $.post(url, data, function (response, status, xhr) {
                $("#modal-edit").modal("hide");
                $(selected_rows.rows[0].children("td:not(.id-field):lt(" + fields.length + ")")).each(function (index) {
                    if (fields[index].isAge) {
                        let date = $("#edit-" + fields[index].field).val();
                        $(this).html(new Date(new Date() - Date.parse(date)).getFullYear() - 1970);
                        $(this).data("date", date);
                    } else if ($("#edit-" + fields[index].field).is("select") && $("#edit-" + fields[index].field + " option:first-child").attr("value") !== undefined) {
                        let option = $("#edit-" + fields[index].field + " option[value='" + $("#edit-" + fields[index].field).val() + "']");
                        $(this).html(option.html());
                    } else {
                        $(this).html($("#edit-" + fields[index].field).val());
                    }
                });
                clearSelected(selected_rows);
                toggleButtons(selected_rows);
            });
        }
    });
});

//Updates the buttons (enables or disables them) based on the selected rows passed into the function
function toggleButtons(selectedRows) {
    let delete_btn = $("#delete-btn");
    let edit_btn = $("#edit-btn");
    if (delete_btn.hasClass("confirm")) {
        delete_btn.toggleClass("confirm");
        delete_btn.text("Delete");
    }
    if (selectedRows.ids.length > 0) { //Checks if there's any selected rows and if so it enables the delete button
        if (delete_btn.hasClass("disabled")) {
            delete_btn.toggleClass("disabled");
        }
        if (selectedRows.ids.length === 1) { //Checks if there's exactly one row selected in which case the edit button is enabled
            if (edit_btn.hasClass("disabled")) {
                edit_btn.toggleClass("disabled");
            }
        } else { //Checks if there's more than one row selected in which case it disables the edit button
            if (!edit_btn.hasClass("disabled")) {
                edit_btn.toggleClass("disabled");
            }
        }
    } else { //Checks if there no rows selected, if there aren't any then it disables both the edit and the delete buttons
        if (!delete_btn.hasClass("disabled")) {
            delete_btn.toggleClass("disabled");
            if (delete_btn.hasClass("confirm")) {
                delete_btn.toggleClass("confirm");
                delete_btn.text("Delete");
            }
        }
        if (!edit_btn.hasClass("disabled")) {
            edit_btn.toggleClass("disabled");
        }
    }
}

//Clears all the selected rows and turns their background to their regular color
function clearSelected(selectedRows) {
    //Sets the arrays' lengths back to 0 as a way to clean them. I don't set them equal to "[]" because then it wouldn't change the original array and just create a new reference inside the function
    selectedRows.ids.length = 0;
    selectedRows.rows.length = 0;

    //Loops through all the table rows and reverts their background back to the original color
    $(".table-row").each(function (index) {
        if ($(this).hasClass("bg-secondary")) {
            $(this).toggleClass("bg-secondary")
        }
    });
}