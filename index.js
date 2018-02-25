var express = require('express')
var _ = require('underscore');
var fs = require("fs");
var browserOpener = require("open");
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require("express-session");
var path = require("path");
var router = express.Router();
var server = {};
var qDate;
var apiSimulatorPort = 3100;
var repo = 'E:/quiz/html';
var apiSimulatorHostName = 'LeaF';
var os= require('os');
var sql = require("mssql");
var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];
var loginId = path.join("domainName",userName);
console.log(userName);

	server = express();	
	server.use(bodyParser.json()); 
	server.use(bodyParser.urlencoded({ extended: true })); 	
	server.use("/", express.static(repo));
  
server.get('/', function(req, res) {
    res.sendFile(path.join(repo + "/LeafQuiz.html"));
});  
  server.listen(apiSimulatorPort,function () {		
		console.log("Server listens on "+ apiSimulatorPort +"!!!");
	});

  var config = {
    server: 'DIVYESH', 
    database: 'Quiz',
    user: 'sa',
    password: 'Dhakshu020415',
    port: 1433
  };

  sql.connect(config, function (err) {
        if (err) console.log(err);
  });

 server.put('/submitAnswer', function(req, res) {
    
        console.log(req.body);
        var request = new sql.Request();
	    var currentDate = new Date(new Date().getTime());
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear()
        qDate = year+'-'+month+'-'+day;
        var isAnswerRight = false;
        console.log(qDate);
         request.query("select * from LeafQuiz where qDate = '"+ qDate+"' and associates ='"+req.body.user+"'", function (err, arr) {
                  if (err) {console.log(err);return;}
                  if(arr.length != 0){
                      isAlreadyAnswered = true;
                  }
                  else{
                    console.log('req.body.user');
                    console.log(req.body);
                     isAlreadyAnswered = false;
                     request.query("INSERT INTO [dbo].[LeaFQuiz]([questionNo],[qDate],[associates],[isAnswerRight]) VALUES ('"+req.body.questionNo+"','"+qDate+"','"+req.body.user+"','"+req.body.correct+"')", function (err, recordset) {

                       
                        if (err) console.log(err)
                        res.send(recordset);
                        //sql.close();
                    });
                  }
                   res.json({'isAlreadyAnswered':  isAlreadyAnswered })
                   //sql.close();
              });
       
    });

 /* server.get('/user', function(req, res) {
    console.log("user")
    res.json({user: userName })
  })*/
  server.get('/starOfMonth', function(req,res){
      try{
          var currentDate = new Date(new Date().getTime());
          var month = currentDate.getMonth() + 1
          var year = currentDate.getFullYear()
          var startDate = year+'-'+month+'-01';
          var endDate = year+'-'+month+'-31';
          var request = new sql.Request();
         
          request.query("Select FirstName,LastName from associates where EmailId in ( SELECT associates FROM LeafQuiz where isAnswerRight = 'true' GROUP BY associates HAVING COUNT (associates)=( SELECT MAX(mycount) FROM ( SELECT associates, COUNT(associates) as mycount FROM [ETP].[dbo].[LeaFQuiz] where isAnswerRight = 'true' and qDate >= '"+startDate+"' and qDate <= '"+endDate+"' GROUP BY associates) as t ) )", function (err, arr) {
                 if (err) console.log(err)
                 console.log("star");
                  console.log(arr);
                res.json({'starOfTheMonth':  arr })
         });
      }
      catch(err){
          console.log("err");
          console.log(err);
      }
  })

  server.get('/status', function(req,res){
      try{
          var value = 1;
           
              var currentDate = new Date(new Date().getTime());
              var day = currentDate.getDate()
              var month = currentDate.getMonth() + 1
              var year = currentDate.getFullYear()
              var currentDay = year+'-'+month+'-'+day;
              var isAlreadyAnswered = false;
              console.log(currentDay);
              console.log(req.body.user);
              sql.query("select * from LeafQuiz where qDate = '"+ currentDay+"' and associates ='"+req.body.user+"'")
                    .then(function (arr) {
                       if(arr.length != 0){
                            isAlreadyAnswered = true;
                        }
                        else{
                          isAlreadyAnswered = false;
                        }
                    })
                    .catch(function (error) {
                        console.dir(error);
                    })
            
            res.json({'isAlreadyAnswered':  isAlreadyAnswered })
            //sql.close();
      }
      catch(err){
        console.log("err");
        console.log(err);
      }
  })
  
  

  server.get('/question', function(req, res) {
    console.log("question")
    fs.readFile(repo+'/json/questions.json', "utf8",
		function (err, data) {		
			if (err) {			
				err.key = "file.not.found";
			console.log("Not found");
			//	callback(err);
			} else {			
				var obj;
				var error = null;
				try {					
					obj = JSON.parse(data);					
				} catch (err2) {					
					console.log("Error in parsing JSON of file.."+file);
					error = err2; 
				}
        console.log(obj);
		
        var currentDate = new Date(new Date().getTime());
        var day = currentDate.getDate()
        var month = currentDate.getMonth() + 1
        var year = currentDate.getFullYear()
        qDate = day+'-'+month+'-'+year;
        console.log(qDate);
        var currentDay = year+'-'+month+'-'+day;
        console.log('currentDay');
        console.log(currentDay);
        var response = _.find(obj, function(item) {
          return item.date == currentDay; 
        })
        console.log('response')
         console.log(response.questionNumber)
        console.log('response.questionNumber')
         console.log(response.questionNumber)
        var prevQNo = response.questionNumber - 1;
        console.log('prevQNo')
         console.log(prevQNo)
        var prevResponse = _.find(obj, function(item) {
          return item.questionNumber == prevQNo; 
        })
        console.log('prevResponse')
         console.log(prevResponse);
		
         if (err) console.log(err);
              var prevAnswers = [];
             var request = new sql.Request();
			console.log('prevResponse1');
               console.log(prevResponse);
              request.query("select FirstName, LastName from associates where EmailId in (SELECT associates from LeafQuiz where qDate = '"+ prevResponse.date+"' and isAnswerRight = 'true' )", function (err, arr) {
                  if (err) console.log(err);
                  prevAnswers = [];
                  prevAnswers = arr;
                  console.log('prevAnswers');
                   console.log(prevAnswers);
                   request.query("SELECT count(associates) as count from LeafQuiz where qDate = '"+ prevResponse.date+"'",function (err, arr) {
                        console.log("arr");
                        console.log(arr[0]);
                        res.json({data: response, prevData : prevResponse, prevAnswerData : prevAnswers, count : arr[0].count})
                   
                   })
                   //sql.close();
              });

          
        }		
    });	
 })
    server.get('/getUserName/:emailId', function(req,res){
    console.log("emailid");
    console.log(req.params.emailId);
    var request = new sql.Request();
      try{
          console.log('req.params.emailId');
             console.log(req.params.emailId);
             request.query("select * from associates where EmailId = '"+ req.params.emailId +"'", function (err, obj) {
                  if (err) console.log(err);
                   console.log(obj);
                   res.json({data: obj })
                   //sql.close();
              });
              
      }
      catch(err){
        console.log("err");
        console.log(err);
      }
  })

 

  