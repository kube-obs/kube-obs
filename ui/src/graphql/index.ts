import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  DateTimeResolver,
  DateTimeTypeDefinition,
  JSONObjectDefinition,
  JSONObjectResolver,
} from 'graphql-scalars';

import k8s from './k8s';

export const typeDefs = `
  ${DateTimeTypeDefinition}
  ${JSONObjectDefinition}
      type Query {
        time: DateTime
        foo: JSONObject
      }`;

export const resolvers = {
  DateTime: DateTimeResolver,
  JSONObject: JSONObjectResolver,
};

export const schema = makeExecutableSchema({
  resolvers: [resolvers, k8s.resolvers],
  typeDefs: [typeDefs, k8s.typeDefs],
});
