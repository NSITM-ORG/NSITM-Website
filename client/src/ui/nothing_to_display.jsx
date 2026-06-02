import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

export default function NothingToDisplay({ title, description, content }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
