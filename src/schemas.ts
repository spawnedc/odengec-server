import { Schema } from "js-data";

const user = new Schema({
  name: "user",
  schema: {
    properties: {
      id: { type: "number" },
      password: { type: "string" },
      username: { type: "string" },
    },
    type: "object",
  },
});

export { user };
