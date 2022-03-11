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
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Store HTML elements
  const recipientsEl = document.querySelector('#compose-recipients');
  const subjectEl = document.querySelector('#compose-subject');
  const bodyEl = document.querySelector('#compose-body');
  const formEl = document.querySelector('#compose-form');

  // Clear out composition fields
  recipientsEl.value = '';
  subjectEl.value = '';
  bodyEl.value = '';

  // Event Handler for sending Emails
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    send_email(recipientsEl.value, subjectEl.value, bodyEl.value);
    return false;
  });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // Create a div to render emails in
  const container = document.createElement('div');
  container.setAttribute('id', 'emails-container');
  document.querySelector('#emails-view').appendChild(container);

  // Determine the mailbox the user wants and render the contents
  if (mailbox === 'inbox') {
    load_inbox(mailbox);
  } else if (mailbox === 'sent') {
    load_sent(mailbox);
  } else if (mailbox === 'archive') {
    load_archived(mailbox);
  }
}

function load_inbox(inbox) {

  // Make a call to the API
  fetch(`/emails/${inbox}`)
  .then(response => response.json())
  .then(emails => {
    if (emails.length == 0) {
      const noEmailEl = document.createElement('h5');
      noEmailEl.innerHTML = 'No Emails';
      document.querySelector('#emails-container').append(noEmailEl);
    }
    emails.forEach(email => {

      // Add elements to the DOM
      const emailContainer = document.createElement('div');
      emailContainer.setAttribute('class', 'email-container');

      const emailEl = document.createElement('h5');
      emailEl.innerHTML = `${email.sender} on ${email.timestamp}`;

      const subjectEl = document.createElement('h6');
      subjectEl.innerHTML = email.subject;

      emailContainer.classList.add('w-75', 'mx-auto','my-3', 'p-2', 'border', 'rounded');
      if (email.read === true) {
        emailContainer.classList.add('bg-light');
      }

      emailContainer.append(emailEl, subjectEl);
      emailContainer.setAttribute('id', email.id);
      document.querySelector('#emails-container').append(emailContainer);
      emailContainer.addEventListener('click', () => {
        load_email(email.id);
      });
    });
  });
}

function load_sent(sent) {

  // Make a call to the API
  fetch(`/emails/${sent}`)
  .then(response => response.json())
  .then(emails => {
    if (emails.length == 0) {
      const noEmailEl = document.createElement('h5');
      noEmailEl.innerHTML = 'No Sent Emails';
      document.querySelector('#emails-container').append(noEmailEl);
    }
    emails.forEach(email => {

      // Add elements to the DOM
      const emailContainer = document.createElement('div');
      emailContainer.setAttribute('class', 'email-container');

      const emailEl = document.createElement('h5');
      let recipients = '';
      if (email.recipients.length != 1) {
        email.recipients.forEach((val, key, arr) => {
          if (Object.is(arr.length - 1, key)) {
            recipients += ' ' + val;
          } else {
            recipients += ' ' + val + ','
          }
        });
      } else {
        recipients = email.recipients[0];
      }
      emailEl.innerHTML = `${recipients} on ${email.timestamp}`;

      const subjectEl = document.createElement('h6');
      subjectEl.innerHTML = email.subject;

      emailContainer.classList.add('w-75', 'mx-auto','my-3', 'p-2', 'border', 'rounded');
      if (email.read === true) {
        emailContainer.classList.add('bg-light');
      }

      emailContainer.append(emailEl, subjectEl);
      document.querySelector('#emails-container').append(emailContainer);
      emailContainer.addEventListener('click', () => {
        load_email(email.id);
      });
    });
  });
}

function load_archived(archive) {

  // Make a call to the API
  fetch(`/emails/${archive}`)
  .then(response => response.json())
  .then(emails => {
    if (emails.length == 0) {
      const noEmailEl = document.createElement('h5');
      noEmailEl.innerHTML = 'No Archived Emails';
      document.querySelector('#emails-container').append(noEmailEl);
    }
    emails.forEach(email => {

      // Add elements to the DOM
      const emailContainer = document.createElement('div');
      emailContainer.setAttribute('class', 'email-container');

      const emailEl = document.createElement('h5');
      emailEl.innerHTML = `${email.sender} on ${email.timestamp}`;

      const subjectEl = document.createElement('h6');
      subjectEl.innerHTML = email.subject;

      emailContainer.classList.add('w-75', 'mx-auto','my-3', 'p-2', 'border', 'rounded', 'bg-light');

      emailContainer.append(emailEl, subjectEl);
      document.querySelector('#emails-container').append(emailContainer);
      emailContainer.addEventListener('click', () => {
        load_email(email.id);
      });
    });
  });
}

function load_email(id) {
  // Show single email view and hide other views
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Create a div to render emails in
  const container = document.createElement('div');
  container.setAttribute('id', 'single-email-container');
  document.querySelector('#email-view').appendChild(container);

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });

  // Make call to API
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    // Add Email to the DOM
    const senderEl = document.createElement('h4');
    senderEl.innerHTML = `From: ${email.sender} on ${email.timestamp}`;

    const recipientsEl = document.createElement('h6');
    let recipients = '';
      if (email.recipients.length != 1) {
        email.recipients.forEach((val, key, arr) => {
          if (Object.is(arr.length - 1, key)) {
            recipients += ' ' + val;
          } else {
            recipients += ' ' + val + ','
          }
        });
      } else {
        recipients = email.recipients[0];
      }
    recipientsEl.innerHTML = `To: ${recipients}`;

    const subjectEl = document.createElement('h6');
    subjectEl.innerHTML = `Subject: ${email.subject}`;

    const bodyEl = document.createElement('p');
    bodyEl.innerHTML = email.body;

    const actionContainer = document.createElement('div');
    const archiveBtn = document.createElement('button');
    archiveBtn.innerHTML = 'Archive';
    archiveBtn.classList.add('btn', 'btn-danger');
    archiveBtn.addEventListener('click', () => {
      archive('archive', email.id);
    });

    const unarchiveBtn = document.createElement('button');
    unarchiveBtn.innerHTML = 'Unarchive';
    unarchiveBtn.classList.add('btn', 'btn-warning');
    unarchiveBtn.addEventListener('click', () => {
      archive('unarchive', email.id);
    })

    const replyBtn = document.createElement('button');
    replyBtn.innerHTML = 'Reply';
    replyBtn.classList.add('btn', 'btn-primary', 'ml-3');
    replyBtn.addEventListener('click', () => {
      reply(email.sender, email.subject, email.timestamp, email.body);
    });

    if (email.archived == true) {
      actionContainer.append(unarchiveBtn, replyBtn);
    } else {
      actionContainer.append(archiveBtn, replyBtn);
    }

    // NOT QUITE WORKING, just keeps appending - need to replace/clear previous one first somehow
    container.append(senderEl, recipientsEl, subjectEl, bodyEl, actionContainer);
  });
}

function send_email(recipients, subject, body) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
    load_mailbox('sent');
  });
}

function archive(option, id) {
  console.log(`${option} email id - ${id}`);
}

function reply(sender, subject, timestamp, body) {
  console.log(`replying to ${sender}`);
}