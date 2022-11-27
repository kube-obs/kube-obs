import {
  AreaSeries,
  Axis,
  Chart,
  DARK_THEME,
  LIGHT_THEME,
  niceTimeFormatByDay,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import {
  dateFormatAliases,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiPanel,
  EuiStat,
  EuiText,
  formatDate,
} from '@elastic/eui';
import { useTheme } from '@emotion/react';
import * as R from 'ramda';
import { FunctionComponent } from 'react';

import dynamic from 'next/dynamic';
import { withElasticQuery } from '../../lib/hooks';
import { useRecoilState } from 'recoil';
import { clusterState } from '../../recoil/cluster';
import { useQuery } from '@tanstack/react-query';

const KibanaLayout = dynamic(() => import('../../layouts/kibana'), {
  ssr: false,
});

const BadReasons = ['Unhealthy', 'BackOff', 'Failed', 'FailedMount'];
const NeutralReasons = ['Pulling', 'Pulled', 'Scheduled', 'Created'];
const GoodReasons = ['Started'];

const getTitleColor = (reason: string) => {
  if (BadReasons.includes(reason)) {
    return 'danger';
  } else if (NeutralReasons.includes(reason)) {
    return 'primary';
  } else if (GoodReasons.includes(reason)) {
    return 'success';
  }
  return 'default';
};

const PodResourceStats = () => {
  const [cluster] = useRecoilState(clusterState);
  const { data, isLoading, error } = useQuery({
    queryKey: ['getPodResourceStats', cluster],
    queryFn: withElasticQuery(`
    SELECT 
      document.status.phase, 
      count(*) AS count 
    FROM kubeobs 
    WHERE metadata.cluster = '${cluster}'
    AND metadata.type = 'POD_RESOURCE'
    GROUP BY metadata.cluster, document.status.phase
    ORDER BY document.status.phase
    `),
    enabled: !!cluster,
  });

  const statItems = (data || []).map(row => (
    <EuiFlexItem>
      <EuiStat
        title={row.count}
        description={row['document.status.phase']}
        textAlign="right"
        titleColor={getTitleColor(row['document.status.phase'])}
        isLoading={isLoading}></EuiStat>
    </EuiFlexItem>
  ));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}>
      {statItems}
    </div>
  );
};

const PodEventStats = () => {
  const [cluster] = useRecoilState(clusterState);
  const { data, isLoading, error } = useQuery({
    queryKey: ['getPodEventStats', cluster],
    queryFn: withElasticQuery(`
    SELECT 
      document.reason, 
      count(*) AS count 
    FROM kubeobs 
    WHERE metadata.cluster = '${cluster}'
    AND metadata.type = 'POD_EVENT'
    GROUP BY metadata.cluster, document.reason
    ORDER BY document.reason
    `),
    enabled: !!cluster,
  });

  console.log('>>>> debug', data, '>>> err', error, isLoading);

  const statItems = (data || []).map(row => (
    <EuiFlexItem>
      <EuiStat
        title={row.count}
        description={row['document.reason']}
        textAlign="right"
        titleColor={getTitleColor(row['document.reason'])}
        isLoading={isLoading}></EuiStat>
    </EuiFlexItem>
  ));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}>
      {statItems}
    </div>
  );
};

// SELECT
//       HISTOGRAM(metadata.timestamp, INTERVAL 1 MINUTE) as timestamp,
//       metadata.cluster as cluster,
//       document.reason,
//       count(*) AS count
//     FROM kubeobs
//     WHERE cluster = '${cluster}' AND
//       metadata.type = "POD_EVENT"
//     GROUP BY
//       metadata.cluster,
//       document.reason,
//       HISTOGRAM(metadata.timestamp, INTERVAL 1 MINUTE)

const Index: FunctionComponent = () => {
  const { colorMode } = useTheme();

  const [cluster] = useRecoilState(clusterState);
  const { data, isLoading, error } = useQuery({
    queryKey: ['podHistogram', cluster],
    queryFn: withElasticQuery(`
    SELECT 
      HISTOGRAM(metadata.timestamp, INTERVAL 1 MINUTE) as timestamp,
      document.reason,
      count(*) AS count
    FROM kubeobs 
    WHERE 
      metadata.cluster = '${cluster}' AND
      metadata.type = 'POD_EVENT'
    GROUP BY
      metadata.cluster,
      document.reason,
      HISTOGRAM(metadata.timestamp, INTERVAL 1 MINUTE)
    `),
    enabled: !!cluster,
  });

  const createAreas = (value, key, obj) => {
    console.log('>>> value', value, '>>> key', key);

    return (
      <AreaSeries
        id={key}
        name={String(key)}
        data={value}
        xScaleType={ScaleType.Time}
        yScaleType={ScaleType.Linear}
        xAccessor={R.pathOr(null, ['timestamp'])}
        yAccessors={[R.pathOr(0, ['count'])]}
      />
    );
  };

  const areas = data
    ? data &&
      Object.values(
        R.mapObjIndexed(
          createAreas,
          R.groupBy(R.propOr('Unknown', 'document.reason'), data)
        )
      )
    : [];

  return (
    <>
      <KibanaLayout
        pageHeader={{
          pageTitle: 'Pod Health',
        }}>
        <EuiPanel paddingSize="l">
          <EuiText>
            <h3>Pod resources</h3>
            <PodResourceStats />
            <h3>Pod events</h3>
            <PodEventStats />
            <h3>Pod events</h3>
            <Chart size={{ height: 200, width: '90%' }}>
              <Settings
                theme={colorMode === 'dark' ? DARK_THEME : LIGHT_THEME}
                showLegend={true}
                legendPosition="bottom"
              />
              {areas}

              <Axis
                title={formatDate(Date.now(), dateFormatAliases.date)}
                id="bottom-axis"
                position="bottom"
                tickFormat={timeFormatter(niceTimeFormatByDay(1))}
              />
              <Axis
                id="left-axis"
                position="left"
                tickFormat={d => Number(d).toFixed(2)}
              />
            </Chart>
          </EuiText>
        </EuiPanel>
      </KibanaLayout>
    </>
  );
};

export default Index;
