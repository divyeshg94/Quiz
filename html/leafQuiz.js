var qNo;
listScroll = null;
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
$(document).ready(function () {
    var userObj = getParameterByName('user'); 
    
   //  $('#welcomeContainer').html("Welcome "+userObj+ " !!");
     $.ajax({
              type: 'GET',
              url:  "/getUserName/"+userObj,
              cache: false,
              headers: {
                      'Content-Type': 'application/json'
                                },
        }).success(function(data) {
            console.log(" user data ");
                        console.log(data.data);
            $('#welcomeContainer').html("Welcome "+data.data[0].FirstName+ " "+data.data[0].LastName+" !!");
        })


        $.ajax({
              type: 'GET',
              url:  "/question",
              cache: false,
              headers: {
                'Content-Type': 'application/json'
              },
        }).success(function(result) {
		//	console.log(result.data);
            qNo = result.data.questionNumber;
            var list1 = "";
		$('#QFD').html(qNo+". "+result.data.question);
		$('#qDate').html("[ "+result.data.date+" ]");
		if(result.prevData.isLastDay != undefined){
            $('#starOfMonthMain').style('display','block');
            $.ajax({
                type: 'GET',
                url:  "/starOfMonth",
                cache: false,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).success(function(user) {
                console.log("user");
                console.log(user);
                if(user.starOfTheMonth != undefined){
                    if(user.starOfTheMonth.length > 0){
                        for(var a =0;a <user.starOfTheMonth.length;a++){
                           list1 = list1+"<li>"+ user.starOfTheMonth[a].FirstName+" "+ user.starOfTheMonth[a].LastName+"</li>";
                        }
                    }
                    else{
                        list1 = list1+"<li> None :( </li>";
                    }
                    $('#starOfMonthList').append(list1);
                }

            })
            .error(function(error) {
                 console.log("error");
                console.log(error);
            })
        }
           /* $('#QFDOptions').append("<label><input type=radio class='radio' id='option1' value='a' name=optionRadio />"+result.data.option1+"</label></br><label><input type=radio id='option2' value='b' name=optionRadio />"+result.data.option2+"</label></br><label><input type=radio id='option3' value='c' name=optionRadio />"+result.data.option3+"</label></br><label><input type=radio id='option4' value='d' name=optionRadio />"+result.data.option4+"</label>");*/
            var rad = '';
            for(var b=0; b<5; b++){
                if((result.data['option'+b] !== undefined) && (result.data['option'+b] !== '') && (result.data['option'+b] !== null)){
                     rad +='<input class="rb-radio-btn" id="radio-'+b+'" name="radio-sample" type="radio"><label for="radio-'+b+'" class="control-label">'+result.data['option'+b]+'</label></br>';
                }
            }
             $('#QFDOptions').append(rad);
          
            sessionInfo = result.data.sessionInfo;
            $('#prevQFD').html(result.prevData.questionNumber+". "+result.prevData.question+'</br></br><span class=answerPrev> Answer : '+result.prevData.sessionInfo+'</span>');
            $('#qPreviousDate').html("[ "+result.prevData.date+" ]");
            
            if(result.prevData.explanation != undefined){
                 $('#explanation').html("Explanation: </br> "+result.prevData.explanation);
            }
           
            var list = "";
            
            if(result.count != undefined){
                $('#totalNoOfParticipants').html(result.count);
            }
            

            if(result.prevAnswerData != undefined){
                if(result.prevAnswerData.length > 0){
                    for(var a =0;a <result.prevAnswerData.length;a++){
                        list = list+"<li>"+ result.prevAnswerData[a].FirstName+" "+ result.prevAnswerData[a].LastName+"</li>";
                    }
                }
                else{
                    list = list+"<li> None :( </li>";
                }
            }
            else{
                    list = list+"<li> None :( </li>";
                }
             
             
             $('#prevAnswerBy').append(list);

            setTimeout(function(){
                if (undefined !== listScroll && listScroll !== null) {
                     listScroll.refresh();
                } else {
                        listScroll = new IScroll('#answerByDiv', {
                                scrollbars : true,
                                interactiveScrollbars : true,
                                    shrinkScrollbars : 'scale',
                                                                            preventDefault : false,
                                                                            mouseWheel : true
                                                                });
                }

            },500 ) 


        
        })
     /*   $.ajax({
              type: 'GET',
              url:  "/status",
              cache: false,
              headers: {
                'Content-Type': 'application/json'
              },
        }).success(function(result) {
            console.log(result);
            if(result.isAlreadyAnswered == true){
                 $('#submitAnswer').addClass('disabled');
                 $('#alreadyAnsweredMsg').css('display','block');
            }
        }) */
         
        $(document).off("click", '#submitAnswer').on('click', '#submitAnswer', function() {
            var answer =$('input.rb-radio-btn[type="radio"]:checked').next().text();
            isCorrect = false;
            if(answer == sessionInfo){
                isCorrect = true;
            }
            var body = {"correct":isCorrect,"questionNo":qNo,"user":userObj };
            $.ajax({
                type: 'PUT',
                url:  "/submitAnswer",
                data : JSON.stringify(body),
                cache: false,
                headers: {
                        'Content-Type': 'application/json'
                },
            }).success(function(result) {
                if(result.isAlreadyAnswered == true){
                    $('#submitAnswer').addClass('disabled');
                    $('#alreadyAnsweredMsg').css('display','block');
                }
                else{
                    $('#submitAnswer').addClass('disabled');
                    $('#successMsg').css('display','block');
                }
            })                       
        });
})
