<!-- Tutorial followed here https://www.youtube.com/watch?v=I6ypD7qv3Z8&t=1789s -->

<!-- Sessions Explanation
req.session.userId = user.id

takes id and stores to redis
key -> User object
express-session stores a cookie to your browser
when user makes a request, this is passed to the server with the request

the server decrypts the cookie via secret and requests redis for the data


 -->
