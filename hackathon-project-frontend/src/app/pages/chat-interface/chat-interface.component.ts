import { Component, ElementRef, ViewChild } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { AiServiceService } from 'src/app/services/ai-service.service';
import { ChatServiceService } from 'src/app/services/chat-service.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-chat-interface',
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.css']
})
export class ChatInterfaceComponent {

  message: string = '';

  chats: { message: string, from: string }[] = [];

  @ViewChild('chatHistory') chatHistory!: ElementRef<HTMLDivElement>;

  constructor(private aiService: AiServiceService, private chatService: ChatServiceService) {}

  ngOnInit() {

    this.chats.push({
      message: '👋 Welcome to FarmSoil.ai! Ask me anything about your farm soil.',
      from: 'ai'
    });

  }
  /* SEND MESSAGE */
sendMessage(callback?: (userMessage: string, reply: string) => void) {

  const userMessage = this.message.trim();
  if (!userMessage) return;

  this.chats.push({
    message: userMessage,
    from: 'user'
  });

  this.message = '';

  const loadingIndex = this.chats.push({
    message: '.',
    from: 'ai'
  }) - 1;

  let dots = 1;

  const interval = setInterval(() => {
    dots = dots === 3 ? 1 : dots + 1;
    this.chats[loadingIndex].message = '.'.repeat(dots);
  }, 500);

  this.aiService.askQuestion(userMessage).subscribe({

    next: (response: any) => {

      clearInterval(interval);

      const reply = response.reply || 'No response from AI';

      this.chats[loadingIndex].message = reply;

      this.scrollToBottom();

      if (callback) {
        callback(userMessage, reply);
      }

    },

    error: () => {

      clearInterval(interval);

      this.chats[loadingIndex].message =
        'Unable to process your request right now.';

    }

  });

}

 handleClick2() {
  this.sendMessage((userMessage, reply) => {
    if (reply) {
      this.addToChatHistory(userMessage); // only 1 argument now
      this.addToChatHistory2(reply);      // only 1 argument now
    }
  });
}

  /* ENTER KEY SEND */

handleKeydown(event: KeyboardEvent) {

  if (event.key === 'Enter' && !event.shiftKey) {

    event.preventDefault();

    this.handleClick2();

  }

}

addToChatHistory(message: string) {
  const token = localStorage.getItem('authToken'); // consistent token key
  if (!token) {
    console.error('No auth token found');
    return;
  }

  let decoded: any;
  try {
    decoded = jwtDecode(token);
    console.log('Decoded token payload:', decoded);
  } catch (err) {
    console.error('Invalid token:', err);
    return;
  }

  // Try multiple common keys to get user ID
  const user_id = decoded.user_id || decoded.id || decoded.sub || decoded.uid;
  if (!user_id) {
    console.error('User ID not found in token payload');
    return;
  }

  console.log('Sending user message:', { user_id, message });

  this.chatService.addMessage(user_id, message).subscribe({
    next: (res) => {
      console.log('User message saved successfully!', res);
    },
    error: (err) => {
      console.error('Error saving user message:', err);
    }
  });
}


addToChatHistory2(message: string) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No auth token found');
    return;
  }

  let decoded: any;
  try {
    decoded = jwtDecode(token);
    console.log('Decoded token payload:', decoded);
  } catch (err) {
    console.error('Invalid token:', err);
    return;
  }

  const user_id = decoded.user_id || decoded.id || decoded.sub || decoded.uid;
  if (!user_id) {
    console.error('User ID not found in token payload');
    return;
  }

  console.log('Sending AI message:', { user_id, message });

  this.chatService.addMessage2(user_id, message).subscribe({
    next: (res) => {
      console.log('AI message saved successfully!', res);
    },
    error: (err) => {
      console.error('Error saving AI message:', err);
    }
  });
}




  scrollToBottom() {

    setTimeout(() => {

      if (this.chatHistory) {

        this.chatHistory.nativeElement.scrollTop =
          this.chatHistory.nativeElement.scrollHeight;

      }

    }, 100);

  }

  /* FARM LOCATION EMAIL */

  openMap() {

    Swal.fire({
      title: 'Where is your farm field located?',
      input: 'text',
      inputPlaceholder: 'Enter your farm location',
      confirmButtonText: 'Submit',
      showCancelButton: true
    }).then(result => {

      if (!result.isConfirmed) return;

      const area = result.value;

      const email = sessionStorage.getItem('email');

      if (!email) {

        Swal.fire('Error', 'Email not found', 'error');

        return;

      }

      this.aiService.sendPolygonInEmail(email, area)
        .subscribe({

          next: () => {

            Swal.fire(
              'Success',
              'Polygon request email sent!',
              'success'
            );

          },

          error: () => {

            Swal.fire(
              'Error',
              'Failed to send email',
              'error'
            );

          }

        });

    });

  }

}
