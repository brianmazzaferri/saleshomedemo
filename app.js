// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const Datastore = require("nedb"), //(require in the database)
  // Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
  // which doesn't get copied if someone remixes the project.
  db = new Datastore({ filename: ".data/datafile", autoload: true }); //initialize the database

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'my-state-secret',
  scopes: ['channels:join','channels:manage','channels:read','chat:write','chat:write.public','groups:write','links:write','commands', 'pins:write'], //add scopes here
  installationStore: {
    storeInstallation: (installation) => {
	    
    if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {       
          console.log("ENTERPRISE INSTALLATION:");
          console.log(installation);
          return db.insert(installation, (err, newDoc) => {
      if (err) console.log("There's a problem with the database ", err);
      else if (newDoc) console.log("enterprise installation insert completed");
          });
    }	

    if (installation.team !== undefined) {       
          console.log("SINGLE TEAM INSTALLATION:");
          console.log(installation);
          return db.insert(installation, (err, newDoc) => {
      if (err) console.log("There's a problem with the database ", err);
      else if (newDoc) console.log("single team installation insert completed");
          });
    }	
    },
	  
    fetchInstallation: async (InstallQuery) => {
	    
    if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
      console.log("ENTERPRISE FETCH:");
      console.log(InstallQuery);
      let incomingteam = InstallQuery.teamId;
      let result = await queryOne({"enterprise.id":InstallQuery.enterpriseId});
      console.log(result);
      return result;
    }

    if (installQuery.teamId !== undefined) {
      console.log("SINGLE TEAM FETCH:");
      console.log(InstallQuery);
      let incomingteam = InstallQuery.teamId;
      let result = await queryOne({"team.id":InstallQuery.teamId});
      console.log(result);
      return result;
    }	    
    },
  },
});

//LISTENERS GO HERE



//BOILERPLATE BELOW HERE

//look up any one document from a query string
function queryOne(query) {
  return new Promise((resolve, reject) => {
    db.findOne(query, (err, docs) => {
      if (err) console.log("There's a problem with the database: ", err);
      else if (docs) console.log(query + " queryOne run successfully.");
      resolve(docs);
    });
  });
}

//print the whole database (for testing)
function printDatabase() {
  db.find({}, (err, data) => {
    if (err) console.log("There's a problem with the database: ", err);
    else if (data) console.log(data);
  });
}

//clear out the database
function clearDatabase(team,channel) {
  db.remove({team:team, channel:channel}, { multi: true }, function(err) {
    if (err) console.log("There's a problem with the database: ", err);
    else console.log("database cleared");
  });
}
(async () => {
  // boilerplate to start the app
  await app.start(process.env.PORT || 3000);
  //printDatabase();
  console.log("⚡️ Bolt app is running!");
})();
