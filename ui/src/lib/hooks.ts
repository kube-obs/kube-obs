import { result } from 'nexus/dist/utils';
import * as R from 'ramda';

export const transformElasticSQLResponse = (data: object) => {
  if (data.rows && data.columns) {
    return data.rows.map(row => {
      const result = {};
      row.map((propValue, idx) => {
        result[data.columns[idx].name] = propValue;
      });
      return result;
    });
  }
  return {};
};

export const withElasticQuery = (query: string): (() => Promise<any>) => {
  return async () => {
    try {
      const res = await fetch(`/api/query`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          runtime_mappings: {
            _document_id: {
              type: 'keyword',
              script: "emit(doc['_id'].value)",
            },
          },
        }),
      });

      const data = await res.json();
      console.log('[Elastic Debug]', data);
      return transformElasticSQLResponse(data);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
};
