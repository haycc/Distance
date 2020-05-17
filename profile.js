/* JS file for profile.html page
 *
 * This page is for allowing the user to logout and change their user account info.
 * The functions include viewing your name and profile picutre and changing them.
 *  
 */


// HTML Variables
var messageName = document.getElementById('username');


// Database Variables
var db = firebase.database();
var msgRef = db.ref('/msgs');
var userRef = db.ref('/users');
var user = firebase.auth().currentUser;
var storage = firebase.storage();
var imageRef = storage.ref('/images');
var uid, name, email;


// Other Variables
// None


// Redirecting to chatroom page if logged in
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in
        uid = user.uid;
        email = user.email;

        // Getting user profile image
        imageRef = storage.ref('/images/' + uid);
        imageRef.getDownloadURL().then(function(url) {
            // Get donwloaded URL for image
            document.querySelector('img').src = url;
        }).catch(function(error) {
            // User has no profile pic so use default
            imageRef = storage.ref('/images/no_user.png');
            imageRef.getDownloadURL().then(function(url) {
                // Get donwloaded URL for image
                document.querySelector('img').src = url;
            });
        });
    } else {
        // No user is signed in
        imageRef = storage.ref('/images/no_user.png');
        imageRef.getDownloadURL().then(function(url) {
            // Get donwloaded URL for image
            document.querySelector('img').src = url;
        });
        location.replace('index.html');
    }
});


// When enter key is pressed
$(document).keypress(function(event) {
    if (event.which == '13') {
        event.preventDefault();
    }
});


// Updating name value on profile page
userRef.on('child_added', function(data) {
    var {id : userID, name : username, email} = data.val();
    
    if (userID == uid) {
        messageName.innerHTML = username;
        name = username;
    }
});


// Logout button function
$('#logoutBtn').click(function() {
    firebase.auth().signOut().then(function() {
        // Sign out successful
        document.querySelector('img').src = "";
        location.replace('loginpage.html');
    }, function(error) {
        // An error happened
        alert(error.message);
    });
});


// Back to chatroom function
$('#chatroomBtn').click(function() {
    location.replace('chatroom.html');
});


// Profile picture function
function previewFile() {
    var preview = document.querySelector('img');
    var file = document.querySelector('input[type=file]').files[0];
    
    var reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
    }

    if (file) {
        // Read the data as a URL
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
    
    newFile = new File([file], uid + '.png', {type: 'image/png'});
    imageRef = storage.ref('/images/' + uid);
    imageRef.put(newFile).then(function(snapshot) {
        // Image succussfully saved in storage
    });
}


// Change name button function
$('#nameChangeBtn').click(function() {
    var newName = $('#nameChange').val();
    var oldName = name;

    // Change name value in users
    userRef.orderByChild('name').equalTo(name).once('value', function(snapshot) {
        // Get correct person data type to change
        snapshot.forEach(function(childSnapshot) {
            childSnapshot.ref.update({ name: newName });
            name = newName;
        });
    });

    // Change neame value in messages
    msgRef.orderByChild('name').equalTo(oldName).once('value', function(snapshot) {
        // Get correct message data types to change
        snapshot.forEach(function(childSnapshot) {
            childSnapshot.ref.update({ name: newName });
        });
    });

    // Reloading current page
    location.reload('#');
});


// Change password button function
$('#changePassBtn').click(function() {
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        $('#forgotpasswordmodal').modal('hide');
        return alert('Password Reset Sent!');
    }).catch(function(error) {
        // An error happened
        return alert(error.message);
    });
});
