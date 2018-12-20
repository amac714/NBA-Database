

var express = require('express');
var bodyParser = require('body-parser');
// var mysql = require('./dbcon.js');
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_macabuha',
    password        : '****',
    database        : 'cs340_macabuha'
});

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8578);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.set('mysql', mysql);

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/error', function(req, res) {
    res.render('error');
});

//functions to display contents of tables
function selectTable1(res, sql, ctx, complete){
    pool.query(sql, function(err, result, fields) {
       if(err){
           console.log(err);
           res.end();
       }

       ctx.results = result;
       complete();
    });
}

function selectTable2(res, sql, ctx, complete){
    pool.query(sql, function(err, result, fields) {
        if(err){
            console.log(err);
            res.end();
        }

        ctx.selection = result;
        complete();
    });
}

function selectTable3(res, sql, ctx, complete){
    pool.query(sql, function(err, result, fields) {
        if(err){
            console.log(err);
            res.end();
        }

        ctx.display = result;
        complete();
    });
}

//delete from a table
function deleteQuery(res, sql, inserts) {
    pool.query(sql, inserts, function(err, rows, fields){
        if(err) {
            console.log(err);
            return;
        }
        console.log('Deleted ' + inserts);
        res.status(202).end();
    });
}

//function to add to a table
function addQuery(res, sql, page, inserts) {
    pool.query(sql, inserts, function(err, rows, fields){
        if(err){
            console.log(err.code);
            res.render('error');
        } else {
            res.redirect(page);
        }

    });
}

//update query function
function updateQuery(res, sql, inserts){
    pool.query(sql, inserts, function(err, rows, fields){
        if(err){
            console.log(err);
            return;
        }
        res.status(200);
        res.end();
    });
}

/*
****************************************
    players table Get, Post, Delete routes
****************************************
*/

//display players
app.get('/players', function(req, res){
    var ctx = {};
    var count = 0;
    var sql = 'SELECT players.id, players.player_fname, players.player_lname, players.age, players.height, teams.team_name FROM players ' +
        'LEFT JOIN teams ON players.team_id = teams.id ORDER BY teams.id, players.player_fname';
    var sql2 = 'SELECT id, team_name FROM teams ORDER BY team_name';

    selectTable1(res, sql, ctx, complete);
    selectTable2(res, sql2, ctx, complete);

    function complete(){
        count++;
        if(count > 1){
            res.render('players', ctx);
        }
    }
});

//add a player
app.post('/players', function(req, res){
    var sql = "INSERT INTO players (player_fname, player_lname, age, height, team_id) VALUES (?,?,?,?,?)";
    if(req.body.team_name === "NULL"){
        req.body.team_name = null;
    }
    var inserts = [req.body.player_fname, req.body.player_lname, req.body.age, req.body.height, req.body.team_name];
    addQuery(res, sql, '/players', inserts);
});

//delete a player
app.delete('/players/:id', function(req, res){
    var sql = 'DELETE FROM players WHERE id=?';
    var inserts = [req.params.id];
    deleteQuery(res, sql, inserts);
});

//display 1 player to update
app.get('/players/:id', function(req, res){
    var ctx = {};
    var count = 0;
    var sql = 'SELECT id, player_fname, player_lname, age, height, team_id FROM players WHERE id=?';
    var sql2 = 'SELECT id, team_name FROM teams ORDER BY team_name';
    var inserts = [req.params.id];

    pool.query(sql, inserts, function(err, rows, fields){
        if(err) {
            console.log(err);
            return;
        }

        selectTable2(res, sql2, ctx, complete);

        ctx.players = rows[0];
        function complete() {
            count++;
            if(count >= 1){
                res.render('players_update', ctx);
            }
        }
    });
});

//update player
app.put('/players/:id', function(req, res) {
    var sql = 'UPDATE players SET player_fname=?, player_lname=?, age=?, height=?, team_id=? WHERE id=?';
    if(req.body.team === "NULL"){
        req.body.team = null;
    }
    var inserts = [req.body.player_fname, req.body.player_lname, req.body.age, req.body.height, req.body.team, req.params.id];
    updateQuery(res, sql, inserts);
});

//render player search page
app.get('/search', function(req, res){
   res.render('search');
});

//search for a player
app.post('/search', function(req, res){
    var sql = 'SELECT players.player_fname, players.player_lname, players.height, players.age, teams.team_name FROM players ' +
       'LEFT JOIN teams ON players.team_id = teams.id WHERE players.player_fname=? AND players.player_lname=?';

    var inserts = [req.body.player_fname, req.body.player_lname];
    var ctx = {};
    pool.query(sql, inserts, function(err, result, fields) {
        if(err){
            console.log(err);
            res.end();
        }

        //if player found, display player info
        if(result[0] !== undefined){
            ctx.results = result[0];
            // console.log(ctx);
            res.render('search', ctx);
        }else {
            res.send('Player Not Found! Go back previous page.');
        }

    });
});
/*
END players routes
 */


/*
**********************************************
    teams table Get, Post, Update, Delete routes
**********************************************
*/

//display teams
app.get('/team', function(req, res){
    var count = 0;
    var ctx = {};
    var sql = 'SELECT teams.id, teams.team_name, divisions.division_name FROM teams LEFT JOIN ' +
          'divisions ON teams.div_id = divisions.id ORDER BY divisions.division_name, teams.team_name';
    var sql2 = 'SELECT id, division_name FROM divisions';

    selectTable1(res, sql, ctx, complete);
    selectTable2(res, sql2, ctx, complete);

    function complete() {
        count++;
        if(count > 1) {
            res.render('team', ctx);
        }
    }
});

//add a team
app.post('/team', function(req, res){
    var sql = "INSERT INTO teams (team_name, div_id) VALUES (?,?)";
    var inserts = [req.body.team_name, req.body.division];
    addQuery(res, sql, '/team', inserts);
});

//display 1 team name that is to be updated
app.get('/team/:id', function(req, res){
   var ctx = {};
   var count = 0;
   var sql = 'SELECT id, team_name, div_id FROM teams WHERE id=?';
   var sql2 = 'SELECT id, division_name FROM divisions';
   var inserts = [req.params.id];

   pool.query(sql, inserts, function(err, rows, fields){
      if(err) {
          console.log(err);
          return;
      }

      selectTable2(res, sql2, ctx, complete);

      ctx.teams = rows[0];
      function complete() {
          count++;
          if(count >= 1){
              res.render('teams_update', ctx);
          }
      }
   });
});

//update a team
app.put('/team/:id', function(req, res) {
    var sql = 'UPDATE teams SET team_name=?, div_id=? WHERE id=?';
    var inserts = [req.body.team_name, req.body.division, req.params.id];
    updateQuery(res, sql, inserts);
});

//delete a team
app.delete('/team/:id', function(req, res){
   var sql = 'DELETE FROM teams WHERE id=?';
   var inserts = [req.params.id];
   deleteQuery(res, sql, inserts);
});
/*
END teams route
 */



/*
**********************************************
    player_position table Get, Post, Delete routes
**********************************************
*/

//display positions and players
app.get('/positions', function(req, res){
    var ctx = {};
    var count = 0;
    var sql = 'SELECT positions.id, positions.position_name FROM positions ORDER BY positions.id';
    var sql1 = 'SELECT player_position.player_id, player_position.position_id, positions.position_name, players.player_fname, players.player_lname FROM player_position ' +
        'INNER JOIN positions ON player_position.position_id = positions.id ' +
        'INNER JOIN players ON player_position.player_id = players.id ORDER BY positions.id, players.player_fname';
    var sql2 = 'SELECT players.id, players.player_fname, players.player_lname FROM players ORDER BY players.player_fname';


    selectTable1(res, sql1, ctx, complete);
    selectTable2(res, sql2, ctx, complete);
    selectTable3(res, sql, ctx, complete);

    function complete(){
        count++;
        if(count >= 3){
            res.render('positions', ctx);
        }
    }

});

//add a player_position relationship
app.post('/positions', function(req, res) {
    var sql = 'INSERT INTO player_position (player_id, position_id) VALUES (?,?)';
    var inserts = [req.body.player, req.body.position];
    console.log(inserts);
    addQuery(res, sql, '/positions', inserts);
});

//delete a relationship
app.delete('/positions/:player_id/:position_id', function(req, res){
    var sql = 'DELETE FROM player_position WHERE player_id=? AND position_id=?';
    var inserts = [req.params.player_id, req.params.position_id];
    deleteQuery(res, sql, inserts);
});
/*
END player_position routes
 */



/*
****************************************************
*   conf_div table Get, Post, Update, Delete routes
****************************************************
*/

app.get('/conference', function(req, res){
    var count = 0;
    var ctx = {};
    var sql = 'SELECT confID, confName FROM conference';
    var sql2 = 'SELECT id, division_name FROM divisions WHERE NOT EXISTS (SELECT 1 FROM conf_div WHERE conf_div.divID = divisions.id) ORDER BY division_name';
    var sql3 = 'SELECT conf_div.confID, conf_div.divID, divisions.id, divisions.division_name, conference.confID, conference.confName FROM conf_div ' +
        'INNER JOIN divisions ON conf_div.divID = divisions.id ' +
        'INNER JOIN conference ON conf_div.confID = conference.confID ORDER BY conference.confName, divisions.division_name';

    selectTable1(res, sql, ctx, complete);
    selectTable2(res, sql2, ctx, complete);
    selectTable3(res, sql3, ctx, complete);

    function complete() {
        count++;
        if(count > 2) {
            res.render('conference', ctx);
        }
    }
});

//add to conf_div
app.post('/conference', function(req, res) {
    var sql = 'INSERT INTO conf_div (confID, divID) VALUES (?,?)';
    var inserts = [req.body.conference, req.body.divisions];
    console.log(inserts);
    addQuery(res, sql, '/conference', inserts);
});


//delete route for conf_div table
app.delete('/conference/:confID/:divID', function(req, res){
    var sql = 'DELETE FROM conf_div WHERE confID=? AND divID=?';
    var inserts = [req.params.confID, req.params.divID];
    deleteQuery(res, sql, inserts);
});
/*
END conf_div
 */


/*
**********************************************
    divisions table Get, Post, Delete routes
**********************************************
*/

//display all divisions
app.get('/divisions', function(req, res) {
   var count = 0;
   var sql = 'SELECT id, division_name FROM divisions';
   var ctx = {};

   selectTable1(res, sql, ctx, complete);

   function complete(){
       count++;
       if(count >= 1){
           res.render('divisions', ctx);
       }
   }
});

//add a division
app.post('/divisions', function(req, res) {
    var sql = 'INSERT INTO divisions (division_name) VALUES (?)';
    var inserts = [req.body.division_name];
    console.log(inserts);
    addQuery(res, sql, '/divisions', inserts);
});

//delete a division
app.delete('/divisions/:id', function(req, res){
    var sql = 'DELETE FROM divisions WHERE id=?';
    var inserts = [req.params.id];
    deleteQuery(res, sql, inserts);
});
/*
END divisions
 */


/*
**********************************************
    conference table Get, Post, Delete routes
**********************************************
*/

//display all conferences
app.get('/create_conf', function(req, res) {
    var count = 0;
    var sql = 'SELECT confID, confName FROM conference';
    var ctx = {};

    selectTable1(res, sql, ctx, complete);

    function complete(){
        count++;
        if(count >= 1){
            res.render('create_conf', ctx);
        }
    }
});

//add a conference
app.post('/create_conf', function(req, res) {
    var sql = 'INSERT INTO conference (confName) VALUES (?)';
    var inserts = [req.body.confName];
    console.log(inserts);
    addQuery(res, sql, '/create_conf', inserts);
});

//delete a conference
app.delete('/create_conf/:confID', function(req, res){
    var sql = 'DELETE FROM conference WHERE confID=?';
    var inserts = [req.params.confID];
    deleteQuery(res, sql, inserts);
});
/*
END conference
 */

/*
**********************************************
    positions table Get, Post, Delete routes
**********************************************
*/

//display all positions
app.get('/create_pos', function(req, res){
   var count = 0;
   var ctx = {};
   var sql = 'SELECT id, position_name FROM positions ORDER BY id';

    selectTable1(res, sql, ctx, complete);

    function complete(){
        count++;
        if(count >= 1){
            res.render('create_position', ctx);
        }
    }
});

//create new position
app.post('/create_pos', function(req, res){
   var sql = 'INSERT INTO positions (position_name) VALUES (?)';
   var inserts = [req.body.posName];
    addQuery(res, sql, '/create_pos', inserts);
});

//delete a position
app.delete('/create_pos/:id', function(req, res){
   var sql = 'DELETE FROM positions WHERE id=?';
   var inserts = [req.params.id];
    deleteQuery(res, sql, inserts);
});
/*
END positions routes
 */



app.use(function(req,res) {
    res.status(404);
    res.render('404');
});

app.use(function(err,req,res,next){
    console.log(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});