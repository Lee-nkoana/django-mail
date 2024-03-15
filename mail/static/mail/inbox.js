document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //calling our submit function
  document.querySelector('#compose-form').addEventListener('submit', send_mail)
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function email_reply(){

}

function show_Email(id){
  //Get email data
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
        //display the view
      document.querySelector('#showEmail-view').style.display = 'block';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'none';
      // ... do something else with email ...
      const this_Email = document.createElement('div');
      //displaying email information
      document.querySelector('#showEmail-view').innerHTML = `
        <p><strong>Sender:</strong> ${email.sender}</p>
        <p><strong>Subject:</strong>${email.subject}</p>
        <p> ${email.timestamp}</p>
        <p>${email.body} </p>
        <p><strong>Recipients:</strong> ${email.recipients}</h5>
        `;

        //Condition for changing email to read
        if (!email.read){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }

        //Creating logic for the archive
        const btnArchive = document.createElement('button');
        btnArchive.innerHTML = email.archived ? "UnArchive" : "Archive";
        btnArchive.className = email.archived ? "btn btn-outline-danger" : "btn btn-outline-success";
        btnArchive.addEventListener('click', function(){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
          })
          .then(() =>{load_mailbox('archive')})
        })

        document.querySelector('#showEmail-view').append(btnArchive);

        //creating a reply button
        const btnReply = document.createElement('button');
        btnReply.innerHTML = "Reply";
        btnReply.className = "btn btn-outline-success";
        btnReply.addEventListener('click', function() {
          //switching to the compose view
          document.querySelector('#showEmail-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'block';
          
          //pre filling the input boxes with certain data
          document.querySelector('#compose-recipients').value = `${email.sender}`;
          let subject = email.subject
          if (subject.split('',1)[0] != "Re:"){
            subject = "Re: " + email.subject;
          }
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body} `;
        })

        document.querySelector('#showEmail-view').append(btnReply);
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#showEmail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //request emails for particular mailbox
   //fetching particular emails for particual mailbox
   fetch(`/emails/${mailbox}`)
   .then(response => response.json())
   .then(emails => {
       //looping through each email and creating a container for each
       emails.forEach(perEmail => {
           //print emails to console
          console.log(perEmail)

          const newEmail = document.createElement('div');
          newEmail.className = "mailDisRead"
          //displaying email information
          newEmail.innerHTML = `
          <h3>From: ${perEmail.sender}</h3>
          <p>Subject: ${perEmail.subject} || ${perEmail.timestamp}</p>
          `;

          //change to gray if email has been read
          if (!perEmail.read){
            newEmail.className =  "mailDisUnRead"
          }

          newEmail.addEventListener('click', function() {
            show_Email(perEmail.id)
          });
          document.querySelector('#emails-view').append(newEmail);
       });
   });
}


//sending email function
function send_mail(event){
  event.preventDefault();
  const newRecipient = document.querySelector('#compose-recipients').value;
  const newSubject = document.querySelector('#compose-subject').value;
  const newBody = document.querySelector('#compose-body').value;

  document.querySelector('form').onsubmit = () => {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: newRecipient,
          subject: newSubject,
          body: newBody
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent')
    });
  }
}

