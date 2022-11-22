export const typeDefs = `
  enum EventType {
    POD,
    STATEFUL_SET,
    DEPLOYMENT
  }

  enum ResourceType {
    POD,
    STATEFUL_SET,
    DEPLOYMENT
  }

  input AddEventInput {
    event: JSONObject!
    type: EventType!
  }

  input AddResourceInput {
    resource: JSONObject!
    type: ResourceType!
  }

  type Mutation {
    addResource(input: AddResourceInput!): JSONObject!
    addEvent(input: AddEventInput!): JSONObject!
  }
`;

export const resolvers = {
  Query: {},
  Mutation: {
    addResource(parent: unknown, args: { input: object }) {
      console.log('>>> debug ', args.input);
      return {
        resource: 100,
      };
    },
    addEvent(parent: unknown, args: { input: object }) {
      console.log('>>> debug ', args.input);
      return {
        event: 100,
      };
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
