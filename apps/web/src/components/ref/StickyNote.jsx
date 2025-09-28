import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StickyNote({
  q,
  onUpdate,
  userRole,
  viewType = "grid",
}) {
  const [answer, setAnswer] = useState(q.answer || "");

  const markStatus = (status) => onUpdate(q._id, { status });

  const saveAnswer = () => {
    if (answer.trim())
      onUpdate(q._id, { answer: answer.trim(), status: "answered" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "answered":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getPriorityColor = (priority) => {
    return priority === "important"
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  if (viewType === "list") {
    return (
      <Card className={`w-full ${getStatusColor(q.status)}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">{q.text}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {q.author} · {new Date(q.createdAt).toLocaleTimeString()}
                </span>
                <Badge
                  variant="outline"
                  className={getPriorityColor(q.priority)}
                >
                  {q.priority}
                </Badge>
                <Badge variant="outline" className={getStatusColor(q.status)}>
                  {q.status}
                </Badge>
              </div>
            </div>
            {userRole === "faculty" && (
              <div className="flex gap-1">
                {q.status !== "answered" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markStatus("answered")}
                  >
                    ✓
                  </Button>
                )}
                {q.status !== "rejected" && q.status !== "answered" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markStatus("rejected")}
                  >
                    ✗
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onUpdate(q._id, {
                      priority:
                        q.priority === "important" ? "normal" : "important",
                    })
                  }
                >
                  {q.priority === "important" ? "!" : "!!"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        {userRole === "faculty" && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Input
                placeholder="Write an answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={saveAnswer}>
                Save
              </Button>
            </div>
            {q.answer && (
              <div className="mt-2 p-2 bg-muted rounded-md">
                <strong className="text-xs">Answer:</strong>
                <p className="text-sm">{q.answer}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className={`${getStatusColor(q.status)} min-h-[200px]`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex gap-1">
            <Badge variant="outline" className={getPriorityColor(q.priority)}>
              {q.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(q.status)}>
              {q.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm font-medium">{q.text}</p>
        <div className="text-xs text-muted-foreground">
          {q.author} · {new Date(q.createdAt).toLocaleTimeString()}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {userRole === "faculty" && (
          <>
            <div className="flex flex-wrap gap-1 mb-2">
              {q.status !== "answered" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markStatus("answered")}
                >
                  Mark Answered
                </Button>
              )}
              {q.status !== "rejected" && q.status !== "answered" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markStatus("rejected")}
                >
                  Reject
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdate(q._id, {
                    priority:
                      q.priority === "important" ? "normal" : "important",
                  })
                }
              >
                {q.priority === "important" ? "Mark Normal" : "Mark Important"}
              </Button>
            </div>

            <div className="space-y-2">
              <textarea
                placeholder="Write an answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={2}
                className="w-full p-2 text-sm border rounded-md resize-none"
              />
              <Button size="sm" onClick={saveAnswer} className="w-full">
                Save Answer
              </Button>
            </div>
          </>
        )}

        {q.answer && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <strong className="text-xs">Answer:</strong>
            <p className="text-sm">{q.answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
