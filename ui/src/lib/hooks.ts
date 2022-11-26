import * as R from 'ramda';

export const withElasticQuery = (
  index: string,
  body: object
): (() => Promise<any>) => {
  return async () => {
    try {
      const res = await fetch(`/api/query/${index}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('[Elastic Debug]', data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};
