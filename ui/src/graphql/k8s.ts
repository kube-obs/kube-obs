import { client } from '../elastic/client';
import glob from 'glob';
import { v4 as uuidv4 } from 'uuid';

const FILE_DIR = __dirname;

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

  input SearchIndexInput {
    index: String!
    query: JSONObject!
  }

  type Mutation {
    addResource(input: AddResourceInput!): JSONObject!
    addEvent(input: AddEventInput!): JSONObject!
  }

  type Query {
    searchIndex(input: SearchIndexInput): JSONObject!
  }
`;

export const resolvers = {
  Query: {
    async searchIndex(parent: unknown, args: { input: any }) {
      const res = await client.search({
        index: args.input.index,
        body: args.input.query,
      });

      return res;
    },
  },
  Mutation: {
    addResource(parent: unknown, args: { input: object }) {
      console.log('>>> received resource ', args.input);
      return {
        resource: 100,
      };
    },
    async addEvent(parent: unknown, args: { input: any }) {
      console.log('>>> received event ', args.input);
      const res = await client.create({
        id: uuidv4(),
        index: 'kube-obs',
        type: args.input.type,
        body: args.input,
      });

      return res.body;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
