var gitlab = require('gitlab');
var waterfall = require('async-waterfall');
 
// Configuration

var source = {
	url: 'https://gitlab.contetto.io',
  	token: 'DSy4kJ3A-KRNF3cjzEcX',
  	projects: [
  		"contetto-micro/billing-srv"
  	]
}

var destination = {
	url:   'https://gitlab.com',
	token: '27L-GNg-b2MyJ2_orCRD',
	projects: [
  		"contetto-source/billing-srv"
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

function startMigration(i){
  	// Get Project
	gitlab_old.projects.show(source.projects[i], function(sourceProject) {
	  	console.log("source project found : " + sourceProject.path_with_namespace);

	  	gitlab_new.projects.show(destination.projects[i], function(destinationProject) {
	  		console.log("destination project found : " + destinationProject.path_with_namespace);
	  		
	  		gitlab_old.projects.issues.list(sourceProject.id, function(sourceIssues) {
	  			if(sourceIssues.length > 0){
	  				console.log("source issues found");

		  			gitlab_new.projects.issues.list(destinationProject.id, function(destinationIssues) {
		  				if(destinationIssues.length != sourceIssues.length) {
			  				console.log("creating issues");

						    function createIssue(i){
						    	if(i < sourceIssues.length){
						    		gitlab_new.issues.create(destinationProject.id, sourceIssues[i], function(response, err){
										console.log(response);
										createIssue(i+1);
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

function createIssue(projectId, sourceIssues, callback){
	for(var j = 0; j < sourceIssues.length; j++){
		gitlab_new.issues.create(projectId, sourceIssues[i], function(response, err){
			if(err){
				callback(err);
			}
			console.log(response);
		});
	}
}