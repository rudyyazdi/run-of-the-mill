type MessageCreatedEvent = {
  name: "messageCreated";
  ownerId: string;
  body: string;
  id: string;
}