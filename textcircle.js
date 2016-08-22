this.Documents = new Mongo.Collection('documents');
EditingUsers = new Mongo.Collection('editingUsers');
// this.Session = new Mongo.Session();

if (Meteor.isClient){

	Template.editor.helpers({
		docid: function () {
			// console.log(Documents.findOne());
			var doc = Documents.findOne();
			if(doc){
				return doc._id;
			} else {
				return undefined;
			}
		},
		config: function () {
			 return function (editor) {
			 	editor.setOption('lineNumbers', true);
			 	editor.setOption('mode', 'html');
			 	editor.setOption('theme', 'cobalt');
			 	editor.on('change', function (cm_editor, info) {
			 	 	// console.log(cm_editor.getValue());
			 	 	$('#viewer_iframe').contents().find('html').html(cm_editor.getValue());
			 	 	Meteor.call('addEditingUser');
			 	});
			 } 
		} 
	});

	Template.editingUsers.helpers({
	users: function () {
			var doc, eusers, users, i = 0;
			doc = Documents.findOne();
			if(!doc){
				return
			}
			eusers = EditingUsers.findOne({docid:doc._id});
			// console.log('eusers.users : ' + eusers.users);
			eusers_fixed = fixKeyObjectNames(eusers.users);	

			users = new Array();	

			for(var user_id in eusers_fixed){
				users[i] = eusers_fixed[user_id];
				i++;
			}
			// console.log('users: ' + users);
			return users;
		}

});

//////
///Events
//////	

	Template.navbar.events({
		'click .js-add-doc': function (e) {
			e.preventDefault();
			console.log('Add a new doc!');
			if(!Meteor.user()){ //no user available
				// alert('You need to login before creating a new Document');
				$('#notLoggedInModal').modal('show');
			} else {

			}   
		}
	});

}	////end isClient

if (Meteor.isServer){
	Meteor.startup(function(){
		// code to run on server at startup
		if(!Documents.findOne()){
			Documents.insert({title: 'my new document'});
		}
	});
}

Meteor.methods({
	addEditingUser: function () {
		// checking if a user is logged in and there's a document to edit, otherwise exiting
		var doc,user, eusers;
		// temporary solution while we only have one document
		doc = Documents.findOne();
		if(!doc){
			return;
		} if(!this.userId) {
			return;
		}
		user = Meteor.user().profile;
		eusers = EditingUsers.findOne({docid:doc._id});
		if(!eusers){ 
			eusers = {
				docid: doc._id,
				users: {}
			};
		}
		user.lastEdit = new Date(); 
		eusers.users[this.userId] = user;
		EditingUsers.upsert({ _id:eusers._id }, eusers);
		}
});

function fixKeyObjectNames(users){
	// console.log(users);
	var newUsers = {};
	$.each(users,function(key){
		var newUser = {};
		for(var key in this){
			var newKey = key.replace('-','');
			newUser[newKey] = this[key];
		}
		newUsers[this[key]] = newUser;
		// console.log(newUsers);
	});

	// console.log(newUsers);

	return newUsers;
}













