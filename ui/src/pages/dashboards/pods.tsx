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
import { dateFormatAliases, EuiPanel, EuiText, formatDate } from '@elastic/eui';
import { useTheme } from '@emotion/react';
import * as R from 'ramda';
import { FunctionComponent } from 'react';

import dynamic from 'next/dynamic';

const KibanaLayout = dynamic(() => import('../../layouts/kibana'), {
  ssr: false,
});

// const getPodEventsByReason = withElasticQuery('kube-obs', );

const Index: FunctionComponent = () => {
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['podEventsByReason'],
  //   queryFn: getPodEventsByReason,
  // });

  const data = null;
  const { colorMode } = useTheme();

  // console.log('>>> data', data, 'isLoading', isLoading, 'error', error);

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
