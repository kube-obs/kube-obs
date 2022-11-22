import { AddEventInput, EventType } from '../graphql/generated';
import glob from 'glob';
import { client } from '../elastic/client';
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

  glob(__dirname + '/mockData/events/**/*.json', async (err, matches) => {
    for (let match of matches) {
      const content = fs.readFileSync(match);

      let eventType: EventType;

      if (match.includes('deployment')) {
        eventType = EventType.Deployment;
      } else if (match.includes('pod')) {
        eventType = EventType.Pod;
      } else if (match.includes('statefulset')) {
        eventType = EventType.StatefulSet;
      } else {
        throw new Error(`Unable to identify ${match} eventType`);
      }

      const payload: AddEventInput = {
        event: JSON.parse(content.toString()),
        type: eventType,
      };
      const res = await apolloClient.mutate({
        mutation: gql`
          mutation AddEvent($input: AddEventInput!) {
            addEvent(input: $input)
          }
        `,
        variables: {
          input: payload,
        },
      });

      console.log(res);
    }
  });
};

const main = async () => {
  await ingestMockData();
};

main();
