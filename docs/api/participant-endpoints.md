join room:

```
POST /api/rooms/join?roomId=123
body:
{
    "name": "John Doe"
}
```

show room:

```
GET /api/rooms/show?roomId=123
```

get questions(socket.io):

```
socket.emit("getQuestions", { roomId: "123" });
```

post question:

```
POST /api/rooms/questions/create?roomId=123
body:
{
    "question": "What is the capital of France?"
}
```
