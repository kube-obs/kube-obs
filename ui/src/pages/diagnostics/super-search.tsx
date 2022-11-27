import {
  EuiAccordion,
  EuiBadge,
  EuiCode,
  EuiCodeBlock,
  EuiCollapsibleNavGroup,
  EuiFieldSearch,
  EuiLoadingContent,
  EuiPanel,
  EuiText,
} from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import React from 'react';
import { FunctionComponent } from 'react';
import { useRecoilState } from 'recoil';
import { withElasticQuery } from '../../lib/hooks';
import { clusterState } from '../../recoil/cluster';
import { useDebounce, useDebouncedCallback } from 'use-debounce';

import * as R from 'ramda';
const KibanaLayout = dynamic(() => import('../../layouts/kibana'), {
  ssr: false,
});

const SearchItem = ({
  id,
  name,
  type,
}: {
  id: string;
  name: string;
  type: string;
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['searchDetails', id, isOpen],
    queryFn: async () => {
      const data = await fetch(`/api/document/${id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return data.json();
    },
    enabled: !!isOpen,
  });

  return (
    <EuiCollapsibleNavGroup
      title={
        <div style={{ textDecoration: 'none' }}>
          <EuiBadge color={'default'}>{type}</EuiBadge>&nbsp; {name}
        </div>
      }
      titleSize="xxxs"
      titleElement="span"
      isCollapsible={true}
      onToggle={e => setIsOpen(e)}
      initialIsOpen={false}>
      {isLoading && <EuiLoadingContent lines={5} />}
      {data && !isLoading && !error && (
        <EuiText size="s" color="subdued">
          <EuiCodeBlock language="JSON">
            // ElasticSearch Document ID: {id}{"\n\n"}
            {JSON.stringify(R.pathOr({}, ['_source'], data), null, '\t')}
          </EuiCodeBlock>
        </EuiText>
      )}
    </EuiCollapsibleNavGroup>
  );
};

const Index: FunctionComponent = () => {
  const [cluster] = useRecoilState(clusterState);
  const [search, setSearch] = React.useState('');

  const debounced = useDebouncedCallback(
    // function
    value => {
      setSearch(value);
    },
    // delay in ms
    1000
  );
  const { data, isLoading, error } = useQuery({
    queryKey: ['superSearchResults', cluster, search],
    queryFn: withElasticQuery(`
    SELECT 
      SCORE() AS score, 
      _document_id as id,
      metadata.type as type,
      document.kind as kind,
      COALESCE(document.metadata.name, document.involvedObject.name) as name
    FROM kubeobs 
    WHERE 
      metadata.cluster = '${cluster}' AND
      QUERY('${search}')
    ORDER BY SCORE() DESC
    LIMIT 100
    `),
    enabled: true,
  });

  console.log('>>> full text search', data, error, isLoading);

  return (
    <>
      <KibanaLayout
        pageHeader={{
          pageTitle: 'Super Search',
        }}>
        <EuiPanel paddingSize="l">
          <EuiText>
            <EuiFieldSearch
              placeholder="Search kubernetes events and resources"
              // value={search}
              onChange={e => debounced(e.target.value)}
              isClearable={true}
              aria-label="Use aria labels when no actual label is in use"
            />
            <br />
            {data &&
              data.map(row => (
                <SearchItem
                  key={row.id}
                  id={row.id}
                  name={`${row.kind.toLowerCase()}/${row.name}`}
                  type={row.type}
                />
              ))}
          </EuiText>
        </EuiPanel>
      </KibanaLayout>
    </>
  );
};

export default Index;
