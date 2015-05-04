Posts = new Mongo.Collection("posts");



if (Meteor.isClient) {

  Meteor.subscribe("posts");


  // This code only runs on the client
  Template.body.helpers({
    posts: function () {
      return Posts.find({}, {sort: {createdAt: -1}});
    },
    count: function () {
      return Posts.find({}).count();
    }
  });

  Template.body.events({
    "submit .new-post": function (event) {
      // This function is called when the new blog form is submitted

      var title = event.target.title.value,
      text = event.target.text.value;

      Meteor.call("addPost", title, text);


      // Clear form
      event.target.title.value = "";
      event.target.text.value = "";



      // Prevent default form submit
      return false;
    }
  });

  Template.post.events({
    "click .delete": function () {
      Meteor.call("deletePost", this._id);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}

Meteor.methods({
  addPost: function (title, text) {
    // Make sure the user is logged in before inserting a post
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Posts.insert({
      title: title,
      text: text,
      owner: Meteor.userId(),
      user: Meteor.user().username,
      createdAt: new Date() // current time
    });
  },
  deletePost: function (postID) {
    Posts.remove(postID);
  }
});


if (Meteor.isServer) {
  Meteor.publish("posts", function () {
    return Posts.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}
