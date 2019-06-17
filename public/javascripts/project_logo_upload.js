$(document).ready(function () {
    //The field for storing the selected rows and their respective elements so it's easier to delete later and so I don't have to look up the element again later
    let selected_row = -1;
    let selected_row_element = null;

    //Checks if the table was clicked, and redirects it to the respective table row, this way it supports even rows dynamically added later with JQuery
    $(".table").on("click", ".table-row", function () {
        let id = parseInt($(this).children(".id-field").html());
        $("#file-input").attr("name", id);
        let project_name = $(this).children(".project-name").html();
        $("#modal_project_name").html(project_name);
        $(this).toggleClass("bg-secondary");
        if (selected_row === id) {
            selected_row = -1;
            selected_row_element = null;
        } else {
            if(selected_row_element !== null) {
                clearSelected();
            }
            selected_row = id;
            selected_row_element = $(this);
        }
        toggleButton(selected_row);
    });

    //Event handler meant to detect if the user clicks outside the table and deselecting all the rows currently highlighted
    $("body").click(function (event) {
        //Checks if the click was outside of the table and if it wasn't in any buttons, only then does it deselect the rows
        if (!$(event.target).is(".table-row") && !$(event.target).parents(".table-row").length > 0 && !$(event.target).is(".btn") && !$(event.target).parents(".modal").length > 0) {
            clearSelected();
            toggleButton(selected_row);
        }
    });

    $("#logo-upload-btn").click(function (event) {
        if ($(this).hasClass("disabled")) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

    //Enable or disables the Upload Logo button by checking if any rows are selected
    function toggleButton() {
        if (selected_row !== -1) {
            $("#logo-upload-btn").removeClass("disabled");
        } else {
            $("#logo-upload-btn").addClass("disabled");
        }
    }


    //Clears all the selected rows and turns their background to their regular color
    function clearSelected() {
        if(selected_row_element !== null) {
            selected_row_element.removeClass("bg-secondary");
        }
        selected_row = -1;
        selected_row_element = null;
    }
});