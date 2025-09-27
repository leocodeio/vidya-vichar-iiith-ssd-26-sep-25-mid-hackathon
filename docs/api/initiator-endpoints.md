create room:

```
POST /api/rooms/create
body:
{
    "roomName": "Room 1"
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

manage question(socket.io):

```
socket.emit("manageQuestion", { roomId: "123", questionId: "123", status: "addressed", answer: "The capital of France is Paris", "priority":"important" });

status:
- addressed
- rejecte

priority:
- important or not
```
