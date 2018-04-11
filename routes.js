var express = require('express');
var router = express.Router();
var pg = require('pg');
var md5 = require('md5');
var request = require('request');

var psqlCredentials = JSON.parse(process.env.VCAP_SERVICES)['a9s-postgresql94'][0]['credentials'];

var connection = new pg.Client({
  user: psqlCredentials.username,
  database: psqlCredentials.name,
  password: psqlCredentials.password,
  port: psqlCredentials.port,
  host: psqlCredentials.host
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting to db: ' + err.stack);
    return;
  }
  console.log('connected to db ');
});

router.get('/hello', function(req, res) {
    res.status(200).json({success: true, msg: 'hi !'});
});

router.post('/create_table', function(req, res) {
  connection.query('CREATE TABLE IF NOT EXISTS users(id INT, firstname VARCHAR(32), lastname VARCHAR(32), age INT,  email VARCHAR(32), twittername VARCHAR(32), twittervalid BOOLEAN, avatar_url VARCHAR(100), PRIMARY KEY(id));', function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(500).json({success: false, msg: 'could not create table'});
    } else {
      res.status(200).json({success: true, msg: 'created table'});
    }
  });
});

router.post('/user', function(req, res) {
  twittercheck(req.body.twittername, function(exists){
    if(exists) {
      add_user(req, res, true);
    } else {
      add_user(req, res, false);
    }
  });
});

router.get('/user', function(req, res){
  connection.query('SELECT * FROM users', function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).json({success: false, msg: 'could not get users'});
    } else {
      res.status(200).json(result.rows);
    }
  });
});

router.get('/user/:user_id', function(req, res){
  connection.query('SELECT * FROM users WHERE id = ' + req.params.user_id + ';', function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).json({success: false, msg: 'could not get user details'});
    } else {
      res.status(200).json(result.rows[0]);
    }
  });
});

router.put('/user/:user_id', function(req, res) {
  twittercheck(req.body.twittername, function(exists){
    if(exists){
      edit_user(req, res, true);
    } else {
      edit_user(req, res, false);
    }
  })
});

router.delete('/user/:user_id', function(req, res){
  connection.query('DELETE FROM users WHERE id = ' + req.params.user_id + ';', function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).json({success: false, msg: 'could not get delete user'});
    } else {
      res.status(200).json({success: true, msg: 'user deleted !'});
    }
  });
});

var twittercheck = function(name, callback){
  request('https://twitter.com/' + name, function (error, response, body) {
    if (!error && response.statusCode == 200) {
       callback(true)
    }
    if (!error && response.statusCode == 404) {
       callback(false);
    }
  });
}

var add_user = function(req, res, twittervalid){
  var gravatarurl = 'https://www.gravatar.com/avatar/' + md5(req.body.email);
  var insert_statement = 'INSERT INTO users (id, firstname, lastname, age, email, twittername, twittervalid, avatar_url) values (coalesce((SELECT max(id)+1 FROM users), 0), \'' + req.body.firstname + '\', \'' + req.body.lastname + '\', ' + req.body.age + ', \'' + req.body.email + '\', \''+ req.body.twittername  + '\', ' + twittervalid + ', \'' + gravatarurl + '\');';
  console.log(insert_statement);

  connection.query(insert_statement, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(500).json({success: false, msg: 'could not add user'});
    } else {
      add_project(req.body.firstname + '_' + req.body.lastname + '_training');
      res.status(200).json({success: true, msg: 'user added. id: ' + rows.insertId });
    };
  });
}

var edit_user = function(req, res, twittervalid){
  var gravatarurl = 'https://www.gravatar.com/avatar/' + md5(req.body.email);
  var update_statement = 'UPDATE users SET firstname = \'' + req.body.firstname + '\', lastname = \'' + req.body.lastname + '\', age = ' + req.body.age + ', email = \'' + req.body.email + '\', twittername = \''+ req.body.twittername  + '\', twittervalid = ' + twittervalid + ', avatar_url = \'' + gravatarurl + '\' where id = ' + req.params.user_id + ';';
  console.log(update_statement);

  connection.query(update_statement, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.status(500).json({success: false, msg: 'could not add user'});
    } else {
      res.status(200).json({success: true, msg: 'user updated '});
    };
  });
}

var add_project = function(project_name){
  var options = {
    url: 'http://localhost:3000/project',
    method: 'POST',
    json: {"projectname": project_name}
  }

  request(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
       console.log('project added');
    }
    if (!error && response.statusCode == 404) {
       console.log('could not add project');
    }
  })
}

module.exports = router;
