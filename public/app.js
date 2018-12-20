function deleteTeam(id) {
    $.ajax({
        url: '/team/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}

function updateTeam(id){
    $.ajax({
        url: '/team/' + id,
        type: 'PUT',
        data: $('#update-team').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    });
}

function updatePlayer(id){
    $.ajax({
        url: '/players/' + id,
        type: 'PUT',
        data: $('#update-player').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    });
}

function deletePerson(id) {
    $.ajax({
        url: '/players/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}

//delete from player_position relationship
function deletePosition(id1, id2) {
    $.ajax({
        url: '/positions/' + id1 + '/' + id2 + '/',
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}

//delete a relationship from conf_div
function deleteDivision(id1, id2) {
    $.ajax({
        url: '/conference/' + id1 + '/' + id2 + '/',
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}

//delete a division from divisions table
function deleteDiv(id){
    $.ajax({
        url: '/divisions/' + id,
        type : 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}

//delete a division from divisions table
function deleteConf(id){
    $.ajax({
        url: '/create_conf/' + id,
        type : 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}

//delete a position from positions table
function deletePos(id){
    $.ajax({
        url: '/create_pos/' + id,
        type : 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    });
}