
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').onsubmit = () => {

    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(load_mailbox('sent'));

    return false
  }
}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // API GET request for the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    emails.forEach(email => {
      
      const listedMail = document.createElement('div');
      listedMail.className = "listed-mail";
      listedMail.setAttribute("id", `${email.id}`);
      
      listedMail.innerHTML =
      `<h5>${email.sender}</h5>
      ${email.subject}<br>  
      ${email.timestamp}<br>`;
      
      if (email.read) {
        listedMail.style = "background-color: #dedede";
      }
      
      // Determine what happens when the element is clicked on
      listedMail.addEventListener('click', () => {
        
        // Show single-email view and hide other views
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#single-email-view').style.display = 'block';
        
        // API GET request for the specific email
        fetch(`/emails/${listedMail.id}`)
        .then(response => response.json())
        .then(email => {
          
          document.querySelector('#single-email-view').innerHTML =
          `<h3>${email.subject}</h3><button class='archive-button'></button>
          <br>${email.timestamp}
          <br><h6><b>Sender: </b>${email.sender}</h6>
          <br><h6><b>Recipients: </b>${email.recipients}</h6>
          <br>${email.body}
          <br>`;

          const archButton = document.querySelector('.archive-button');

          if (mailbox === 'sent') {
            archButton.style.display = ('none');
          } else if (mailbox === 'inbox') {
            archButton.style.display = ('block');
            archButton.innerHTML =
            "Archive Mail"
          } else if (mailbox === 'archive') {
            archButton.style.display = ('block');
            archButton.innerHTML =
            "Unarchive Mail"
          }

          archButton.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: !email.archived
              })
            })
            .then(load_mailbox('inbox'));
          })

          // Mark as read
          if (email.read == false) {
            fetch(`/emails/${this.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            });
          };
          
        });
        
      })
      
      
      // Finally add this element to the DOM
      document.querySelector('#emails-view').append(listedMail);

    });
  
  });

};
    