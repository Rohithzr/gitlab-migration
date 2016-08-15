var gitlab = require('gitlab');
var waterfall = require('async-waterfall');
//============================
var request = require('request');
const queryString = require('query-string');

 
function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    console.log(info.stargazers_count + " Stars");
    console.log(info.forks_count + " Forks");
  }
}
 //============================
// Configuration

var source = {
	url: 'https://gitlab.contetto.io',
  	token: 'DSy4kJ3A-KRNF3cjzEcX',
  	projects: [
  		"contetto-micro/inbox-srv"
  	]
}

var destination = {
	url:   'https://gitlab.com',
	token: '27L-GNg-b2MyJ2_orCRD',
	projects: [
  		"contetto-source/inbox-srv"
  	]
}
// Connections

// Source Gitlab
var gitlab_old = gitlab({
	url: source.url,
	token: source.token 
});

// Destination Gitlab
var gitlab_new = gitlab({
 	url:   destination.url,
 	token: destination.token
});

// Start

for(var i = 0; i < source.projects.length; i++){
    startMigration(i);
}
//
//console.log(gitlab_old.projects.issues.notes);
//
function startMigration(i){
	var j = 0;
	var k = 0;
  	// Get Project
	gitlab_old.projects.show(source.projects[i], function(sourceProject) {
	  	console.log("source project found : " + sourceProject.path_with_namespace);

	  	gitlab_new.projects.show(destination.projects[i], function(destinationProject) {
	  		console.log("destination project found : " + destinationProject.path_with_namespace);
	  		
	  		gitlab_old.projects.issues.list(sourceProject.id, function(sourceIssues) {
	  			if(sourceIssues.length > 0){
	  				console.log("source issues found");

		  			gitlab_new.projects.issues.list(destinationProject.id, function(destinationIssues) {
		  				if(destinationIssues.length < sourceIssues.length) {
			  				console.log("creating issues");


						    function createIssue(j){
						    	if(j < sourceIssues.length){
						    		var options = {
									  url: "https://gitlab.com/api/v3/projects/"+destinationProject.id+"/issues?"+queryString.stringify(sourceIssues[j]),
									  headers: {
									    'PRIVATE-TOKEN': '27L-GNg-b2MyJ2_orCRD'
									  },
									  method: "POST"
									};
									//console.log(options)
									// gitlab_new.issues.create(destinationProject.id, sourceIssues[j], function(response, body, err){
						    		request(options, function (error, response, body) {
						    			if(error){
						    				console.log(error);
						    			}
						    			issueBody = JSON.parse(body);
  										var newIssueId = issueBody.id;
						    			console.log("creating issue #"+j+" id:"+newIssueId);

						    			if(sourceIssues[j].user_notes_count > 0){
												console.log("get comments");

												gitlab_old.projects.issues.notes.all(sourceProject.id, sourceIssues[j].id, function(sourceComments, err){
													function createComment(k){
							    						if(k < sourceComments.length){														
															gitlab_new.notes.create(destinationProject.id, newIssueId, sourceComments[k], function(response, err){
																console.log("create comment");

																createComment(k+1);
															});
							    						}
							    					}
							    					createComment(0);
												});
										}
										if(sourceIssues[j].state == "closed"){
											console.log("close issue")
											var options = {
											  url: "https://gitlab.com/api/v3/projects/"+destinationProject.id+"/issues/"+newIssueId+"?state_event=close",
											  headers: {
											    'PRIVATE-TOKEN': '27L-GNg-b2MyJ2_orCRD'
											  },
											  method: "PUT"
											};
											request(options, function (e, r, x) {
												if(e){
								    				console.log(e);
								    			}else{
								    				console.log("issue closed")
								    			}
											});
										}
										createIssue(j+1);
									});
						    	}
							}
							createIssue(0);
		  				}else{
			  				console.log("issues already copied");
		  				}
		  			});
	  			}
			});	  		
	  	});
	});
}