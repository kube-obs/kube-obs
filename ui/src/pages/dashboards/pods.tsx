import {
  Chart,
  Settings,
  AreaSeries,
  Axis,
  timeFormatter,
  niceTimeFormatByDay,
  ScaleType,
} from '@elastic/charts';
import {
  EuiPanel,
  EuiCode,
  EuiText,
  dateFormatAliases,
  formatDate,
} from '@elastic/eui';
import { useTheme } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import KibanaLayout from '../../layouts/kibana';
import { withElasticQuery } from '../../lib/hooks';
import { DARK_THEME, LIGHT_THEME } from '@elastic/charts';
import * as R from 'ramda';

const getPodEventsByReason = withElasticQuery('kube-obs', {
  size: 10000,
  query: {
    exists: {
      field: 'document.reason',
    },
  },
  aggs: {
    sales_over_time: {
      auto_date_histogram: {
        field: '@timestamp',
        buckets: 10,
      },
    },
  },
});

const Index: FunctionComponent = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['podEventsByReason'],
    queryFn: getPodEventsByReason,
  });

  const { colorMode } = useTheme();

  console.log('>>> data', data, 'isLoading', isLoading, 'error', error);

  return (
    <>
      <KibanaLayout
        pageHeader={{
          pageTitle: 'Pod Health',
        }}>
        <EuiPanel paddingSize="l">
          <EuiText>
            <h3>Pod events</h3>
            <Chart size={{ height: 200, width: '90%' }}>
              <Settings
                theme={colorMode === 'dark' ? DARK_THEME : LIGHT_THEME}
                showLegend={true}
                legendPosition="bottom"
              />
              <AreaSeries
                id="financial"
                name="Financial"
                data={data || []}
                xScaleType={ScaleType.Time}
                yScaleType={ScaleType.Linear}
                xAccessor={R.pathOr(null, [
                  '_source',
                  'document',
                  'lastTimestamp',
                ])}
                yAccessors={[() => Math.random() * 50]}
              />

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
