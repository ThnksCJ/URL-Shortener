# URL-Shortener


This is a simple URL shortener written in Javascript. It uses the Node.js framework Express and the MongoDB database.

![1](https://user-images.githubusercontent.com/89362919/170525366-913ca797-9196-45c9-84b1-683315be91e0.PNG)
![2](https://user-images.githubusercontent.com/89362919/170525377-741a010e-c143-41ec-b519-4ddaad616da4.PNG)

## Installation

1. Install Node.js and MongoDB
2. Clone this repository
3. Run `npm install` in the project directory
4. Run `npm start` to start the server
5. Open `localhost` in your browser
6. Enjoy!

## Routes 

### GET /

This route is used to get the index page. 
It shows a form where you can enter a URL to shorten. 
The form is submitted to the POST /shorten route.

### GET /get/:code

Redirects to the URL associated with the code.
If the code is not found, it returns a 404 error.

### POST /shorten

Shortens the URL in the request body and returns the shortened URL. 
The request body must be a JSON object with the key `url` and the value being the URL to shorten.
