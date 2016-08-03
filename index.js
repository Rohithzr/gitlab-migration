var gitlab = require('gitlab');

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
	gitlab_old.projects.show(source.projects[i], function(project) {
	  	console.log("project found : " + project.path_with_namespace);
	  	gitlab_old.projects.issues.list(project.id, function(issues) {
	  		if(issues.length > 0){
	  			console.log("issues found");
	  		}
		});	
	});
}


