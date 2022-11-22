import { AddEventInput, EventType } from '../graphql/generated';
import glob from 'glob';
import { client } from './client';
import fetch from 'cross-fetch';
import fs from 'fs';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  HttpLink,
} from '@apollo/client';

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3000/api/graphql', fetch }),
  cache: new InMemoryCache(),
});

let ingestMockData = async () => {
  try {
    const res = await client.indices.create({
      index: 'kube-obs',
      body: {
        settings: {
          number_of_replicas: 0,
          number_of_shards: 1,
        },
      },
    });
    console.log(res);
  } catch (err) {
    // ignore
  }
};

const main = async () => {
  await ingestMockData();
};

main();
